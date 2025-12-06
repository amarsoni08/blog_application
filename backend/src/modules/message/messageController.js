import User from "../../models/userModel.js";
import Message from "../../models/messageModel.js";
import mongoose from "mongoose";

export default {
    // ===============================
    // GET MESSAGE FRIENDS
    // ===============================
    getMessageFriends: async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    // get friends
    const user = await User.findById(userId)
      .populate("friends", "firstName lastName profileImage lastSeen")
      .lean();

    // unread count aggregation
    const unread = await Message.aggregate([
      {
        $match: {
          receiver: new mongoose.Types.ObjectId(userId),
          isSeen: false
        }
      },
      {
        $group: {
          _id: "$sender",
          count: { $sum: 1 }
        }
      }
    ]);

    // Add unread + last message to each friend
    const friendsEnhanced = await Promise.all(
      user.friends.map(async (friend) => {

        // find unread count
        const foundUnread = unread.find(
          (u) => String(u._id) === String(friend._id)
        );

        // find last message
        const lastMsg = await Message.findOne({
          $or: [
            { sender: userId, receiver: friend._id },
            { sender: friend._id, receiver: userId }
          ]
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...friend,
          unreadCount: foundUnread ? foundUnread.count : 0,
          lastMessage: lastMsg ? lastMsg.content : null,
          lastMessageTime: lastMsg ? lastMsg.createdAt : null,
        };
      })
    );

    // Sort friends by latest message time (Instagram-style)
    friendsEnhanced.sort((a, b) => {
      return new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0);
    });

    return res.json({ success: true, friends: friendsEnhanced });

  } catch (err) {
    next(err);
  }
},


    // ===============================
    // CHAT HISTORY
    // ===============================
    getChatHistory: async (req, res, next) => {
        try {
            const me = req.user.id || req.user._id;
            const friendId = req.params.friendId;

            const messages = await Message.find({
                $or: [
                    { sender: me, receiver: friendId },
                    { sender: friendId, receiver: me }
                ],
                isDeleted: false
            })
                .sort({ createdAt: 1 })
                .populate("sender", "firstName lastName profileImage");

            // MARK AS SEEN
            await Message.updateMany(
                { sender: friendId, receiver: me, isSeen: false },
                { $set: { isSeen: true, seenAt: new Date() } }
            );

            // SOCKET NOTIFY
            try {
                const io = req.app.get("io");
                const onlineUsers = req.app.get("onlineUsers");
                const friendSocket = onlineUsers.get(String(friendId));

                if (friendSocket && io) {
                    io.to(friendSocket).emit("message-seen", { by: me });
                }
            } catch (e) {}

            res.json({ success: true, messages });

        } catch (err) {
            next(err);
        }
    },

    // ===============================
    // SEND MESSAGE
    // ===============================
    sendMessage: async (req, res, next) => {
        try {
            const me = req.user.id || req.user._id;
            const friendId = req.params.friendId;
            const { content } = req.body;

            const newMessage = await Message.create({
                sender: me,
                receiver: friendId,
                content
            });

            // SOCKET SEND
            try {
                const io = req.app.get("io");
                const onlineUsers = req.app.get("onlineUsers");
                const receiverSocket = onlineUsers.get(String(friendId));

                if (receiverSocket && io) {
                    io.to(receiverSocket).emit("receive-message", {
                        _id: newMessage._id,
                        sender: newMessage.sender,
                        receiver: newMessage.receiver,
                        content: newMessage.content,
                        createdAt: newMessage.createdAt
                    });

                    // delivered
                    newMessage.isDelivered = true;
                    newMessage.deliveredAt = new Date();
                    await newMessage.save();

                    const senderSocket = onlineUsers.get(String(me));
                    if (senderSocket) {
                        io.to(senderSocket).emit("message-delivered", {
                            messageId: newMessage._id
                        });
                    }
                }
            } catch (e) {}

            res.json({ success: true, message: newMessage });

        } catch (err) {
            next(err);
        }
    },

    // ===============================
    // MARK SEEN
    // ===============================
    markSeen: async (req, res, next) => {
        try {
            const me = req.user.id || req.user._id;
            const { messageId } = req.body;

            const msg = await Message.findById(messageId);
            if (!msg) return res.status(404).json({ success: false, message: "Not found" });

            if (String(msg.receiver) !== String(me))
                return res.status(403).json({ success: false, message: "Not allowed" });

            msg.isSeen = true;
            msg.seenAt = new Date();
            await msg.save();

            try {
                const io = req.app.get("io");
                const onlineUsers = req.app.get("onlineUsers");
                const senderSocket = onlineUsers.get(String(msg.sender));

                if (senderSocket) {
                    io.to(senderSocket).emit("message-seen", {
                        messageId: msg._id,
                        by: me
                    });
                }
            } catch (e) {}

            res.json({ success: true, message: msg });

        } catch (err) {
            next(err);
        }
    },

    // ===============================
    // REACT TO MESSAGE
    // ===============================
    reactMessage: async (req, res, next) => {
        try {
            const me = req.user.id || req.user._id;
            const { messageId } = req.params;
            const { emoji } = req.body;

            const msg = await Message.findById(messageId);
            if (!msg) return res.status(404).json({ success: false, message: "Not found" });

            const existing = msg.reactions.find(r => String(r.by) === String(me));

            if (existing) existing.emoji = emoji;
            else msg.reactions.push({ by: me, emoji });

            await msg.save();

            try {
                const io = req.app.get("io");
                const onlineUsers = req.app.get("onlineUsers");
                const otherUser =
                    String(msg.sender) === String(me) ? msg.receiver : msg.sender;

                const sock = onlineUsers.get(String(otherUser));
                if (sock && io) {
                    io.to(sock).emit("message-reacted", {
                        messageId: msg._id,
                        reaction: emoji
                    });
                }
            } catch (e) {}

            res.json({ success: true, message: msg });

        } catch (err) {
            next(err);
        }
    },

    // ===============================
    // DELETE MESSAGE FOR EVERYONE
    // ===============================
    deleteForEveryone: async (req, res, next) => {
        try {
            const me = req.user.id || req.user._id;
            const { messageId } = req.params;

            const msg = await Message.findById(messageId);
            if (!msg) return res.status(404).json({ success: false, message: "Not found" });

            if (String(msg.sender) !== String(me))
                return res.status(403).json({ success: false, message: "Not allowed" });

            msg.isDeleted = true;
            await msg.save();

            try {
                const io = req.app.get("io");
                const onlineUsers = req.app.get("onlineUsers");
                const sock = onlineUsers.get(String(msg.receiver));

                if (sock && io) {
                    io.to(sock).emit("message-deleted", { messageId: msg._id });
                }
            } catch (e) {}

            res.json({ success: true });

        } catch (err) {
            next(err);
        }
    },

    // ===============================
    // UNREAD COUNT
    // ===============================
    getUnreadCount: async (req, res, next) => {
        try {
            const userId = req.user.id || req.user._id;

            const unread = await Message.aggregate([
                {
                    $match: {
                        isSeen: false,
                        receiver: new mongoose.Types.ObjectId(userId)   // FIXED
                    }
                },
                {
                    $group: {
                        _id: "$sender",
                        count: { $sum: 1 }
                    }
                }
            ]);

            res.json({
                success: true,
                unreadUsers: unread.length,
                details: unread
            });

        } catch (err) {
            next(err);
        }
    }
};

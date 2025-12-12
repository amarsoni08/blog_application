import { Server } from "socket.io";
import User from "../models/userModel.js";

let onlineUsers = new Map();

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        "https://blog-application-lovat.vercel.app/"
      ],
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    // -----------------------------
    // USER ONLINE
    // -----------------------------
    socket.on("user-online", (userId) => {
      onlineUsers.set(String(userId), socket.id);
      socket.userId = String(userId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // -----------------------------
    // TYPING EVENTS
    // -----------------------------
    socket.on("typing", ({ from, to }) => {
      const target = onlineUsers.get(String(to));
      if (target) io.to(target).emit("typing", { from });
    });

    socket.on("stop-typing", ({ from, to }) => {
      const target = onlineUsers.get(String(to));
      if (target) io.to(target).emit("stop-typing", { from });
    });

    // -----------------------------
    // SEND MESSAGE
    // -----------------------------
    socket.on("send-message", (msg) => {
      const receiverSocket = onlineUsers.get(String(msg.receiver));

      if (receiverSocket) {
        io.to(receiverSocket).emit("receive-message", msg);

        io.to(socket.id).emit("message-delivered", {
          messageId: msg._id,
          delivered: true
        });
      }
    });

    // -----------------------------
    // MESSAGE SEEN
    // -----------------------------
    socket.on("seen-message", ({ messageId, to }) => {
      const senderSocket = onlineUsers.get(String(to));
      if (senderSocket) {
        io.to(senderSocket).emit("message-seen", {
          messageId,
          seen: true
        });
      }
    });

    // -----------------------------
    // REACT MESSAGE
    // -----------------------------
    socket.on("react-message", ({ messageId, reaction, to }) => {
      const receiverSocket = onlineUsers.get(String(to));
      if (receiverSocket) {
        io.to(receiverSocket).emit("message-reacted", {
          messageId,
          reaction
        });
      }
    });

    // -----------------------------
    // DELETE MESSAGE
    // -----------------------------
    socket.on("delete-message", ({ messageId, to }) => {
      const receiverSocket = onlineUsers.get(String(to));
      if (receiverSocket) {
        io.to(receiverSocket).emit("message-deleted", { messageId });
      }
    });

    // -----------------------------
    // FORCE LOGOUT
    // -----------------------------
    socket.on("force-logout", async (userId) => {
      onlineUsers.delete(String(userId));
      await User.findByIdAndUpdate(userId, {
        lastSeen: new Date()
      });

      io.emit("online-users", Array.from(onlineUsers.keys()));
    });

    // -----------------------------
    // DISCONNECT
    // -----------------------------
    socket.on("disconnect", async () => {
      const userId = socket.userId;
      if (userId) {
        onlineUsers.delete(String(userId));
        io.emit("online-users", Array.from(onlineUsers.keys()));

        await User.findByIdAndUpdate(userId, {
          lastSeen: new Date()
        });
      }
      console.log("❌ User disconnected:", socket.id);
    });

    socket.on("call-user", ({ to, from, callType /* "video" or "audio" */ }) => {
    const target = onlineUsers.get(String(to));
    if (target) {
      io.to(target).emit("incoming-call", { from, callType });
    } else {
      // optional: notify caller that user is offline
      io.to(socket.id).emit("call-failed", { reason: "user-offline" });
    }
  });

  // Caller sends offer (SDP)
  socket.on("webrtc-offer", ({ to, offer }) => {
    const target = onlineUsers.get(String(to));
    if (target) io.to(target).emit("webrtc-offer", { offer });
  });

  // Callee sends answer (SDP)
  socket.on("webrtc-answer", ({ to, answer }) => {
    const target = onlineUsers.get(String(to));
    if (target) io.to(target).emit("webrtc-answer", { answer });
  });

  // ICE candidates exchange
  socket.on("webrtc-ice-candidate", ({ to, candidate }) => {
    const target = onlineUsers.get(String(to));
    if (target) io.to(target).emit("webrtc-ice-candidate", { candidate });
  });

  // Callee rejects the call
  socket.on("reject-call", ({ to }) => {
    const target = onlineUsers.get(String(to));
    if (target) io.to(target).emit("call-rejected");
  });

  // End call (either side)
  socket.on("end-call", ({ to }) => {
    const target = onlineUsers.get(String(to));
    if (target) io.to(target).emit("call-ended");
  });

  });

  return io;
}

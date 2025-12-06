import User from "../../models/userModel.js";

export default {
  // get aggregated data for the friends page
  getFriendsDataService: async (userId) => {
    const me = await User.findById(userId)
      .select("friends sentRequests receivedRequests")
      .populate("friends", "firstName lastName profileImage")
      .populate("sentRequests", "firstName lastName profileImage")
      .populate("receivedRequests", "firstName lastName profileImage")
      .lean();

    // all other users (exclude self)
    const allUsers = await User.find({ _id: { $ne: userId } })
      .select("firstName lastName profileImage")
      .lean();

    return {
      me,
      allUsers,
      receivedRequestsCount: me.receivedRequests.length
    };
  },

  // send a friend request from userId -> targetId
  sendRequestService: async (userId, targetId) => {
    if (userId === targetId) throw { statusCode: 400, message: "Cannot send request to yourself" };

    const me = await User.findById(userId);
    const target = await User.findById(targetId);
    if (!target) throw { statusCode: 404, message: "User not found" };

    // already friends?
    if (me.friends.includes(targetId)) throw { statusCode: 400, message: "Already friends" };

    // already requested
    if (me.sentRequests.includes(targetId)) throw { statusCode: 400, message: "Friend request already sent" };

    // reciprocal safe: if target had sent request, accept instead
    if (me.receivedRequests.includes(targetId)) {
      // accept automatically (optional) — here we perform accept
      me.receivedRequests.pull(targetId);
      me.friends.push(targetId);

      target.sentRequests.pull(userId);
      target.friends.push(userId);

      await me.save();
      await target.save();
      return { accepted: true };
    }

    // normal send
    me.sentRequests.push(targetId);
    target.receivedRequests.push(userId);

    await me.save();
    await target.save();
    return { sent: true };
  },

  // accept request: current user (userId) accepts from senderId
  acceptRequestService: async (userId, senderId) => {
    const me = await User.findById(userId);
    const sender = await User.findById(senderId);
    if (!me || !sender) throw { statusCode: 404, message: "User not found" };

    if (!me.receivedRequests.includes(senderId)) throw { statusCode: 400, message: "No request from this user" };

    // remove from requests and add to friends
    me.receivedRequests.pull(senderId);
    me.friends.push(senderId);

    sender.sentRequests.pull(userId);
    sender.friends.push(userId);

    await me.save();
    await sender.save();

    return true;
  },

  // reject request
  rejectRequestService: async (userId, senderId) => {
    const me = await User.findById(userId);
    const sender = await User.findById(senderId);
    if (!me || !sender) throw { statusCode: 404, message: "User not found" };

    me.receivedRequests.pull(senderId);
    sender.sentRequests.pull(userId);

    await me.save();
    await sender.save();
    return true;
  },

  // unfriend
  unfriendService: async (userId, friendId) => {
    const me = await User.findById(userId);
    const friend = await User.findById(friendId);
    if (!me || !friend) throw { statusCode: 404, message: "User not found" };

    me.friends.pull(friendId);
    friend.friends.pull(userId);

    await me.save();
    await friend.save();
    return true;
  },
  cancelRequestService: async (userId, targetId) => {
  const me = await User.findById(userId);
  const target = await User.findById(targetId);

  if (!me || !target) throw { statusCode: 404, message: "User not found" };

  // request exists?
  if (!me.sentRequests.includes(targetId)) {
    throw { statusCode: 400, message: "No pending request" };
  }

  me.sentRequests.pull(targetId);
  target.receivedRequests.pull(userId);

  await me.save();
  await target.save();
  return true;
}

};

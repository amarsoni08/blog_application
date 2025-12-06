// src/modules/friends/friendController.js
import friendService from "./friendService.js";
import { successResponse } from "../../utils/responseHandler.js";

export default {
  getFriendsData: async (req, res, next) => {
    try {
      const data = await friendService.getFriendsDataService(req.user.id);
      return successResponse(res, 200, "Friends data fetched", data);
    } catch (err) {
      next(err);
    }
  },

  sendRequest: async (req, res, next) => {
    try {
      const targetId = req.params.id;
      const result = await friendService.sendRequestService(req.user.id, targetId);
      if (result.accepted) return successResponse(res, 200, "Friend request accepted automatically (mutual).");
      return successResponse(res, 200, "Friend request sent");
    } catch (err) {
      next(err);
    }
  },

  acceptRequest: async (req, res, next) => {
    try {
      const senderId = req.params.id;
      await friendService.acceptRequestService(req.user.id, senderId);
      return successResponse(res, 200, "Friend request accepted");
    } catch (err) {
      next(err);
    }
  },

  rejectRequest: async (req, res, next) => {
    try {
      const senderId = req.params.id;
      await friendService.rejectRequestService(req.user.id, senderId);
      return successResponse(res, 200, "Friend request rejected");
    } catch (err) {
      next(err);
    }
  },

  unfriend: async (req, res, next) => {
    try {
      const friendId = req.params.id;
      await friendService.unfriendService(req.user.id, friendId);
      return successResponse(res, 200, "Unfriended successfully");
    } catch (err) {
      next(err);
    }
  },
  cancelRequest: async (req, res, next) => {
  try {
    const targetId = req.params.id;
    await friendService.cancelRequestService(req.user.id, targetId);
    return successResponse(res, 200, "Friend request canceled");
  } catch (err) {
    next(err);
  }
}
};

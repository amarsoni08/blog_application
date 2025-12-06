import commentService from "./commentService.js";
import { successResponse } from "../../utils/responseHandler.js";

export default {
  // POST /comments/:postId
  createComment: async (req, res, next) => {
    try {
      const { content, parent } = req.body;
      const postId = req.params.postId;
      if (!content || !content.trim()) return next({ statusCode: 400, message: "Content required" });

      const comment = await commentService.createCommentService({
        postId,
        authorId: req.user.id,
        content: content.trim(),
        parent: parent || null
      });

      return successResponse(res, 201, "Comment created", comment);
    } catch (err) {
      next(err);
    }
  },

  // GET /comments/:postId
  getComments: async (req, res, next) => {
    try {
      const postId = req.params.postId;
      const comments = await commentService.getCommentsService(postId);
      return successResponse(res, 200, "Comments fetched", comments);
    } catch (err) {
      next(err);
    }
  },

  // DELETE /comments/:id
  deleteComment: async (req, res, next) => {
    try {
      const commentId = req.params.id;
      await commentService.deleteCommentService(commentId, req.user.id);
      return successResponse(res, 200, "Comment deleted");
    } catch (err) {
      next(err);
    }
  }
};

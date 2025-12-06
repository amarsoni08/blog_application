import Comment from "../../models/commentModel.js";
import Post from "../../models/postModel.js";

async function buildCommentTree(comment) {
  const replies = await Comment.find({ parent: comment._id })
    .populate("author", "firstName lastName profileImage")
    .lean();

  for (let reply of replies) {
    reply.replies = await buildCommentTree(reply);
  }

  return replies;
}
export default {
  // create comment or reply
  createCommentService: async ({ postId, authorId, content, parent = null }) => {
    // validate post exists
    const post = await Post.findById(postId);
    if (!post) throw { statusCode: 404, message: "Post not found" };

    const comment = await Comment.create({
      post: postId,
      author: authorId,
      content,
      parent: parent || null
    });

    // if it's a reply, attach it to parent's replies array
    if (parent) {
      await Comment.findByIdAndUpdate(parent, { $push: { replies: comment._id } });
    }

    // increment post commentsCount if top-level comment OR repliesCount if you want separate
    await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    // return populated comment
    return await Comment.findById(comment._id)
      .populate("author", "firstName lastName profileImage");
  },

  // get top-level comments for a post with replies populated (one level)
  getCommentsService: async (postId) => {
    // Step 1: Get only top-level comments (parent = null)
    const topComments = await Comment.find({
      post: postId,
      parent: null
    })
      .populate("author", "firstName lastName profileImage")
      .sort({ createdAt: 1 })
      .lean();

    // Step 2: For each top comment → attach nested replies
    for (let c of topComments) {
      c.replies = await buildCommentTree(c);
    }

    return topComments;
  },

  // delete comment or reply
  deleteCommentService: async (commentId, userId) => {
    const comment = await Comment.findById(commentId);
    if (!comment) throw { statusCode: 404, message: "Comment not found" };

    // only author can delete
    if (String(comment.author) !== String(userId)) throw { statusCode: 403, message: "Unauthorized" };

    // if it's a reply: remove its id from parent's replies array
    if (comment.parent) {
      await Comment.findByIdAndUpdate(comment.parent, { $pull: { replies: comment._id } });
    } else {
      // if deleting top-level comment also delete its replies (cascade)
      if (comment.replies && comment.replies.length > 0) {
        await Comment.deleteMany({ _id: { $in: comment.replies } });
      }
    }

    await Comment.findByIdAndDelete(commentId);

    // decrement post commentsCount
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

    return true;
  }
};

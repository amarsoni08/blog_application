import postService from "./postService.js";
import { successResponse } from "../../utils/responseHandler.js";
import { createPostSchema, updatePostSchema } from "./postValidation.js";
import Post from "../../models/postModel.js";
export default {
  createPost: async (req, res, next) => {
    try {
      const { error } = createPostSchema.validate(req.body);
      if (error) return next({ statusCode: 400, message: error.details[0].message });

      const imageUrls = req.files.map(file => file.path);
      if (imageUrls.length === 0)
        return next({ statusCode: 400, message: "At least one image required" });

      const post = await postService.createPostService(
        req.user.id,
        req.body.caption,
        imageUrls
      );

      return successResponse(res, 201, "Post created successfully", post);
    } catch (err) {
      next(err);
    }
  },
  getAllPosts: async (req, res, next) => {
    try {
      const posts = await postService.getAllPostsService();
      return successResponse(res, 200, "Posts fetched", posts);
    } catch (err) {
      next(err);
    }
  },
  getSinglePost: async (req, res, next) => {
    try {
      const post = await postService.getSinglePostService(req.params.id);
      return successResponse(res, 200, "Post fetched", post);
    } catch (err) {
      next(err);
    }
  },

  updatePost: async (req, res, next) => {
    try {
      const { caption, removeImages } = req.body;

      // new images uploaded
      const newImages = req.files?.length > 0
        ? req.files.map(f => f.path)
        : [];

      // images to remove (UI se array string aayega)
      const removeList = removeImages
        ? JSON.parse(removeImages)
        : [];

      const updatedPost = await postService.updatePostService(
        req.params.id,
        req.user.id,
        caption,
        newImages,
        removeList
      );

      return successResponse(res, 200, "Post updated", updatedPost);
    } catch (err) {
      next(err);
    }
  },


  deletePost: async (req, res, next) => {
    try {
      await postService.deletePostService(req.params.id, req.user.id);
      return successResponse(res, 200, "Post deleted");
    } catch (err) {
      next(err);
    }
  },
  toggleLike: async (req, res, next) => {
    try {
      const postId = req.params.id;
      const userId = req.user.id;

      const post = await Post.findById(postId);
      if (!post) return next({ statusCode: 404, message: "Post not found" });

      const alreadyLiked = post.likes.includes(userId);

      if (alreadyLiked) {
        post.likes.pull(userId);
      } else {
        post.likes.push(userId);
      }

      await post.save();

      return successResponse(res, 200, "Like updated", {
        liked: !alreadyLiked,
        likesCount: post.likes.length
      });

    } catch (err) {
      next(err);
    }
  },
  getPostLikes: async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id)
        .populate("likes", "firstName lastName profileImage");

      return successResponse(res, 200, "Likes fetched", post.likes);
    } catch (err) {
      next(err);
    }
  }


}
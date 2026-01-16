import Post from "../../models/postModel.js";

export default {
    // CREATE
  createPostService: async (userId, caption, imageUrls) => {
    return await Post.create({
      caption,
      images: imageUrls,
      author: userId
    });
  },

  // GET ALL
  getAllPostsService: async () => {
    return await Post.find()
      .populate("author", "firstName lastName profileImage")
      .sort({ createdAt: -1 });
  },

    // GET SINGLE
  getSinglePostService: async (postId) => {
    const post = await Post.findById(postId)
      .populate("author", "firstName lastName profileImage");

    if (!post) throw { statusCode: 404, message: "Post not found" };

    return post;
  },

  // UPDATE
  updatePostService: async (postId, userId, caption, newImages = [], removeImages = []) => {
  const post = await Post.findById(postId);
  if (!post) throw { statusCode: 404, message: "Post not found" };

  if (String(post.author) !== String(userId))
    throw { statusCode: 403, message: "Unauthorized" };

  // Update caption
  if (caption !== undefined) {
    post.caption = caption;
  }

  // Remove selected old images
  if (removeImages.length > 0) {
    post.images = post.images.filter(img => !removeImages.includes(img));
  }

  // Add new uploaded images
  if (newImages.length > 0) {
    post.images.push(...newImages);
  }

  // At least 1 image required
  if (post.images.length === 0) {
    throw { statusCode: 400, message: "Post must have at least 1 image" };
  }

  await post.save();
  return post;
},


  // DELETE
  deletePostService: async (postId, userId) => {
    const post = await Post.findById(postId);
    if (!post) throw { statusCode: 404, message: "Post not found" };

    if (post.author.toString() !== userId)
      throw { statusCode: 403, message: "Unauthorized" };

    await Post.findByIdAndDelete(postId);
    return true;
  },

    getPostsByUserService: async (userId) => {
    const postbyuser = await Post.find({ author: userId })
      .populate("author", "firstName lastName profileImage")
      .sort({ createdAt: -1 });

    return postbyuser;
  }
}

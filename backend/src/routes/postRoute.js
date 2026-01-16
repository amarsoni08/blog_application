import express from "express";
import { userauthenticateJWT } from "../middlewares/userAuth.js";
import postController from '../modules/post/postController.js';
import {upload} from "../middlewares/multer.js";

const postRouter = express.Router();

postRouter.post("/create",userauthenticateJWT,upload.array("images", 10),postController.createPost);
postRouter.get("/",userauthenticateJWT,postController.getAllPosts);
postRouter.get("/:id", userauthenticateJWT,postController.getSinglePost);
postRouter.patch("/:id",userauthenticateJWT,upload.array("images", 10),postController.updatePost);
postRouter.delete("/:id",userauthenticateJWT,postController.deletePost);
postRouter.post("/:id/like", userauthenticateJWT, postController.toggleLike);
postRouter.get("/:id/likes", userauthenticateJWT, postController.getPostLikes);
postRouter.get("/user/:id", userauthenticateJWT, postController.getPostsByUser);
export default postRouter;

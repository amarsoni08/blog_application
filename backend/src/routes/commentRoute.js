import express from "express";  
import { userauthenticateJWT } from "../middlewares/userAuth.js";
import commentController from '../modules/comment/commentController.js';

const commentRouter = express.Router();

commentRouter.post("/:postId", userauthenticateJWT, commentController.createComment);
commentRouter.get("/:postId", commentController.getComments);
commentRouter.delete("/:id", userauthenticateJWT, commentController.deleteComment);

export default commentRouter;
import express from "express";
import messageController from "../modules/message/messageController.js";
import {userauthenticateJWT} from "../middlewares/userAuth.js";

const messageRouter = express.Router();
messageRouter.get("/friends", userauthenticateJWT, messageController.getMessageFriends);
messageRouter.get("/chat/:friendId", userauthenticateJWT, messageController.getChatHistory);
messageRouter.post("/send/:friendId", userauthenticateJWT, messageController.sendMessage);
messageRouter.post("/seen", userauthenticateJWT, messageController.markSeen); // body: { messageId }
messageRouter.post("/react/:messageId", userauthenticateJWT, messageController.reactMessage);
messageRouter.post("/delete/:messageId", userauthenticateJWT, messageController.deleteForEveryone);
messageRouter.get("/unread-count", userauthenticateJWT, messageController.getUnreadCount);
export default messageRouter;
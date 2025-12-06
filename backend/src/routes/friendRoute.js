import express from "express";
import friendController from "../modules/friends/friendController.js";
import {userauthenticateJWT} from "../middlewares/userAuth.js";

const friendRouter = express.Router();

// get aggregated data: my friends, sent, received, and list of all users
friendRouter.get("/data", userauthenticateJWT, friendController.getFriendsData);

// send request
friendRouter.post("/send/:id", userauthenticateJWT, friendController.sendRequest);

// accept
friendRouter.post("/accept/:id", userauthenticateJWT, friendController.acceptRequest);

// reject
friendRouter.post("/reject/:id", userauthenticateJWT, friendController.rejectRequest);

// unfriend
friendRouter.post("/unfriend/:id", userauthenticateJWT, friendController.unfriend);

friendRouter.post("/cancel/:id", userauthenticateJWT, friendController.cancelRequest);

export default friendRouter;
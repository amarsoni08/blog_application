import express from "express";
import { userauthenticateJWT } from "../middlewares/userAuth.js";
import userController from '../modules/user/userController.js';
import {upload,formParser} from "../middlewares/multer.js";
const userRouter = express.Router();

userRouter.post("/register", upload.single("profileImage"), userController.registerUser);
userRouter.post("/login",formParser, userController.loginUser);
userRouter.patch('/update/profile', userauthenticateJWT,upload.single("profileImage"), userController.editProfile);
userRouter.get('/userprofile', userauthenticateJWT, userController.getProfile);
userRouter.post('/reset-password', userauthenticateJWT, userController.resetPassword);
userRouter.post('/forgot-password/send-otp', userController.sendOtp);
userRouter.post('/forgot-password/verify-otp', userController.verifyOtpAndReset);
userRouter.patch(
  "/remove/profile-image",
  userauthenticateJWT,
  userController.removeProfileImage
);
userRouter.get("/me", userauthenticateJWT,userController.logininfo);
userRouter.post("/last-seen",userauthenticateJWT,userController.setLastSeen);
userRouter.post("/location",userauthenticateJWT,userController.updateLocation);
userRouter.get("/friends/map",userauthenticateJWT,userController.getFriendsForMap);
export default userRouter;                  

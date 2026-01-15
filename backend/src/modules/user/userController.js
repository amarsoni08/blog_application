import { registerSchema, loginSchema, updateProfileSchema ,resetPasswordSchema } from "./userValidation.js";
import userService from "./userService.js";
import { successResponse } from "../../utils/responseHandler.js";
import User from "../../models/userModel.js";
export default {

    registerUser: async (req, res, next) => {
        try {

            const { error } = registerSchema.validate(req.body);
            if (error) return next({ statusCode: 400, message: error.details[0].message });

            const user = await userService.signupService(req.body);

            return successResponse(res, 201, "User created successfully", user);

        } catch (err) {
            return next(err);
        }
    },


    loginUser: async (req, res, next) => {
        try {
            const { error } = loginSchema.validate(req.body);
            if (error) return next({ statusCode: 400, message: error.details[0].message });

            const result = await userService.loginService(req.body);

            return successResponse(res, 200, "Login successful", result);

        } catch (err) {
            return next(err);
        }
    }
    ,
    editProfile: async (req, res, next) => {
  try {
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      bio: req.body.bio
    };

    if (req.body.profileImage && typeof req.body.profileImage === "string") {
      updateData.profileImage = req.body.profileImage;
    }
    if (req.file) {
      updateData.profileImage = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    );

    return successResponse(res, 200, "Profile updated", updatedUser);

  } catch (err) {
    next(err);
  }
},

    getProfile: async (req, res, next) => {
        try {
            const profile = await userService.getUserProfileService(req.user.id);
            return successResponse(res, 200, "Profile fetched successfully", profile);
        } catch (err) {
            next(err);
        }
    },
    resetPassword: async (req, res, next) => {
    try {
        // Validate inputs
        const { error } = resetPasswordSchema.validate(req.body);
        if (error)
            return next({ statusCode: 400, message: error.details[0].message });

        const { oldPassword, newPassword } = req.body;

        // Call service
        await userService.resetPasswordService(
            req.user.id,
            oldPassword,
            newPassword
        );

        return successResponse(res, 200, "Password reset successfully");

    } catch (err) {
        next(err);
    }
},

    sendOtp: async (req, res, next) => {
        try {
            const { email } = req.body;
            if (!email) throw { statusCode: 400, message: "Email is required" };

            await userService.sendOtpService(email);
            return successResponse(res, 200, "OTP sent to your email");
        } catch (err) {
            next(err);
        }
    },
    verifyOtpAndReset: async (req, res, next) => {
        try {
            const { email, otp, newPassword } = req.body;

            if (!email || !otp || !newPassword) {
                throw { statusCode: 400, message: "Email, OTP and new password are required" };
            }

            await userService.verifyOtpAndResetService(email, otp, newPassword);
            return successResponse(res, 200, "Password changed successfully! You can now login.");
        } catch (err) {
            next(err);
        }
    },
    removeProfileImage: async (req, res, next) => {
  try {
    const defaultImage =
      "https://res.cloudinary.com/dww37x72g/image/upload/v1763454332/default_image_q8kqsc.jpg";

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: defaultImage },
      { new: true }
    );

    return successResponse(res, 200, "Profile photo removed", user);

  } catch (err) {
    next(err);
  }
},
 logininfo:async(req,res,next)=>{
  try {
        const user = await User.findById(req.user.id)
            .select("firstName lastName profileImage receivedRequestsCount");

        res.json({ success: true, ...user.toObject() });
    } catch (err) {
        next(err);
    }
 },
 setLastSeen : async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
},
    updateLocation: async (req, res, next) => {
        try {
            const { lat, lng } = req.body;
            await userService.saveUserLocation(req.user.id, lat, lng);
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    },

    getFriendsForMap: async (req, res, next) => {
        try {
            const friends = await userService.getFriendsMapData(req.user.id);
            return res.json(friends);
        } catch (err) {
            next(err);
        }
    },
};

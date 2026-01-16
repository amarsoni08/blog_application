import User from "../../models/userModel.js";
import Post from "../../models/postModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {sendEmail} from "../../utils/sendEmail.js";
export default {

    signupService: async (data) => {
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser)
            throw { statusCode: 409, message: "Email already registered" };
        const hashedPassword = await bcrypt.hash(data.password, 10);
        data.password = hashedPassword;
        const newUser = await User.create(data);

        return {
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            mobile: newUser.mobile
        };
    },


    loginService: async (data) => {
        const user = await User.findOne({ email: data.email }).select("+password");
        if (!user)
            throw { statusCode: 404, message: "User not found" };
        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch)
            throw { statusCode: 401, message: "Invalid credentials" };

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return {
            token,
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                mobile: user.mobile,
                profileImage: user.profileImage,
                receivedRequestsCount: user.receivedRequests.length
            }
        };
    },
    updateProfileService: async (userId, data) => {

    const user = await User.findById(userId);
    if (!user) throw { statusCode: 404, message: "User not found" };

    // Update only new fields
    if (data.firstName) user.firstName = data.firstName;
    if (data.lastName) user.lastName = data.lastName;
    if (data.mobile) user.mobile = data.mobile;
    if (data.bio) user.bio = data.bio;

    // If new image uploaded → update image URL only
    if (data.profileImage) {
        user.profileImage = data.profileImage;
    }

    await user.save();

    return {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        bio: user.bio,
        profileImage: user.profileImage
    };
    },
    getUserProfileService: async (userId) => {
        const user = await User.findById(userId).select("-password");
        if (!user) throw { statusCode: 404, message: "User not found" };
        const postsCount = await Post.countDocuments({ author: userId });
        return {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            mobile: user.mobile,
            bio: user.bio || "",
            profileImage: user.profileImage || null,
            receivedRequestsCount: user.receivedRequests.length,
            friendsCount: user.friends.length,
            postsCount
        };
    },
    sendOtpService: async (email) => {
    const user = await User.findOne({ email });
    if (!user) throw { statusCode: 404, message: "User not found" };

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes


    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendEmail({
      to: email,
      subject: "Your Password Reset OTP - BlogApp",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; border-radius: 10px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello <strong>${user.firstName}</strong>,</p>
          <p>Your OTP for password reset is:</p>
          <h1 style="background: #007bff; color: white; padding: 15px; border-radius: 8px; text-align: center; letter-spacing: 5px;">
            ${otp}
          </h1>
          <p>This OTP is valid for <strong>10 minutes only</strong>.</p>
          <p>If you didn't request this, ignore this email.</p>
          <br>
          <p>Thanks,<br>BlogApp Team</p>
        </div>
      `,
    });

    return { message: "OTP sent successfully" };
  },
  verifyOtpAndResetService: async (email, otp, newPassword) => {
    const user = await User.findOne({ email });
    if (!user) throw { statusCode: 404, message: "User not found" };

    // Check OTP match
    if (user.otp !== otp) {
      throw { statusCode: 400, message: "Invalid OTP" };
    }

    // Check if expired
    if (!user.otpExpiry || user.otpExpiry < Date.now()) {
      throw { statusCode: 400, message: "OTP has expired" };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear OTP fields
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return { message: "Password reset successful" };
  },
 resetPasswordService: async (userId, oldPassword, newPassword) => {

    const user = await User.findById(userId).select("+password");
    if (!user) throw new Error("User not found");
  console.log(oldPassword, newPassword);
    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Current password is incorrect");

    // Prevent same password usage
    const isSameAsOld = await bcrypt.compare(newPassword.trim(), user.password);
    if (isSameAsOld) throw new Error("New password cannot be same as current password");

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword.trim(), 10);

    user.password = hashedPassword;
    await user.save();

    return true;
},
saveUserLocation: async (userId, lat, lng) => {
        const { city, area } = await reverseGeocode(lat, lng);

        await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "location.type": "Point",
                    "location.coordinates": [lng, lat],
                    city,
                    area,
                    lastSeen: new Date()
                }
            },
            { upsert: false }
        );
    },
    getFriendsMapData: async (userId) => {
        const me = await User.findById(userId);

        if (!me) throw new Error("User not found");

        return User.find({
            _id: { $in: me.friends },
            shareLocation: true
        }).select("firstName lastName profileImage city area lastSeen location");
    }

};

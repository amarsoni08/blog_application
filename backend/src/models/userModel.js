import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    mobile: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: "https://res.cloudinary.com/dww37x72g/image/upload/v1763454332/default_image_q8kqsc.jpg"
    },

    bio: {
      type: String,
      maxlength: 200,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    otp: {
      type: String,
      default: null
    },

    otpExpiry: {
      type: Date,
      default: null
    },
    
    role:{
        type: String,
        default: "user"
    },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],           // accepted friends
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],     // ids that THIS user sent to
    receivedRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],  // ids that sent to THIS user
    lastSeen: {
  type: Date,
  default: null
},
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema({
  by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  emoji: { type: String },
}, { _id: false });

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: false },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    content: {
      type: String,
      required: true
    },

    isSeen: {
      type: Boolean,
      default: false
    },

    seenAt: { type: Date },

    isDelivered: {
      type: Boolean,
      default: false
    },

    deliveredAt: { type: Date },

    reactions: [reactionSchema], // multiple reactions allowed

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;

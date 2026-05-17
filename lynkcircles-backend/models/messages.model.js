import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    // Not required: a message may be just an attachment with no text.
    // Validation that *something* (content or fileUrl) is present lives
    // in the controller/socket layer so the rule can stay app-level.
    default: "",
  },
  fileUrl: {
    type: String,
    default: null,
  },
  fileType: {
    type: String,
    enum: ["image", "document", "video", null],
    default: null,
  },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  reactions: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      reaction: {
        type: String,
        enum: ["like", "love", "laugh", "sad"],
      },
    },
  ],
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

/**
 * Two compound indexes covering the only query shapes we run against
 * Messages today:
 *
 *   1. `getMessages(peerId)` — find all messages between two users
 *      ordered by time. With an OR across sender/recipient, the
 *      planner picks whichever covers the most documents; both
 *      directions point at the same (createdAt: 1) sort so the
 *      collection scan goes away on either side.
 *
 *   2. `Conversation.lastMessage` and the "is this read?" path
 *      benefit from indexing `recipient + status` so the markRead
 *      socket handler's `findOneAndUpdate({recipient, status: {$ne}})`
 *      can use an index instead of a full scan as the table grows.
 */
messageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });
messageSchema.index({ recipient: 1, sender: 1, createdAt: 1 });
messageSchema.index({ recipient: 1, status: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;

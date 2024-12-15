import mongoose from "mongoose";

// Conversation Schema
const conversationSchema = new mongoose.Schema({
    participants: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    isGroup: {
      type: Boolean,
      default: false
    },
    groupName: {
      type: String,
      default: null
    },
    groupAdmins: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
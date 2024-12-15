import mongoose from "mongoose";

// CircleAnswer Schema
const circleAnswerSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true, 
    trim: true 
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the user who answered
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question", // Reference to the question being answered
    required: true,
  },
  upvotes: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",  // Users who have upvoted this answer
    }
  ],
  status: {
    type: String,
    enum: ["approved", "pending", "flagged"],
    default: "pending",
  },
  isBestAnswer: { 
    type: Boolean, 
    default: false, // Indicates whether this is the best answer
  },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const CircleAnswer = mongoose.model("CircleAnswer", circleAnswerSchema);
export default CircleAnswer;

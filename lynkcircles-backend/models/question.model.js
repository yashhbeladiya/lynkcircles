import mongoose from "mongoose";

// Question Schema
const questionSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true, 
      maxlength: 150 
    }, // Title of the question
    body: { 
      type: String, 
      required: true, 
      trim: true 
    }, // Detailed description of the question
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    }, // User who asked the question
    tags: { 
      type: [String], 
      default: [] 
    }, // Tags for filtering or search, e.g., ["plumbing", "tips"]
    upvotes: [
      { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }
    ], // Users who upvoted this question
    status: { 
      type: String, 
      enum: ["Open", "Answered", "Closed"], 
      default: "Open" 
    }, // Question status
    bestAnswer: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "CircleAnswer" 
    }, // Reference to the best answer (if applicable)
    comments: [
      {
        user: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User" 
        },
        comment: { 
          type: String, 
          required: true 
        },
        createdAt: { 
          type: Date, 
          default: Date.now 
        },
      }
    ], // Comments on the question
    createdAt: { 
      type: Date, 
      default: Date.now 
    } // Timestamp of when the question was asked
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;

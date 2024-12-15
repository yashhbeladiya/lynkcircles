import mongoose from "mongoose";

const workDetailSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  serviceOffered: { type: String }, // Example: "Plumbing", "Carpentry"
  description: { type: String },
  hourlyRate: { type: Number },
  availability: {
    days: [{ type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] }],
    timeSlots: [
      {
        start: { type: String },
        end: { type: String },
      },
    ],
  },
  ratings: { type: Number },
  reviews: [
    {
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      review: String,
      rating: { type: Number },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const WorkDetail = mongoose.model("WorkDetail", workDetailSchema);

export default WorkDetail;
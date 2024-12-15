import mongoose from "mongoose";

// JobPortfolio Schema

const jobPortfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "workDetail",
    required: true,
  },
  jobTitle: { type: String },
  description: { type: String },
  images: { type: [String] },
  videos: { type: [String] },
  dateCompleted: { type: Date },
  clientUsername: { type: String },
  clientName: { type: String },
  reviews: [
    {
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      review: String,
      rating: { type: Number },
    }, { timestamps: true },
  ],
}, { timestamps: true });

const JobPortfolio = mongoose.model("JobPortfolio", jobPortfolioSchema);

export default JobPortfolio;

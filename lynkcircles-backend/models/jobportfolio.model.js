import mongoose from "mongoose";

/**
 * A review left by a Client on a specific completed job. Has its own
 * timestamps (the previous declaration tried to set them via the
 * array's options block, which mongoose ignores — so reviews had no
 * createdAt before). Supports up to a few proof images.
 */
const portfolioReviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    review: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    images: { type: [String], default: [] },
  },
  { timestamps: true }
);

const jobPortfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkDetail",
      required: true,
    },
    jobTitle: { type: String },
    description: { type: String },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    dateCompleted: { type: Date },
    clientUsername: { type: String },
    clientName: { type: String },
    reviews: { type: [portfolioReviewSchema], default: [] },
  },
  { timestamps: true }
);

const JobPortfolio = mongoose.model("JobPortfolio", jobPortfolioSchema);

export default JobPortfolio;

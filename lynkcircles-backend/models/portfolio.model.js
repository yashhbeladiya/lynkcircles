import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },
  videoUrl: { type: String },
  dateCompleted: { type: Date },
});

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
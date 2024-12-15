import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobTitle: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  skillsRequired: { type: [String], default: [] }, // Skills needed for the job
  location: { type: String, required: true },
  budget: { type: String, required: true },
  requiredOn: { type: Date },
  deadline: { type: Date },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Completed", "Canceled"],
    default: "Open",
  },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

const JobPost = mongoose.model("JobPost", jobPostSchema);

export default JobPost;
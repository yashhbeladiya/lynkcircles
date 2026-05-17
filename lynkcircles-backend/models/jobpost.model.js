import mongoose from "mongoose";

const jobPostSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  jobTitle: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  /**
   * Canonical service slugs the job needs (e.g. ["carpentry"] or
   * ["embroidery-operator"]). Indexed so "match jobs to a Worker's
   * services" is a one-shot query. This is the field everything else
   * (skill-matching, future job alerts, search) keys off.
   */
  serviceKeys: { type: [String], default: [], index: true },
  /**
   * Free-text "must-haves" outside the catalog (e.g. "must speak
   * Hindi", "experience with X brand"). Rendered as additional chips
   * beneath the service chips.
   */
  skillsRequired: { type: [String], default: [] },
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
  /**
   * GeoJSON Point for geospatial queries. Stored as [longitude, latitude].
   * Falls back to the client's profile location when the FE doesn't
   * pass an explicit coordinate set on createJob.
   */
  locationPoint: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number] },
  },
  createdAt: { type: Date, default: Date.now },
});

jobPostSchema.index({ locationPoint: "2dsphere" });

const JobPost = mongoose.model("JobPost", jobPostSchema);

export default JobPost;

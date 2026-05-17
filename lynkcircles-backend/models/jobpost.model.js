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
  /**
   * Three genuinely different things crammed into one model before:
   *
   *   gig         — one-time job ("Fix my cabinet by Sunday for ₹500")
   *   recurring   — ongoing service ("Twice-weekly cleaning, ₹3000/mo")
   *   employment  — full/part-time role ("Embroidery operator, ₹20k +
   *                 bonus, 2 yrs exp")
   *
   * Each surfaces a different subset of the optional fields below. The
   * FE swaps form fields and tile labels off this discriminator. Old
   * records without jobType default to "gig" — that's what they
   * effectively were.
   */
  jobType: {
    type: String,
    enum: ["gig", "recurring", "employment"],
    default: "gig",
    index: true,
  },
  /** recurring jobs only — how often the work repeats. */
  frequency: {
    type: String,
    enum: ["daily", "weekly", "bi-weekly", "monthly"],
  },
  /** employment only — minimum years of experience. */
  experienceMinYears: { type: Number, min: 0 },
  /** employment only — schedule shape. */
  schedule: {
    type: String,
    enum: ["full-time", "part-time"],
  },
  location: { type: String, required: true },
  budget: { type: String, required: true },
  /** When work should start (gig: when needed; recurring/employment: start date). */
  requiredOn: { type: Date },
  /** Applications close (all types). */
  deadline: { type: Date },
  status: {
    type: String,
    enum: ["Open", "In Progress", "Completed", "Canceled"],
    default: "Open",
  },
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  /**
   * The applicant the Client picked. Set when the Client clicks "Hire"
   * on a specific applicant — moves the job to In Progress and locks
   * everyone else out of being hired for this same post. Stays
   * populated through Completed so the Worker's portfolio entry can
   * back-reference it.
   */
  hiredWorker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  /**
   * Flips true after the Client submits a review (via /works/:id/review).
   * Drives the "Leave a review" → "Reviewed" UI state on the detail
   * page so a Client doesn't end up reviewing the same job twice.
   */
  reviewed: { type: Boolean, default: false },
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

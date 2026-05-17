import mongoose from "mongoose";

const workDetailSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    /**
     * Canonical service slug from lib/serviceCatalog.js (e.g. "carpentry",
     * "embroidery-operator"). Required going forward so skill-matching
     * can rely on a controlled vocabulary. The old free-text
     * `serviceOffered` lingers for already-saved records — the FE
     * displays it as a fallback when `serviceKey` is empty.
     */
    serviceKey: { type: String, index: true },
    /** Legacy free-text label — kept for existing records, no new writes. */
    serviceOffered: { type: String },
    description: { type: String },
    hourlyRate: { type: Number },
    /** ISO 4217 currency code. Defaults to INR for the primary market. */
    currency: { type: String, default: "INR" },
    availability: {
      days: [
        {
          type: String,
          enum: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
        },
      ],
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
  },
  { timestamps: true }
);

const WorkDetail = mongoose.model("WorkDetail", workDetailSchema);

export default WorkDetail;

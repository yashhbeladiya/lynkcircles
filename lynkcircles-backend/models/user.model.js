import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["Worker", "Client", "Admin", "Moderator"], required: true },
    profilePicture: { type: String, required: false },
    bannerImage: { type: String, required: false },
    headline: { type: String, default: "lynkCircle User", required: false },
    location: {
      city: String,
      state: String,
      zipCode: String,
    },
    bio: { type: String, default: "I am user of LynkCircles", required: false },
    savedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    resetPasswordToken: { type: String, default: null },
    resetPasswordTokenExpiration: { type: Date, default: null },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      website: { type: String },
    },
    /**
     * Optional contact phone. Stored as a digit-only string (no
     * spaces, dashes, parentheses) so it concatenates cleanly into
     * `wa.me/<phone>` and `tel:` URIs without parsing. India is the
     * primary market — if a number is 10 digits we assume +91 in
     * link generation, but the schema doesn't enforce a country.
     */
    phone: { type: String },
    /** Whether to surface the phone publicly on the profile and as a
     *  WhatsApp link. False keeps it private (admin/account only). */
    phonePublic: { type: Boolean, default: false },
    lastLogin: { type: Date },
    lastActivity: { type: Date },
    /**
     * GeoJSON Point for geospatial queries (2dsphere index, below).
     * Coordinates are stored as [longitude, latitude] per the GeoJSON
     * spec — this catches a lot of people out, so write helpers
     * always take {lat, lng} and the schema reorders on the way in.
     */
    locationPoint: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] },
    },
    /** Legacy lat/long object retained for backward compatibility on
     *  existing records. New writes also update locationPoint. */
    locationCoordinates: {
      lat: { type: Number },
      long: { type: Number },
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Required for the $near / $geoNear / $geoWithin queries that power
// "workers near me" and the distance display on every Worker tile.
userSchema.index({ locationPoint: "2dsphere" });

const User = mongoose.model("User", userSchema);

export default User;

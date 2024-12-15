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
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followingClients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    communityJoined: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Community" },
    ],
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
    lastLogin: { type: Date },
    lastActivity: { type: Date },
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

const User = mongoose.model("User", userSchema);

export default User;

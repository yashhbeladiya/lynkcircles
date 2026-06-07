import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../lib/validate.js";
import { updateProfileSchema } from "../schemas/profile.schema.js";
import {
  getSuggestedConnections,
  getPublicProfile,
  getUserById,
  updateProfile,
  connectUser,
  followClient,
  disconnectUser,
  unfollowClient,
  getUserConnections,
  getUserFollowers,
  getUserFollowing,
  deleteAccount,
  saveUser,
  getSavedWorkers,
} from "../controllers/user.controller.js";
import { runVerificationCheck } from "../lib/verification.js";

const router = express.Router();

// Static / specific paths before the catch-all `/:id`.
router.get("/suggestions", protectRoute, getSuggestedConnections);
router.get("/profile/:username", protectRoute, getPublicProfile);
router.put("/profile", protectRoute, validate(updateProfileSchema), updateProfile);

router.post("/connect/:username", protectRoute, connectUser);
router.post("/follow/:clientId", protectRoute, followClient);
router.delete("/disconnect/:username", protectRoute, disconnectUser);
router.delete("/unfollow/:clientId", protectRoute, unfollowClient);
router.get("/connections", protectRoute, getUserConnections);
router.get("/followers", protectRoute, getUserFollowers);
router.get("/following", protectRoute, getUserFollowing);
router.delete("/delete-account", protectRoute, deleteAccount);
router.post("/save/:userId", protectRoute, saveUser);
router.get("/saved", protectRoute, getSavedWorkers);

// Current verification progress for the requesting user. Inline
// handler — small enough that pulling it into the controller would
// just be ceremony, and the lib function does the actual work.
router.get("/me/verification", protectRoute, async (req, res) => {
  try {
    const status = await runVerificationCheck(req.user._id);
    res.json(status);
  } catch (error) {
    console.error("Error in /me/verification:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Catch-all by ObjectId. Must come last.
router.get("/:id", protectRoute, getUserById);

export default router;

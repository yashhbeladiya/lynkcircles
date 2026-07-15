import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../lib/validate.js";
import { updateProfileSchema } from "../schemas/profile.schema.js";
import {
  getSuggestedWorkers,
  getPublicProfile,
  getUserById,
  updateProfile,
  deleteAccount,
  saveUser,
  getSavedWorkers,
} from "../controllers/user.controller.js";
import { runVerificationCheck } from "../lib/verification.js";

const router = express.Router();

// Static / specific paths before the catch-all `/:id`.
router.get("/suggestions", protectRoute, getSuggestedWorkers);
router.get("/profile/:username", protectRoute, getPublicProfile);
router.put("/profile", protectRoute, validate(updateProfileSchema), updateProfile);

router.delete("/delete-account", protectRoute, deleteAccount);
router.post("/save/:userId", protectRoute, saveUser);
router.get("/saved", protectRoute, getSavedWorkers);

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

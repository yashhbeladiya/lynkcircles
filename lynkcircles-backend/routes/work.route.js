import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  applyForWork,
  createWork,
  deleteWorkPost,
  getMyApplications,
  getMyWorkPosts,
  getWorkApplicants,
  getWorkPostById,
  getWorkPosts,
  updateWorkPost,
  withdrawApplication,
} from "../controllers/work.controller.js";

const router = express.Router();

// Static paths first — `/:id` swallowed every named segment previously,
// so `myapplications`/`applicants` were never reachable.
router.post("/create", protectRoute, createWork);
router.get("/myapplications", protectRoute, getMyApplications);
router.get("/pastWork", protectRoute, getMyWorkPosts);

router.get("/", protectRoute, getWorkPosts);

// Per-job actions. `/:id/applicants` replaces the old `/applicants`
// route — the controller already reads `req.params.id`, so the only
// thing wrong before was the missing :id segment.
router.get("/:id/applicants", protectRoute, getWorkApplicants);
router.post("/:id/apply", protectRoute, applyForWork);
router.delete("/:id/withdraw", protectRoute, withdrawApplication);

router.put("/update/:id", protectRoute, updateWorkPost);
router.delete("/delete/:id", protectRoute, deleteWorkPost);

// Catch-all single-post fetch must come last.
router.get("/:id", protectRoute, getWorkPostById);

export default router;

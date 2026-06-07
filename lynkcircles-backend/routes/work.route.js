import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../lib/validate.js";
import {
  createWorkSchema,
  updateWorkSchema,
  reviewJobSchema,
} from "../schemas/work.schema.js";
import {
  applyForWork,
  createWork,
  deleteWorkPost,
  getMyApplications,
  getMyWorkPosts,
  getWorkApplicants,
  getWorkPostById,
  getWorkPosts,
  hireApplicant,
  markJobComplete,
  reviewCompletedJob,
  updateWorkPost,
  withdrawApplication,
} from "../controllers/work.controller.js";

const router = express.Router();

// Static paths first — `/:id` swallowed every named segment previously,
// so `myapplications`/`applicants` were never reachable.
router.post("/create", protectRoute, validate(createWorkSchema), createWork);
router.get("/myapplications", protectRoute, getMyApplications);
router.get("/pastWork", protectRoute, getMyWorkPosts);

router.get("/", protectRoute, getWorkPosts);

// Per-job actions. `/:id/applicants` replaces the old `/applicants`
// route — the controller already reads `req.params.id`, so the only
// thing wrong before was the missing :id segment.
router.get("/:id/applicants", protectRoute, getWorkApplicants);
router.post("/:id/apply", protectRoute, applyForWork);
router.delete("/:id/withdraw", protectRoute, withdrawApplication);

// Hiring lifecycle: pick applicant → complete → review. Each step
// also runs verification scoring for the hired Worker so the badge
// flips automatically when criteria are met.
router.post("/:id/hire/:workerId", protectRoute, hireApplicant);
router.post("/:id/complete", protectRoute, markJobComplete);
router.post("/:id/review", protectRoute, validate(reviewJobSchema), reviewCompletedJob);

router.put("/update/:id", protectRoute, validate(updateWorkSchema), updateWorkPost);
router.delete("/delete/:id", protectRoute, deleteWorkPost);

// Catch-all single-post fetch must come last.
router.get("/:id", protectRoute, getWorkPostById);

export default router;

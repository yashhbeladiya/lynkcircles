import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getWorkDetails,
  createWorkDetail,
  updateWorkDetail,
  deleteWorkDetail,
  getWorkDetailsbyId,
  deleteWorkDetailbyId,
  getJobPortfolioForService,
  getPortfolioByUsername,
  createJobPortfolio,
  updateJobPortfolio,
  deleteJobPortfolio,
  getJobPortfolioById,
  addPortfolioReview,
  createReview,
  updateReview,
  deleteReview,
  getReview,
  getReviewById,
} from "../controllers/workDetail.controller.js";

const router = express.Router();

// IMPORTANT: every static path below must be declared BEFORE the
// `/:username` catch-all. The previous ordering matched `jobportfolio`
// as a username and 404'd silently on every portfolio request.

// Work details (services) CRUD
router.post("/", protectRoute, createWorkDetail);
router.put("/update", protectRoute, updateWorkDetail);
router.delete("/delete", protectRoute, deleteWorkDetail);
router.delete("/delete/:id", protectRoute, deleteWorkDetailbyId);
router.get("/id/:id", protectRoute, getWorkDetailsbyId);

// Portfolio (completed jobs) — per-user batch fetch + per-service list + CRUD
router.get("/portfolio/user/:username", protectRoute, getPortfolioByUsername);
router.get("/jobportfolio/:serviceId", protectRoute, getJobPortfolioForService);
router.post("/jobportfolio", protectRoute, createJobPortfolio);
router.put("/jobportfolio", protectRoute, updateJobPortfolio);
router.delete("/jobportfolio/:id", protectRoute, deleteJobPortfolio);
router.get("/jobportfolio/id/:id", protectRoute, getJobPortfolioById);
router.post("/jobportfolio/:id/review", protectRoute, addPortfolioReview);

// Service-level reviews (overall rating for a service, not per job)
router.post("/review/:serviceId", protectRoute, createReview);
router.put("/review/:serviceId", protectRoute, updateReview);
router.delete("/review/:serviceId", protectRoute, deleteReview);
router.get("/review/:serviceId", protectRoute, getReview);
router.get("/review/:serviceId/:reviewerId", protectRoute, getReviewById);

// Catch-all: all services for a username. MUST come last.
router.get("/:username", protectRoute, getWorkDetails);

export default router;

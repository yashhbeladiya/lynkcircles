import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getInsights } from "../controllers/insights.controller.js";

const router = express.Router();

router.get("/", protectRoute, getInsights);

export default router;

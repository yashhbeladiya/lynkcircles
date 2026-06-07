import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMatches } from "../controllers/match.controller.js";

const router = express.Router();

router.get("/", protectRoute, getMatches);

export default router;

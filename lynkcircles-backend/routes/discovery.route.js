import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMapData } from "../controllers/discovery.controller.js";

const router = express.Router();

router.get("/map", protectRoute, getMapData);

export default router;

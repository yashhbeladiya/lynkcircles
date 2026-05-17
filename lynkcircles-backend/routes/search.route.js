import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { search } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/", protectRoute, search);

export default router;

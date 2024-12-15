import express from 'express';
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMyApplications, getWorkPosts } from '../controllers/work.controller.js';
import { applyForWork, createWork, deleteWorkPost, getMyWorkPosts, getWorkPostById, updateWorkPost, getWorkApplicants, withdrawApplication } from '../controllers/work.controller.js';
const router = express.Router();

router.get("/pastWork", protectRoute, getMyWorkPosts);
router.post("/create", protectRoute, createWork);
router.get("/", protectRoute, getWorkPosts);
router.get("/:id", protectRoute, getWorkPostById);
router.put("/update/:id", protectRoute, updateWorkPost);
router.delete("/delete/:id", protectRoute, deleteWorkPost);

router.post("/:id/apply", protectRoute, applyForWork);
router.delete("/:id/withdraw", protectRoute, withdrawApplication);

router.get("/myapplications", protectRoute, getMyApplications);

router.get("/applicants", protectRoute, getWorkApplicants);


export default router;
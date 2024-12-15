import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getFeedPosts, createPost, deletePost, getPostById, createComment, likePost} from "../controllers/feed.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize:  1024 * 1024 } });

const router = express.Router();

router.get("/", protectRoute, getFeedPosts);
router.post("/create", protectRoute, upload.single('image'), createPost);
router.delete("/delete/:id", protectRoute, deletePost);
router.get("/:id", protectRoute, getPostById);
router.post("/:id/comment", protectRoute, createComment);
router.post("/:id/like", protectRoute, likePost);

export default router;
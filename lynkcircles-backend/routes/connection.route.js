
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptConnectionRequest,
    removeConnection,
  getConnectionRequests,
  getConnectionStatus,
  rejectConnectionRequest,
  sendConnectionRequest,
} from "../controllers/connection.controller.js";
import { getUserConnections } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/request/:userId", protectRoute, sendConnectionRequest);
router.get("/requests", protectRoute, getConnectionRequests);
router.put("/requests/:id/accept", protectRoute, acceptConnectionRequest);
router.put("/requests/:id/reject", protectRoute, rejectConnectionRequest);
router.delete("/requests/:id", protectRoute, removeConnection);
router.get("/", protectRoute, getUserConnections);
router.get("/status/:userId", protectRoute, getConnectionStatus);



export default router;
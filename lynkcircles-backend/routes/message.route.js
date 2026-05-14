import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";

import {
  createMessage,
  getConversations,
  getConversation,
  uploadAttachment,
  getMessages,
} from "../controllers/message.controller.js";

const router = express.Router();

// More specific paths must come before the catch-all `/:recipientId`,
// otherwise Express matches `/conversations` as `/:recipientId` with
// recipientId="conversations".
router.post("/upload", protectRoute, uploadAttachment);
router.get("/conversations", protectRoute, getConversations);
router.get("/conversations/:conversationId", protectRoute, getConversation);

router.post("/", protectRoute, createMessage);
router.get("/:recipientId", protectRoute, getMessages);

export default router;

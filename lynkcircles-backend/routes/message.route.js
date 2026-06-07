import express from "express";
import multer from "multer";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../lib/validate.js";
import { createMessageSchema } from "../schemas/message.schema.js";

import {
  createMessage,
  getConversations,
  getConversation,
  uploadAttachment,
  getMessages,
} from "../controllers/message.controller.js";

const router = express.Router();

// In-memory uploads. Buffer is streamed to Cloudinary in the handler.
// 10MB cap matches the express body limit and covers most images/docs.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// More specific paths must come before the catch-all `/:recipientId`,
// otherwise Express matches `/conversations` as `/:recipientId` with
// recipientId="conversations".
router.post("/upload", protectRoute, upload.single("file"), uploadAttachment);
router.get("/conversations", protectRoute, getConversations);
router.get("/conversations/:conversationId", protectRoute, getConversation);

router.post("/", protectRoute, validate(createMessageSchema), createMessage);
router.get("/:recipientId", protectRoute, getMessages);

export default router;

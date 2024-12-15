import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';

import {
    createMessage,
    getConversations,
    getConversation,
    uploadAttachment
    } from '../controllers/message.controller.js';

const router = express.Router();

router.post('/', protectRoute, createMessage);


router.get('/conversations', protectRoute, getConversations);
router.get('/conversations/:conversationId', protectRoute, getConversation);
router.post('/upload', protectRoute, uploadAttachment);

export default router;

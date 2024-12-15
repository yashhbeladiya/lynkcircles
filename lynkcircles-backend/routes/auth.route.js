import express from 'express';
import { signup, login, logout, forgotPassword } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getMe } from '../controllers/auth.controller.js';



const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgotpassword', forgotPassword);

router.get('/me', protectRoute, getMe);

export default router;
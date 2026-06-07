import express from "express";
import { signup, login, logout, forgotPassword, getMe } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../lib/validate.js";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
} from "../schemas/auth.schema.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/forgotpassword", validate(forgotPasswordSchema), forgotPassword);

router.get("/me", protectRoute, getMe);

export default router;

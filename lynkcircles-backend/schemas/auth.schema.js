import { z } from "zod";

const username = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must be at most 30 characters")
  .regex(/^[a-zA-Z0-9_.]+$/, "Letters, numbers, _ and . only");

const password = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(200);

export const signupSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  username,
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password,
  role: z.enum(["Worker", "Client"], {
    message: "Pick whether you're hiring or being hired",
  }),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
});

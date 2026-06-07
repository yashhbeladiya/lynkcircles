import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid id");

export const createMessageSchema = z
  .object({
    recipient: objectId,
    content: z.string().max(5000).optional(),
    fileUrl: z.string().url().optional(),
    fileType: z.enum(["image", "document", "video"]).optional(),
  })
  .refine((v) => (v.content && v.content.trim().length > 0) || v.fileUrl, {
    message: "Message must have text or an attachment",
    path: ["content"],
  });

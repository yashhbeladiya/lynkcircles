import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{7,15}$/, "Enter a valid phone number")
  .or(z.literal(""));

const urlOrEmpty = z.string().trim().url().or(z.literal(""));

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  headline: z.string().trim().max(160).optional(),
  bio: z.string().trim().max(2000).optional(),
  profilePicture: z.string().optional(),
  bannerImage: z.string().optional(),
  phone: phoneSchema.optional(),
  phonePublic: z.coerce.boolean().optional(),
  location: z
    .object({
      city: z.string().trim().max(80).optional(),
      state: z.string().trim().max(80).optional(),
      zipCode: z.string().trim().max(20).optional(),
    })
    .optional(),
  locationCoordinates: z
    .object({ lat: z.number(), long: z.number() })
    .optional(),
  socialLinks: z
    .object({
      linkedin: urlOrEmpty.optional(),
      github: urlOrEmpty.optional(),
      twitter: urlOrEmpty.optional(),
      facebook: urlOrEmpty.optional(),
      website: urlOrEmpty.optional(),
    })
    .optional(),
});

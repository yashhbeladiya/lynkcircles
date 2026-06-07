import { z } from "zod";
import { isValidServiceKey } from "../lib/serviceCatalog.js";

const jobTypeSchema = z.enum(["gig", "recurring", "employment"]);
const frequencySchema = z.enum(["daily", "weekly", "bi-weekly", "monthly"]);
const scheduleSchema = z.enum(["full-time", "part-time"]);

const serviceKeysSchema = z
  .array(z.string().refine(isValidServiceKey, "Unknown service"))
  .min(1, "Pick at least one service")
  .max(8, "Too many services");

const baseFields = {
  jobTitle: z.string().trim().min(4, "Title is too short").max(140),
  description: z.string().trim().min(10, "Add a short description").max(4000),
  serviceKeys: serviceKeysSchema,
  skillsRequired: z.array(z.string().max(60)).max(15).optional(),
  jobType: jobTypeSchema.default("gig"),
  location: z.string().trim().min(2).max(200),
  budget: z.string().trim().min(1).max(120),
  requiredOn: z.coerce.date().optional(),
  deadline: z.coerce.date().optional(),
  frequency: frequencySchema.optional(),
  schedule: scheduleSchema.optional(),
  experienceMinYears: z.coerce.number().int().min(0).max(50).optional(),
  locationCoordinates: z
    .object({ lat: z.number(), lng: z.number() })
    .optional(),
};

export const createWorkSchema = z
  .object(baseFields)
  .refine((j) => j.jobType !== "recurring" || j.frequency, {
    message: "Recurring jobs need a frequency",
    path: ["frequency"],
  })
  .refine((j) => j.jobType !== "employment" || j.schedule, {
    message: "Employment posts need a schedule",
    path: ["schedule"],
  });

export const updateWorkSchema = z.object({
  jobTitle: baseFields.jobTitle.optional(),
  description: baseFields.description.optional(),
  serviceKeys: serviceKeysSchema.optional(),
  skillsRequired: baseFields.skillsRequired,
  jobType: jobTypeSchema.optional(),
  location: baseFields.location.optional(),
  budget: baseFields.budget.optional(),
  requiredOn: baseFields.requiredOn,
  deadline: baseFields.deadline,
  frequency: baseFields.frequency,
  schedule: baseFields.schedule,
  experienceMinYears: baseFields.experienceMinYears,
  status: z.enum(["Open", "In Progress", "Completed", "Canceled"]).optional(),
});

export const reviewJobSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  review: z.string().trim().min(1, "Review can't be empty").max(2000),
  images: z.array(z.string().url()).max(8).optional(),
});

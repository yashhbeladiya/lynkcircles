import express from "express";
import { SERVICE_CATALOG } from "../lib/serviceCatalog.js";

const router = express.Router();

/**
 * Public catalog. Auth not required — the catalog itself isn't
 * sensitive, and the sign-up "what do you do?" prompt may want to
 * read it before a user exists. ETag-friendly response: same payload
 * every time until we move to a DB-backed catalog.
 */
router.get("/", (_req, res) => {
  res.set("Cache-Control", "public, max-age=300");
  res.json({ categories: SERVICE_CATALOG });
});

export default router;

import User from "../models/user.model.js";
import WorkDetail from "../models/workdetail.model.js";
import JobPost from "../models/jobpost.model.js";
import { SERVICE_CATALOG } from "../lib/serviceCatalog.js";

/**
 * Escape a user-supplied string before dropping it into a RegExp.
 * Without this, "C++" or a stray "(" would either throw or behave
 * surprisingly. We don't accept regex syntax from clients.
 */
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const WORKER_FIELDS =
  "_id firstName lastName username profilePicture verified headline role location locationPoint locationCoordinates";

/**
 * Match a free-text query against the service catalog so "carpenter"
 * also surfaces "carpentry" / "Furniture Making" results. Returns
 * { matchedKeys, matchedEntries } — keys feed serviceKey filters,
 * entries are surfaced as "did you mean" suggestion chips.
 */
const resolveCatalogMatches = (q) => {
  const lower = q.toLowerCase();
  const matchedEntries = [];
  for (const cat of SERVICE_CATALOG) {
    for (const svc of cat.services) {
      const label = svc.label.toLowerCase();
      const key = svc.key.toLowerCase();
      if (label.includes(lower) || key.includes(lower) || lower.includes(key)) {
        matchedEntries.push({ key: svc.key, label: svc.label });
      }
    }
  }
  return {
    matchedEntries: matchedEntries.slice(0, 6),
    matchedKeys: matchedEntries.map((e) => e.key),
  };
};

/**
 * Cross-resource search. Returns Workers, open Jobs, and any matched
 * catalog service chips. Cheap MVP-grade text matching via regex on
 * a small set of fields — when this becomes slow we'll move to a
 * Mongo $text index or an Atlas Search index, but for the current
 * data scale this is fine and lets us iterate without infra changes.
 *
 * Response shape:
 *   { workers: UserSummary[], jobs: JobPost[], services: {key,label}[] }
 *
 * Each list is capped at 8 to keep the palette dropdown scannable.
 * Workers/jobs that match a catalog service via the user's query
 * come back even if the free-text fields don't hit — so "carpenter"
 * surfaces every Worker offering Carpentry even if their headline
 * says "I build cabinets."
 */
export const search = async (req, res) => {
  try {
    const raw = (req.query.q ?? "").toString().trim();
    if (raw.length < 1) {
      return res.json({ workers: [], jobs: [], services: [] });
    }

    const pattern = new RegExp(escapeRegex(raw), "i");
    const { matchedEntries, matchedKeys } = resolveCatalogMatches(raw);

    // Workers offering a matched service. Two-step: services that
    // match the query → users who provide them. Worker dedupe by id.
    const userIdsFromService = matchedKeys.length
      ? await WorkDetail.distinct("user", {
          serviceKey: { $in: matchedKeys },
        })
      : [];

    const workerQuery = {
      role: "Worker",
      _id: { $ne: req.user._id },
      $or: [
        { firstName: pattern },
        { lastName: pattern },
        { username: pattern },
        { headline: pattern },
        ...(userIdsFromService.length
          ? [{ _id: { $in: userIdsFromService } }]
          : []),
      ],
    };

    // Jobs by free-text OR by serviceKey overlap. status: Open so
    // closed/in-progress jobs don't clutter the palette.
    const jobQuery = {
      status: "Open",
      $or: [
        { jobTitle: pattern },
        { description: pattern },
        { location: pattern },
        ...(matchedKeys.length
          ? [{ serviceKeys: { $in: matchedKeys } }]
          : []),
      ],
    };

    const [workers, jobs] = await Promise.all([
      User.find(workerQuery).select(WORKER_FIELDS).limit(8).lean(),
      JobPost.find(jobQuery)
        .sort({ createdAt: -1 })
        .limit(8)
        .populate(
          "author",
          "firstName lastName username profilePicture verified"
        )
        .lean(),
    ]);

    res.json({ workers, jobs, services: matchedEntries });
  } catch (error) {
    console.error("Error in search:", error.message);
    res.status(500).json({ message: "Search failed" });
  }
};

import User from "../models/user.model.js";
import WorkDetail from "../models/workdetail.model.js";
import JobPost from "../models/jobpost.model.js";
import { SERVICE_CATALOG } from "../lib/serviceCatalog.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const WORKER_FIELDS =
  "_id firstName lastName username profilePicture verified headline role location locationPoint locationCoordinates";

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

export const search = async (req, res) => {
  try {
    const raw = (req.query.q ?? "").toString().trim();
    if (raw.length < 1) {
      return res.json({ workers: [], jobs: [], services: [] });
    }

    const pattern = new RegExp(escapeRegex(raw), "i");
    const { matchedEntries, matchedKeys } = resolveCatalogMatches(raw);

    const userIdsFromService = matchedKeys.length
      ? await WorkDetail.distinct("user", {
          serviceKey: { $in: matchedKeys },
        })
      : [];

    const workerQuery = {
      role: "Worker",
      _id: { $ne: req.user?._id },
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

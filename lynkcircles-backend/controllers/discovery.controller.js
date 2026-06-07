import User from "../models/user.model.js";
import JobPost from "../models/jobpost.model.js";
import { lookupService } from "../lib/serviceCatalog.js";

const userProjection = {
  firstName: 1,
  lastName: 1,
  username: 1,
  profilePicture: 1,
  headline: 1,
  verified: 1,
  role: 1,
  locationPoint: 1,
  "location.city": 1,
};

const jobProjection = {
  jobTitle: 1,
  serviceKeys: 1,
  jobType: 1,
  budget: 1,
  location: 1,
  status: 1,
  locationPoint: 1,
};

const toMarker = (doc, kind, extra = {}) => {
  if (!doc.locationPoint?.coordinates) return null;
  const [lng, lat] = doc.locationPoint.coordinates;
  return { id: doc._id, lat, lng, kind, ...extra };
};

export const getMapData = async (req, res) => {
  try {
    const [workers, jobs] = await Promise.all([
      User.find({
        role: "Worker",
        "locationPoint.coordinates": { $exists: true, $ne: [] },
      })
        .select(userProjection)
        .limit(300)
        .lean(),
      JobPost.find({
        status: "Open",
        "locationPoint.coordinates": { $exists: true, $ne: [] },
      })
        .select(jobProjection)
        .limit(300)
        .lean(),
    ]);

    const workerPins = workers
      .map((w) =>
        toMarker(w, "worker", {
          firstName: w.firstName,
          lastName: w.lastName,
          username: w.username,
          profilePicture: w.profilePicture,
          headline: w.headline,
          verified: w.verified,
          city: w.location?.city,
        }),
      )
      .filter(Boolean);

    const jobPins = jobs
      .map((j) =>
        toMarker(j, "job", {
          jobTitle: j.jobTitle,
          serviceKeys: j.serviceKeys,
          serviceLabels: (j.serviceKeys || [])
            .map((k) => lookupService(k)?.label)
            .filter(Boolean),
          jobType: j.jobType,
          budget: j.budget,
          location: j.location,
        }),
      )
      .filter(Boolean);

    res.json({ workers: workerPins, jobs: jobPins });
  } catch (error) {
    console.error("Error in getMapData:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

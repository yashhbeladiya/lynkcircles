import JobPost from "../models/jobpost.model.js";
import WorkDetail from "../models/workdetail.model.js";
import JobPortfolio from "../models/jobportfolio.model.js";
import Notification from "../models/notification.model.js";
import { isValidServiceKey, lookupService } from "../lib/serviceCatalog.js";
import { uploadToCloudinary } from "../util/util.js";
import { runVerificationCheck } from "../lib/verification.js";

const VALID_JOB_TYPES = ["gig", "recurring", "employment"];
const VALID_FREQUENCIES = ["daily", "weekly", "bi-weekly", "monthly"];
const VALID_SCHEDULES = ["full-time", "part-time"];

export const createWork = async (req, res) => {
  try {
    const {
      title,
      description,
      serviceKeys = [],
      skills = [],
      location,
      pay,
      status,
      requiredOn,
      deadline,
      jobType,
      frequency,
      experienceMinYears,
      schedule,
    } = req.body;

    // Drop unknown service keys defensively — the FE picker enforces
    // catalog membership, but a stale FE or curl call shouldn't be
    // able to pollute the matching index.
    const cleanedServiceKeys = Array.isArray(serviceKeys)
      ? Array.from(new Set(serviceKeys.filter((k) => typeof k === "string" && isValidServiceKey(k))))
      : [];

    if (cleanedServiceKeys.length === 0) {
      return res
        .status(400)
        .json({ message: "Pick at least one service from the catalog" });
    }

    const newWork = await JobPost.create({
      jobTitle: title,
      description,
      budget: pay,
      location,
      status,
      requiredOn,
      deadline,
      serviceKeys: cleanedServiceKeys,
      skillsRequired: Array.isArray(skills) ? skills : [],
      author: req.user._id,
    });
    res.status(201).json(newWork);
  } catch (error) {
    console.log("Error in createWork: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkPosts = async (req, res) => {
  try {
    const workPosts = await JobPost.find({ status: "Open" })
      .sort({ createdAt: -1 })
      .populate(
        "author",
        "firstName lastName username profilePicture verified headline"
      )
      .lean();

    if (req.user?.role !== "Worker") {
      return res.status(200).json(workPosts);
    }

    // Worker's offered service keys, drawn from their WorkDetail rows.
    // distinct() returns an array of unique values; the .filter strips
    // null/undefined left over from pre-taxonomy records.
    const userServiceKeys = (
      await WorkDetail.distinct("serviceKey", { user: req.user._id })
    ).filter(Boolean);

    const userServiceSet = new Set(userServiceKeys);

    // Tag every job with a match block: which of the user's services
    // it hits, how many, and a normalized 0..1 score. Then sort:
    // matches first by score desc, ties broken by recency. No-skill
    // jobs (legacy data, or jobs that didn't pick from the catalog)
    // fall to the bottom so they don't crowd out matched results.
    const enriched = workPosts.map((job) => {
      const matched = (job.serviceKeys ?? []).filter((k) =>
        userServiceSet.has(k)
      );
      const total = (job.serviceKeys ?? []).length || 1;
      return {
        ...job,
        match: {
          score: matched.length / total,
          matchedKeys: matched,
          totalKeys: job.serviceKeys?.length ?? 0,
          hasMatch: matched.length > 0,
        },
      };
    });

    enriched.sort((a, b) => {
      if (a.match.score !== b.match.score) return b.match.score - a.match.score;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    res.status(200).json(enriched);
  } catch (error) {
    console.log("Error in getWorkPosts: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await JobPost.findById(postId)
      .populate("author", "firstName lastName username profilePicture headline verified")
      // Populate the hired Worker so the detail page can render their
      // card and link to their profile without a follow-up fetch.
      .populate(
        "hiredWorker",
        "_id firstName lastName username profilePicture headline verified"
      );
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in getWorkPostById: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const applyForWork = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await JobPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Work Post not found" });
    }
    if (post.applicants.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You have already applied for this work" });
    }
    // if closed
    if (post.status !== "Open") {
      return res
        .status(400)
        .json({ message: "Work Post is not open for applications" });
    }

    post.applicants.push(req.user._id);
    await post.save();
    res.status(200).json({ message: "Applied for work successfully" });
  } catch (error) {
    console.log("Error in applyForWork: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateWorkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await JobPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Work Post not found" });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this work post" });
    }
    // The schema field is `jobTitle`; the previous code wrote to a
    // bare `title` field that mongoose silently dropped on save, so
    // job titles were never actually editable. Map FE payload names
    // to schema names explicitly.
    const {
      title,
      description,
      serviceKeys,
      skillsRequired,
      skills,
      location,
      pay,
      status,
      requiredOn,
      deadline,
      jobType,
      frequency,
      experienceMinYears,
      schedule,
    } = req.body;

    if (title !== undefined) post.jobTitle = title;
    if (description !== undefined) post.description = description;
    if (serviceKeys !== undefined) {
      const cleaned = Array.isArray(serviceKeys)
        ? Array.from(
            new Set(
              serviceKeys.filter(
                (k) => typeof k === "string" && isValidServiceKey(k)
              )
            )
          )
        : [];
      post.serviceKeys = cleaned;
    }
    // Accept either `skillsRequired` or `skills` (older FE casing)
    if (skillsRequired !== undefined) post.skillsRequired = skillsRequired;
    else if (skills !== undefined) post.skillsRequired = skills;
    if (location !== undefined) post.location = location;
    if (pay !== undefined) post.budget = pay;
    if (status !== undefined) post.status = status;
    if (requiredOn !== undefined) post.requiredOn = requiredOn;
    if (deadline !== undefined) post.deadline = deadline;
    if (jobType !== undefined && VALID_JOB_TYPES.includes(jobType)) {
      post.jobType = jobType;
    }
    if (frequency !== undefined) {
      post.frequency = VALID_FREQUENCIES.includes(frequency)
        ? frequency
        : undefined;
    }
    if (experienceMinYears !== undefined) {
      post.experienceMinYears =
        typeof experienceMinYears === "number" && experienceMinYears >= 0
          ? experienceMinYears
          : undefined;
    }
    if (schedule !== undefined) {
      post.schedule = VALID_SCHEDULES.includes(schedule) ? schedule : undefined;
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in updateWorkPost: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteWorkPost = async (req, res) => {
  try {
    console.log("Delete work post");
    const postId = req.params.id;
    const post = await JobPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Work Post not found" });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this work post" });
    }
    await JobPost.findByIdAndDelete(postId);
    res.status(200).json({ message: "Work Post deleted successfully" });
  } catch (error) {
    console.log("Error in deleteWorkPost: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyWorkPosts = async (req, res) => {
  try {
    const myWorkPosts = await JobPost.find({ author: req.user._id }).populate(
      "author",
      "firstName lastName username profilePicture"
    );
    res.status(200).json(myWorkPosts);
  } catch (error) {
    console.log("Error in getMyWorkPosts: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const myApplications = await JobPost.find({
      applicants: req.user._id,
    }).populate("author", "firstName lastName username profilePicture");
    res.status(200).json(myApplications);
  } catch (error) {
    console.log("Error in getMyApplications: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await JobPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Work Post not found" });
    }
    if (!post.applicants.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "You have not applied for this work" });
    }
    post.applicants = post.applicants.filter(
      (applicant) => applicant.toString() !== req.user._id.toString()
    );
    await post.save();
    res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (error) {
    console.log("Error in withdrawApplication: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkApplicants = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await JobPost.findById(postId).populate(
      "applicants",
      "firstName lastName username profilePicture verified"
    );
    if (!post) {
      return res.status(404).json({ message: "Work Post not found" });
    }
    res.status(200).json(post.applicants);
  } catch (error) {
    console.log("Error in getWorkApplicants: ", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- HIRING FLOW ---------------- */

const requireJobOwnerOpen = async (req, jobId, allowedStatuses) => {
  const post = await JobPost.findById(jobId);
  if (!post) return { error: { status: 404, message: "Work Post not found" } };
  if (post.author.toString() !== req.user._id.toString()) {
    return { error: { status: 403, message: "Only the job poster can do this" } };
  }
  if (allowedStatuses && !allowedStatuses.includes(post.status)) {
    return {
      error: {
        status: 400,
        message: `Job is ${post.status}, expected one of: ${allowedStatuses.join(", ")}`,
      },
    };
  }
  return { post };
};

export const hireApplicant = async (req, res) => {
  try {
    const { id: jobId, workerId } = req.params;
    const { error, post } = await requireJobOwnerOpen(req, jobId, ["Open"]);
    if (error) return res.status(error.status).json({ message: error.message });

    if (!post.applicants.some((a) => a.toString() === workerId)) {
      return res
        .status(400)
        .json({ message: "That user didn't apply to this job" });
    }

    post.hiredWorker = workerId;
    post.status = "In Progress";
    await post.save();

    // Notify the hired Worker.
    await Notification.create({
      recipient: workerId,
      relatedUser: req.user._id,
      relatedJob: post._id,
      type: "Job Application",
      content: `You were hired for "${post.jobTitle}". The client can message you to get started.`,
    });

    // Notify everyone else who applied — done in parallel, errors
    // swallowed so a single failed notification can't block the hire.
    const others = post.applicants.filter(
      (a) => a.toString() !== workerId
    );
    await Promise.all(
      others.map((id) =>
        Notification.create({
          recipient: id,
          relatedUser: req.user._id,
          relatedJob: post._id,
          type: "Job Application",
          content: `The position for "${post.jobTitle}" has been filled.`,
        }).catch((err) =>
          console.warn("notify-applicant failed (non-fatal):", err.message)
        )
      )
    );

    res.json(post);
  } catch (error) {
    console.error("Error in hireApplicant:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const markJobComplete = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { error, post } = await requireJobOwnerOpen(req, jobId, [
      "In Progress",
    ]);
    if (error) return res.status(error.status).json({ message: error.message });

    if (!post.hiredWorker) {
      return res
        .status(400)
        .json({ message: "Can't complete a job that has no hired Worker" });
    }

    post.status = "Completed";
    await post.save();

    await Notification.create({
      recipient: post.hiredWorker,
      relatedUser: req.user._id,
      relatedJob: post._id,
      type: "Job Application",
      content: `"${post.jobTitle}" was marked complete. Your client may leave a review with photos shortly.`,
    });

    // Verification scoring for the Worker. Idempotent — does nothing
    // if they're already verified or the gate isn't met yet.
    void runVerificationCheck(post.hiredWorker);

    res.json(post);
  } catch (error) {
    console.error("Error in markJobComplete:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const reviewCompletedJob = async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { error, post } = await requireJobOwnerOpen(req, jobId, [
      "Completed",
    ]);
    if (error) return res.status(error.status).json({ message: error.message });

    if (post.reviewed) {
      return res
        .status(409)
        .json({ message: "You already reviewed this job" });
    }
    if (!post.hiredWorker) {
      return res
        .status(400)
        .json({ message: "Can't review a job with no hired Worker" });
    }

    const { rating, review, images = [] } = req.body;
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!review?.trim()) {
      return res.status(400).json({ message: "Write a short review" });
    }

    // Match a service. Prefer one the Worker already lists for the
    // job's serviceKeys; fall back to creating a minimal WorkDetail
    // so the required ref is satisfied (they applied to this job, so
    // they're effectively claiming this service).
    let workDetail = null;
    if (post.serviceKeys?.length) {
      workDetail = await WorkDetail.findOne({
        user: post.hiredWorker,
        serviceKey: { $in: post.serviceKeys },
      });
    }
    if (!workDetail) {
      const fallbackKey = post.serviceKeys?.[0];
      const label = lookupService(fallbackKey)?.label ?? fallbackKey ?? "Service";
      workDetail = await WorkDetail.create({
        user: post.hiredWorker,
        serviceKey: fallbackKey,
        serviceOffered: label,
      });
    }

    // Upload review photos (data URIs from FE) in parallel.
    const uploadedImages = (
      await Promise.all(
        images
          .filter((img) => typeof img === "string" && img.startsWith("data:"))
          .map((img) => uploadToCloudinary(img, "reviews"))
      )
    ).filter(Boolean);

    const portfolio = await JobPortfolio.create({
      user: post.hiredWorker,
      service: workDetail._id,
      jobTitle: post.jobTitle,
      description: post.description,
      images: [],
      videos: [],
      dateCompleted: new Date(),
      clientUsername: req.user.username,
      clientName: `${req.user.firstName} ${req.user.lastName}`,
      reviews: [
        {
          reviewer: req.user._id,
          review: review.trim(),
          rating,
          images: uploadedImages,
        },
      ],
    });

    post.reviewed = true;
    await post.save();

    await Notification.create({
      recipient: post.hiredWorker,
      relatedUser: req.user._id,
      relatedJob: post._id,
      type: "Review",
      content: `You received a new ${rating}-star review for "${post.jobTitle}".`,
    });

    void runVerificationCheck(post.hiredWorker);

    res.status(201).json({ portfolio });
  } catch (error) {
    console.error("Error in reviewCompletedJob:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

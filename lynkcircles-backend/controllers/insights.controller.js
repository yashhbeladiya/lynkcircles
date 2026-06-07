import mongoose from "mongoose";
import User from "../models/user.model.js";
import JobPost from "../models/jobpost.model.js";
import JobPortfolio from "../models/jobportfolio.model.js";
import Message from "../models/messages.model.js";

const DAY = 24 * 60 * 60 * 1000;

const bucketByDay = (rows, days = 14) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(start.getTime() - i * DAY);
    buckets.push({ date, key: date.toISOString().slice(0, 10), count: 0 });
  }
  const index = new Map(buckets.map((b) => [b.key, b]));
  for (const row of rows) {
    const key = new Date(row).toISOString().slice(0, 10);
    const b = index.get(key);
    if (b) b.count += 1;
  }
  return buckets.map(({ date, count }) => ({
    date: date.toISOString().slice(0, 10),
    count,
  }));
};

export const getInsights = async (req, res) => {
  try {
    const me = req.user;
    const myId = new mongoose.Types.ObjectId(me._id);

    if (me.role === "Worker") {
      const since = new Date(Date.now() - 14 * DAY);

      const [savedByUsers, messages, portfolios, applications] = await Promise.all([
        User.countDocuments({ savedWorkers: myId }),
        Message.find({ recipient: myId, createdAt: { $gte: since } })
          .select("createdAt")
          .lean(),
        JobPortfolio.find({ user: myId }).select("reviews dateCompleted").lean(),
        JobPost.find({ applicants: myId })
          .select("status hiredWorker createdAt")
          .lean(),
      ]);

      const reviews = portfolios.flatMap((p) => p.reviews || []);
      const ratingDistribution = [1, 2, 3, 4, 5].map((r) => ({
        rating: r,
        count: reviews.filter((rv) => rv.rating === r).length,
      }));
      const avgRating = reviews.length
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

      const hiredFromApplications = applications.filter(
        (a) => String(a.hiredWorker) === String(myId),
      ).length;

      return res.json({
        role: "Worker",
        totals: {
          saves: savedByUsers,
          reviews: reviews.length,
          avgRating: Number(avgRating.toFixed(2)),
          completedJobs: portfolios.length,
          applications: applications.length,
          hires: hiredFromApplications,
          hireRate: applications.length
            ? Math.round((hiredFromApplications / applications.length) * 100)
            : 0,
        },
        messageVolume: bucketByDay(messages.map((m) => m.createdAt)),
        ratingDistribution,
      });
    }

    // Client view
    const posts = await JobPost.find({ author: myId })
      .select("status applicants hiredWorker createdAt")
      .lean();

    const totals = {
      posts: posts.length,
      open: posts.filter((p) => p.status === "Open").length,
      inProgress: posts.filter((p) => p.status === "In Progress").length,
      completed: posts.filter((p) => p.status === "Completed").length,
      applicants: posts.reduce((s, p) => s + (p.applicants?.length || 0), 0),
      hires: posts.filter((p) => p.hiredWorker).length,
    };
    totals.hireRate = totals.posts ? Math.round((totals.hires / totals.posts) * 100) : 0;

    const postsByStatus = ["Open", "In Progress", "Completed", "Canceled"].map((s) => ({
      status: s,
      count: posts.filter((p) => p.status === s).length,
    }));

    const postsByDay = bucketByDay(posts.map((p) => p.createdAt));

    res.json({
      role: "Client",
      totals,
      postsByStatus,
      postsByDay,
    });
  } catch (error) {
    console.error("Error in getInsights:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

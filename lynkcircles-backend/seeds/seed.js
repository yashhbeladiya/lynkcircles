// Seed script — populates the local MongoDB with realistic
// trades-marketplace data. Idempotent: anything tied to a
// `@lynk.demo` email is wiped before reseeding so re-running
// this script doesn't pile up duplicates.
//
// Usage (from repo root):
//   npm run seed
//
// Password for every seeded user: `demo1234`.

import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "../lib/db.js";
import { toGeoPoint } from "../lib/geo.js";

import User from "../models/user.model.js";
import WorkDetail from "../models/workdetail.model.js";
import JobPortfolio from "../models/jobportfolio.model.js";
import JobPost from "../models/jobpost.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/messages.model.js";
import Notification from "../models/notification.model.js";

import { WORKERS, CLIENTS } from "./data/personas.js";
import { CITIES, cityCoords } from "./data/cities.js";
import { JOBS } from "./data/jobs.js";
import { PORTFOLIOS } from "./data/portfolios.js";
import { CONVERSATIONS } from "./data/conversations.js";

const SEED_EMAIL_SUFFIX = "@lynk.demo";
const SHARED_PASSWORD = "demo1234";

const log = (label, n) => console.log(`  ${label.padEnd(22)} ${n}`);

const wipe = async () => {
  const seeded = await User.find({
    email: { $regex: `${SEED_EMAIL_SUFFIX}$` },
  })
    .select("_id")
    .lean();
  const ids = seeded.map((u) => u._id);
  if (!ids.length) return;

  const [msgs, convs, jobs, portfolios, work, notes, users] = await Promise.all([
    Message.deleteMany({ $or: [{ sender: { $in: ids } }, { recipient: { $in: ids } }] }),
    Conversation.deleteMany({ participants: { $in: ids } }),
    JobPost.deleteMany({ author: { $in: ids } }),
    JobPortfolio.deleteMany({ user: { $in: ids } }),
    WorkDetail.deleteMany({ user: { $in: ids } }),
    Notification.deleteMany({
      $or: [{ recipient: { $in: ids } }, { relatedUser: { $in: ids } }],
    }),
    User.deleteMany({ _id: { $in: ids } }),
  ]);

  console.log("Cleared previous seed:");
  log("messages", msgs.deletedCount);
  log("conversations", convs.deletedCount);
  log("job posts", jobs.deletedCount);
  log("portfolios", portfolios.deletedCount);
  log("work details", work.deletedCount);
  log("notifications", notes.deletedCount);
  log("users", users.deletedCount);
};

const buildUserDoc = (persona, hashedPassword) => {
  const cityRow = CITIES[persona.cityKey];
  const coords = cityCoords(persona.cityKey);
  return {
    firstName: persona.firstName,
    lastName: persona.lastName,
    email: persona.email,
    username: persona.username,
    password: hashedPassword,
    role: persona.role,
    headline: persona.headline,
    bio: persona.bio,
    profilePicture: persona.profilePicture,
    bannerImage: persona.bannerImage,
    phone: persona.phone,
    phonePublic: persona.role === "Worker",
    verified: persona.verified ?? false,
    location: { city: cityRow.city, state: cityRow.state },
    locationPoint: toGeoPoint(coords),
    locationCoordinates: { lat: coords.lat, long: coords.lng },
    lastLogin: new Date(),
    lastActivity: new Date(),
  };
};

const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash(SHARED_PASSWORD, 10);
  const all = [...WORKERS, ...CLIENTS].map((p) => buildUserDoc(p, hashedPassword));
  const inserted = await User.insertMany(all);

  const byUsername = new Map();
  for (const u of inserted) byUsername.set(u.username, u);
  return byUsername;
};

const seedWorkDetails = async (byUsername) => {
  const docs = WORKERS.map((w) => ({
    user: byUsername.get(w.username)._id,
    serviceKey: w.serviceKey,
    serviceOffered: w.serviceLabel,
    description: w.bio,
    hourlyRate: w.hourlyRate,
    currency: "INR",
    availability: {
      days: w.days,
      timeSlots: [{ start: "09:00", end: "18:00" }],
    },
    ratings: w.rating,
    reviews: [],
  }));
  const inserted = await WorkDetail.insertMany(docs);

  const byWorkerUsername = new Map();
  for (let i = 0; i < WORKERS.length; i++) {
    byWorkerUsername.set(WORKERS[i].username, inserted[i]);
  }
  return byWorkerUsername;
};

const seedPortfolios = async (byUsername, workDetailByWorker) => {
  const docs = [];
  for (const block of PORTFOLIOS) {
    const worker = byUsername.get(block.workerUsername);
    const workDetail = workDetailByWorker.get(block.workerUsername);
    if (!worker || !workDetail) continue;

    for (const item of block.items) {
      const completedAt = new Date(
        Date.now() - item.completedDaysAgo * 24 * 60 * 60 * 1000,
      );
      const reviews = (item.reviews ?? []).map((r) => {
        const reviewer = byUsername.get(r.reviewerUsername);
        return {
          reviewer: reviewer?._id,
          review: r.review,
          rating: r.rating,
          images: r.images ?? [],
          createdAt: completedAt,
          updatedAt: completedAt,
        };
      });

      docs.push({
        user: worker._id,
        service: workDetail._id,
        jobTitle: item.jobTitle,
        description: item.description,
        images: item.images,
        videos: [],
        dateCompleted: completedAt,
        clientUsername: item.client?.username,
        clientName: item.client?.name,
        reviews,
        createdAt: completedAt,
        updatedAt: completedAt,
      });
    }
  }
  await JobPortfolio.insertMany(docs);
  return docs.length;
};

const seedJobs = async (byUsername) => {
  const docs = JOBS.map((j) => {
    const author = byUsername.get(j.authorUsername);
    const coords = cityCoords(j.cityKey);
    return {
      author: author._id,
      jobTitle: j.jobTitle,
      description: j.description,
      serviceKeys: j.serviceKeys,
      skillsRequired: j.skillsRequired ?? [],
      jobType: j.jobType,
      frequency: j.frequency,
      schedule: j.schedule,
      experienceMinYears: j.experienceMinYears,
      location: j.location,
      budget: j.budget,
      requiredOn: j.requiredOn,
      deadline: j.deadline,
      status: "Open",
      applicants: [],
      locationPoint: toGeoPoint(coords),
    };
  });
  await JobPost.insertMany(docs);
  return docs.length;
};

const seedConversations = async (byUsername) => {
  let msgTotal = 0;
  for (const thread of CONVERSATIONS) {
    const a = byUsername.get(thread.a);
    const b = byUsername.get(thread.b);
    if (!a || !b) continue;

    const conv = await Conversation.create({ participants: [a._id, b._id] });

    let last;
    for (const m of thread.messages) {
      const ts = new Date(Date.now() - m.minsAgo * 60 * 1000);
      const sender = m.from === "a" ? a : b;
      const recipient = m.from === "a" ? b : a;
      last = await Message.create({
        sender: sender._id,
        recipient: recipient._id,
        content: m.text,
        status: "read",
        createdAt: ts,
        updatedAt: ts,
      });
      msgTotal++;
    }
    conv.lastMessage = last._id;
    conv.updatedAt = last.createdAt;
    await conv.save();
  }
  return msgTotal;
};

const seedNotifications = async (byUsername) => {
  const pick = (name) => byUsername.get(name);
  const now = Date.now();
  const ago = (mins) => new Date(now - mins * 60 * 1000);

  const docs = [
    {
      recipient: pick("ramesh_carpenter")._id,
      type: "Job Application",
      relatedUser: pick("anil_homes")._id,
      content: "Anil Kothari sent you a message about a kitchen job.",
      read: false,
      createdAt: ago(40),
    },
    {
      recipient: pick("anita_embroidery")._id,
      type: "Review",
      relatedUser: pick("aarti_d")._id,
      content: "Aarti Desai left a 5-star review on your bridal blouse work.",
      read: false,
      createdAt: ago(120),
    },
    {
      recipient: pick("vikram_plumb")._id,
      type: "Job Application",
      relatedUser: pick("prakash_g")._id,
      content: "Prakash Gupta hired you for the geyser + RO job.",
      read: true,
      createdAt: ago(60 * 24),
    },
    {
      recipient: pick("divya_p")._id,
      type: "Message",
      relatedUser: pick("lakshmi_cook")._id,
      content: "Lakshmi Iyer replied to your message.",
      read: false,
      createdAt: ago(25),
    },
    {
      recipient: pick("karthik_dev")._id,
      type: "Review",
      relatedUser: pick("ritesh_m")._id,
      content: "Ritesh Modi reviewed your inventory app project.",
      read: true,
      createdAt: ago(60 * 24 * 3),
    },
    {
      recipient: pick("anil_homes")._id,
      type: "Message",
      relatedUser: pick("ramesh_carpenter")._id,
      content: "Ramesh confirmed Saturday 10am for your kitchen drawer fix.",
      read: false,
      createdAt: ago(15),
    },
    {
      recipient: pick("sneha_b")._id,
      type: "Message",
      relatedUser: pick("ramesh_carpenter")._id,
      content: "Ramesh confirmed Wednesday start on the Aundh project.",
      read: false,
      createdAt: ago(200),
    },
  ];
  await Notification.insertMany(docs);
  return docs.length;
};

const main = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI not set. Run from repo root or check your .env.");
    process.exit(1);
  }

  await connectDB();
  console.log("");

  await wipe();
  console.log("");

  const byUsername = await seedUsers();
  const workDetailByWorker = await seedWorkDetails(byUsername);
  const portfolioCount = await seedPortfolios(byUsername, workDetailByWorker);
  const jobCount = await seedJobs(byUsername);
  const messageCount = await seedConversations(byUsername);
  const notificationCount = await seedNotifications(byUsername);

  console.log("Inserted:");
  log("workers", WORKERS.length);
  log("clients", CLIENTS.length);
  log("work details", WORKERS.length);
  log("portfolio items", portfolioCount);
  log("job posts", jobCount);
  log("messages", messageCount);
  log("conversations", CONVERSATIONS.length);
  log("notifications", notificationCount);
  console.log("");
  console.log(`Done. Sign in with any seeded username, password: ${SHARED_PASSWORD}`);

  await mongoose.disconnect();
  process.exit(0);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

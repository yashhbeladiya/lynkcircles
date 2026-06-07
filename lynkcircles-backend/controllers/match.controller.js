import User from "../models/user.model.js";
import JobPost from "../models/jobpost.model.js";
import WorkDetail from "../models/workdetail.model.js";
import { lookupService } from "../lib/serviceCatalog.js";

const STOPWORDS = new Set([
  "the","a","an","and","or","of","for","in","on","at","to","with","by","is",
  "are","was","were","be","been","being","this","that","these","those","i",
  "you","we","they","he","she","it","my","your","our","their","its","as",
  "but","if","then","than","so","not","no","do","does","did","have","has",
  "had","will","would","can","could","should","may","might","one","two",
  "three","also","very","just","only","some","any","all","more","most",
  "ok","okay","please","need","want","good","bad","new","old","like",
]);

const tokenize = (text) =>
  String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));

const termFreq = (tokens) => {
  const tf = new Map();
  for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
  return tf;
};

const buildIdf = (docs) => {
  const df = new Map();
  for (const tokens of docs) {
    const seen = new Set(tokens);
    for (const t of seen) df.set(t, (df.get(t) || 0) + 1);
  }
  const N = Math.max(docs.length, 1);
  const idf = new Map();
  for (const [t, count] of df) idf.set(t, Math.log(1 + N / (1 + count)));
  return idf;
};

const vectorize = (tf, idf) => {
  const v = new Map();
  for (const [term, count] of tf) {
    const weight = idf.get(term);
    if (weight) v.set(term, count * weight);
  }
  return v;
};

const cosine = (a, b) => {
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  for (const w of a.values()) aMag += w * w;
  for (const w of b.values()) bMag += w * w;
  if (!aMag || !bMag) return 0;
  for (const [term, weight] of a) {
    const bw = b.get(term);
    if (bw) dot += weight * bw;
  }
  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
};

const workerText = (user, work) => {
  const services = (work || [])
    .map((w) => `${lookupService(w.serviceKey)?.label ?? ""} ${w.description ?? ""}`)
    .join(" ");
  return [user.headline, user.bio, services].filter(Boolean).join(" ");
};

const jobText = (job) => {
  const labels = (job.serviceKeys || [])
    .map((k) => lookupService(k)?.label)
    .filter(Boolean)
    .join(" ");
  return [job.jobTitle, job.description, labels, (job.skillsRequired || []).join(" ")]
    .filter(Boolean)
    .join(" ");
};

const matchedTerms = (a, b, idf, max = 6) => {
  const shared = [];
  for (const [term, weight] of a) {
    if (b.has(term)) shared.push({ term, score: weight * b.get(term) });
  }
  shared.sort((x, y) => y.score - x.score);
  return shared.slice(0, max).map((s) => s.term);
};

export const getMatches = async (req, res) => {
  try {
    const me = req.user;

    if (me.role === "Worker") {
      const [myWork, jobs] = await Promise.all([
        WorkDetail.find({ user: me._id }).lean(),
        JobPost.find({ status: "Open" })
          .populate("author", "firstName lastName username profilePicture verified")
          .lean(),
      ]);

      const meTokens = tokenize(workerText(me, myWork));
      const docTokens = jobs.map((j) => tokenize(jobText(j)));
      const idf = buildIdf([meTokens, ...docTokens]);
      const meVec = vectorize(termFreq(meTokens), idf);

      const ranked = jobs
        .map((j, i) => {
          const tokens = docTokens[i];
          const vec = vectorize(termFreq(tokens), idf);
          return {
            kind: "job",
            score: cosine(meVec, vec),
            matchedTerms: matchedTerms(meVec, vec, idf),
            job: j,
          };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      return res.json({ role: "Worker", matches: ranked });
    }

    // Client: rank Workers against the Client's most recent open job,
    // or against the Client's headline/bio if they have no posts.
    const [recentJob, workers] = await Promise.all([
      JobPost.findOne({ author: me._id, status: "Open" })
        .sort({ createdAt: -1 })
        .lean(),
      User.find({ role: "Worker" })
        .select("firstName lastName username profilePicture headline bio verified location")
        .limit(150)
        .lean(),
    ]);

    const workIndex = await WorkDetail.find({
      user: { $in: workers.map((w) => w._id) },
    }).lean();
    const workByUser = new Map();
    for (const w of workIndex) {
      const arr = workByUser.get(String(w.user)) || [];
      arr.push(w);
      workByUser.set(String(w.user), arr);
    }

    const queryText = recentJob ? jobText(recentJob) : `${me.headline} ${me.bio}`;
    const meTokens = tokenize(queryText);

    const docTokens = workers.map((w) =>
      tokenize(workerText(w, workByUser.get(String(w._id)) || [])),
    );
    const idf = buildIdf([meTokens, ...docTokens]);
    const meVec = vectorize(termFreq(meTokens), idf);

    const ranked = workers
      .map((w, i) => {
        const tokens = docTokens[i];
        const vec = vectorize(termFreq(tokens), idf);
        return {
          kind: "worker",
          score: cosine(meVec, vec),
          matchedTerms: matchedTerms(meVec, vec, idf),
          worker: w,
        };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json({ role: "Client", anchor: recentJob, matches: ranked });
  } catch (error) {
    console.error("Error in getMatches:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

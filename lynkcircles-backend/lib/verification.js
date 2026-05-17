import User from "../models/user.model.js";
import JobPortfolio from "../models/jobportfolio.model.js";
import JobPost from "../models/jobpost.model.js";

/**
 * Verification criteria — minimum bar for a Worker to earn the
 * `verified` badge. Deliberately objective (not admin-discretion) so
 * Workers can SEE the path and work toward it from their profile.
 *
 *   - ≥ 1 portfolio entry (proves they've logged real work)
 *   - ≥ 1 job completed via the platform (status: Completed with
 *     this user as hiredWorker)
 *   - ≥ 3 reviews on their portfolio averaging at least 4.0
 *
 * Phone OTP would be the obvious 4th criterion, but we don't have
 * the SMS infra yet. Add when it's ready and bump the gate.
 */
const REQUIRED_PORTFOLIO = 1;
const REQUIRED_COMPLETED_JOBS = 1;
const REQUIRED_REVIEW_COUNT = 3;
const REQUIRED_AVG_RATING = 4.0;

/**
 * Compute the current score against the verification bar. Returns
 * the same shape we surface to the FE so it can render a checklist
 * with "you have X of Y" on each row.
 */
export const computeVerificationStatus = async (userId) => {
  const [portfolioCount, completedJobCount, portfolioWithReviews] =
    await Promise.all([
      JobPortfolio.countDocuments({ user: userId }),
      JobPost.countDocuments({ hiredWorker: userId, status: "Completed" }),
      JobPortfolio.find({ user: userId }).select("reviews"),
    ]);

  const allReviews = portfolioWithReviews.flatMap((p) => p.reviews ?? []);
  const reviewCount = allReviews.length;
  const avg =
    reviewCount > 0
      ? allReviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviewCount
      : 0;

  const criteria = {
    portfolio: {
      met: portfolioCount >= REQUIRED_PORTFOLIO,
      have: portfolioCount,
      need: REQUIRED_PORTFOLIO,
    },
    completedJobs: {
      met: completedJobCount >= REQUIRED_COMPLETED_JOBS,
      have: completedJobCount,
      need: REQUIRED_COMPLETED_JOBS,
    },
    reviewCount: {
      met: reviewCount >= REQUIRED_REVIEW_COUNT,
      have: reviewCount,
      need: REQUIRED_REVIEW_COUNT,
    },
    avgRating: {
      met: reviewCount >= REQUIRED_REVIEW_COUNT && avg >= REQUIRED_AVG_RATING,
      have: Number(avg.toFixed(2)),
      need: REQUIRED_AVG_RATING,
    },
  };

  const allMet = Object.values(criteria).every((c) => c.met);
  return { criteria, allMet };
};

/**
 * Side-effect-aware version: runs the check AND flips the User.verified
 * flag when criteria pass. Called from anywhere a relevant event lands
 * (job completion, new review). Idempotent — re-running on an
 * already-verified user is a no-op.
 */
export const runVerificationCheck = async (userId) => {
  const status = await computeVerificationStatus(userId);
  if (status.allMet) {
    await User.updateOne({ _id: userId, verified: { $ne: true } }, { verified: true });
  }
  return status;
};

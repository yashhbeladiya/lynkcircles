import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

import { EmptyState } from "@/components/ui";
import { Briefcase, FileText } from "lucide-react";
import { useMyApplications, useOpenJobs } from "@/hooks/useJobPosts";
import { SectionHeader } from "./SectionHeader";
import { JobScrollRow } from "./JobScrollRow";

/**
 * Worker's marketplace-first Home: what jobs can I find, what have I
 * already applied to. Both sections are previews — the dedicated
 * /works page is one tap away via each section's "See all".
 */
export const WorkerDashboard = () => {
  const openJobs = useOpenJobs();
  const myApps = useMyApplications();

  return (
    <Box sx={{ display: "grid", gap: 3, mb: 3 }}>
      <Box>
        <SectionHeader
          eyebrow="For you"
          title="Open jobs in your area"
          description="Newest first. Tap a tile to read the full brief or apply."
          seeAllHref="/works"
        />
        {openJobs.isLoading ? (
          <RowSkeleton />
        ) : openJobs.data && openJobs.data.length > 0 ? (
          <JobScrollRow jobs={openJobs.data.slice(0, 8)} />
        ) : (
          <EmptyShell
            icon={Briefcase}
            title="No open jobs right now"
            description="Check back soon — new jobs land here as Clients post them."
          />
        )}
      </Box>

      <Box>
        <SectionHeader
          eyebrow="Your pipeline"
          title="Active applications"
          description="Jobs you've applied to. Tap to view status or withdraw."
          seeAllHref="/works"
        />
        {myApps.isLoading ? (
          <RowSkeleton />
        ) : myApps.data && myApps.data.length > 0 ? (
          <JobScrollRow jobs={myApps.data.slice(0, 6)} />
        ) : (
          <EmptyShell
            icon={FileText}
            title="You haven't applied yet"
            description="Find a job above and hit Apply — it'll show up here so you can track it."
          />
        )}
      </Box>
    </Box>
  );
};

const EmptyShell = ({
  icon,
  title,
  description,
}: {
  icon: typeof Briefcase;
  title: string;
  description: string;
}) => (
  <Box
    sx={(theme) => ({
      p: 3,
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: theme.palette.background.paper,
    })}
  >
    <EmptyState icon={icon} title={title} description={description} />
  </Box>
);

const RowSkeleton = () => (
  <Box sx={{ display: "flex", gap: 1.5, overflow: "hidden" }}>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={(theme) => ({
          flex: "0 0 280px",
          p: 1.75,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Skeleton width={50} height={20} sx={{ borderRadius: 999 }} />
        <Skeleton width="90%" height={16} sx={{ mt: 1 }} />
        <Skeleton width="70%" height={16} />
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Skeleton width={50} height={18} sx={{ borderRadius: 999 }} />
          <Skeleton width={60} height={18} sx={{ borderRadius: 999 }} />
        </Box>
      </Box>
    ))}
  </Box>
);

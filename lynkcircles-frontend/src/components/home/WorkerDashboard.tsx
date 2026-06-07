import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

import { EmptyState } from "@/components/ui";
import { Briefcase, FileText } from "lucide-react";
import { useMyApplications, useOpenJobs } from "@/hooks/useJobPosts";
import { SectionHeader } from "./SectionHeader";
import { JobScrollRow } from "./JobScrollRow";

export const WorkerDashboard = () => {
  const openJobs = useOpenJobs();
  const myApps = useMyApplications();

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 3, mt: 3 }}>
      <Box>
        <SectionHeader title="Open jobs near you" seeAllHref="/works" />
        {openJobs.isLoading ? (
          <RowSkeleton />
        ) : openJobs.data && openJobs.data.length > 0 ? (
          <JobScrollRow jobs={openJobs.data.slice(0, 8)} />
        ) : (
          <EmptyShell icon={Briefcase} title="No open jobs right now" />
        )}
      </Box>

      <Box>
        <SectionHeader title="Your applications" seeAllHref="/works" />
        {myApps.isLoading ? (
          <RowSkeleton />
        ) : myApps.data && myApps.data.length > 0 ? (
          <JobScrollRow jobs={myApps.data.slice(0, 6)} />
        ) : (
          <EmptyShell icon={FileText} title="No active applications" />
        )}
      </Box>
    </Box>
  );
};

const EmptyShell = ({ icon, title }: { icon: typeof Briefcase; title: string }) => (
  <Box
    sx={{
      p: 3,
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: "background.paper",
    }}
  >
    <EmptyState icon={icon} title={title} />
  </Box>
);

const RowSkeleton = () => (
  <Box sx={{ display: "flex", gap: 1.5, overflow: "hidden" }}>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={{
          flex: "0 0 280px",
          p: 1.75,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
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

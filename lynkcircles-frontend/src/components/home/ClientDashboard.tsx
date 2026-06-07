import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

import { EmptyState } from "@/components/ui";
import { Briefcase, Users } from "lucide-react";
import { useRecommendedUsers } from "@/hooks/useRecommendedUsers";
import { useMyJobPosts } from "@/hooks/useJobPosts";
import { SectionHeader } from "./SectionHeader";
import { DiscoveryUserCard } from "./DiscoveryUserCard";
import { JobScrollRow } from "./JobScrollRow";

interface Props {
  onPostJob: () => void;
}

export const ClientDashboard = ({ onPostJob }: Props) => {
  const workers = useRecommendedUsers();
  const myPosts = useMyJobPosts();

  return (
    <Box sx={{ display: "grid", gap: 3, mt: 3 }}>
      <Box>
        <SectionHeader title="Workers near you" seeAllHref="/map" seeAllLabel="View map" />
        {workers.isLoading ? (
          <WorkerGridSkeleton />
        ) : workers.data && workers.data.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 1.25,
            }}
          >
            {workers.data.slice(0, 8).map((u) => (
              <DiscoveryUserCard key={u._id} user={u} />
            ))}
          </Box>
        ) : (
          <EmptyShell icon={Users} title="No workers near you yet" />
        )}
      </Box>

      <Box>
        <SectionHeader title="Your job posts" seeAllHref="/works" />
        {myPosts.isLoading ? (
          <JobRowSkeleton />
        ) : myPosts.data && myPosts.data.length > 0 ? (
          <JobScrollRow jobs={myPosts.data.slice(0, 6)} />
        ) : (
          <EmptyShell
            icon={Briefcase}
            title="You haven't posted a job yet"
            action={{ label: "Post a job", onClick: onPostJob }}
          />
        )}
      </Box>
    </Box>
  );
};

const EmptyShell = ({
  icon,
  title,
  action,
}: {
  icon: typeof Users;
  title: string;
  action?: { label: string; onClick: () => void };
}) => (
  <Box
    sx={{
      p: 3,
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: "background.paper",
    }}
  >
    <EmptyState icon={icon} title={title} action={action} />
  </Box>
);

const WorkerGridSkeleton = () => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "repeat(2, minmax(0, 1fr))",
        sm: "repeat(3, minmax(0, 1fr))",
        md: "repeat(3, minmax(0, 1fr))",
        lg: "repeat(4, minmax(0, 1fr))",
      },
      gap: 1.25,
    }}
  >
    {[0, 1, 2, 3].map((i) => (
      <Box
        key={i}
        sx={{
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton width="65%" height={14} sx={{ mt: 1.5 }} />
        <Skeleton width="80%" height={11} sx={{ mt: 0.5 }} />
      </Box>
    ))}
  </Box>
);

const JobRowSkeleton = () => (
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
        <Skeleton width="90%" height={16} />
        <Skeleton width="70%" height={16} />
        <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
          <Skeleton width={60} height={18} />
          <Skeleton width={50} height={18} />
        </Box>
      </Box>
    ))}
  </Box>
);

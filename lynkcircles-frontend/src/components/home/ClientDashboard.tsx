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

/**
 * Client's marketplace-first Home: who can I hire, what jobs of
 * mine are live, who's applied. Workers grid leads — for a Client
 * the answer to "what am I doing here?" is "finding people," so the
 * page leads with people.
 */
export const ClientDashboard = ({ onPostJob }: Props) => {
  const workers = useRecommendedUsers();
  const myPosts = useMyJobPosts();

  return (
    <Box sx={{ display: "grid", gap: 3, mb: 3 }}>
      <Box>
        <SectionHeader
          eyebrow="Hire"
          title="Workers to consider"
          description="Verified pros near you, sorted by location and trade overlap. Tap any to view their profile and portfolio."
          seeAllHref="/network"
          seeAllLabel="Browse all"
        />
        {workers.isLoading ? (
          <WorkerGridSkeleton />
        ) : workers.data && workers.data.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: "repeat(4, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            {workers.data.slice(0, 8).map((u) => (
              <DiscoveryUserCard key={u._id} user={u} />
            ))}
          </Box>
        ) : (
          <EmptyShell
            icon={Users}
            title="No Workers to show yet"
            description="As more pros join LynkCircles, you'll see suggestions here based on your location and the work you post."
          />
        )}
      </Box>

      <Box>
        <SectionHeader
          eyebrow="Your jobs"
          title="Active job posts"
          description="Tap any tile to review applicants or change status."
          seeAllHref="/works"
        />
        {myPosts.isLoading ? (
          <JobRowSkeleton />
        ) : myPosts.data && myPosts.data.length > 0 ? (
          <JobScrollRow jobs={myPosts.data.slice(0, 6)} />
        ) : (
          <EmptyShell
            icon={Briefcase}
            title="You haven't posted a job yet"
            description="Post one and Workers in your area can apply. You'll review and hire from one place."
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
  description,
  action,
}: {
  icon: typeof Users;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
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
    <EmptyState icon={icon} title={title} description={description} action={action} />
  </Box>
);

const WorkerGridSkeleton = () => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "repeat(2, minmax(0, 1fr))",
        sm: "repeat(3, minmax(0, 1fr))",
        md: "repeat(4, minmax(0, 1fr))",
      },
      gap: 1.5,
    }}
  >
    {[0, 1, 2, 3].map((i) => (
      <Box
        key={i}
        sx={(theme) => ({
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        })}
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
        sx={(theme) => ({
          flex: "0 0 280px",
          p: 1.75,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
        })}
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

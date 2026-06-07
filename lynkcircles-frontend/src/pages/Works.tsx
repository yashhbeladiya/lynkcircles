import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { Briefcase, Plus } from "lucide-react";

import { EmptyState } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import {
  useMyApplications,
  useMyJobPosts,
  useOpenJobs,
} from "@/hooks/useJobPosts";
import { JobPostCard } from "@/components/works/JobPostCard";
import { CreateJobPostDialog } from "@/components/works/CreateJobPostDialog";
import type { JobPost } from "@/types/jobPost";

type TabKey = "browse" | "applications" | "mine";

const Works = () => {
  const { data: authUser } = useAuthUser();
  const isClient = authUser?.role === "Client";

  const [tab, setTab] = useState<TabKey>(isClient ? "mine" : "browse");
  const [createOpen, setCreateOpen] = useState(false);

  const open = useOpenJobs();
  const applications = useMyApplications(!isClient);
  const myPosts = useMyJobPosts(isClient);

  const tabs: { value: TabKey; label: string; count?: number }[] = useMemo(
    () => [
      { value: "browse", label: "Browse jobs", count: open.data?.length },
      isClient
        ? {
            value: "mine",
            label: "My posts",
            count: myPosts.data?.length,
          }
        : {
            value: "applications",
            label: "My applications",
            count: applications.data?.length,
          },
    ],
    [isClient, open.data, applications.data, myPosts.data]
  );

  const activeQuery =
    tab === "browse"
      ? open
      : tab === "applications"
        ? applications
        : myPosts;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, letterSpacing: "-0.02em" }}>
            {isClient ? "Hire a Worker" : "Find work"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 520 }}>
            {isClient
              ? "Post a job, review applicants, and pick the Worker that fits. You can manage every job's status from its detail page."
              : "Browse open jobs from Clients, apply with one click, and track what you've put your name on."}
          </Typography>
        </Box>
        {isClient ? (
          <Button
            variant="contained"
            startIcon={<Plus size={14} />}
            onClick={() => setCreateOpen(true)}
          >
            Post a job
          </Button>
        ) : null}
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v as TabKey)}
          textColor="primary"
          indicatorColor="primary"
        >
          {tabs.map((t) => (
            <Tab
              key={t.value}
              value={t.value}
              label={
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                  <span>{t.label}</span>
                  {typeof t.count === "number" && t.count > 0 ? (
                    <Box
                      component="span"
                      sx={{
                        bgcolor: "action.selected",
                        color: "text.secondary",
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        px: 0.75,
                        borderRadius: 999,
                        minWidth: 18,
                        textAlign: "center",
                      }}
                    >
                      {t.count}
                    </Box>
                  ) : null}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {activeQuery.isLoading ? (
        <JobsSkeleton />
      ) : !activeQuery.data || activeQuery.data.length === 0 ? (
        <EmptyShell tab={tab} isClient={isClient} onPostJob={() => setCreateOpen(true)} />
      ) : (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {activeQuery.data.map((job: JobPost) => (
            <JobPostCard key={job._id} job={job} />
          ))}
        </Box>
      )}

      <CreateJobPostDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Container>
  );
};

interface EmptyShellProps {
  tab: TabKey;
  isClient: boolean;
  onPostJob: () => void;
}

const EmptyShell = ({ tab, isClient, onPostJob }: EmptyShellProps) => {
  const messages: Record<TabKey, { title: string; description: string }> = {
    browse: {
      title: "No open jobs right now",
      description: isClient
        ? "Nobody else has posted a job here yet — be the first to put one up."
        : "Check back soon. New jobs land here as Clients post them.",
    },
    applications: {
      title: "You haven't applied to anything yet",
      description: "When you apply to a job, it lands here so you can track and withdraw if plans change.",
    },
    mine: {
      title: "You haven't posted a job yet",
      description: "Post one and Workers in your area can apply. You'll see them all in one place when they do.",
    },
  };
  const msg = messages[tab];
  return (
    <Box
      sx={(theme) => ({
        p: 4,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
      })}
    >
      <EmptyState
        icon={Briefcase}
        title={msg.title}
        description={msg.description}
        action={
          isClient && (tab === "mine" || tab === "browse")
            ? { label: "Post a job", onClick: onPostJob }
            : undefined
        }
      />
    </Box>
  );
};

const JobsSkeleton = () => (
  <Box sx={{ display: "grid", gap: 1.5 }}>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={(theme) => ({
          p: 2.25,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Skeleton width="60%" height={20} />
        <Skeleton width="100%" height={14} sx={{ mt: 1 }} />
        <Skeleton width="80%" height={14} />
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Skeleton width={60} height={22} sx={{ borderRadius: 999 }} />
          <Skeleton width={80} height={22} sx={{ borderRadius: 999 }} />
        </Box>
      </Box>
    ))}
  </Box>
);

export default Works;

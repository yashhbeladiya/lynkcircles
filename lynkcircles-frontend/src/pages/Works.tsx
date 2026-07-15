import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { Briefcase, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { data: authUser } = useAuthUser();
  const isClient = authUser?.role === "Client";

  const [tab, setTab] = useState<TabKey>(isClient ? "mine" : "browse");
  const [createOpen, setCreateOpen] = useState(false);

  const open = useOpenJobs();
  const applications = useMyApplications(!isClient);
  const myPosts = useMyJobPosts(isClient);

  const tabs: { value: TabKey; label: string; count?: number }[] = useMemo(
    () => [
      { value: "browse", label: t("works.tabs.browse"), count: open.data?.length },
      isClient
        ? {
            value: "mine",
            label: t("works.tabs.mine"),
            count: myPosts.data?.length,
          }
        : {
            value: "applications",
            label: t("works.tabs.applications"),
            count: applications.data?.length,
          },
    ],
    [isClient, open.data, applications.data, myPosts.data, t]
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
            {isClient ? t("works.title.client") : t("works.title.worker")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 520 }}>
            {isClient ? t("works.subtitle.client") : t("works.subtitle.worker")}
          </Typography>
        </Box>
        {isClient ? (
          <Button
            variant="contained"
            startIcon={<Plus size={14} />}
            onClick={() => setCreateOpen(true)}
          >
            {t("works.postJob")}
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
  const { t } = useTranslation();
  const messages: Record<TabKey, { title: string; description: string }> = {
    browse: {
      title: t("works.empty.browse.title"),
      description: isClient
        ? t("works.empty.browse.descClient")
        : t("works.empty.browse.descWorker"),
    },
    applications: {
      title: t("works.empty.applications.title"),
      description: t("works.empty.applications.description"),
    },
    mine: {
      title: t("works.empty.mine.title"),
      description: t("works.empty.mine.description"),
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
            ? { label: t("works.postJob"), onClick: onPostJob }
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

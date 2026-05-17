import { useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import {
  Bookmark,
  BookmarkCheck,
  Compass,
  MessageSquare,
  Users,
} from "lucide-react";

import { EmptyState } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useRecommendedUsers } from "@/hooks/useRecommendedUsers";
import {
  useSavedWorkers,
  useToggleSaveWorker,
} from "@/hooks/useSavedWorkers";
import { NetworkRow } from "@/components/network/NetworkRow";

type TabKey = "saved" | "discover";

/**
 * Network — marketplace shape. Two tabs:
 *
 *   Saved    — Workers the Client has bookmarked for later. The
 *              hire-when-I-need-you list. Empty for new Clients;
 *              builds up as they Save Workers from profiles.
 *   Discover — Suggested Workers near you in trades that overlap
 *              your services / location.
 *
 * The previous version had Requests + Connections (the LinkedIn-shape
 * request/accept graph). That's been retired — for a service
 * marketplace, "save for later" + "message anytime" is the right
 * primitive set. Connect/Accept friction added zero value.
 */
const Network = () => {
  const [tab, setTab] = useState<TabKey>("saved");
  const { data: authUser } = useAuthUser();

  const { data: saved, isLoading: savedLoading } = useSavedWorkers();
  const { data: discover, isLoading: discoverLoading } = useRecommendedUsers();
  const toggleSave = useToggleSaveWorker();

  const isClient = authUser?.role === "Client";

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, letterSpacing: "-0.02em" }}>
          Your network
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isClient
            ? "Workers you've bookmarked + new pros to consider."
            : "Other Workers in your trade and Clients near you. Use the search bar to find people directly."}
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v as TabKey)}
          textColor="primary"
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            value="saved"
            label={
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                <span>Saved</span>
                {saved && saved.length > 0 ? (
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
                    {saved.length}
                  </Box>
                ) : null}
              </Box>
            }
          />
          <Tab value="discover" label="Discover" />
        </Tabs>
      </Box>

      {tab === "saved" ? (
        savedLoading ? (
          <RowsSkeleton />
        ) : !saved || saved.length === 0 ? (
          <EmptyShell
            icon={Bookmark}
            title="Nothing saved yet"
            description={
              isClient
                ? "Tap Save on any Worker's profile and they'll land here — your hire-when-I-need-you shortlist."
                : "Bookmarks show up here. Save someone on their profile to start a shortlist."
            }
          />
        ) : (
          <Box sx={{ display: "grid", gap: 1 }}>
            {saved.map((s) => (
              <NetworkRow
                key={s._id}
                user={s}
                actions={
                  <>
                    <Button
                      component={Link}
                      to={`/messages/${s._id}`}
                      size="small"
                      variant="contained"
                      startIcon={<MessageSquare size={14} />}
                    >
                      Message
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<BookmarkCheck size={14} />}
                      onClick={() => toggleSave.mutate(s._id)}
                      disabled={toggleSave.isPending}
                    >
                      Unsave
                    </Button>
                  </>
                }
              />
            ))}
          </Box>
        )
      ) : null}

      {tab === "discover" ? (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
              {isClient ? "Workers to hire" : "People to connect with"}
            </Typography>
            <Typography variant="caption" color="text.tertiary">
              {isClient
                ? "Trusted Workers near you and in trades you might need. Tap a row to view their profile and portfolio."
                : "Other Workers in your trade, and Clients who post jobs near you. Open a profile to message them."}
            </Typography>
          </Box>
          {discoverLoading ? (
            <RowsSkeleton />
          ) : !discover || discover.length === 0 ? (
            <EmptyShell
              icon={Compass}
              title="No suggestions yet"
              description="As more people join near you, this list fills up — sorted by location and overlapping trade."
            />
          ) : (
            <Box sx={{ display: "grid", gap: 1 }}>
              {discover.map((u) => (
                <NetworkRow
                  key={u._id}
                  user={u}
                  actions={
                    <Button
                      component={Link}
                      to={`/profile/${u.username}`}
                      size="small"
                      variant="contained"
                    >
                      View profile
                    </Button>
                  }
                />
              ))}
            </Box>
          )}
        </>
      ) : null}
    </Container>
  );
};

const EmptyShell = ({
  icon,
  title,
  description,
}: {
  icon: typeof Users;
  title: string;
  description: string;
}) => (
  <Box
    sx={(theme) => ({
      p: 4,
      borderRadius: 2,
      border: 1,
      borderColor: "divider",
      backgroundColor: theme.palette.background.paper,
    })}
  >
    <EmptyState icon={icon} title={title} description={description} />
  </Box>
);

const RowsSkeleton = () => (
  <Box sx={{ display: "grid", gap: 1 }}>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
        })}
      >
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="40%" height={14} />
          <Skeleton width="60%" height={12} />
        </Box>
        <Skeleton width={120} height={32} sx={{ borderRadius: 1 }} />
      </Box>
    ))}
  </Box>
);

export default Network;

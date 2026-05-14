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
  Check,
  Compass,
  MessageSquare,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import { EmptyState } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useConnections } from "@/hooks/useConnections";
import { useRecommendedUsers } from "@/hooks/useRecommendedUsers";
import {
  useAcceptConnectionRequest,
  useConnectionRequests,
  useDisconnect,
  useRejectConnectionRequest,
  useSendConnectionRequest,
} from "@/hooks/useProfile";
import { NetworkRow } from "@/components/network/NetworkRow";

type TabKey = "requests" | "connections" | "discover";

/**
 * Marketplace-flavored Network. Not "people you may know" — this is
 * "who's in your hire-and-be-hired graph". Three tabs, each showing
 * users with their role, what they do, and where they are, so a
 * Client can act on this list without having to click into each
 * profile to find out who's a Worker.
 */
const Network = () => {
  const [tab, setTab] = useState<TabKey>("requests");
  const { data: authUser } = useAuthUser();

  const { data: requests, isLoading: requestsLoading } = useConnectionRequests();
  const { data: connections, isLoading: connectionsLoading } = useConnections();
  const { data: discover, isLoading: discoverLoading } = useRecommendedUsers();

  const sendRequest = useSendConnectionRequest();
  const accept = useAcceptConnectionRequest();
  const reject = useRejectConnectionRequest();
  const disconnect = useDisconnect();

  const isClient = authUser?.role === "Client";
  // Tab subtitles speak the actual marketplace use cases, not generic
  // "your network" language. A Client cares about hiring, a Worker
  // cares about being discovered + collaborating.
  const discoverTitle = isClient ? "Workers to hire" : "People to connect with";
  const discoverDescription = isClient
    ? "Trusted Workers near you and in trades you might need. Connecting starts a conversation — you can hire them from their profile."
    : "Other Workers in your trade, and Clients who post jobs near you. Connecting helps you get hired and stay in the loop.";

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 3 } }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, letterSpacing: "-0.02em" }}>
          Your network
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isClient
            ? "The Workers you trust, the people who've reached out, and new pros you can hire."
            : "Your connections, pending invites, and new people worth meeting in your trade."}
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
            value="requests"
            label={
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
                <span>Requests</span>
                {requests && requests.length > 0 ? (
                  <Box
                    component="span"
                    sx={{
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      fontSize: "0.625rem",
                      fontWeight: 600,
                      px: 0.75,
                      borderRadius: 999,
                      minWidth: 18,
                      textAlign: "center",
                    }}
                  >
                    {requests.length}
                  </Box>
                ) : null}
              </Box>
            }
          />
          <Tab value="connections" label="Connections" />
          <Tab value="discover" label="Discover" />
        </Tabs>
      </Box>

      {tab === "requests" ? (
        requestsLoading ? (
          <RowsSkeleton />
        ) : !requests || requests.length === 0 ? (
          <EmptyShell
            icon={Users}
            title="No pending requests"
            description="When someone wants to connect with you, you'll see them here with an Accept / Decline action."
          />
        ) : (
          <Box sx={{ display: "grid", gap: 1 }}>
            {requests.map((req) => (
              <NetworkRow
                key={req._id}
                user={req.sender}
                actions={
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Check size={14} />}
                      onClick={() => accept.mutate(req._id)}
                      disabled={accept.isPending || reject.isPending}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<X size={14} />}
                      onClick={() => reject.mutate(req._id)}
                      disabled={accept.isPending || reject.isPending}
                    >
                      Decline
                    </Button>
                  </>
                }
              />
            ))}
          </Box>
        )
      ) : null}

      {tab === "connections" ? (
        connectionsLoading ? (
          <RowsSkeleton />
        ) : !connections || connections.length === 0 ? (
          <EmptyShell
            icon={Users}
            title="No connections yet"
            description={
              isClient
                ? "Connect with Workers you trust — it's the fastest way to rehire and to keep a shortlist for next time."
                : "Connect with people in your trade and Clients near you. Connections show up first when they need work done."
            }
          />
        ) : (
          <Box sx={{ display: "grid", gap: 1 }}>
            {connections.map((c) => (
              <NetworkRow
                key={c._id}
                user={c}
                actions={
                  <>
                    <Button
                      component={Link}
                      to={`/messages/${c._id}`}
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
                      startIcon={<UserMinus size={14} />}
                      onClick={() => {
                        if (window.confirm(`Remove ${c.firstName} from your connections?`)) {
                          disconnect.mutate(c.username);
                        }
                      }}
                      disabled={disconnect.isPending}
                    >
                      Remove
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
              {discoverTitle}
            </Typography>
            <Typography variant="caption" color="text.tertiary">
              {discoverDescription}
            </Typography>
          </Box>
          {discoverLoading ? (
            <RowsSkeleton />
          ) : !discover || discover.length === 0 ? (
            <EmptyShell
              icon={Compass}
              title="No suggestions yet"
              description="As you connect with more people, we'll surface more here based on location and trade."
            />
          ) : (
            <Box sx={{ display: "grid", gap: 1 }}>
              {discover.map((u) => (
                <NetworkRow
                  key={u._id}
                  user={u}
                  actions={
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<UserPlus size={14} />}
                      onClick={() => sendRequest.mutate(u._id)}
                      disabled={sendRequest.isPending}
                    >
                      Connect
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

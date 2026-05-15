import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { BellOff, Check } from "lucide-react";

import { EmptyState } from "@/components/ui";
import {
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/notifications/NotificationItem";

const Notifications = () => {
  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const remove = useDeleteNotification();

  const unreadCount = data ? data.filter((n) => !n.read).length : 0;

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, letterSpacing: "-0.02em" }}
          >
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            New applicants, messages, reviews, and signals from your network.
          </Typography>
        </Box>
        {unreadCount > 0 ? (
          <Button
            size="small"
            startIcon={<Check size={14} />}
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            Mark all as read
          </Button>
        ) : null}
      </Box>

      {isLoading ? (
        <NotificationsSkeleton />
      ) : !data || data.length === 0 ? (
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
            icon={BellOff}
            title="You're all caught up"
            description="When someone applies to your job, sends you a message, leaves a review, or accepts your connection — it'll show up here."
          />
        </Box>
      ) : (
        <Box sx={{ display: "grid", gap: 1 }}>
          {data.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onMarkRead={(id) => markRead.mutate(id)}
              onDelete={(id) => remove.mutate(id)}
            />
          ))}
        </Box>
      )}
    </Container>
  );
};

const NotificationsSkeleton = () => (
  <Box sx={{ display: "grid", gap: 1 }}>
    {[0, 1, 2, 3].map((i) => (
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
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="80%" height={14} />
          <Skeleton width="30%" height={12} sx={{ mt: 0.5 }} />
        </Box>
      </Box>
    ))}
  </Box>
);

export default Notifications;

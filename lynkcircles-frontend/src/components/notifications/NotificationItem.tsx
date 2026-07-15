import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import {
  Bell,
  Briefcase,
  MessageSquare,
  Star,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import { UserAvatar } from "@/components/ui";
import type { AppNotification, NotificationType } from "@/types/notification";

interface Props {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}

type IconSpec = {
  icon: LucideIcon;
  tint: "primary" | "warning" | "success" | "secondary";
};

const iconFor = (type: NotificationType): IconSpec => {
  const iconMap: Record<NotificationType, IconSpec> = {
    "Job Application": { icon: Briefcase, tint: "primary" },
    "Message": { icon: MessageSquare, tint: "primary" },
    "Review": { icon: Star, tint: "warning" },
  };
  return iconMap[type] || { icon: Bell, tint: "secondary" };
};

const linkFor = (n: AppNotification): string | null => {
  switch (n.type) {
    case "Job Application":
      return n.relatedJob ? `/works/${n.relatedJob}` : null;
    case "Message":
      return n.relatedUser ? `/messages/${n.relatedUser._id}` : "/messages";
    case "Review":
      return n.relatedUser ? `/profile/${n.relatedUser.username}` : null;
  }
};

const composeMessage = (n: AppNotification): string => {
  const fromBackend = n.content || n.message;
  if (fromBackend) return fromBackend;
  const name = n.relatedUser
    ? `${n.relatedUser.firstName} ${n.relatedUser.lastName}`
    : "Someone";
  switch (n.type) {
    case "Job Application":
      return `${name} applied to your job post.`;
    case "Message":
      return `${name} sent you a message.`;
    case "Review":
      return `${name} left a review on your work.`;
  }
};

export const NotificationItem = ({ notification, onMarkRead, onDelete }: Props) => {
  const navigate = useNavigate();
  const { icon: Icon, tint } = iconFor(notification.type);
  const text = composeMessage(notification);
  const href = linkFor(notification);

  const handleClick = () => {
    if (!notification.read) onMarkRead(notification._id);
    if (href) navigate(href);
  };

  return (
    <Box
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      sx={(theme) => ({
        display: "flex",
        alignItems: "flex-start",
        gap: 1.25,
        p: 1.5,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: notification.read
          ? theme.palette.background.paper
          : theme.palette.mode === "dark"
            ? "rgba(99, 102, 241, 0.08)"
            : "rgba(99, 102, 241, 0.05)",
        cursor: "pointer",
        transition: "border-color 120ms ease, background-color 120ms ease",
        "&:hover": { borderColor: "primary.main" },
        position: "relative",
      })}
    >
      {/* Unread dot — single visual cue, accessible via aria-label */}
      {!notification.read ? (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: "primary.main",
          }}
          aria-label="Unread"
        />
      ) : null}

      {/* Avatar + type icon overlay */}
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        {notification.relatedUser ? (
          <Box
            component={Link}
            to={`/profile/${notification.relatedUser.username}`}
            onClick={(e) => e.stopPropagation()}
            sx={{ display: "flex", textDecoration: "none" }}
          >
            <UserAvatar user={notification.relatedUser} size="md" />
          </Box>
        ) : (
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: theme.palette.action.hover,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            })}
          >
            <Icon size={18} color={`var(--mui-palette-${tint}-main)`} aria-hidden />
          </Box>
        )}
        <Box
          sx={(theme) => ({
            position: "absolute",
            bottom: -2,
            right: -2,
            width: 18,
            height: 18,
            borderRadius: "50%",
            backgroundColor: theme.palette.background.paper,
            border: 1,
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <Icon size={10} color={`var(--mui-palette-${tint}-main)`} aria-hidden />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, pr: 3 }}>
        <Typography variant="body2" sx={{ fontSize: "0.875rem", lineHeight: 1.4 }}>
          {text}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.tertiary", fontSize: "0.6875rem", mt: 0.25, display: "block" }}
        >
          {formatDistanceToNowStrict(new Date(notification.createdAt))} ago
        </Typography>
      </Box>

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification._id);
        }}
        aria-label="Delete notification"
        sx={{ color: "text.tertiary", alignSelf: "center" }}
      >
        <Trash2 size={13} />
      </IconButton>
    </Box>
  );
};

import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import {
  Briefcase,
  Check,
  Clock,
  MapPin,
  MessageSquare,
  Pencil,
  ShieldCheck,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";

import { UserAvatar } from "@/components/ui";
import {
  useAcceptConnectionRequest,
  useConnectionStatus,
  useDisconnect,
  useRejectConnectionRequest,
  useSendConnectionRequest,
} from "@/hooks/useProfile";
import type { UserProfile } from "@/types/user";

interface Props {
  user: UserProfile;
  isOwn: boolean;
  onEdit: () => void;
}

const formatLocation = (loc?: UserProfile["location"]) => {
  if (!loc) return null;
  const parts = [loc.city, loc.state].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
};

export const ProfileHeader = ({ user, isOwn, onEdit }: Props) => {
  const { data: connection } = useConnectionStatus(user._id, !isOwn);
  const sendRequest = useSendConnectionRequest();
  const accept = useAcceptConnectionRequest();
  const reject = useRejectConnectionRequest();
  const disconnect = useDisconnect();

  const location = formatLocation(user.location);

  return (
    <Box
      sx={(theme) => ({
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        overflow: "hidden",
        mb: 2,
      })}
    >
      {/* Banner */}
      <Box
        sx={{
          height: { xs: 120, sm: 168 },
          background: user.bannerImage
            ? `url(${user.bannerImage}) center/cover`
            : (t) =>
                t.palette.mode === "dark"
                  ? `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`
                  : `linear-gradient(135deg, ${t.palette.primary.light ?? t.palette.primary.main} 0%, ${t.palette.primary.main} 100%)`,
        }}
      />

      {/* Body */}
      <Box sx={{ px: { xs: 2, sm: 3 }, pb: 3 }}>
        {/* Avatar + actions row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 1.5,
            mt: { xs: -4, sm: -5 },
          }}
        >
          <Box
            sx={{
              borderRadius: "50%",
              outline: "4px solid",
              outlineColor: "background.paper",
              boxShadow: 2,
            }}
          >
            <UserAvatar user={user} size="xl" verified={user.verified} />
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pt: 5 }}>
            {isOwn ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Pencil size={14} />}
                onClick={onEdit}
              >
                Edit profile
              </Button>
            ) : (
              <ActionButtons
                userId={user._id}
                username={user.username}
                status={connection?.status ?? "not_connected"}
                requestId={
                  connection?.status === "received" ? connection.requestId : undefined
                }
                pending={
                  sendRequest.isPending ||
                  accept.isPending ||
                  reject.isPending ||
                  disconnect.isPending
                }
                onConnect={() => sendRequest.mutate(user._id)}
                onAccept={(id) => accept.mutate(id)}
                onReject={(id) => reject.mutate(id)}
                onDisconnect={() => disconnect.mutate(user.username)}
              />
            )}
          </Box>
        </Box>

        {/* Name + headline */}
        <Box sx={{ mt: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 600, letterSpacing: "-0.02em" }}
            >
              {user.firstName} {user.lastName}
            </Typography>
            {user.verified ? (
              <ShieldCheck
                size={18}
                color="var(--mui-palette-success-main, #10b981)"
                aria-label="Verified"
              />
            ) : null}
          </Box>
          {user.headline ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {user.headline}
            </Typography>
          ) : null}

          {/* Meta chips */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
            {user.role ? (
              <Chip
                size="small"
                icon={<Briefcase size={12} aria-hidden />}
                label={user.role}
                sx={{ fontSize: "0.6875rem", height: 22 }}
              />
            ) : null}
            {location ? (
              <Chip
                size="small"
                icon={<MapPin size={12} aria-hidden />}
                label={location}
                sx={{ fontSize: "0.6875rem", height: 22 }}
              />
            ) : null}
            <Chip
              size="small"
              label={`${user.connections?.length ?? 0} connections`}
              sx={{ fontSize: "0.6875rem", height: 22 }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

interface ActionProps {
  userId: string;
  username: string;
  status: "connected" | "pending" | "received" | "not_connected";
  requestId?: string | undefined;
  pending: boolean;
  onConnect: () => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onDisconnect: () => void;
}

const ActionButtons = ({
  userId,
  status,
  requestId,
  pending,
  onConnect,
  onAccept,
  onReject,
  onDisconnect,
}: ActionProps) => {
  if (status === "connected") {
    return (
      <>
        <Button
          component={Link}
          to={`/messages/${userId}`}
          variant="contained"
          size="small"
          startIcon={<MessageSquare size={14} />}
        >
          Message
        </Button>
        <IconButton
          size="small"
          onClick={onDisconnect}
          disabled={pending}
          aria-label="Remove connection"
          sx={{ border: 1, borderColor: "divider" }}
        >
          <UserMinus size={14} />
        </IconButton>
      </>
    );
  }

  if (status === "pending") {
    return (
      <Button
        variant="outlined"
        size="small"
        disabled
        startIcon={<Clock size={14} />}
      >
        Request sent
      </Button>
    );
  }

  if (status === "received" && requestId) {
    return (
      <>
        <Button
          variant="contained"
          size="small"
          startIcon={<Check size={14} />}
          disabled={pending}
          onClick={() => onAccept(requestId)}
        >
          Accept
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<X size={14} />}
          disabled={pending}
          onClick={() => onReject(requestId)}
        >
          Decline
        </Button>
      </>
    );
  }

  return (
    <Button
      variant="contained"
      size="small"
      startIcon={<UserPlus size={14} />}
      disabled={pending}
      onClick={onConnect}
    >
      Connect
    </Button>
  );
};

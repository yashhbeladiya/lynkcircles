import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { ShieldCheck } from "lucide-react";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_PX: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

interface User {
  firstName?: string | null;
  lastName?: string | null;
  profilePicture?: string | null;
}

interface Props {
  user: User;
  size?: AvatarSize;
  online?: boolean;
  verified?: boolean;
  alt?: string;
}

const initials = (user: User) => {
  const f = user.firstName?.trim()[0] ?? "";
  const l = user.lastName?.trim()[0] ?? "";
  return (f + l).toUpperCase() || "?";
};

export const UserAvatar = ({
  user,
  size = "md",
  online = false,
  verified = false,
  alt,
}: Props) => {
  const px = SIZE_PX[size];
  const fontSize =
    size === "xs" ? "0.6875rem" : size === "sm" ? "0.75rem" : size === "lg" ? "1.25rem" : size === "xl" ? "1.75rem" : "0.875rem";

  const avatar = (
    <Avatar
      src={user.profilePicture ?? undefined}
      alt={alt ?? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
      sx={{
        width: px,
        height: px,
        fontSize,
        fontWeight: 600,
        bgcolor: "primary.main",
        color: "primary.contrastText",
      }}
    >
      {initials(user)}
    </Avatar>
  );

  if (verified) {
    const dotSize = Math.max(14, Math.round(px * 0.36));
    return (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          <Tooltip title="Verified worker">
            <Box
              sx={{
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                bgcolor: "success.main",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: 2,
                borderColor: "background.default",
                boxSizing: "content-box",
              }}
            >
              <ShieldCheck size={Math.max(8, Math.round(dotSize * 0.55))} />
            </Box>
          </Tooltip>
        }
      >
        {avatar}
      </Badge>
    );
  }

  if (online) {
    const dotSize = Math.max(10, Math.round(px * 0.26));
    return (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        badgeContent={
          <Box
            aria-label="Online"
            sx={{
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              bgcolor: "success.main",
              border: 2,
              borderColor: "background.default",
              boxSizing: "content-box",
            }}
          />
        }
      >
        {avatar}
      </Badge>
    );
  }

  return avatar;
};

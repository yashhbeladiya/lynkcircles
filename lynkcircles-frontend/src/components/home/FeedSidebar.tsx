import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";

import { UserAvatar } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";

/**
 * Left rail on the Home page. Shows the current user's mini profile
 * card with a clickable link to their full profile.
 */
export const FeedSidebar = () => {
  const { data: user } = useAuthUser();
  if (!user) return null;

  return (
    <Box
      sx={(theme) => ({
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        overflow: "hidden",
        position: { md: "sticky" },
        top: { md: 76 },
      })}
    >
      <Box
        sx={{
          height: 56,
          background: user.bannerImage
            ? `url(${user.bannerImage}) center/cover`
            : (t) =>
                t.palette.mode === "dark"
                  ? `linear-gradient(135deg, ${t.palette.primary.dark} 0%, ${t.palette.primary.main} 100%)`
                  : `linear-gradient(135deg, ${t.palette.primary.light ?? t.palette.primary.main} 0%, ${t.palette.primary.main} 100%)`,
        }}
      />
      <Box sx={{ px: 2, pb: 2, mt: -3 }}>
        <Box
          component={Link}
          to={`/profile/${user.username}`}
          sx={{
            display: "inline-block",
            textDecoration: "none",
            // 3px ring around the avatar so it reads as "popping" out
            // of the banner above. Done on the wrapper to keep the
            // shared UserAvatar primitive prop-light.
            borderRadius: "50%",
            outline: "3px solid",
            outlineColor: "background.paper",
            boxShadow: 1,
          }}
        >
          <UserAvatar user={user} size="lg" verified={user.verified} />
        </Box>
        <Typography
          component={Link}
          to={`/profile/${user.username}`}
          variant="body1"
          sx={{
            display: "block",
            fontWeight: 600,
            mt: 1,
            color: "text.primary",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {user.firstName} {user.lastName}
        </Typography>
        {user.headline ? (
          <Typography
            variant="caption"
            sx={{
              display: "block",
              color: "text.secondary",
              fontSize: "0.75rem",
              mt: 0.25,
            }}
          >
            {user.headline}
          </Typography>
        ) : null}
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Stat label="Connections" value={user.connections?.length ?? 0} />
        {user.role ? (
          <Stat label="Role" value={user.role} sx={{ mt: 0.75 }} />
        ) : null}
      </Box>
      <Divider />
      <Box
        component={Link}
        to={`/profile/${user.username}`}
        sx={{
          display: "block",
          p: 2,
          fontSize: "0.8125rem",
          fontWeight: 600,
          color: "primary.main",
          textDecoration: "none",
          "&:hover": { backgroundColor: "action.hover" },
        }}
      >
        Visit your profile →
      </Box>
    </Box>
  );
};

const Stat = ({
  label,
  value,
  sx,
}: {
  label: string;
  value: string | number;
  sx?: object;
}) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      ...sx,
    }}
  >
    <Typography
      variant="caption"
      sx={{ color: "text.tertiary", fontSize: "0.6875rem" }}
    >
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
      {value}
    </Typography>
  </Box>
);

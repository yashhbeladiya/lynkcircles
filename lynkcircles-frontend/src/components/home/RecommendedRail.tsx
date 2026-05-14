import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { Users } from "lucide-react";

import { UserAvatar, EmptyState } from "@/components/ui";
import { useRecommendedUsers } from "@/hooks/useRecommendedUsers";
import type { UserSummary } from "@/types/user";

/**
 * Right rail on Home. Marketplace-flavored: photo + headline + a
 * verified badge if applicable + a single primary CTA per row.
 */
export const RecommendedRail = () => {
  const { data, isLoading } = useRecommendedUsers();

  return (
    <Box
      sx={(theme) => ({
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        position: { lg: "sticky" },
        top: { lg: 76 },
      })}
    >
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography variant="overline" sx={{ color: "text.secondary" }}>
          People to connect
        </Typography>
      </Box>
      <Box sx={{ px: 1, pb: 1 }}>
        {isLoading ? (
          [0, 1, 2].map((i) => <SuggestionSkeleton key={i} />)
        ) : !data || data.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <EmptyState
              icon={Users}
              title="No suggestions yet"
              description="Connect with people to see more here."
            />
          </Box>
        ) : (
          data.slice(0, 5).map((u) => <SuggestionRow key={u._id} user={u} />)
        )}
      </Box>
    </Box>
  );
};

const SuggestionRow = ({ user }: { user: UserSummary }) => (
  <Box
    sx={{
      display: "flex",
      gap: 1.25,
      alignItems: "center",
      px: 1.5,
      py: 1,
      borderRadius: 1.5,
      "&:hover": { backgroundColor: "action.hover" },
    }}
  >
    <Box
      component={Link}
      to={`/profile/${user.username}`}
      sx={{ display: "flex", textDecoration: "none" }}
    >
      <UserAvatar user={user} size="md" verified={user.verified} />
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        component={Link}
        to={`/profile/${user.username}`}
        variant="body2"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          textDecoration: "none",
          display: "block",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          "&:hover": { textDecoration: "underline" },
        }}
      >
        {user.firstName} {user.lastName}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: "text.tertiary",
          fontSize: "0.6875rem",
          display: "-webkit-box",
          WebkitLineClamp: 1,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {user.headline ?? "LynkCircles user"}
      </Typography>
    </Box>
    <Button
      component={Link}
      to={`/profile/${user.username}`}
      size="small"
      variant="outlined"
      sx={{ fontSize: "0.6875rem", minWidth: 0, px: 1.25 }}
    >
      View
    </Button>
  </Box>
);

const SuggestionSkeleton = () => (
  <Box sx={{ display: "flex", gap: 1.25, alignItems: "center", px: 1.5, py: 1 }}>
    <Skeleton variant="circular" width={36} height={36} />
    <Box sx={{ flex: 1 }}>
      <Skeleton width="60%" height={14} />
      <Skeleton width="40%" height={12} />
    </Box>
    <Skeleton width={48} height={28} />
  </Box>
);

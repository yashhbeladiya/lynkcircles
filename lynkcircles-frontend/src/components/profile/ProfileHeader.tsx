import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  MapPin,
  MessageSquare,
  Pencil,
  ShieldCheck,
} from "lucide-react";

import { UserAvatar } from "@/components/ui";
import {
  useIsSaved,
  useToggleSaveWorker,
} from "@/hooks/useSavedWorkers";
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

/**
 * Marketplace-shape profile header. The connection request/accept/
 * connected graph is gone — for a service marketplace, "connect" was
 * friction (I don't want a relationship, I want to hire someone or
 * message them). The two primary actions now are:
 *
 *   Save   — bookmark a Worker for later (Client's perspective).
 *            Toggles via /users/save/:id; optimistic.
 *   Message — open the chat with this user.
 *
 * Both are available regardless of any prior relationship. If you've
 * never met someone before, you can still message them. That's how
 * Airbnb/Upwork/Thumbtack work — and the way a marketplace should.
 */
export const ProfileHeader = ({ user, isOwn, onEdit }: Props) => {
  const isSaved = useIsSaved(user._id);
  const toggleSave = useToggleSaveWorker();

  const location = formatLocation(user.location);
  // The Save button mostly makes sense for Workers — a Client doesn't
  // really "save" another Client for a future job. Hide it on Client
  // profiles to keep the action surface focused.
  const showSave = user.role === "Worker";

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
              <>
                <Button
                  component={Link}
                  to={`/messages/${user._id}`}
                  variant="contained"
                  size="small"
                  startIcon={<MessageSquare size={14} />}
                >
                  Message
                </Button>
                {showSave ? (
                  <Button
                    variant={isSaved ? "contained" : "outlined"}
                    color={isSaved ? "success" : "primary"}
                    size="small"
                    startIcon={
                      isSaved ? (
                        <BookmarkCheck size={14} />
                      ) : (
                        <Bookmark size={14} />
                      )
                    }
                    onClick={() => toggleSave.mutate(user._id)}
                    disabled={toggleSave.isPending}
                  >
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                ) : null}
              </>
            )}
          </Box>
        </Box>

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

          {/* Meta chips. Dropped the "N connections" chip — it was a
              LinkedIn-shape stat. The role + location chips carry the
              marketplace-relevant context. */}
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
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

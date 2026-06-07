import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  MapPin,
  MessageCircle,
  MessageSquare,
  Pencil,
  ShieldCheck,
} from "lucide-react";

import { UserAvatar } from "@/components/ui";
import {
  useIsSaved,
  useToggleSaveWorker,
} from "@/hooks/useSavedWorkers";
import { buildWhatsappLink } from "@/lib/contactLinks";
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
  const { t } = useTranslation();
  const isSaved = useIsSaved(user._id);
  const toggleSave = useToggleSaveWorker();

  const location = formatLocation(user.location);
  const showSave = user.role === "Worker";
  const waLink =
    user.phonePublic && user.phone
      ? buildWhatsappLink(
          user.phone,
          `Hi ${user.firstName}, I found you on LynkCircles.`,
        )
      : null;

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
        overflow: "hidden",
        mb: 2,
        boxShadow: (t) =>
          t.palette.mode === "dark"
            ? "0 4px 12px -4px rgba(0,0,0,0.4)"
            : "0 4px 12px -4px rgba(0,0,0,0.06)",
      }}
    >
      <Box
        sx={{
          height: { xs: 140, sm: 200 },
          background: user.bannerImage
            ? `url(${user.bannerImage}) center/cover`
            : (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(135deg, #312e81 0%, #4f46e5 60%, #6366f1 100%)"
                  : "linear-gradient(135deg, #4338ca 0%, #6366f1 55%, #818cf8 100%)",
          position: "relative",
          "&::after": user.bannerImage
            ? undefined
            : {
                content: '""',
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(ellipse at top right, rgba(255,255,255,0.2), transparent 60%)",
                pointerEvents: "none",
              },
        }}
      />

      <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pb: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: 2,
            mt: { xs: -5, sm: -6 },
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              borderRadius: "50%",
              outline: "4px solid",
              outlineColor: "background.paper",
              boxShadow: 3,
              flexShrink: 0,
            }}
          >
            <UserAvatar user={user} size="xl" verified={user.verified} />
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", pt: { xs: 1.5, sm: 6 } }}>
            {isOwn ? (
              <Button
                variant="contained"
                size="small"
                startIcon={<Pencil size={15} />}
                onClick={onEdit}
                sx={{
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.75, sm: 1 },
                  fontWeight: 600,
                  fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                  boxShadow: (t) =>
                    t.palette.mode === "dark"
                      ? "0 6px 14px -4px rgba(99,102,241,0.5)"
                      : "0 6px 14px -4px rgba(67,56,202,0.35)",
                }}
              >
                {t("profile.actions.editProfile")}
              </Button>
            ) : (
              <>
                <Button
                  component={Link}
                  to={`/messages/${user._id}`}
                  variant="contained"
                  size="small"
                  startIcon={<MessageSquare size={15} />}
                  sx={{
                    px: { xs: 2, sm: 2.5 },
                    py: { xs: 0.75, sm: 1 },
                    fontWeight: 600,
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    boxShadow: (t) =>
                      t.palette.mode === "dark"
                        ? "0 6px 14px -4px rgba(99,102,241,0.5)"
                        : "0 6px 14px -4px rgba(67,56,202,0.35)",
                  }}
                >
                  {t("profile.actions.message")}
                </Button>
                {waLink ? (
                  <Tooltip title={t("profile.actions.whatsapp")}>
                    <Button
                      component="a"
                      href={waLink}
                      target="_blank"
                      rel="noreferrer noopener"
                      variant="outlined"
                      size="small"
                      startIcon={<MessageCircle size={15} />}
                      sx={{
                        px: { xs: 1.5, sm: 2 },
                        py: { xs: 0.75, sm: 1 },
                        fontWeight: 600,
                        fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                        borderColor: "#25D366",
                        color: "#25D366",
                        "&:hover": {
                          borderColor: "#1ebd5a",
                          backgroundColor: "rgba(37, 211, 102, 0.08)",
                        },
                      }}
                    >
                      {t("profile.actions.whatsapp")}
                    </Button>
                  </Tooltip>
                ) : null}
                {showSave ? (
                  <Button
                    variant={isSaved ? "contained" : "outlined"}
                    color={isSaved ? "success" : "primary"}
                    size="small"
                    startIcon={
                      isSaved ? (
                        <BookmarkCheck size={15} />
                      ) : (
                        <Bookmark size={15} />
                      )
                    }
                    onClick={() => toggleSave.mutate(user._id)}
                    disabled={toggleSave.isPending}
                    sx={{ px: { xs: 1.5, sm: 2 }, py: { xs: 0.75, sm: 1 }, fontWeight: 600 }}
                  >
                    {isSaved
                      ? t("profile.actions.saved")
                      : t("profile.actions.save")}
                  </Button>
                ) : null}
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontSize: { xs: "1.5rem", sm: "1.875rem" },
              }}
            >
              {user.firstName} {user.lastName}
            </Typography>
            {user.verified ? (
              <Tooltip title="Verified worker">
                <ShieldCheck
                  size={22}
                  color="var(--mui-palette-success-main, #10b981)"
                  aria-label="Verified"
                />
              </Tooltip>
            ) : null}
          </Box>
          {user.headline ? (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 0.5, fontSize: { xs: "0.9375rem", sm: "1rem" } }}
            >
              {user.headline}
            </Typography>
          ) : null}

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.75 }}>
            {user.role ? (
              <Chip
                size="small"
                icon={<Briefcase size={13} aria-hidden />}
                label={user.role}
                sx={{
                  fontSize: "0.75rem",
                  height: 26,
                  fontWeight: 600,
                  px: 0.5,
                }}
              />
            ) : null}
            {location ? (
              <Chip
                size="small"
                icon={<MapPin size={13} aria-hidden />}
                label={location}
                sx={{
                  fontSize: "0.75rem",
                  height: 26,
                  fontWeight: 600,
                  px: 0.5,
                }}
              />
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

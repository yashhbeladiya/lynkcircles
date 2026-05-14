import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GitHub from "@mui/icons-material/GitHub";
import LinkedIn from "@mui/icons-material/LinkedIn";
import Twitter from "@mui/icons-material/Twitter";
import Facebook from "@mui/icons-material/Facebook";
import { Globe } from "lucide-react";
import type { UserProfile } from "@/types/user";

interface Props {
  user: UserProfile;
}

// MUI brand icons (sized via fontSize prop) + lucide Globe for the
// non-branded website link. Mixed-source is intentional: lucide-react
// v1 dropped social-brand icons for trademark reasons, and MUI's
// brand icons are clean enough that pulling both libs is fine.
const linkIcons = {
  github: GitHub,
  linkedin: LinkedIn,
  twitter: Twitter,
  facebook: Facebook,
  website: Globe,
} as const;

const labelFor = (key: keyof typeof linkIcons) =>
  key === "website" ? "Personal site" : key.charAt(0).toUpperCase() + key.slice(1);

export const AboutSection = ({ user }: Props) => {
  const links = user.socialLinks ?? {};
  const linkEntries = (Object.entries(links) as [keyof typeof linkIcons, string | undefined][])
    .filter(([, url]) => !!url && url.trim().length > 0);

  if (!user.bio && linkEntries.length === 0) return null;

  return (
    <Box
      sx={(theme) => ({
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        mb: 2,
      })}
    >
      <Typography variant="overline" sx={{ color: "text.secondary", display: "block", mb: 1 }}>
        About
      </Typography>
      {user.bio ? (
        <Typography
          variant="body2"
          sx={{ whiteSpace: "pre-wrap", fontSize: "0.875rem", lineHeight: 1.55 }}
        >
          {user.bio}
        </Typography>
      ) : null}

      {linkEntries.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.25,
            mt: user.bio ? 2 : 0,
          }}
        >
          {linkEntries.map(([key, url]) => {
            const Icon = linkIcons[key];
            const isLucide = key === "website";
            return (
              <Box
                key={key}
                component="a"
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 999,
                  border: 1,
                  borderColor: "divider",
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  textDecoration: "none",
                  transition: "border-color 120ms ease, color 120ms ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    color: "primary.main",
                  },
                }}
              >
                {isLucide ? (
                  <Icon size={14} aria-hidden />
                ) : (
                  <Icon sx={{ fontSize: 14 }} aria-hidden />
                )}
                <span>{labelFor(key)}</span>
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
};

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { Briefcase, MapPin, Search, ShieldCheck, Users } from "lucide-react";

import { UserAvatar } from "@/components/ui";
import { useSearch, type SearchResults } from "@/hooks/useSearch";
import { serviceLabel } from "@/data/serviceCatalog";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

/**
 * ⌘K command palette — real search across Workers and Jobs. Mounts a
 * global keydown listener so the shortcut works from anywhere.
 *
 * Layout:
 *   [ icon ] [ input ........................ ] [ ESC ]
 *   --------------------------------------------------
 *   Service chip suggestions (if any catalog matches)
 *   Workers (top 5)  →  click to /profile/:username
 *   Jobs (top 5)     →  click to /works/:id
 *
 * Below 2 chars the hook skips the network call and we show a
 * "Try…" empty state. Above 2, results stream in once the 250ms
 * debounce settles.
 */
export const CommandPalette = ({ open, onClose, onOpen }: Props) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { data, isLoading, enabled, debouncedQuery } = useSearch(query);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isCmdK =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (isCmdK) {
        event.preventDefault();
        if (open) onClose();
        else onOpen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpen, onClose]);

  const go = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            mt: 8,
            alignSelf: "flex-start",
          },
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Search size={16} aria-hidden />
        <InputBase
          autoFocus
          fullWidth
          placeholder="Search workers, jobs, services…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ fontSize: "0.9375rem" }}
          inputProps={{ "aria-label": "Search LynkCircles" }}
        />
        {isLoading && enabled ? (
          <CircularProgress size={14} />
        ) : (
          <Box
            component="kbd"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.6875rem",
              px: 0.75,
              py: 0.25,
              border: 1,
              borderColor: "divider",
              borderRadius: 0.75,
              color: "text.secondary",
            }}
          >
            ESC
          </Box>
        )}
      </Box>
      <DialogContent sx={{ minHeight: 180, p: 1.5 }}>
        {!enabled ? (
          <PaletteHint />
        ) : !data ? (
          <Typography
            variant="body2"
            color="text.tertiary"
            sx={{ textAlign: "center", py: 4 }}
          >
            Searching for "{debouncedQuery}"…
          </Typography>
        ) : (
          <Results data={data} debouncedQuery={debouncedQuery} go={go} />
        )}
      </DialogContent>
    </Dialog>
  );
};

const PaletteHint = () => (
  <Box sx={{ display: "grid", gap: 1, py: 2, px: 1 }}>
    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
      Try a service ("carpenter"), a name, a city, or a job title.
    </Typography>
    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, flexWrap: "wrap" }}>
      {["carpenter", "domestic help", "embroidery operator", "barber"].map(
        (suggestion) => (
          <Chip
            key={suggestion}
            label={suggestion}
            size="small"
            variant="outlined"
            sx={{ fontSize: "0.6875rem", height: 22 }}
          />
        )
      )}
    </Box>
  </Box>
);

interface ResultsProps {
  data: SearchResults;
  debouncedQuery: string;
  go: (path: string) => void;
}

const Results = ({ data, debouncedQuery, go }: ResultsProps) => {
  const empty =
    data.workers.length === 0 &&
    data.jobs.length === 0 &&
    data.services.length === 0;

  if (empty) {
    return (
      <Typography
        variant="body2"
        color="text.tertiary"
        sx={{ textAlign: "center", py: 4 }}
      >
        No results for "{debouncedQuery}". Try a service category or a city.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 1.25 }}>
      {data.services.length > 0 ? (
        <Section title="Services">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, px: 1, pb: 0.5 }}>
            {data.services.map((s) => (
              <Chip
                key={s.key}
                label={s.label}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: "0.6875rem", height: 22 }}
              />
            ))}
          </Box>
        </Section>
      ) : null}

      {data.workers.length > 0 ? (
        <Section title="Workers" icon={<Users size={12} aria-hidden />}>
          {data.workers.map((u) => {
            const loc = [u.location?.city, u.location?.state]
              .filter(Boolean)
              .join(", ");
            return (
              <ResultRow
                key={u._id}
                onClick={() => go(`/profile/${u.username}`)}
                avatar={<UserAvatar user={u} size="sm" verified={u.verified} />}
                title={`${u.firstName} ${u.lastName}`}
                titleAdornment={
                  u.verified ? (
                    <ShieldCheck
                      size={11}
                      color="var(--mui-palette-success-main)"
                      aria-label="Verified"
                    />
                  ) : null
                }
                subtitle={u.headline || loc || "Worker"}
                meta={loc || undefined}
                metaIcon={loc ? <MapPin size={11} aria-hidden /> : undefined}
              />
            );
          })}
        </Section>
      ) : null}

      {data.jobs.length > 0 ? (
        <Section title="Open jobs" icon={<Briefcase size={12} aria-hidden />}>
          {data.jobs.map((j) => (
            <ResultRow
              key={j._id}
              onClick={() => go(`/works/${j._id}`)}
              avatar={
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                  }}
                >
                  <Briefcase size={14} aria-hidden />
                </Box>
              }
              title={j.jobTitle}
              subtitle={
                j.serviceKeys && j.serviceKeys.length > 0
                  ? j.serviceKeys
                      .slice(0, 3)
                      .map((k) => serviceLabel(k))
                      .join(" · ")
                  : "Job"
              }
              meta={j.location}
              metaIcon={<MapPin size={11} aria-hidden />}
            />
          ))}
        </Section>
      ) : null}
    </Box>
  );
};

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Box>
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.25,
        py: 0.5,
        color: "text.tertiary",
        fontSize: "0.625rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
      }}
    >
      {icon}
      <span>{title}</span>
    </Box>
    <Box sx={{ display: "grid", gap: 0.25 }}>{children}</Box>
  </Box>
);

interface ResultRowProps {
  avatar: React.ReactNode;
  title: string;
  titleAdornment?: React.ReactNode;
  subtitle?: string;
  meta?: string;
  metaIcon?: React.ReactNode;
  onClick: () => void;
}

const ResultRow = ({
  avatar,
  title,
  titleAdornment,
  subtitle,
  meta,
  metaIcon,
  onClick,
}: ResultRowProps) => (
  <Box
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      px: 1.25,
      py: 1,
      borderRadius: 1.5,
      cursor: "pointer",
      transition: "background-color 80ms ease",
      "&:hover": { backgroundColor: "action.hover" },
      "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" },
    }}
  >
    {avatar}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: "0.8125rem",
            color: "text.primary",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </Typography>
        {titleAdornment}
      </Box>
      {subtitle ? (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            color: "text.tertiary",
            fontSize: "0.6875rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Box>
    {meta ? (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.25,
          color: "text.tertiary",
          fontSize: "0.6875rem",
        }}
      >
        {metaIcon}
        <span>{meta}</span>
      </Box>
    ) : null}
  </Box>
);

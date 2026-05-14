import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Search } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}

/**
 * ⌘K / Ctrl-K command palette. Controlled by the parent so other parts
 * of the chrome (TopNav search button) can also open it.
 *
 * This commit renders the chrome (input + empty state) only. Real
 * search wiring (users, posts, jobs) lands in Phase 3 alongside the
 * search backend.
 */
export const CommandPalette = ({ open, onClose, onOpen }: Props) => {
  const [query, setQuery] = useState("");

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
          placeholder="Search people, posts, jobs…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ fontSize: "0.9375rem" }}
          inputProps={{ "aria-label": "Search LynkCircles" }}
        />
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
      </Box>
      <DialogContent sx={{ minHeight: 180, py: 4 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          {query
            ? "Search isn't wired up yet — coming in Phase 3."
            : "Try searching for a worker, a job, or a post."}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";

/**
 * Temporary content while routing is being wired up in sub 5/5. Once
 * the router lands, this becomes the <Routes> tree.
 */
function App() {
  return (
    <AppShell>
      <Box
        sx={{
          maxWidth: 720,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 4, md: 8 },
        }}
      >
        <Stack spacing={3}>
          <Typography variant="overline" color="text.secondary">
            Phase 1b · sub 3/5
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2rem", md: "2.5rem" },
              letterSpacing: "-0.03em",
            }}
          >
            Layout shell online.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Top navigation on desktop, bottom tab bar on mobile, and a
            <Box
              component="kbd"
              sx={{
                fontFamily: "monospace",
                fontSize: "0.75rem",
                px: 0.75,
                py: 0.125,
                border: 1,
                borderColor: "divider",
                borderRadius: 0.75,
                mx: 0.75,
              }}
            >
              ⌘K
            </Box>
            command palette wired to a stub. Real routes, axios, and
            react-query land in sub 5/5.
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: "center", flexWrap: "wrap" }}
          >
            <Button variant="contained" color="primary">
              Primary action
            </Button>
            <Button variant="outlined">Secondary</Button>
            <Chip
              label="Verified worker"
              icon={<ShieldCheck size={14} />}
              color="success"
              sx={{
                color: "#fff",
                "& .MuiChip-icon": { color: "#fff" },
              }}
            />
          </Stack>
        </Stack>
      </Box>
    </AppShell>
  );
}

export default App;

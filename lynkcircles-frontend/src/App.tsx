import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import { Sun, Moon, ShieldCheck } from "lucide-react";
import { useColorMode } from "@/hooks/useColorMode";

/**
 * Theme preview page. Real layout/router land in the next commits — this
 * page exists so the theme tokens are visible end-to-end (and so dark/
 * light toggle can be exercised before the rest of the UI is built).
 */
function App() {
  const { mode, toggleMode } = useColorMode();
  const theme = useTheme();

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        px: 3,
        py: 6,
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <Stack spacing={1} sx={{ alignItems: "center", textAlign: "center" }}>
        <Typography variant="overline" color="text.secondary">
          Phase 1b · sub 2/5
        </Typography>
        <Typography variant="h1" sx={{ letterSpacing: "-0.04em" }}>
          lynkcircles
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: "32rem" }}
        >
          New design system online. Theme tokens, MUI overrides, and a
          dark/light color mode are now wired. Layout shell and primitives
          land in the next commits.
        </Typography>
      </Stack>

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
          sx={{
            bgcolor: theme.palette.success.main,
            color: "#fff",
            "& .MuiChip-icon": { color: "#fff" },
          }}
        />
      </Stack>

      <Button
        variant="outlined"
        size="small"
        onClick={toggleMode}
        startIcon={mode === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      >
        Switch to {mode === "dark" ? "light" : "dark"} mode
      </Button>
    </Box>
  );
}

export default App;

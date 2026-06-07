import { useState, type FormEvent } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Logo } from "@/components/layout/Logo";
import { api, apiErrorMessage } from "@/lib/axios";
import { AUTH_QUERY_KEY } from "@/hooks/useAuthUser";

interface LocationState {
  from?: string;
}

const SignIn = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (vars: { username: string; password: string }) => {
      await api.post("/auth/login", vars);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      const state = location.state as LocationState | null;
      navigate(state?.from ?? "/", { replace: true });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error));
    },
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!username || !password) return;
    loginMutation.mutate({ username, password });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        bgcolor: "background.default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: (t) =>
            t.palette.mode === "dark"
              ? "radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.18), transparent 55%), radial-gradient(ellipse at 75% 100%, rgba(67,56,202,0.20), transparent 60%)"
              : "radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.18), transparent 55%), radial-gradient(ellipse at 75% 100%, rgba(67,56,202,0.10), transparent 60%)",
        }}
      />
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
          backdropFilter: "blur(8px)",
          backgroundColor: (t) =>
            t.palette.mode === "dark"
              ? "rgba(24, 24, 27, 0.85)"
              : "rgba(255, 255, 255, 0.92)",
        }}
      >
        <Stack spacing={1} sx={{ alignItems: "center", textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              position: "relative",
              display: "inline-flex",
              "&::after": {
                content: '""',
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)",
                filter: "blur(12px)",
                zIndex: -1,
              },
            }}
          >
            <Logo size={56} />
          </Box>
          <Typography
            variant="h5"
            sx={{ mt: 2, fontWeight: 700, letterSpacing: "-0.02em" }}
          >
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to keep working with people you trust.
          </Typography>
        </Stack>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Username"
              autoComplete="username"
              autoFocus
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              sx={{ mt: 1, py: 1.25, fontWeight: 600 }}
            >
              {loginMutation.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 3 }}
        >
          New to LynkCircles?{" "}
          <Link component={RouterLink} to="/signup" underline="hover" fontWeight={500}>
            Create an account
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignIn;

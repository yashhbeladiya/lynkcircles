import { useState, type FormEvent } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
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
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 380,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Stack
          spacing={0.5}
          sx={{ alignItems: "center", textAlign: "center", mb: 1 }}
        >
          <Logo size={56} />
          <Typography
            variant="h5"
            sx={{ mt: 2.5, fontWeight: 700, letterSpacing: "-0.02em" }}
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
              size="medium"
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
              size="medium"
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
              sx={{ mt: 1 }}
            >
              {loginMutation.isPending ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          New to LynkCircles?{" "}
          <Link component={RouterLink} to="/signup" underline="hover">
            Create an account
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignIn;

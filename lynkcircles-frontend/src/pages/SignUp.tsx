import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { Logo } from "@/components/layout/Logo";
import { api, apiErrorMessage } from "@/lib/axios";
import { AUTH_QUERY_KEY } from "@/hooks/useAuthUser";
import type { UserRole } from "@/types/user";

interface SignupPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

const SignUp = () => {
  const [form, setForm] = useState<SignupPayload>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    role: "Worker",
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signupMutation = useMutation({
    mutationFn: async (payload: SignupPayload) => {
      await api.post("/auth/signup", payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      toast.success("Welcome to LynkCircles!");
      navigate("/", { replace: true });
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error));
    },
  });

  const update =
    (field: keyof SignupPayload) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    signupMutation.mutate(form);
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
          maxWidth: 440,
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
            Create your account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hire skilled workers or get hired for what you do best.
          </Typography>
        </Stack>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5}>
              <TextField
                label="First name"
                fullWidth
                required
                value={form.firstName}
                onChange={update("firstName")}
                autoComplete="given-name"
              />
              <TextField
                label="Last name"
                fullWidth
                required
                value={form.lastName}
                onChange={update("lastName")}
                autoComplete="family-name"
              />
            </Stack>
            <TextField
              label="Username"
              fullWidth
              required
              value={form.username}
              onChange={update("username")}
              autoComplete="username"
              helperText="Visible on your profile URL."
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={update("email")}
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
              helperText="At least 6 characters."
            />

            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.75 }}
              >
                I'm here to…
              </Typography>
              <ToggleButtonGroup
                value={form.role}
                exclusive
                onChange={(_, next: UserRole | null) =>
                  next && setForm((current) => ({ ...current, role: next }))
                }
                fullWidth
                size="small"
                color="primary"
              >
                <ToggleButton value="Worker">…find work</ToggleButton>
                <ToggleButton value="Client">…hire</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={signupMutation.isPending}
              sx={{ mt: 1, py: 1.25, fontWeight: 600 }}
            >
              {signupMutation.isPending ? "Creating account…" : "Create account"}
            </Button>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 3 }}
        >
          Already on LynkCircles?{" "}
          <Link component={RouterLink} to="/signin" underline="hover" sx={{ fontWeight: 500 }}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignUp;

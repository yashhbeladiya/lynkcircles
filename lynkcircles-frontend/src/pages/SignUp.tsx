import { useState, type FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
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
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
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
                size="medium"
                fullWidth
                required
                value={form.firstName}
                onChange={update("firstName")}
                autoComplete="given-name"
              />
              <TextField
                label="Last name"
                size="medium"
                fullWidth
                required
                value={form.lastName}
                onChange={update("lastName")}
                autoComplete="family-name"
              />
            </Stack>
            <TextField
              label="Username"
              size="medium"
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
              size="medium"
              fullWidth
              required
              value={form.email}
              onChange={update("email")}
              autoComplete="email"
            />
            <TextField
              label="Password"
              type="password"
              size="medium"
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
              sx={{ mt: 1 }}
            >
              {signupMutation.isPending ? "Creating account…" : "Create account"}
            </Button>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Already on LynkCircles?{" "}
          <Link component={RouterLink} to="/signin" underline="hover">
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignUp;

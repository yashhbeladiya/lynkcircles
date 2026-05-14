import { Navigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuthUser } from "@/hooks/useAuthUser";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface LocationState {
  from?: string;
}

/**
 * Inverse of RequireAuth. Wraps signin/signup so a logged-in user
 * who lands there bounces back to wherever they were headed (or home).
 */
export const RedirectIfAuth = ({ children }: Props) => {
  const { data: user, isLoading } = useAuthUser();
  const location = useLocation();
  const state = location.state as LocationState | null;

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (user) {
    return <Navigate to={state?.from ?? "/"} replace />;
  }

  return <>{children}</>;
};

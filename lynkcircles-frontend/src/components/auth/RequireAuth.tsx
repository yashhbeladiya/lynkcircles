import { Navigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useAuthUser } from "@/hooks/useAuthUser";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const RequireAuth = ({ children }: Props) => {
  const { data: user, isLoading, isError } = useAuthUser();
  const location = useLocation();

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

  if (isError || !user) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  return <>{children}</>;
};

//@ts-nocheck
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Check, Clock, UserCheck, UserPlus, X } from "lucide-react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";

interface User {
  _id: string;
  username: string;
  profilePicture: string;
  firstName: string;
  lastName: string;
  headline: string;
}

interface ConnectionStatus {
  status: string;
  requestId?: string;
}

const RecommandedUser: React.FC<{ user: User }> = ({ user }) => {
  const queryClient = useQueryClient();

  const { data: connectionStatus, isLoading } = useQuery<ConnectionStatus>({
    queryKey: ["connectionStatus", user._id],
    queryFn: () =>
      axiosInstance
        .get(`/connections/status/${user._id}`)
        .then((res) => res.data),
  });

  const { mutate: sendConnectionRequest } = useMutation({
    mutationFn: (userId: string) =>
      axiosInstance.post(`/connections/request/${userId}`),
    onSuccess: () => {
      toast.success("Connection request sent successfully");
      queryClient.invalidateQueries({
        queryKey: ["connectionStatus", user._id],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "An error occurred");
    },
  });

  const { mutate: acceptRequest } = useMutation({
    mutationFn: (requestId: string) =>
      axiosInstance.put(`/connections/requests/${requestId}/accept`),
    onSuccess: () => {
      toast.success("Connection request accepted");
      queryClient.invalidateQueries({
        queryKey: ["connectionStatus", user._id],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "An error occurred");
    },
  });

  const { mutate: rejectRequest } = useMutation({
    mutationFn: (requestId: string) =>
      axiosInstance.put(`/connections/requests/${requestId}/reject`),
    onSuccess: () => {
      toast.success("Connection request rejected");
      queryClient.invalidateQueries({
        queryKey: ["connectionStatus", user._id],
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "An error occurred");
    },
  });

  const handleConnect = () => {
    if (connectionStatus?.status === "not_connected") {
      sendConnectionRequest(user._id);
    }
  };

  const renderButton = () => {
    if (isLoading) {
      return (
        <Button variant="contained" color="primary" disabled>
          <CircularProgress size={16} />
        </Button>
      );
    }

    switch (connectionStatus?.status) {
      case "pending":
        return (
          <Button
            variant="contained"
            color="warning"
            disabled
            startIcon={<Clock size={16} />}
          >
            Pending
          </Button>
        );
      case "received":
        return (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => acceptRequest(connectionStatus.requestId!)}
              startIcon={<Check size={16} />}
            >
              Accept
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => rejectRequest(connectionStatus.requestId!)}
              startIcon={<X size={16} />}
            >
              Reject
            </Button>
          </Box>
        );
      case "connected":
        return (
          <Button
            variant="contained"
            color="success"
            disabled
            startIcon={<UserCheck size={16} />}
          >
            Connected
          </Button>
        );
      default:
        return (
          <Button
            variant="outlined"
            sx={{ color: "#333366" }}
            onClick={handleConnect}
            startIcon={<UserPlus size={16} />}
          >
            Connect
          </Button>
        );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 2,
      }}
    >
      <Link
        to={`/profile/${user.username}`}
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <Avatar
          src={user.profilePicture || "/avatar.png"}
          alt={`${user.firstName} ${user.lastName}`}
          sx={{ width: 48, height: 48, mr: 2 }}
        />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {user.headline || "LynkCircle's User"}
          </Typography>
        </Box>
      </Link>
      {renderButton()}
    </Box>
  );
};

export default RecommandedUser;

//@ts-nocheck

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import {
  ExternalLink,
  Eye,
  MessageSquare,
  ThumbsUp,
  Trash2,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { formatDistanceToNow } from "date-fns";
import Grid from "@mui/material/Grid2";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";

interface User {
  _id: string;
  username: string;
  profilePicture: string;
  firstName: string;
  lastName: string;
}

interface Notification {
  _id: string;
  type: string;
  read: boolean;
  createdAt: string;
  relatedUser: User;
  relatedPost?: {
    _id: string;
    image?: string;
    content: string;
  };
}

const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery<User>({
    queryKey: ["authUser"],
    queryFn: () => axiosInstance.get("/auth/me").then((res) => res.data),
  });

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: () => axiosInstance.get("/notifications").then((res) => res.data),
  });

  const { mutate: markAsReadMutation } = useMutation({
    mutationFn: (id: string) => axiosInstance.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const { mutate: deleteNotificationMutation } = useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/notifications/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      toast.success("Notification deleted");
    },
  });

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <ThumbsUp className="text-blue-500" />;
      case "comment":
        return <MessageSquare className="text-green-500" />;
      case "connectionAccepted":
        return <UserPlus className="text-purple-500" />;
      default:
        return null;
    }
  };

  const renderNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case "like":
        return (
          <span>
            <strong>
              {notification.relatedUser.firstName}{" "}
              {notification.relatedUser.lastName}
            </strong>{" "}
            liked your post
          </span>
        );
      case "comment":
        return (
          <span>
            <Link
              to={`/profile/${notification.relatedUser.username}`}
              className="font-bold"
            >
              {notification.relatedUser.firstName}{" "}
              {notification.relatedUser.lastName}
            </Link>{" "}
            commented on your post
          </span>
        );
      case "connectionAccepted":
        return (
          <span>
            <Link
              to={`/profile/${notification.relatedUser.username}`}
              className="font-bold"
            >
              {notification.relatedUser.firstName}{" "}
              {notification.relatedUser.lastName}
            </Link>{" "}
            accepted your connection request
          </span>
        );
      default:
        return null;
    }
  };

  const renderRelatedPost = (relatedPost?: {
    _id: string;
    image?: string;
    content: string;
  }) => {
    if (!relatedPost) return null;

    return (
      <Link
        to={`/feed/${relatedPost._id}`}
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
          marginTop: "8px",
          padding: "8px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          transition: "background-color 0.3s",
        }}
      >
        {relatedPost.image && (
          <img
            src={relatedPost.image}
            alt="Post preview"
            style={{
              width: "40px",
              height: "40px",
              objectFit: "cover",
              borderRadius: "4px",
              marginRight: "8px",
            }}
          />
        )}
        <Typography variant="body2" color="textSecondary" noWrap>
          {relatedPost.content}
        </Typography>
        <ExternalLink size={14} style={{ color: "#888", marginLeft: "8px" }} />
      </Link>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={authUser} />
      </div>
      <div className="col-span-1 lg:col-span-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>

          {isLoading ? (
            <CircularProgress />
          ) : notifications?.length > 0 ? (
            <List>
              {notifications.map((notification) => (
                <ListItem
                  key={notification._id}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column" }, // Column for small screens, row for large screens
                    alignItems: { xs: "flex-start", sm: "center" }, // Align items based on screen size
                    mb: 2,
                    backgroundColor: "white",
                    borderRadius: "8px",
                    boxShadow: 1,
                    transition: "box-shadow 0.3s",
                    "&:hover": { boxShadow: 3 },
                    padding: 2,
                  }}
                >
                  {/* Top Section: Avatar, Message, Action Buttons */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "row", sm: "row" }, // Row for both screen sizes
                      alignItems: "center",
                      justifyContent: "space-between", // Space between for message and actions
                      width: "100%",
                    }}
                  >
                    {/* Avatar */}
                    <ListItemAvatar>
                      <Link
                        to={`/profile/${notification.relatedUser.username}`}
                      >
                        <Avatar
                          src={
                            notification.relatedUser.profilePicture ||
                            "/avatar.png"
                          }
                          alt={`${notification.relatedUser.firstName} ${notification.relatedUser.lastName}`}
                        />
                      </Link>
                    </ListItemAvatar>

                    {/* Notification Message */}
                    <Box sx={{ flex: 1 }}>
                      <ListItemText
                        primary={renderNotificationContent(notification)}
                        secondary={formatDistanceToNow(
                          new Date(notification.createdAt),
                          {
                            addSuffix: true,
                          }
                        )}
                      />
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {!notification.read && (
                        <IconButton
                          onClick={() => markAsReadMutation(notification._id)}
                          style={{ color: "#333366" }}
                        >
                          <Eye size={16} />
                        </IconButton>
                      )}
                      <IconButton
                        onClick={() =>
                          deleteNotificationMutation(notification._id)
                        }
                        color="error"
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Related Post Section */}
                  {notification.relatedPost && (
                    <Box
                      sx={{
                        mt: 2, // Margin-top for spacing
                        width: "100%", // Full width
                        display: { xs: "block", sm: "flex" }, // Block for small screens, inline for large
                        alignItems: "center",
                      }}
                    >
                      {renderRelatedPost(notification.relatedPost)}
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          ) : (
            <p>No notification at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

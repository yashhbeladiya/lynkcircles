//@ts-nocheck
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { initializeSocket, getSocket } from "../lib/socket";

export const useSocket = () => {
  const queryClient = useQueryClient();

  // Auth query
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (error: any) {
        if (error.response?.status === 401) {
          console.log("User is not logged in");
          return null;
        }
        console.error("Error fetching auth user:", error);
        return null;
      }
    },
  });

  // Initialize socket when auth is confirmed
  useEffect(() => {
    if (authUser) {
      const socket = initializeSocket(authUser);

      if (socket) {
        // Set up socket event listeners
        socket.on("newMessage", (data) => {
          // Invalidate and refetch conversations query
          queryClient.invalidateQueries(["conversations"]);
          // Invalidate specific conversation messages if needed
          queryClient.invalidateQueries(["messages", data.conversation]);
        });

        socket.on("messageStatusUpdate", (data) => {
          // Update message status in cache
          queryClient.setQueryData(
            ["messages", data.messageId],
            (oldData: any) => ({
              ...oldData,
              status: data.status,
            })
          );
        });

        return () => {
          socket.disconnect();
        };
      }
    }
  }, [authUser, queryClient]);

  return {
    socket: getSocket(authUser),
    isAuthenticated: !!authUser,
    authUser,
    isLoading,
  };
};

// Example usage in a component:
export const useSendMessage = () => {
  const { socket } = useSocket();
  
  const sendMessage = async (
    recipientId: string,
    content: string,
    fileUrl?: string,
    fileType?: string
  ) => {
    if (!socket) {
      throw new Error("Socket not connected");
    }

    console.log("Sending message to:", recipientId);

    return new Promise((resolve, reject) => {
      socket.emit("privateMessage", {
        recipientId,
        content,
        fileUrl,
        fileType,
      });

      socket.once("messageSent", resolve);
      socket.once("messageError", reject);
    });
  };

  return { sendMessage };
};

  
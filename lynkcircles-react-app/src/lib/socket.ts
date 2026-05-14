// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  newMessage: (data: { message: any; conversation: string }) => void;
  messageSent: (data: { message: any; conversation: string }) => void;
  messageStatusUpdate: (data: { messageId: string; status: string }) => void;
  userTyping: (data: { conversationId: string; userId: string }) => void;
  userOnline: (data: { userId: string }) => void;
  userOffline: (data: { userId: string }) => void;
}

interface ClientToServerEvents {
  privateMessage: (data: {
    recipientId: string;
    content: string;
    fileUrl?: string | null;
    fileType?: string | null;
  }) => void;
  messageStatus: (data: { messageId: string; status: string }) => void;
  typing: (data: { conversationId: string; recipientId: string }) => void;
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const initializeSocket = (authUser : any) => {
  if (!socket) {
    
    if (!authUser) {
        console.error("User not authenticated");
      return null;
    }

    socket = io("http://localhost:5100", {
        withCredentials: true,
        auth: {
          userId: authUser?._id // Pass user ID instead of token
        }
      });

    // Socket event listeners
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      socket = null;
    });
  }
  console.log("Socket initialized", socket);
  return socket;
};

export const getSocket = (authUser : any) => {
  if (!socket) {
    return initializeSocket(authUser);
  }
  return socket;
};
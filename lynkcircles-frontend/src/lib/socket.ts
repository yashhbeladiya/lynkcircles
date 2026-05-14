import { io, type Socket } from "socket.io-client";
import type { Message } from "@/types/message";

/**
 * Typed socket contract — kept in sync with lynkcircles-backend/lib/
 * socket.js. Strong typing here means a server-side rename or event
 * payload change fails the build, not a runtime listener that silently
 * never fires.
 */
export interface ServerToClientEvents {
  newMessage: (data: { message: Message; tempId?: string }) => void;
  messageSent: (data: { message: Message; tempId?: string }) => void;
  messageError: (data: { error: string; tempId?: string }) => void;
  messageRead: (data: { messageId: string }) => void;
  userTyping: (data: { userId: string; isTyping: boolean }) => void;
  userOnline: (data: { userId: string }) => void;
  userOffline: (data: { userId: string }) => void;
  onlineUsers: (data: { userIds: string[] }) => void;
}

export interface ClientToServerEvents {
  privateMessage: (
    data: {
      recipientId: string;
      content: string;
      fileUrl?: string | null;
      fileType?: string | null;
      tempId?: string;
    },
    ack?: (response: { ok: boolean; message?: Message; tempId?: string; error?: string }) => void
  ) => void;
  markMessageRead: (data: { messageId: string; senderId: string }) => void;
  typing: (data: { recipientId: string; isTyping: boolean }) => void;
}

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let instance: AppSocket | null = null;

/**
 * Module-level singleton. We don't open the socket eagerly because the
 * cookie may not be set yet on first page load. `connectSocket()` is
 * called by useSocketLifecycle after auth resolves; `disconnectSocket()`
 * is called on sign-out.
 *
 * Why a singleton: socket.io maintains an internal reconnect loop. We
 * only want one of those per tab — multiple instances would compete to
 * deliver the same events and inflate the connected-users count
 * server-side.
 */
export const connectSocket = (): AppSocket => {
  if (instance && instance.connected) return instance;
  if (instance && !instance.connected) {
    instance.connect();
    return instance;
  }

  // baseURL is relative so dev (Vite proxy) and prod (same-origin) both
  // work without a build-time env switch. The cookie auth handshake on
  // the server reads from socket.handshake.headers.cookie — withCreds
  // makes the browser include the cookie on the WS upgrade request.
  instance = io({
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  return instance;
};

export const disconnectSocket = (): void => {
  if (!instance) return;
  instance.removeAllListeners();
  instance.disconnect();
  instance = null;
};

export const getSocket = (): AppSocket | null => instance;

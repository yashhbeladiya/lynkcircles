import { io, type Socket } from "socket.io-client";
import toast from "react-hot-toast";
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

const log = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.info("[socket]", ...args);
};

/**
 * Module-level singleton, idempotent. Safe to call from any component
 * effect: if a socket already exists it's returned as-is; otherwise the
 * connection is opened.
 *
 * IMPORTANT: child-component effects fire BEFORE the parent's effect
 * during React's commit phase, so any subscriber (ChatPane, useOnlineUsers,
 * etc.) MUST call connectSocket() rather than a "read-only" getter —
 * otherwise the socket may not exist yet when the subscriber tries to
 * attach its listener, and the listener silently no-ops for the lifetime
 * of that subscriber.
 *
 * Why a singleton: socket.io maintains an internal reconnect loop. We
 * only want one per tab — multiple instances would compete to deliver
 * the same events and inflate the server-side connected-users count.
 */
export const connectSocket = (): AppSocket => {
  if (instance) {
    if (!instance.connected) instance.connect();
    return instance;
  }

  // No explicit URL: the browser uses the current origin. In dev that's
  // the Vite server (3001), which proxies /socket.io to the backend
  // (5100). In prod the Express app serves both APIs and assets, so
  // same-origin is what we want too.
  //
  // No explicit `transports` either — letting socket.io use its default
  // ["polling", "websocket"] order is more resilient through proxies
  // than forcing websocket-first.
  const next: AppSocket = io({
    withCredentials: true,
    autoConnect: true,
  });

  // Bind diagnostic listeners once, at instance creation time. These are
  // module-level (not in any React effect), so they survive remounts.
  next.on("connect", () => log("connected", next.id));
  next.on("disconnect", (reason) => log("disconnected:", reason));
  next.on("connect_error", (err) => {
    log("connect_error:", err.message);
    // Surface auth-cookie / proxy failures so the user doesn't sit
    // wondering why messages aren't moving in real time.
    toast.error(`Real-time connection failed: ${err.message}`, {
      id: "socket-connect-error",
    });
  });

  instance = next;
  return next;
};

export const disconnectSocket = (): void => {
  if (!instance) return;
  instance.removeAllListeners();
  instance.disconnect();
  instance = null;
};

/**
 * Read-only accessor — returns null if the socket hasn't been opened
 * yet. Prefer `connectSocket()` from inside component effects; reserve
 * `getSocket()` for cleanup paths and tests where creating-on-read
 * would be a side effect.
 */
export const getSocket = (): AppSocket | null => instance;

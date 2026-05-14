import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";

/**
 * Subscribe to online-user changes. Returns a Set keyed by userId.
 *
 * Hydration: the server emits `onlineUsers` once per socket connection
 * with the full current set, so a freshly-mounted component doesn't
 * have to wait for the first userOnline event before knowing who's
 * around.
 */
export const useOnlineUsers = (): ReadonlySet<string> => {
  const [online, setOnline] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onHydrate = ({ userIds }: { userIds: string[] }) =>
      setOnline(new Set(userIds));

    const onOnline = ({ userId }: { userId: string }) =>
      setOnline((prev) => {
        if (prev.has(userId)) return prev;
        const next = new Set(prev);
        next.add(userId);
        return next;
      });

    const onOffline = ({ userId }: { userId: string }) =>
      setOnline((prev) => {
        if (!prev.has(userId)) return prev;
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });

    socket.on("onlineUsers", onHydrate);
    socket.on("userOnline", onOnline);
    socket.on("userOffline", onOffline);

    return () => {
      socket.off("onlineUsers", onHydrate);
      socket.off("userOnline", onOnline);
      socket.off("userOffline", onOffline);
    };
  }, []);

  return online;
};

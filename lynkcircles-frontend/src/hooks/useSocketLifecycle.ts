import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useAuthUser } from "@/hooks/useAuthUser";
import type { Message } from "@/types/message";

const MESSAGES_KEY = "messages";

/**
 * Wires the singleton socket to the app's lifecycle:
 * - Connects once auth resolves to a real user.
 * - Disconnects when the user logs out / unmounts.
 * - Bridges socket events into react-query so any open page (Messages,
 *   notification badges, etc.) re-renders with new data automatically.
 *
 * Mounted exactly once near the top of the tree (inside AppShell), so
 * components further down can call useSocket() / useOnlineUsers() and
 * trust that the connection exists.
 */
export const useSocketLifecycle = () => {
  const { data: user } = useAuthUser();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const socket = connectSocket();

    const pushMessage = (message: Message, peerId: string) => {
      queryClient.setQueryData<Message[] | undefined>(
        [MESSAGES_KEY, peerId],
        (old) => {
          if (!old) return [message];
          // Reconcile optimistic outbound bubble (tempId) with server echo,
          // and dedupe inbound by _id (e.g. cross-tab fan-out).
          const matchedIndex = old.findIndex(
            (m) =>
              (message.tempId && m.tempId && m.tempId === message.tempId) ||
              m._id === message._id
          );
          if (matchedIndex >= 0) {
            const next = old.slice();
            next[matchedIndex] = { ...message, status: "sent" };
            return next;
          }
          return [...old, { ...message, status: "delivered" }];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    const onNewMessage = ({ message, tempId }: { message: Message; tempId?: string }) => {
      // We are the recipient — peer is the sender.
      pushMessage({ ...message, tempId }, message.sender._id);
    };

    const onMessageSent = ({ message, tempId }: { message: Message; tempId?: string }) => {
      // We are the sender — peer is the recipient (string id on the model).
      pushMessage({ ...message, tempId }, message.recipient);
    };

    const onMessageRead = ({ messageId }: { messageId: string }) => {
      queryClient.setQueriesData<Message[] | undefined>(
        { queryKey: [MESSAGES_KEY] },
        (old) =>
          old?.map((m) => (m._id === messageId ? { ...m, status: "read" } : m))
      );
    };

    socket.on("newMessage", onNewMessage);
    socket.on("messageSent", onMessageSent);
    socket.on("messageRead", onMessageRead);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageSent", onMessageSent);
      socket.off("messageRead", onMessageRead);
    };
  }, [user, queryClient]);

  useEffect(() => {
    if (user) return;
    // Auth gone — tear down the socket so the next sign-in starts fresh.
    disconnectSocket();
  }, [user]);
};

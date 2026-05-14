import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isSameDay } from "date-fns";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { ArrowLeft, MessagesSquare } from "lucide-react";
import { UserAvatar, EmptyState } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useMessages } from "@/hooks/useMessages";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { api } from "@/lib/axios";
import { connectSocket } from "@/lib/socket";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { DateDivider } from "./DateDivider";
import { TypingIndicator } from "./TypingIndicator";
import type { Message } from "@/types/message";
import type { UserSummary } from "@/types/user";

const SAME_AUTHOR_GAP_MS = 60_000;

/**
 * Right-pane chat view for the peer identified by /:peerId in the URL.
 * Handles message rendering, sending (optimistic), typing indicator
 * subscription, read-receipt emission, and the mobile back button.
 */
export const ChatPane = () => {
  const { peerId } = useParams<{ peerId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: authUser } = useAuthUser();
  const { data: messages, isLoading } = useMessages(peerId);
  const online = useOnlineUsers();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const initialScrollDoneRef = useRef<string | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const typingHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Peer profile — fetched separately so the chat header has a name
  // even before any messages have been exchanged.
  const { data: peer } = useQuery<UserSummary>({
    queryKey: ["user", peerId],
    queryFn: async () => {
      if (!peerId) throw new Error("missing peer id");
      const { data } = await api.get<UserSummary>(`/users/${peerId}`);
      return data;
    },
    enabled: !!peerId,
    staleTime: 5 * 60_000,
  });

  // Subscribe to typing events from this peer. The server emits to all
  // sockets owned by the recipient, so we filter by sender userId.
  useEffect(() => {
    if (!peerId) return;
    const socket = connectSocket();
    if (!socket) return;

    const onTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (userId !== peerId) return;
      setPeerTyping(isTyping);
      if (typingHideTimer.current) clearTimeout(typingHideTimer.current);
      if (isTyping) {
        // Safety net: hide after 4s of no further events.
        typingHideTimer.current = setTimeout(() => setPeerTyping(false), 4000);
      }
    };
    socket.on("userTyping", onTyping);
    return () => {
      socket.off("userTyping", onTyping);
      if (typingHideTimer.current) clearTimeout(typingHideTimer.current);
    };
  }, [peerId]);

  // Mark inbound messages as read when they appear and we're viewing
  // this conversation. The server emits messageRead back, which our
  // global socket lifecycle hook reconciles into the cache.
  useEffect(() => {
    if (!authUser || !peerId || !messages) return;
    const socket = connectSocket();
    if (!socket) return;
    for (const m of messages) {
      if (m.sender._id === peerId && m.status !== "read") {
        socket.emit("markMessageRead", {
          messageId: m._id,
          senderId: peerId,
        });
      }
    }
  }, [messages, peerId, authUser]);

  // Autoscroll behavior:
  // - On initial load (or when switching peers), JUMP to the bottom so
  //   the user sees the latest conversation, the way every messenger
  //   works. Tracked per-peer in a ref so each new conversation gets
  //   its own first-render snap.
  // - On subsequent updates, only auto-scroll if the user was already
  //   near the bottom — otherwise they'd be yanked back down while
  //   scrolling history.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !peerId || !messages || messages.length === 0) return;

    const isFirstLoadForPeer = initialScrollDoneRef.current !== peerId;
    if (isFirstLoadForPeer) {
      // Use rAF so layout has settled (fonts loaded, images sized) by
      // the time we read scrollHeight. Otherwise we frequently land
      // a few pixels short of the bottom.
      requestAnimationFrame(() => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        initialScrollDoneRef.current = peerId;
      });
      return;
    }

    const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (fromBottom < 200) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, peerTyping, peerId]);

  // Reset the first-load flag when peerId changes so a fresh chat
  // always starts at the bottom.
  useEffect(() => {
    if (initialScrollDoneRef.current && initialScrollDoneRef.current !== peerId) {
      initialScrollDoneRef.current = null;
    }
  }, [peerId]);

  const handleTyping = useCallback(
    (isTyping: boolean) => {
      if (!peerId) return;
      connectSocket()?.emit("typing", { recipientId: peerId, isTyping });
    },
    [peerId]
  );

  const handleSend = useCallback(
    async ({
      content,
      fileUrl,
      fileType,
    }: {
      content: string;
      fileUrl?: string;
      fileType?: Message["fileType"];
    }) => {
      if (!peerId || !authUser) return;
      // socket.io buffers outbound emits when not yet connected, so we
      // don't gate on socket.connected — gating there meant a brief
      // reconnect window swallowed the user's click with no optimistic
      // bubble. If auth-cookie or proxy is truly broken, the
      // connect_error listener in lib/socket.ts surfaces a toast.
      const socket = connectSocket();

      const tempId = `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const optimistic: Message = {
        _id: tempId,
        tempId,
        sender: {
          _id: authUser._id,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          username: authUser.username,
          profilePicture: authUser.profilePicture,
          verified: authUser.verified,
        },
        recipient: peerId,
        content,
        fileUrl: fileUrl ?? null,
        fileType: fileType ?? null,
        status: "sending",
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Message[]>(["messages", peerId], (old) =>
        old ? [...old, optimistic] : [optimistic]
      );

      socket.emit("privateMessage", {
        recipientId: peerId,
        content,
        fileUrl: fileUrl ?? null,
        fileType: fileType ?? null,
        tempId,
      });
    },
    [peerId, authUser, queryClient]
  );

  // Group messages into visual clusters so we can collapse the
  // timestamp on consecutive same-sender bubbles, and inject date
  // dividers when the calendar day rolls over.
  const rendered = useMemo(() => {
    if (!messages) return null;
    const items: React.ReactNode[] = [];
    let prevDate: Date | null = null;

    messages.forEach((m, i) => {
      const date = new Date(m.createdAt);
      if (!prevDate || !isSameDay(prevDate, date)) {
        items.push(<DateDivider key={`d-${m._id}`} date={date} />);
      }
      prevDate = date;

      const next = messages[i + 1];
      const groupedWithNext =
        next &&
        next.sender._id === m.sender._id &&
        new Date(next.createdAt).getTime() - date.getTime() < SAME_AUTHOR_GAP_MS &&
        isSameDay(new Date(next.createdAt), date);

      items.push(
        <MessageBubble
          key={m._id + (m.tempId ?? "")}
          message={m}
          mine={m.sender._id === authUser?._id}
          compact={groupedWithNext}
        />
      );
    });
    return items;
  }, [messages, authUser]);

  if (!peerId) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
        }}
      >
        <EmptyState
          icon={MessagesSquare}
          title="Select a conversation"
          description="Pick someone from the list to start chatting, or send a message to start a new conversation."
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.25,
          borderBottom: 1,
          borderColor: "divider",
          minHeight: 60,
        }}
      >
        <IconButton
          size="small"
          onClick={() => navigate("/messages")}
          sx={{ display: { md: "none" } }}
          aria-label="Back to conversations"
        >
          <ArrowLeft size={18} />
        </IconButton>
        {peer ? (
          <>
            <UserAvatar
              user={peer}
              size="sm"
              online={online.has(peer._id)}
              verified={peer.verified}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, lineHeight: 1.2 }}
              >
                {peer.firstName} {peer.lastName}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.tertiary", fontSize: "0.6875rem" }}
              >
                {online.has(peer._id) ? "Online" : peer.headline ?? "Offline"}
              </Typography>
            </Box>
          </>
        ) : null}
      </Box>

      {/* Messages */}
      <Box
        ref={scrollRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          px: { xs: 1.5, sm: 2.5 },
          py: 1,
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={20} />
          </Box>
        ) : messages && messages.length === 0 ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No messages yet. Say hi!
            </Typography>
          </Box>
        ) : (
          rendered
        )}
        {peerTyping ? <TypingIndicator name={peer?.firstName} /> : null}
      </Box>

      <MessageComposer onTyping={handleTyping} onSend={handleSend} />
    </Box>
  );
};

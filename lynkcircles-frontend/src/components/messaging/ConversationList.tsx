import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import { Search, MessageSquarePlus, MessageSquare } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";

import { UserAvatar, EmptyState } from "@/components/ui";
import { useConversations } from "@/hooks/useConversations";
import { useConnections } from "@/hooks/useConnections";
import { useOnlineUsers } from "@/hooks/useOnlineUsers";
import { useAuthUser } from "@/hooks/useAuthUser";
import type { Conversation } from "@/types/message";
import type { UserSummary } from "@/types/user";

interface Row {
  peer: UserSummary;
  lastMessage: string;
  lastAt?: string | undefined;
  online: boolean;
}

const peerOf = (conv: Conversation, selfId: string): UserSummary | null => {
  const others = conv.participants.filter((p) => p._id !== selfId);
  return others[0] ?? null;
};

const previewOf = (conv: Conversation, selfId: string): string => {
  const last = conv.lastMessage;
  if (!last) return "Start the conversation";
  const prefix = last.sender._id === selfId ? "You: " : "";
  if (last.content?.trim()) return prefix + last.content;
  if (last.fileType === "image") return `${prefix}sent an image`;
  if (last.fileType) return `${prefix}sent a ${last.fileType}`;
  return prefix + "Message";
};

/**
 * Left rail listing existing conversations and connections you can start
 * a new chat with. Filterable by name in the local search box. Clicking
 * a row navigates to /messages/:peerId; the chat pane reads the param.
 */
export const ConversationList = () => {
  const { peerId } = useParams<{ peerId: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { data: user } = useAuthUser();
  const { data: conversations, isLoading } = useConversations();
  const { data: connections } = useConnections();
  const online = useOnlineUsers();

  const rows = useMemo<Row[]>(() => {
    if (!user) return [];
    const fromConv: Row[] = [];
    for (const c of conversations ?? []) {
      const peer = peerOf(c, user._id);
      if (!peer) continue;
      fromConv.push({
        peer,
        lastMessage: previewOf(c, user._id),
        lastAt: c.lastMessage?.createdAt,
        online: online.has(peer._id),
      });
    }

    const seen = new Set(fromConv.map((r) => r.peer._id));
    const fromConns: Row[] = (connections ?? [])
      .filter((c) => !seen.has(c._id))
      .map((c) => ({
        peer: c,
        lastMessage: "Say hello",
        online: online.has(c._id),
      }));

    const all = [...fromConv, ...fromConns];
    if (!query.trim()) return all;
    const q = query.trim().toLowerCase();
    return all.filter((r) =>
      `${r.peer.firstName} ${r.peer.lastName} ${r.peer.username}`
        .toLowerCase()
        .includes(q)
    );
  }, [conversations, connections, online, user, query]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 2.5,
          pt: 2,
          pb: 1.5,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Messages
        </Typography>
        <Tooltip title="New conversation">
          <IconButton size="small" aria-label="New conversation">
            <MessageSquarePlus size={18} />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ px: 2, pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.25,
            py: 0.75,
            borderRadius: 999,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Search size={14} aria-hidden />
          <InputBase
            fullWidth
            placeholder="Search people"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ fontSize: "0.8125rem" }}
            inputProps={{ "aria-label": "Search conversations" }}
          />
        </Box>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 1, pb: 2 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={20} />
          </Box>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="Connect with someone first, then come back to start a chat."
          />
        ) : (
          rows.map((row) => {
            const active = row.peer._id === peerId;
            return (
              <Box
                key={row.peer._id}
                component="button"
                onClick={() => navigate(`/messages/${row.peer._id}`)}
                sx={{
                  width: "100%",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.5,
                  py: 1.25,
                  borderRadius: 1.5,
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: active ? "action.selected" : "transparent",
                  color: "text.primary",
                  transition: "background-color 120ms ease",
                  "&:hover": {
                    backgroundColor: active ? "action.selected" : "action.hover",
                  },
                }}
                aria-current={active ? "page" : undefined}
              >
                <UserAvatar
                  user={row.peer}
                  size="md"
                  online={row.online}
                  verified={row.peer.verified}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 1,
                      mb: 0.25,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: 1,
                      }}
                    >
                      {row.peer.firstName} {row.peer.lastName}
                    </Typography>
                    {row.lastAt ? (
                      <Typography
                        variant="caption"
                        sx={{ color: "text.tertiary", fontSize: "0.6875rem" }}
                      >
                        {formatDistanceToNowStrict(new Date(row.lastAt))}
                      </Typography>
                    ) : null}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.75rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {row.lastMessage}
                  </Typography>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

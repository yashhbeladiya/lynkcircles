import { useParams, Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import { ConversationList } from "@/components/messaging/ConversationList";

/**
 * Two-pane Messages layout.
 *
 * Desktop (≥md): list on the left, chat on the right, side-by-side.
 * Mobile (<md): one pane at a time — list when no peerId in the URL,
 *   chat when there is. Navigation between them uses the router so
 *   back/forward feel native.
 *
 * The chat pane is rendered by react-router's <Outlet />:
 *   /messages          -> <EmptyChatPane />   (index route)
 *   /messages/:peerId  -> <ChatPane />        (peerId comes from useParams)
 *
 * This is intentional. In react-router v7, useParams in a PARENT
 * route's element only sees the parent's params. So if we rendered
 * <ChatPane /> directly here, ChatPane's useParams would return {}
 * with no peerId — and the messages query would never run with the
 * right key. Letting <ChatPane /> be the child route's element makes
 * peerId unambiguously available.
 */
const Messages = () => {
  const { peerId } = useParams<{ peerId: string }>();

  return (
    <Box
      sx={{
        height: { xs: "calc(100svh - 64px)", md: "calc(100svh - 60px)" },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(280px, 360px) 1fr" },
        borderTop: 1,
        borderColor: "divider",
        mb: { xs: "-64px", md: 0 },
      }}
    >
      <Box
        sx={{
          display: { xs: peerId ? "none" : "flex", md: "flex" },
          flexDirection: "column",
          borderRight: { md: 1 },
          borderColor: { md: "divider" },
          minHeight: 0,
        }}
      >
        <ConversationList />
      </Box>
      <Box
        sx={{
          display: { xs: peerId ? "flex" : "none", md: "flex" },
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Messages;

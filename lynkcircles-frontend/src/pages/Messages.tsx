import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import { ConversationList } from "@/components/messaging/ConversationList";
import { ChatPane } from "@/components/messaging/ChatPane";

/**
 * Two-pane Messages layout.
 *
 * Desktop (≥md): list on the left, chat on the right, side-by-side.
 * Mobile (<md): one pane visible at a time — list when no peerId in
 *   the URL, chat when there is. Navigation between them uses the
 *   router so back/forward buttons feel native.
 */
const Messages = () => {
  const { peerId } = useParams<{ peerId: string }>();

  return (
    <Box
      sx={{
        // Fill the viewport below the top nav. Use small-viewport units
        // (svh) so iOS Safari doesn't push the composer behind the URL bar.
        height: { xs: "calc(100svh - 64px)", md: "calc(100svh - 60px)" },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(280px, 360px) 1fr" },
        borderTop: 1,
        borderColor: "divider",
        // Override AppShell's mobile bottom padding — Messages owns the
        // full viewport so the composer can sit flush at the bottom of
        // the chat pane.
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
        <ChatPane />
      </Box>
    </Box>
  );
};

export default Messages;

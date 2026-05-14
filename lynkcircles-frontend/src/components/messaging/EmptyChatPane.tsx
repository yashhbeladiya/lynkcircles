import Box from "@mui/material/Box";
import { MessagesSquare } from "lucide-react";
import { EmptyState } from "@/components/ui";

/**
 * Right-pane content when no conversation is selected (URL is /messages,
 * no :peerId). Rendered as the index route's element, so it only shows
 * up when no chat is active.
 */
export const EmptyChatPane = () => (
  <Box
    sx={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "background.default",
      height: "100%",
    }}
  >
    <EmptyState
      icon={MessagesSquare}
      title="Select a conversation"
      description="Pick someone from the list to start chatting, or send a message to start a new conversation."
    />
  </Box>
);

export default EmptyChatPane;

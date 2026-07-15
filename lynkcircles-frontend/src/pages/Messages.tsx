import { useParams, Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import { ConversationList } from "@/components/messaging/ConversationList";

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

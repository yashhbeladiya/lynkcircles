import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { AlertCircle, Check, CheckCheck, Paperclip } from "lucide-react";
import { format } from "date-fns";
import type { Message } from "@/types/message";

interface Props {
  message: Message;
  mine: boolean;
  compact?: boolean;
}

const StatusIcon = ({ status }: { status?: Message["status"] }) => {
  if (status === "failed") {
    return (
      <Tooltip title="Failed to send">
        <AlertCircle size={12} aria-label="Failed" />
      </Tooltip>
    );
  }
  if (status === "read") {
    return (
      <Tooltip title="Read">
        <CheckCheck size={12} aria-label="Read" />
      </Tooltip>
    );
  }
  if (status === "delivered" || status === "sent") {
    return (
      <Tooltip title={status === "delivered" ? "Delivered" : "Sent"}>
        <Check size={12} aria-label={status} />
      </Tooltip>
    );
  }
  return null;
};

export const MessageBubble = ({ message, mine, compact = false }: Props) => {
  const hasImage = message.fileType === "image" && message.fileUrl;
  const hasOtherFile =
    message.fileUrl && message.fileType && message.fileType !== "image";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: mine ? "flex-end" : "flex-start",
        // Uniform 4px gap between every bubble regardless of sender or
        // grouping. The original "1.25 for non-compact" pattern made one
        // message stand out with extra space which read as a layout bug
        // more than a deliberate group break.
        mt: 0.5,
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: "82%", sm: "70%" },
          display: "flex",
          flexDirection: "column",
          alignItems: mine ? "flex-end" : "flex-start",
          gap: 0.25,
        }}
      >
        <Box
          sx={(theme) => ({
            px: 1.5,
            py: 1,
            borderRadius: 2.5,
            borderBottomRightRadius: mine ? 0.75 : 2.5,
            borderBottomLeftRadius: mine ? 2.5 : 0.75,
            // Outbound bubble uses a fixed dark indigo + white text so the
            // contrast holds in BOTH light and dark mode. Reading
            // primary.contrastText was unreliable (something in the
            // sx-callback chain was returning a dark value, leaving white
            // text on a still-readable indigo and the reverse — dark text
            // on dark — in dark mode). Hard-coding sidesteps the issue
            // entirely and matches typical messenger conventions.
            backgroundColor: mine
              ? theme.palette.mode === "dark"
                ? "#4f46e5" /* indigo-600 */
                : "#4338ca" /* indigo-700 */
              : theme.palette.mode === "dark"
                ? theme.palette.action.hover
                : theme.palette.grey[100],
            color: mine ? "#ffffff" : theme.palette.text.primary,
            "& *": mine ? { color: "#ffffff" } : undefined,
            wordBreak: "break-word",
            opacity: message.status === "sending" ? 0.7 : 1,
            transition: "opacity 120ms ease",
          })}
        >
          {hasImage ? (
            <Box
              component="img"
              src={message.fileUrl ?? undefined}
              alt="attachment"
              sx={{
                display: "block",
                width: "100%",
                maxWidth: 280,
                maxHeight: 320,
                objectFit: "cover",
                borderRadius: 1.5,
                mb: message.content ? 0.75 : 0,
              }}
              loading="lazy"
            />
          ) : null}
          {hasOtherFile ? (
            <Box
              component="a"
              href={message.fileUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                px: 1,
                py: 0.75,
                mb: message.content ? 0.75 : 0,
                borderRadius: 1,
                backgroundColor: "rgba(0,0,0,0.08)",
                color: "inherit",
                textDecoration: "none",
                fontSize: "0.8125rem",
              }}
            >
              <Paperclip size={14} aria-hidden />
              <span>{message.fileType} file</span>
            </Box>
          ) : null}
          {message.content ? (
            <Typography
              variant="body2"
              sx={{
                fontSize: "0.875rem",
                lineHeight: 1.45,
                whiteSpace: "pre-wrap",
              }}
            >
              {message.content}
            </Typography>
          ) : null}
        </Box>
        {!compact ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 0.5,
              color: "text.tertiary",
              fontSize: "0.6875rem",
            }}
          >
            <span>{format(new Date(message.createdAt), "p")}</span>
            {mine ? <StatusIcon status={message.status} /> : null}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

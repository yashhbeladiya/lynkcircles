import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import { AlertCircle, Check, CheckCheck, Paperclip } from "lucide-react";
import { format } from "date-fns";
import type { Message } from "@/types/message";

interface Props {
  message: Message;
  /** True if the current user is the sender of this message. */
  mine: boolean;
  /** Hide the timestamp + receipt row if true (used when the next bubble
   *  is from the same sender within a short time window). */
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

/**
 * Single message bubble. Right-aligned + tinted accent for outbound,
 * left-aligned + neutral surface for inbound. Attachments render above
 * the text content; images inline, other files as a small file row.
 */
export const MessageBubble = ({ message, mine, compact = false }: Props) => {
  const hasImage = message.fileType === "image" && message.fileUrl;
  const hasOtherFile =
    message.fileUrl && message.fileType && message.fileType !== "image";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: mine ? "flex-end" : "flex-start",
        mt: compact ? 0.5 : 1.25,
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
            backgroundColor: mine
              ? theme.palette.primary.main
              : theme.palette.mode === "dark"
                ? theme.palette.action.hover
                : theme.palette.grey[100],
            color: mine ? theme.palette.primary.contrastText : "text.primary",
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

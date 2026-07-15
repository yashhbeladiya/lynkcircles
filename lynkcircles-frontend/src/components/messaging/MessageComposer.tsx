import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import { Paperclip, Send, X, Image as ImageIcon, FileText } from "lucide-react";
import toast from "react-hot-toast";

import { api, apiErrorMessage } from "@/lib/axios";
import type { FileType, UploadedAttachment } from "@/types/message";

const MAX_BYTES = 10 * 1024 * 1024;

interface AttachmentDraft {
  file: File;
  previewUrl?: string;
  fileType: FileType;
}

interface SendArgs {
  content: string;
  fileUrl?: string;
  fileType?: FileType;
}

interface Props {
  disabled?: boolean;
  onTyping: (isTyping: boolean) => void;
  onSend: (args: SendArgs) => Promise<void> | void;
}

const inferFileType = (file: File): FileType => {
  const top = file.type.split("/")[0];
  if (top === "image") return "image";
  if (top === "video") return "video";
  if (top === "audio") return "audio";
  return "document";
};

export const MessageComposer = ({ disabled, onTyping, onSend }: Props) => {
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<AttachmentDraft | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContent(event.target.value);
    onTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => onTyping(false), 1500);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-picking the same file later
    if (!file) return;
    if (file.size > MAX_BYTES) {
      toast.error("File is larger than 10 MB.");
      return;
    }
    const fileType = inferFileType(file);
    const previewUrl =
      fileType === "image" ? URL.createObjectURL(file) : undefined;
    setAttachment({ file, fileType, previewUrl });
  };

  const clearAttachment = () => {
    if (attachment?.previewUrl) URL.revokeObjectURL(attachment.previewUrl);
    setAttachment(null);
  };

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = content.trim();
    if (!trimmed && !attachment) return;
    if (disabled || uploading) return;

    let fileUrl: string | undefined;
    let fileType: FileType | undefined;

    if (attachment) {
      try {
        setUploading(true);
        const form = new FormData();
        form.append("file", attachment.file);
        // No Content-Type header here on purpose — axios sets
        // `multipart/form-data; boundary=----...` itself when it sees
        // a FormData body. Pinning a value without the boundary makes
        // multer reject the body silently with 400.
        const { data } = await api.post<UploadedAttachment>(
          "/messages/upload",
          form
        );
        fileUrl = data.fileUrl;
        fileType = data.fileType;
      } catch (error) {
        toast.error(apiErrorMessage(error));
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      await onSend({ content: trimmed, fileUrl, fileType });
      setContent("");
      clearAttachment();
      onTyping(false);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{
        borderTop: 1,
        borderColor: "divider",
        bgcolor: "background.default",
        px: { xs: 1.5, sm: 2 },
        pt: 1,
        pb: { xs: 1.5, sm: 2 },
      }}
    >
      {attachment ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
            px: 1,
            py: 0.75,
            borderRadius: 1,
            bgcolor: "action.hover",
            fontSize: "0.8125rem",
          }}
        >
          {attachment.fileType === "image" && attachment.previewUrl ? (
            <Box
              component="img"
              src={attachment.previewUrl}
              alt="preview"
              sx={{ width: 32, height: 32, borderRadius: 0.75, objectFit: "cover" }}
            />
          ) : attachment.fileType === "image" ? (
            <ImageIcon size={16} aria-hidden />
          ) : (
            <FileText size={16} aria-hidden />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {attachment.file.name}
            </Box>
            <Box sx={{ color: "text.tertiary", fontSize: "0.6875rem" }}>
              {(attachment.file.size / 1024).toFixed(0)} KB · {attachment.fileType}
            </Box>
          </Box>
          <IconButton size="small" onClick={clearAttachment} aria-label="Remove attachment">
            <X size={14} />
          </IconButton>
        </Box>
      ) : null}

      <Box
        sx={{
          display: "flex",
          alignItems: "flex-end",
          gap: 1,
          px: 1,
          py: 0.75,
          borderRadius: 999,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          transition: "border-color 120ms ease",
          "&:focus-within": { borderColor: "primary.main" },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFile}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
        <Tooltip title="Attach file">
          <span>
            <IconButton
              size="small"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
              aria-label="Attach file"
            >
              <Paperclip size={16} />
            </IconButton>
          </span>
        </Tooltip>
        <InputBase
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message…"
          value={content}
          onChange={handleChange}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submit();
            }
          }}
          disabled={disabled}
          sx={{ fontSize: "0.875rem", py: 0.5 }}
          inputProps={{ "aria-label": "Message" }}
        />
        <Tooltip title="Send">
          <span>
            <IconButton
              type="submit"
              size="small"
              color="primary"
              disabled={
                disabled ||
                uploading ||
                (!content.trim() && !attachment)
              }
              aria-label="Send message"
            >
              {uploading ? <CircularProgress size={16} /> : <Send size={16} />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

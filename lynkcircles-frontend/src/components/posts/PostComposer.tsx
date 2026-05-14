import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import CircularProgress from "@mui/material/CircularProgress";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";

import { UserAvatar } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useCreatePost } from "@/hooks/usePosts";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Composer at the top of the feed. One textarea, optional image attach,
 * collapsed by default — it auto-expands when focused so the empty
 * state stays quiet.
 */
export const PostComposer = () => {
  const { data: user } = useAuthUser();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();

  if (!user) return null;

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
  };

  const reset = () => {
    setContent("");
    clearImage();
    setExpanded(false);
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported here.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image is larger than 5 MB.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setExpanded(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed && !imageFile) return;
    await createPost.mutateAsync({ content: trimmed, imageFile });
    reset();
    toast.success("Posted");
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={(theme) => ({
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        mb: 2,
      })}
    >
      <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
        <UserAvatar user={user} size="md" />
        <InputBase
          fullWidth
          multiline
          minRows={expanded ? 3 : 1}
          placeholder={`What's on your mind, ${user.firstName}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setExpanded(true)}
          sx={{
            fontSize: "0.9375rem",
            py: 0.5,
          }}
          inputProps={{ "aria-label": "Post content" }}
        />
      </Box>

      {previewUrl ? (
        <Box sx={{ position: "relative", mt: 1.5 }}>
          <Box
            component="img"
            src={previewUrl}
            alt="preview"
            sx={{
              maxWidth: "100%",
              maxHeight: 320,
              borderRadius: 1.5,
              border: 1,
              borderColor: "divider",
            }}
          />
          <IconButton
            size="small"
            onClick={clearImage}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "rgba(0, 0, 0, 0.55)",
              color: "#fff",
              "&:hover": { bgcolor: "rgba(0, 0, 0, 0.7)" },
            }}
            aria-label="Remove image"
          >
            <X size={14} />
          </IconButton>
        </Box>
      ) : null}

      {expanded ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1.5,
            pt: 1.5,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFile}
          />
          <Button
            size="small"
            startIcon={<ImagePlus size={14} />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ color: "text.secondary" }}
          >
            Photo
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button size="small" onClick={reset} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="small"
              disabled={
                createPost.isPending || (!content.trim() && !imageFile)
              }
              startIcon={
                createPost.isPending ? (
                  <CircularProgress size={12} color="inherit" />
                ) : null
              }
            >
              Post
            </Button>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

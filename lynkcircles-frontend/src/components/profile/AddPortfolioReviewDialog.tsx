import { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";

import { useAddPortfolioReview } from "@/hooks/useWorkDetails";

interface Props {
  username: string;
  portfolioId: string;
  jobTitle?: string;
  open: boolean;
  onClose: () => void;
}

const MAX_IMAGES = 3;
const MAX_BYTES = 5 * 1024 * 1024;

const readAsDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => (typeof r.result === "string" ? resolve(r.result) : reject(new Error("read failed")));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

/**
 * Review-with-photos modal. Photos are the trust mechanic — clients
 * can document what they actually got, which is what makes a
 * marketplace review meaningfully different from a social-network
 * recommendation. Capped at 3 images per review to keep the upload
 * payload sane.
 */
export const AddPortfolioReviewDialog = ({
  username,
  portfolioId,
  jobTitle,
  open,
  onClose,
}: Props) => {
  const [rating, setRating] = useState<number | null>(0);
  const [text, setText] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addReview = useAddPortfolioReview(username);

  useEffect(() => {
    if (!open) return;
    setRating(0);
    setText("");
    setImages([]);
  }, [open]);

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    const slotsLeft = MAX_IMAGES - images.length;
    if (slotsLeft <= 0) {
      toast.error(`At most ${MAX_IMAGES} images per review.`);
      return;
    }
    const accepted: File[] = [];
    for (const file of files.slice(0, slotsLeft)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_BYTES) {
        toast.error(`Skipped ${file.name}: over 5 MB`);
        continue;
      }
      accepted.push(file);
    }
    const dataUris = await Promise.all(accepted.map(readAsDataUri));
    setImages((prev) => [...prev, ...dataUris]);
  };

  const removeImage = (i: number) =>
    setImages((prev) => prev.filter((_, idx) => idx !== i));

  const canSubmit =
    !!rating && rating > 0 && text.trim().length >= 4 && !addReview.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    await addReview.mutateAsync({
      portfolioId,
      review: text.trim(),
      rating: rating ?? 0,
      images,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Review this work
          {jobTitle ? (
            <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontSize: "0.75rem" }}>
              {jobTitle}
            </Typography>
          ) : null}
        </DialogTitle>
        <DialogContent dividers sx={{ display: "grid", gap: 1.5, pt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography component="legend" variant="body2" sx={{ fontWeight: 600 }}>
              Rating
            </Typography>
            <Rating
              value={rating}
              precision={0.5}
              onChange={(_, v) => setRating(v)}
              size="medium"
            />
          </Box>
          <TextField
            label="Your review"
            placeholder="How did it go? What stood out?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            multiline
            minRows={3}
            required
            fullWidth
          />
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Box component="span" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                Proof photos ({images.length}/{MAX_IMAGES})
              </Box>
              <Button
                size="small"
                startIcon={<ImagePlus size={14} />}
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= MAX_IMAGES}
              >
                Add
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={handleFiles}
              />
            </Box>
            {images.length > 0 ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 1,
                }}
              >
                {images.map((src, i) => (
                  <Box
                    key={i}
                    sx={{
                      position: "relative",
                      paddingTop: "100%",
                      borderRadius: 1.5,
                      overflow: "hidden",
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box
                      component="img"
                      src={src}
                      alt={`Proof ${i + 1}`}
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeImage(i)}
                      aria-label="Remove image"
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        p: 0.25,
                      }}
                    >
                      <X size={12} />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!canSubmit}
            startIcon={addReview.isPending ? <CircularProgress size={12} color="inherit" /> : null}
          >
            Post review
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

import { useEffect, useRef, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { ImagePlus, X } from "lucide-react";
import toast from "react-hot-toast";

import { useCreatePortfolio } from "@/hooks/useWorkDetails";
import type { WorkDetail } from "@/types/workDetail";

interface Props {
  username: string;
  services: WorkDetail[];
  open: boolean;
  onClose: () => void;
}

const MAX_IMAGES = 6;
const MAX_BYTES = 5 * 1024 * 1024;

const readAsDataUri = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => (typeof r.result === "string" ? resolve(r.result) : reject(new Error("read failed")));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });

export const CreatePortfolioDialog = ({
  username,
  services,
  open,
  onClose,
}: Props) => {
  const [service, setService] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateCompleted, setDateCompleted] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientUsername, setClientUsername] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const create = useCreatePortfolio(username);

  useEffect(() => {
    if (!open) return;
    setService(services[0]?._id ?? "");
    setJobTitle("");
    setDescription("");
    setDateCompleted("");
    setClientName("");
    setClientUsername("");
    setImages([]);
  }, [open, services]);

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    const slotsLeft = MAX_IMAGES - images.length;
    if (slotsLeft <= 0) {
      toast.error(`At most ${MAX_IMAGES} images per entry.`);
      return;
    }
    const accepted: File[] = [];
    for (const file of files.slice(0, slotsLeft)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`Skipped ${file.name}: not an image`);
        continue;
      }
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
    !!service && jobTitle.trim().length >= 2 && !create.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    await create.mutateAsync({
      service,
      jobTitle: jobTitle.trim(),
      description: description.trim() || undefined,
      images,
      dateCompleted: dateCompleted || undefined,
      clientName: clientName.trim() || undefined,
      clientUsername: clientUsername.trim() || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add completed job</DialogTitle>
        <DialogContent dividers sx={{ display: "grid", gap: 1.5, pt: 2 }}>
          <TextField
            select
            label="Service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
            fullWidth
            helperText={services.length === 0 ? "Add a service first" : undefined}
            disabled={services.length === 0}
          >
            {services.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.serviceOffered}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Job title"
            placeholder="e.g. Custom oak cabinet for kitchen"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Description"
            placeholder="What did you do, how long did it take, what's notable?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <TextField
              label="Date completed"
              type="date"
              value={dateCompleted}
              onChange={(e) => setDateCompleted(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Client name (optional)"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              fullWidth
            />
          </Box>
          <TextField
            label="Client username on LynkCircles (optional)"
            placeholder="@username — lets them leave a verified review"
            value={clientUsername}
            onChange={(e) => setClientUsername(e.target.value.replace(/^@/, ""))}
            fullWidth
          />

          {/* Image gallery */}
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
                Photos ({images.length}/{MAX_IMAGES})
              </Box>
              <Button
                size="small"
                startIcon={<ImagePlus size={14} />}
                onClick={() => fileInputRef.current?.click()}
                disabled={images.length >= MAX_IMAGES}
              >
                Add photos
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
                  gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
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
                      alt={`Photo ${i + 1}`}
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
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0,0,0,0.55)",
                        color: "#fff",
                        p: 0.25,
                        "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                      }}
                      aria-label="Remove photo"
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
            startIcon={create.isPending ? <CircularProgress size={12} color="inherit" /> : null}
          >
            Save entry
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

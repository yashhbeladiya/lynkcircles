import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import { useCreateWorkDetail } from "@/hooks/useWorkDetails";

interface Props {
  username: string;
  open: boolean;
  onClose: () => void;
}

export const CreateServiceDialog = ({ username, open, onClose }: Props) => {
  const [serviceOffered, setServiceOffered] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const create = useCreateWorkDetail(username);

  useEffect(() => {
    if (!open) return;
    setServiceOffered("");
    setDescription("");
    setHourlyRate("");
  }, [open]);

  const canSubmit = serviceOffered.trim().length >= 2 && !create.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    const rate = Number(hourlyRate);
    await create.mutateAsync({
      serviceOffered: serviceOffered.trim(),
      description: description.trim() || undefined,
      hourlyRate: Number.isFinite(rate) && rate > 0 ? rate : undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Offer a new service</DialogTitle>
        <DialogContent dividers sx={{ display: "grid", gap: 1.5, pt: 2 }}>
          <TextField
            label="Service"
            placeholder="e.g. Carpentry, Plumbing"
            value={serviceOffered}
            onChange={(e) => setServiceOffered(e.target.value)}
            required
            autoFocus
            fullWidth
          />
          <TextField
            label="Description"
            placeholder="What does this service include?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />
          <TextField
            label="Hourly rate"
            placeholder="0"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value.replace(/[^0-9.]/g, ""))}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">/ hr</InputAdornment>
                ),
              },
            }}
            inputMode="decimal"
            fullWidth
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!canSubmit}
            startIcon={
              create.isPending ? (
                <CircularProgress size={12} color="inherit" />
              ) : null
            }
          >
            Add service
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";

import { useCreateWorkDetail } from "@/hooks/useWorkDetails";
import { useServiceCatalog } from "@/hooks/useServiceCatalog";

interface Props {
  username: string;
  open: boolean;
  onClose: () => void;
}

export const CreateServiceDialog = ({ username, open, onClose }: Props) => {
  const { data: categories } = useServiceCatalog();
  const [serviceKey, setServiceKey] = useState("");
  const [description, setDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [currency, setCurrency] = useState("INR");
  const create = useCreateWorkDetail(username);

  useEffect(() => {
    if (!open) return;
    setServiceKey("");
    setDescription("");
    setHourlyRate("");
    setCurrency("INR");
  }, [open]);

  const canSubmit = serviceKey.length > 0 && !create.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    const rate = Number(hourlyRate);
    await create.mutateAsync({
      serviceKey,
      description: description.trim() || undefined,
      hourlyRate: Number.isFinite(rate) && rate > 0 ? rate : undefined,
      currency,
    });
    onClose();
  };

  const currencySymbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : currency;

  // flatten the catalog into a stream of [subheader, option, option, ...]
  // entries so we can render in a single Select without nesting JSX
  // beyond what TextField select supports.
  const flatOptions = (categories ?? []).flatMap((cat) => [
    <ListSubheader
      key={`cat-${cat.key}`}
      sx={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.06em" }}
    >
      {cat.label}
    </ListSubheader>,
    ...cat.services.map((svc) => (
      <MenuItem key={svc.key} value={svc.key} sx={{ pl: 3 }}>
        {svc.label}
      </MenuItem>
    )),
  ]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Offer a new service</DialogTitle>
        <DialogContent dividers sx={{ display: "grid", gap: 1.5, pt: 2 }}>
          <TextField
            select
            label="Service"
            value={serviceKey}
            onChange={(e) => setServiceKey(e.target.value)}
            required
            autoFocus
            fullWidth
            helperText="Pick from the catalog — this is what clients filter by."
            slotProps={{
              select: {
                MenuProps: {
                  slotProps: { paper: { sx: { maxHeight: 400 } } },
                },
              },
            }}
          >
            {flatOptions}
          </TextField>

          <TextField
            label="Description"
            placeholder="What does this service include? Years of experience, specialties, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
            fullWidth
          />

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: 1 }}>
            <TextField
              label="Hourly rate"
              placeholder="0"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value.replace(/[^0-9.]/g, ""))}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      {currencySymbol}
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">/ hr</InputAdornment>
                  ),
                },
              }}
              inputMode="decimal"
              fullWidth
            />
            <TextField
              select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              fullWidth
            >
              <MenuItem value="INR">INR</MenuItem>
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="GBP">GBP</MenuItem>
            </TextField>
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

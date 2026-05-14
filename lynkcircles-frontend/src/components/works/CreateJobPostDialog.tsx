import { useEffect, useState, type KeyboardEvent } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

import { useCreateJobPost } from "@/hooks/useJobPosts";

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal for a Client to post a new job. Marketplace-flavored fields:
 * title + description, skills as a tagged input (press Enter to add
 * a chip), location, budget (free-form string — "$500 fixed" or
 * "$25/hr" both work), optional required-by and deadline dates.
 */
export const CreateJobPostDialog = ({ open, onClose }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [pay, setPay] = useState("");
  const [requiredOn, setRequiredOn] = useState("");
  const [deadline, setDeadline] = useState("");
  const create = useCreateJobPost();

  useEffect(() => {
    if (!open) return;
    setTitle("");
    setDescription("");
    setSkillInput("");
    setSkills([]);
    setLocation("");
    setPay("");
    setRequiredOn("");
    setDeadline("");
  }, [open]);

  const addSkill = () => {
    const next = skillInput.trim();
    if (!next || skills.includes(next)) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, next]);
    setSkillInput("");
  };

  const handleSkillKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addSkill();
    } else if (event.key === "Backspace" && !skillInput && skills.length) {
      setSkills((prev) => prev.slice(0, -1));
    }
  };

  const canSubmit =
    title.trim().length >= 4 &&
    description.trim().length >= 10 &&
    location.trim().length >= 2 &&
    pay.trim().length >= 1 &&
    !create.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    await create.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      skills,
      location: location.trim(),
      pay: pay.trim(),
      requiredOn: requiredOn || undefined,
      deadline: deadline || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Post a job</DialogTitle>
        <DialogContent dividers sx={{ display: "grid", gap: 1.5, pt: 2 }}>
          <TextField
            label="Job title"
            placeholder="e.g. Install kitchen cabinets — 1-day job"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
            fullWidth
          />
          <TextField
            label="Description"
            placeholder="Scope, location specifics, materials, what's already in place, deadline pressure…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={4}
            required
            fullWidth
          />

          <Box>
            <TextField
              label="Skills needed"
              placeholder="Type a skill and press Enter (e.g. Carpentry)"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={handleSkillKey}
              onBlur={() => skillInput && addSkill()}
              fullWidth
            />
            {skills.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
                {skills.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    onDelete={() =>
                      setSkills((prev) => prev.filter((x) => x !== s))
                    }
                  />
                ))}
              </Box>
            ) : null}
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <TextField
              label="Location"
              placeholder="Brooklyn, NY"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Budget"
              placeholder="$500 fixed or $25/hr"
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Needed by"
              type="date"
              value={requiredOn}
              onChange={(e) => setRequiredOn(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="Applications close"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
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
            Post job
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

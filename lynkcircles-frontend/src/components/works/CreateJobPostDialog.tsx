import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { useCreateJobPost } from "@/hooks/useJobPosts";
import { useServiceCatalog } from "@/hooks/useServiceCatalog";
import { serviceLabel } from "@/data/serviceCatalog";
import type {
  JobFrequency,
  JobSchedule,
  JobType,
} from "@/types/jobPost";

interface Props {
  open: boolean;
  onClose: () => void;
}

// Date-label maps per job type — same `requiredOn` field, three
// different things depending on what kind of job this is.
const REQUIRED_ON_LABEL: Record<JobType, string> = {
  gig: "Needed by",
  recurring: "Start date",
  employment: "Start date",
};
const BUDGET_PLACEHOLDER: Record<JobType, string> = {
  gig: "₹500 fixed, or ₹25/hr",
  recurring: "₹3,000 / month",
  employment: "₹20,000/month + bonus, or ₹2.5L/yr",
};
const BUDGET_LABEL: Record<JobType, string> = {
  gig: "Budget",
  recurring: "Pay (per period)",
  employment: "Salary",
};

export const CreateJobPostDialog = ({ open, onClose }: Props) => {
  const { data: categories } = useServiceCatalog();
  const [jobType, setJobType] = useState<JobType>("gig");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serviceKeys, setServiceKeys] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [location, setLocation] = useState("");
  const [pay, setPay] = useState("");
  const [requiredOn, setRequiredOn] = useState("");
  const [deadline, setDeadline] = useState("");
  // Type-conditional fields
  const [frequency, setFrequency] = useState<JobFrequency>("monthly");
  const [schedule, setSchedule] = useState<JobSchedule>("full-time");
  const [experienceMinYears, setExperienceMinYears] = useState("");
  const create = useCreateJobPost();

  useEffect(() => {
    if (!open) return;
    setJobType("gig");
    setTitle("");
    setDescription("");
    setServiceKeys([]);
    setSkillInput("");
    setSkills([]);
    setLocation("");
    setPay("");
    setRequiredOn("");
    setDeadline("");
    setFrequency("monthly");
    setSchedule("full-time");
    setExperienceMinYears("");
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
    serviceKeys.length > 0 &&
    location.trim().length >= 2 &&
    pay.trim().length >= 1 &&
    !create.isPending;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    const exp = Number(experienceMinYears);
    await create.mutateAsync({
      title: title.trim(),
      description: description.trim(),
      jobType,
      // Only send type-conditional fields when they apply — keeps the
      // payload clean and the server-side validation rules simple.
      ...(jobType === "recurring" ? { frequency } : {}),
      ...(jobType === "employment"
        ? {
            schedule,
            experienceMinYears: Number.isFinite(exp) && exp >= 0 ? exp : undefined,
          }
        : {}),
      serviceKeys,
      skills,
      location: location.trim(),
      pay: pay.trim(),
      requiredOn: requiredOn || undefined,
      deadline: deadline || undefined,
    });
    onClose();
  };

  const flatOptions = useMemo(
    () =>
      (categories ?? []).flatMap((cat) => [
        <ListSubheader
          key={`cat-${cat.key}`}
          sx={{
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {cat.label}
        </ListSubheader>,
        ...cat.services.map((svc) => (
          <MenuItem key={svc.key} value={svc.key} sx={{ pl: 3 }}>
            {svc.label}
          </MenuItem>
        )),
      ]),
    [categories]
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>Post a job</DialogTitle>
        <DialogContent dividers sx={{ display: "grid", gap: 1.5, pt: 2 }}>
          {/* Job type — sets the shape of the rest of the form. Pinned
              at top so a Client picks "is this a one-off, a recurring
              gig, or a hire?" before filling anything else in. */}
          <Box>
            <Typography
              variant="overline"
              sx={{ color: "text.secondary", display: "block", mb: 0.5 }}
            >
              Job type
            </Typography>
            <ToggleButtonGroup
              value={jobType}
              exclusive
              onChange={(_, v) => v && setJobType(v as JobType)}
              size="small"
              fullWidth
            >
              <ToggleButton value="gig" sx={{ fontSize: "0.75rem", py: 1 }}>
                One-off gig
              </ToggleButton>
              <ToggleButton value="recurring" sx={{ fontSize: "0.75rem", py: 1 }}>
                Recurring
              </ToggleButton>
              <ToggleButton value="employment" sx={{ fontSize: "0.75rem", py: 1 }}>
                Employment
              </ToggleButton>
            </ToggleButtonGroup>
            <Typography
              variant="caption"
              sx={{ color: "text.tertiary", fontSize: "0.6875rem", mt: 0.5, display: "block" }}
            >
              {jobType === "gig" &&
                "One-time work — fix something, install something, finish a task."}
              {jobType === "recurring" &&
                "Repeating service — weekly cleaning, daily cook, monthly maintenance."}
              {jobType === "employment" &&
                "Hire someone — full-time or part-time role with a salary."}
            </Typography>
          </Box>

          <TextField
            label="Job title"
            placeholder={
              jobType === "employment"
                ? "e.g. Embroidery machine operator — 2 yrs exp"
                : jobType === "recurring"
                  ? "e.g. Twice-weekly house cleaning"
                  : "e.g. Install kitchen cabinets — 1-day job"
            }
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

          <TextField
            select
            label="Services needed"
            value={serviceKeys}
            onChange={(e) => {
              const v = e.target.value;
              setServiceKeys(Array.isArray(v) ? v : [v]);
            }}
            required
            fullWidth
            helperText="Workers offering these services will see your job first."
            slotProps={{
              select: {
                multiple: true,
                renderValue: (selected) => {
                  const list = (selected as string[]) ?? [];
                  if (!list.length)
                    return (
                      <Typography variant="caption" color="text.tertiary">
                        Pick one or more
                      </Typography>
                    );
                  return (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {list.map((key) => (
                        <Chip
                          key={key}
                          label={serviceLabel(key)}
                          size="small"
                          sx={{ fontSize: "0.6875rem", height: 20 }}
                        />
                      ))}
                    </Box>
                  );
                },
                MenuProps: {
                  slotProps: { paper: { sx: { maxHeight: 400 } } },
                },
              },
            }}
          >
            {flatOptions}
          </TextField>

          {/* Type-conditional fields. Surface only what's relevant to
              the kind of job being posted. */}
          {jobType === "recurring" ? (
            <TextField
              select
              label="Frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as JobFrequency)}
              fullWidth
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
          ) : null}

          {jobType === "employment" ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              <TextField
                select
                label="Schedule"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value as JobSchedule)}
                fullWidth
              >
                <MenuItem value="full-time">Full-time</MenuItem>
                <MenuItem value="part-time">Part-time</MenuItem>
              </TextField>
              <TextField
                label="Experience (years)"
                placeholder="0"
                value={experienceMinYears}
                onChange={(e) =>
                  setExperienceMinYears(e.target.value.replace(/[^0-9.]/g, ""))
                }
                inputMode="numeric"
                fullWidth
              />
            </Box>
          ) : null}

          <Box>
            <TextField
              label="Extra requirements (optional)"
              placeholder='e.g. "Must speak Hindi", "2 yrs exp with X brand" — press Enter to add'
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

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            <TextField
              label="Location"
              placeholder="Mumbai, Maharashtra"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label={BUDGET_LABEL[jobType]}
              placeholder={BUDGET_PLACEHOLDER[jobType]}
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label={REQUIRED_ON_LABEL[jobType]}
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
            startIcon={
              create.isPending ? <CircularProgress size={12} color="inherit" /> : null
            }
          >
            Post job
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

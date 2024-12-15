//@ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  IconButton,
  styled,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Save, Close, AddCircleOutline, Delete } from "@mui/icons-material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useParams } from "react-router";
import { create } from "axios";
import { axiosInstance } from "../../lib/axios";
import { i } from "react-router/dist/production/route-data-DuV3tXo2";

const CustomTextField = styled(TextField)({
  "& label.Mui-focused": {
    color: "#333366",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#333366",
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#333366",
    },
    "&:hover fieldset": {
      borderColor: "#333366",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#333366",
    },
  },
});

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const CreateService = ({ serviceData, handleClose, isEdit, onSave }) => {
  const [service, setService] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [timeSlots, setTimeSlots] = useState([{ start: "", end: "" }]);
  const id = serviceData?.id;

  useEffect(() => {
    if (isEdit && serviceData) {
      setService(serviceData.serviceOffered);
      setServiceDescription(serviceData.description);
      setHourlyRate(serviceData.hourlyRate.toString());
      setSelectedDays(serviceData.availability.days);
      setTimeSlots(serviceData.availability.timeSlots);
    }
  }, [isEdit, serviceData]);

  const queryClient = useQueryClient();

  const handleDayToggle = (day: any) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const addTimeSlot = () => {
    setTimeSlots([...timeSlots, { start: "", end: "" }]);
  };

  const removeTimeSlot = (indexToRemove) => {
    setTimeSlots(timeSlots.filter((_, index) => index !== indexToRemove));
  };

  const updateTimeSlot = (index, field, value) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index][field] = value;
    setTimeSlots(newTimeSlots);
  };

  const { mutate: createService } = useMutation({
    mutationFn: async (serviceData) => {
      // Send service data to backend
      await axiosInstance.post("/workdetails", serviceData);
    },
    onSuccess: () => {
      toast.success("Service created successfully");
      queryClient.invalidateQueries(["workDetails", username]);

      handleClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const { mutate: updateService } = useMutation({
    mutationFn: async (serviceData) => {
      // Send service data to backend
      await axiosInstance.put("/workdetails/update", serviceData);
    },
    onSuccess: () => {
      toast.success("Service updated successfully");
      queryClient.invalidateQueries(["workDetails", username]);

      handleClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const handleSubmit = () => {
    // Validate form
    if (!service) {
      toast.error("Please fill out all required fields");
      return;
    }

    // Here you would typically send the data to your backend
    const serviceData = {
      serviceOffered: service,
      description: serviceDescription,
      hourlyRate: parseFloat(hourlyRate),
      availability: {
        days: selectedDays,
        timeSlots: timeSlots,
      },
    };
    if (isEdit) {
      // Update service
      onSave({ ...serviceData, id: id });
    } else {
      onSave(serviceData);
    }
    console.log("Service Data:", serviceData);

    // Close dialog after submission
    handleClose();
  };

  return (
    <Dialog open={true} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Grid container alignItems="center" spacing={1}>
          <Grid item>
            <AddCircleOutline color="secondary" />
          </Grid>
          <Grid item>
            <Typography variant="h6">{isEdit ? "Edit Service" : "Create New Service"}</Typography>
          </Grid>
        </Grid>
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          <Grid size={12}>
            <CustomTextField
              fullWidth
              label="Service Name"
              variant="outlined"
              value={service}
              sx={{ mt: 1 }}
              onChange={(e) => setService(e.target.value)}
              required
            />
          </Grid>

          <Grid size={12}>
            <CustomTextField
              fullWidth
              label="Service Description"
              variant="outlined"
              multiline
              rows={3}
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <CustomTextField
              fullWidth
              label="Hourly Rate"
              type="number"
              variant="outlined"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              InputProps={{
                startAdornment: (
                  <Typography variant="body2" sx={{ mr: 1 }}>
                    $
                  </Typography>
                ),
              }}
              required
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom>
              Available Days
            </Typography>
            <FormGroup row>
              {daysOfWeek.map((day) => (
                <FormControlLabel
                  key={day}
                  control={
                    <Checkbox
                      checked={selectedDays.includes(day)}
                      color="secondary"
                      onChange={() => handleDayToggle(day)}
                    />
                  }
                  label={day}
                />
              ))}
            </FormGroup>
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle1" gutterBottom>
              Available Time Slots
            </Typography>
            {timeSlots.map((slot, index) => (
              <Grid
                container
                spacing={2}
                alignItems="center"
                key={index}
                sx={{ mb: 2 }}
              >
                <Grid size={5}>
                  <CustomTextField
                    fullWidth
                    label="Start Time"
                    type="time"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }} // 5 min intervals
                    value={slot.start}
                    onChange={(e) =>
                      updateTimeSlot(index, "start", e.target.value)
                    }
                    required
                  />
                </Grid>
                <Grid size={5}>
                  <CustomTextField
                    fullWidth
                    label="End Time"
                    type="time"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }} // 5 min intervals
                    value={slot.end}
                    onChange={(e) =>
                      updateTimeSlot(index, "end", e.target.value)
                    }
                    required
                  />
                </Grid>
                <Grid size={2}>
                  {timeSlots.length > 1 && (
                    <IconButton
                      color="secondary"
                      onClick={() => removeTimeSlot(index)}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}
            <Button
              startIcon={<AddCircleOutline color="secondary" />}
              onClick={addTimeSlot}
              variant="outlined"
              sx={{ mt: 1, mb: 2 }}
            >
              Add Time Slot
            </Button>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="secondary" startIcon={<Close />}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          sx={{ backgroundColor: "#333366", color: "white" }}
          variant="contained"
          startIcon={<Save />}
        >
          {isEdit ? "Save Changes" : "Save Service"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateService;

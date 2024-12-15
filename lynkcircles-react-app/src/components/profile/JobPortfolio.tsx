//@ts-nocheck
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Box,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Add as AddIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  VideoFile as VideoFileIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers-pro";
import { LocalizationProvider } from "@mui/x-date-pickers-pro";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import toast from "react-hot-toast";

const JobPortfolio = ({
  open,
  onClose,
  onSave,
  isEdit = false,
  initialData = null,
}) => {
  const [jobDetails, setJobDetails] = useState({
    title: "",
    description: "",
    dateCompleted: null,
    clientName: "",
    clientUsername:"",
    images: [], // Wrap in preview structure
    videos: [],
  });

  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const handleImageUpload = (event) => {
    try {
      const files = Array.from(event.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setJobDetails((prev) => ({
            ...prev,
            images: [...prev.images, { preview: reader.result, file }],
          }));
        };
        reader.readAsDataURL(file); // This should be called here
      });
    } catch (error) {
      toast.error("Error uploading image");
    }
  };

  const handleVideoUpload = (event) => {
    try {
      const files = Array.from(event.target.files);
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setJobDetails((prev) => ({
            ...prev,
            videos: [...prev.videos, { preview: reader.result, file }],
          }));
        };
        reader.readAsDataURL(file);
      });
    } catch (error) {
      toast.error("Error uploading video");
    }
  };

  const removeFile = (index, fileType) => {
    setJobDetails((prev) => {
      const updatedFiles = prev[fileType + "s"].filter((_, i) => i !== index);
      return { ...prev, [fileType + "s"]: updatedFiles };
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Handle nested client object
    if (name.startsWith("client.")) {
      const clientField = name.split(".")[1];
      setJobDetails((prev) => ({
        ...prev,
        client: {
          ...prev.client,
          [clientField]: value,
        },
      }));
    } else {
      setJobDetails((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = () => {
    // Validate and save job details
    const jobHistory = {
      _id: initialData?._id,
      jobTitle: jobDetails.title,
      description: jobDetails.description,
      dateCompleted: jobDetails.dateCompleted,
      clientName: jobDetails.clientName,
      clientUsername: jobDetails.clientUsername,
      // Map images and videos to extract only the preview (Base64 string or URL)
      images: jobDetails.images.map((image) => image.preview),
      videos: jobDetails.videos.map((video) => video.preview),
    };

    if (onSave) {
      onSave(jobHistory);
    }
    onClose();
  };

  useEffect(() => {
    if (initialData) {
      setJobDetails({
        title: initialData.jobTitle,
        description: initialData.description,
        dateCompleted: initialData.dateCompleted
        ? new Date(initialData.dateCompleted)
        : null,
        clientName: initialData.clientName,
        clientUsername: initialData.clientUsername,
        images: initialData.images.map((image) => ({ preview: image })),
        videos: initialData.videos.map((video) => ({ preview: video })),
      });
    }
  }
  , [initialData]);


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "2px solid #333366",
        },
      }}
    >
      <DialogTitle sx={{ backgroundColor: "#f0f0f0", color: "#333366" }}>
        {isEdit ? "Edit Job Portfolio" : "Add Job to Portfolio"}

      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Job Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Job Title"
              name="title"
              value={jobDetails.title}
              onChange={handleInputChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Job Description"
              name="description"
              value={jobDetails.description}
              onChange={handleInputChange}
              multiline
              rows={4}
              variant="outlined"
              sx={{ mb: 2 }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date Completed"
                value={jobDetails.dateCompleted}
                onChange={(newValue) =>
                  setJobDetails((prev) => ({
                    ...prev,
                    dateCompleted: newValue,
                  }))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </LocalizationProvider>
          </Grid>

          {/* Client Details */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Client Name"
              name="clientName"
              value={jobDetails.clientName}
              onChange={handleInputChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Client Username"
              name="clientUsername"
              value={jobDetails.clientUsername}
              onChange={handleInputChange}
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Image Upload */}
          <Grid size={12}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                Job Images
              </Typography>
              <input
                type="file"
                ref={imageInputRef}
                hidden
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e)}
              />
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<ImageIcon />}
                onClick={() => imageInputRef.current.click()}
              >
                Upload Images
              </Button>
            </Box>

            <Grid container spacing={2}>
              {jobDetails.images.map((image, index) => (
                <Grid item key={index}>
                  <Card sx={{ width: 150, position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="150"
                      image={image.preview}
                      alt={`Job Image ${index + 1}`}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        backgroundColor: "rgba(255,255,255,0.7)",
                      }}
                      onClick={() => removeFile(index, "image")}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>

          {/* Video Upload */}
          <Grid size={12}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="subtitle1" sx={{ mr: 2 }}>
                Job Videos
              </Typography>
              <input
                type="file"
                ref={videoInputRef}
                hidden
                accept="video/*"
                multiple
                onChange={(e) => handleVideoUpload(e)}
              />
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<VideoFileIcon />}
                onClick={() => videoInputRef.current.click()}
              >
                Upload Videos
              </Button>
            </Box>

            <Grid container spacing={2}>
              {jobDetails.videos.map((video, index) => (
                <Grid item key={index}>
                  <Card sx={{ width: 250, position: "relative" }}>
                    <CardMedia
                      component="video"
                      controls
                      src={video.preview}
                      height="150"
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 5,
                        right: 5,
                        backgroundColor: "rgba(255,255,255,0.7)",
                      }}
                      onClick={() => removeFile(index, "video")}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary" startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          startIcon={<CloudUploadIcon />}
          sx={{
            backgroundColor: "#333366",
            color: "white",
            "&:hover": { backgroundColor: "#262659" },
          }}
        >
          {isEdit ? "Update Portfolio" : "Save Portfolio"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobPortfolio;

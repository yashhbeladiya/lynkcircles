//@ts-nocheck
import React, { useState } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { set } from "date-fns";

const JobPortfolioCard = ({
  jobPortfolio,
  authUser,
  service,
  setSelectedJob,
  setEditJobPortfolioModalOpen,
  handleDeleteJobPortfolio,
}) => {
  // State to track current media for each job
  const [currentMedia, setCurrentMedia] = useState({});

  // Handle media navigation
  const handleNextMedia = (jobId, totalMedia) => {
    setCurrentMedia((prev) => ({
      ...prev,
      [jobId]: ((prev[jobId] || 0) + 1) % totalMedia,
    }));
  };

  const handlePrevMedia = (jobId, totalMedia) => {
    setCurrentMedia((prev) => {
      const current = prev[jobId] || 0;
      return {
        ...prev,
        [jobId]: current === 0 ? totalMedia - 1 : current - 1,
      };
    });
  };

  const renderMedia = (job) => {
    // Combine images and videos into a single media array
    const allMedia = [
      ...(job.images || []).map((img) => ({ type: "image", src: img })),
      ...(job.videos || []).map((vid) => ({ type: "video", src: vid })),
    ];

    if (allMedia.length === 0) return null;

    const currentMediaIndex = (currentMedia[job.id] || 0) % allMedia.length;
    const currentMediaItem = allMedia[currentMediaIndex];

    return (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%", // 16:9 aspect ratio
          overflow: "hidden",
        }}
      >
        {currentMediaItem.type === "image" ? (
          <CardMedia
            component="img"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            image={currentMediaItem.src}
            alt={`${job.title} - Media ${currentMediaIndex + 1}`}
          />
        ) : (
          <CardMedia
            component="video"
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            controls
            src={currentMediaItem.src}
          />
        )}

        {allMedia.length > 1 && (
          <>
            <IconButton
              sx={{
                position: "absolute",
                left: 0,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                backgroundColor: "rgba(0,0,0,0.5)",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.7)",
                },
              }}
              onClick={() => handlePrevMedia(job.id, allMedia.length)}
            >
              <ArrowBackIosIcon />
            </IconButton>
            <IconButton
              sx={{
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
                color: "white",
                backgroundColor: "rgba(0,0,0,0.5)",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.7)",
                },
              }}
              onClick={() => handleNextMedia(job.id, allMedia.length)}
            >
              <ArrowForwardIosIcon />
            </IconButton>
          </>
        )}
      </Box>
    );
  };

  return (
    <Grid container spacing={3}>
      {jobPortfolio?.map((job) => (
        <Grid size={{ xs:12, md:6 }} key={job.id}>
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {renderMedia(job)}
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="subtitle1" gutterBottom>
                  {job.jobTitle}
                </Typography>
              </Box>
              <Typography variant="h6">{job.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Client: {job.clientName}
              </Typography>
              <Typography variant="body2" component="p">
                {job.description}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed: {job.dateCompleted}
              </Typography>
            </CardContent>
            <Box flexGrow={1} />
            {authUser && authUser._id === service.user._id && (
              <Box display="flex" justifyContent="flex-end">
                <IconButton
                  onClick={() => {
                    setSelectedJob(job);
                    setEditJobPortfolioModalOpen(true);
                  }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDeleteJobPortfolio(job._id)}>
                  <CloseIcon />
                </IconButton>
              </Box>
            )}
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default JobPortfolioCard;

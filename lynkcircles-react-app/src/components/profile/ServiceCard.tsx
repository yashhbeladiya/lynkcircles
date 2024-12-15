//@ts-nocheck
import React, { useState } from "react";
import { BsTools, BsClock, BsCalendar } from "react-icons/bs";
import Grid from "@mui/material/Grid2";
import { Card, CardContent, Typography, Chip, Button } from "@mui/material";
import Rating from "@mui/material/Rating";
import EditIcon from "@mui/icons-material/Edit";
import WorkIcon from "@mui/icons-material/Work";
import DeleteIcon from "@mui/icons-material/Delete"; // Import DeleteIcon
import { CgArrowsExpandUpRight } from "react-icons/cg";
import { useNavigate } from "react-router";

const ServiceCard = ({ service, isOwner, onEdit, onAddJob, onViewReviews, onDelete }) => {
  const navigate = useNavigate();

  console.log("ServiceCard -> service", service);

  const handleCardClick = () => {
    navigate(`/service/${service._id}`);
  }

  return (
    <Card
      sx={{
        m: 2,
        border: "1px solid #333366",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <BsTools size={24} color="#333366" />
          </Grid>
          <Grid item xs>
            <Typography variant="h6" color="secondary">
              {service.serviceOffered}
            </Typography>
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" mt={1}>
          {service.description}
        </Typography>

        <Grid container spacing={2} mt={1}>
          <Grid item>
            <Chip
              icon={<BsClock />}
              label={`$${service.hourlyRate}/hr`}
              variant="outlined"
              color="secondary"
            />
          </Grid>
          <Grid item>
            <Chip
              icon={<BsCalendar />}
              label={service.availability.days.join(", ")}
              variant="outlined"
              color="secondary"
            />
          </Grid>
        </Grid>

        <Grid container justifyContent="space-between" mt={2}>
          <Rating
            value={service.ratings || 0}
            readOnly
            precision={0.5}
            onClick={() => onViewReviews(service)}
          />
          {isOwner && (
            <>
              <Button
                startIcon={<EditIcon />}
                onClick={() => onEdit(service)}
                color="secondary"
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />} // Add Delete button
                onClick={() => onDelete(service._id)} // Add onClick event
                color="secondary"
              >
                Delete
              </Button>
            </>
          )}
          <Button
            startIcon={<CgArrowsExpandUpRight />}
            onClick={handleCardClick}
            color="secondary"
          >
            View Details
          </Button>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
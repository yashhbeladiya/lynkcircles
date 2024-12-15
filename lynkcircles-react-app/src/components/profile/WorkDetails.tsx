//@ts-nocheck
import React, { useState } from "react";
import { Button, Dialog } from "@mui/material";
import { BsTools } from "react-icons/bs";
import CreateService from "./CreateService";
import JobPortfolio from "./JobPortfolio";
import ReviewsDialog from "./ReviewDialog";
import ServiceCard from "./ServiceCard";
import Grid from "@mui/material/Grid2";
import ServiceDetail from "./ServiceDetails";

const WorkDetails = ({ workDetails, isOwnProfile, onSave, onDelete }) => {
  const [open, setOpen] = useState(false);

  const services = workDetails || [];

  const [selectedService, setSelectedService] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [updateServiceOpen, setUpdateServiceOpen] = useState(false);
  const [jobPortfolioOpen, setJobPortfolioOpen] = useState(false);

  const handleEditService = (service) => {
    setSelectedService(service);
    setUpdateServiceOpen(true);
  };

  const handleAddJob = (service) => {
    setSelectedService(service);
    setJobPortfolioOpen(true);
  };

  const handleViewReviews = (service) => {
    setSelectedService(service);
    setReviewDialogOpen(true);
  };

  const handleCreateService = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mt-2 text-center">
      {services.length === 0 && (
        <p className="text-lg font-semibold mb-4">No work details available</p>
      )}
      {services.map((service) => (
        <Grid key={service.id}>
          <ServiceCard
            service={service}
            isOwner={isOwnProfile}
            onEdit={handleEditService}
            onAddJob={handleAddJob}
            onViewReviews={handleViewReviews}
            onDelete={onDelete}
          />
        </Grid>
      ))}

      {/* Add review */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
      >
        <ReviewsDialog
          open={reviewDialogOpen}
          onClose={() => setReviewDialogOpen(false)}
          service={selectedService}
        />
      </Dialog>

      {/* Edit Service Details */}
      <Dialog
        open={updateServiceOpen}
        onClose={() => setUpdateServiceOpen(false)}
      >
        <CreateService
          handleClose={() => setUpdateServiceOpen(false)}
          serviceData={selectedService}
          isEdit={true}
          onSave={onSave}
        />
      </Dialog>

      {/* Add Service Details */}
      {isOwnProfile && (
        <>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<BsTools />}
            onClick={handleCreateService}
          >
            Add Work Details
          </Button>
          <Dialog open={open} onClose={handleClose}>
            <CreateService handleClose={handleClose} onSave={onSave} />
          </Dialog>
        </>
      )}
    </div>
  );
};

export default WorkDetails;

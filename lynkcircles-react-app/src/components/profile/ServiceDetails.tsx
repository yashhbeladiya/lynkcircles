//@ts-nocheck
import React, { useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
  Avatar,
  Box,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  MenuItem,
  Select,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Work as WorkIcon,
  Description as DescriptionIcon,
  Reviews as ReviewsIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { BsTools, BsClock, BsCalendar } from "react-icons/bs";
import { styled } from "@mui/material/styles";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import JobPortfolio from "./JobPortfolio";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import JobPortfolioCard from "./JobPortFolioCard";
import ReviewsDialog from "./ReviewDialog";
import { formatDistanceToNow } from "date-fns";


// Tabs Panel Component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`service-tabpanel-${index}`}
      aria-labelledby={`service-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Custom Styled Tab Component for Better Mobile Responsiveness
const StyledTab = styled(Tab)(({ theme }) => ({
  minWidth: 120,
  flexGrow: 1,
  "&.Mui-selected": {
    color: theme.palette.secondary.main,
    backgroundColor: "rgba(103, 58, 183, 0.1)", // Subtle background for active tab
  },
}));

// User Header Component
const UserHeader = ({ user, isOwner }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        backgroundColor: "#ffffff",
        borderRadius: 2,
        p: 2,
        mb: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box display="flex" alignItems="center">
        <Avatar src={user.avatarUrl} sx={{ width: 64, height: 64, mr: 2 }} />
        <Box>
          <Typography variant="h6">{user.fullName}</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            {user.headline}
          </Typography>
        </Box>
      </Box>
      {isOwner && (
        <IconButton color="secondary">
          <EditIcon />
        </IconButton>
      )}
    </Paper>
  );
};

const ServiceDetail = ({ service, authUser }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [editServiceModalOpen, setEditServiceModalOpen] = useState(false);
  const [jobPortfolioModalOpen, setJobPortfolioModalOpen] = useState(false);
  const [editJobPortfolioModalOpen, setEditJobPortfolioModalOpen] =
    useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  // const [editReviewModalOpen, setEditReviewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const queryClient = useQueryClient();

  // Fetch Job Portfolio Data
  const { data: jobPortfolio } = useQuery({
    queryKey: ["jobPortfolio", service.id],
    queryFn: () =>
      axiosInstance
        .get(`/workdetails/jobportfolio/${service._id}`)
        .then((res) => res.data),
  });

  const { mutate: addJobPortfolio } = useMutation({
    mutationFn: async (newJob) => {
      await axiosInstance.post("/workdetails/jobportfolio", newJob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["jobPortfolio", service.id]);
      setJobPortfolioModalOpen(false);
      toast.success("Job Portfolio added successfully");
    },
    onError: (error) => {
      toast.error("An error occurred. Please try again.");
      console.error(error);
    },
  });

  const { mutate: updateJobPortfolio } = useMutation({
    mutationFn: async (updatedJob) => {
      await axiosInstance.put("/workdetails/jobportfolio", updatedJob);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["jobPortfolio", service.id]);
      setJobPortfolioModalOpen(false);
      toast.success("Job Portfolio updated successfully");
    },
  });

  const { mutate: deleteJobPortfolio } = useMutation({
    mutationFn: async (jobId) => {
      await axiosInstance.delete(`/workdetails/jobportfolio/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["jobPortfolio", service.id]);
      toast.success("Job Portfolio deleted successfully");
    },
  });

  const { mutate: addReview } = useMutation({
    mutationFn: async (review) => {
      await axiosInstance.post(`/workdetails/review/${service._id}`, review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workDetails", authUser.username]);
      setReviewModalOpen(false);
      toast.success("Review added successfully");
    },
  });

  const { mutate: updateReview } = useMutation({
    mutationFn: async (review) => {
      await axiosInstance.put(`/workdetails/review/${service._id}`, review);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workDetails", authUser.username]);
      setReviewModalOpen(false);
      toast.success("Review updated successfully");
    },
  });

  const { mutate: deleteReview } = useMutation({
    mutationFn: async (reviewId) => {
      await axiosInstance.delete(`/workdetails/review/${reviewId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["workDetails", authUser.username]);
      toast.success("Review deleted successfully");
    },
  });

  const handleDeleteJobPortfolio = (jobId) => {
    deleteJobPortfolio(jobId);
  };

  const handleSaveJobPortfolio = (job) => {
    if (job._id) {
      updateJobPortfolio(job);
    } else {
      addJobPortfolio({ ...job, service: service._id });
    }
  };

  const handleSaveReview = (review) => {
    if (service.reviews.find((r) => r.reviewer === authUser.id)) {
      updateReview(review);
    }
    addReview(review);
  };

  const hasUserReviewed = (reviews, userId) => {
    return reviews.some(review => review.reviewer.id === userId);
  };

  // Service Details
  const [serviceDetails, setServiceDetails] = useState({
    name: service.serviceOffered,
    description: service.description,
    hourlyRate: service.hourlyRate,
    availableDays: service.availability.days,
    timeSlots: service.availability.timeSlots,
    averageRating: service.ratings,
    totalReviews: service.reviews.length,
    clientReviews: service.reviews,
  });

  console.log(service);

  // ... (rest of the existing component logic remains similar)
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      {/* User Header */}
      <UserHeader
        user={{
          fullName: service.user.firstName + " " + service.user.lastName,
          headline: service.user.headline,
          avatarUrl: service.user.profilePicture,
        }}
        isOwner={authUser && authUser.id === service.user}
      />

      {/* Service Header */}
      <Paper
        elevation={3}
        sx={{
          backgroundColor: "#ffffff",
          borderRadius: 2,
          p: 3,
          mb: 3,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h4" color="#333366" gutterBottom>
              {serviceDetails.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {serviceDetails.description}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} textAlign="right">
            <Box display="flex" flexDirection="column" alignItems="flex-end">
              <Chip
                icon={<BsClock />}
                label={`$${serviceDetails.hourlyRate}/hr`}
                color="secondary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Rating value={service.ratings} precision={0.5} readOnly />
              <Typography variant="caption">
                {serviceDetails.totalReviews} Reviews
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Existing Tabs and TabPanels with minor modifications */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="secondary"
          textColor="secondary"
        >
          <StyledTab
            icon={<DescriptionIcon />}
            label="Service Info"
            iconPosition="start"
          />
          <StyledTab
            icon={<WorkIcon />}
            label="Job Portfolio"
            iconPosition="start"
          />
          <StyledTab
            icon={<ReviewsIcon />}
            label="Client Reviews"
            iconPosition="start"
          />
        </Tabs>

        {/* Tabs for Service Details */}
        <Paper elevation={2} sx={{ borderRadius: 2 }}>
          {/* Service Info Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Service Availability
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <CalendarIcon color="secondary" sx={{ mr: 2 }} />
                  <Typography>
                    Available Days: {serviceDetails.availableDays.join(", ")}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <TimeIcon color="secondary" sx={{ mr: 2 }} />
                  <Typography>
                    Time Slots:{" "}
                    {serviceDetails.timeSlots
                      .map((slot) => `${slot.start} - ${slot.end}`)
                      .join(", ")}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h6" gutterBottom>
                  Additional Details
                </Typography>
                <Typography>{serviceDetails.description}</Typography>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Job Portfolio Tab */}
          <TabPanel value={activeTab} index={1}>
            <JobPortfolioCard
              jobPortfolio={jobPortfolio}
              authUser={authUser}
              service={service}
              setSelectedJob={setSelectedJob}
              setEditJobPortfolioModalOpen={setEditJobPortfolioModalOpen}
              handleDeleteJobPortfolio={handleDeleteJobPortfolio}
            />

            {/* Add Job Portfolio Button */}
            {authUser && authUser._id === service.user._id && (
              <Box textAlign="right" mt={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => setJobPortfolioModalOpen(true)}
                >
                  Add Job Portfolio
                </Button>
                <Dialog
                  open={jobPortfolioModalOpen}
                  onClose={() => setJobPortfolioModalOpen(false)}
                  maxWidth="md"
                  fullWidth
                >
                  <JobPortfolio
                    open={jobPortfolioModalOpen}
                    onClose={() => setJobPortfolioModalOpen(false)}
                    onSave={handleSaveJobPortfolio}
                  />
                </Dialog>
              </Box>
            )}
          </TabPanel>

          {/* Client Reviews Tab */}
          <TabPanel value={activeTab} index={2}>
            {service.reviews?.map((review) => (
              <Card key={review.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container alignItems="center" spacing={2}>
                    <Grid item>
                      <Avatar
                        src={review.reviewer.profilePicture}
                        alt={review.reviewer.firstName}
                      />
                    </Grid>
                    <Grid item>
                      <Typography variant="subtitle1">
                        {review.reviewer.firstName} {review.reviewer.lastName}
                      </Typography>
                      <Rating value={review.rating} readOnly />
                    </Grid>
                    <Grid item>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(review.createdAt), {
                          addSuffix: true,
                        })}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Typography variant="body2" mt={2}>
                    {review.review}
                  </Typography>
                  {authUser && authUser.id === review.reviewer.id && (
                    <Box textAlign="right" mt={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => setReviewModalOpen(true)}
                        sx={{ mr: 1 }}
                      >
                        Update
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteReview(service._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
            {authUser && authUser._id !== service.user._id && !hasUserReviewed(service.reviews, authUser.id) && (
              <Box textAlign="right" mt={2}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<AddIcon />}
                  onClick={() => setReviewModalOpen(true)}
                >
                  Add Review
                </Button>
              </Box>
            )}
          </TabPanel>
        </Paper>
      </Paper>

      {/* Modals for Editing */}
      {/* <EditServiceInfoModal
        open={editServiceModalOpen}
        onClose={() => setEditServiceModalOpen(false)}
        serviceDetails={serviceDetails}
      /> */}

      <JobPortfolio
        open={editJobPortfolioModalOpen}
        onClose={() => setEditJobPortfolioModalOpen(false)}
        job={selectedJob}
        onSave={handleSaveJobPortfolio}
        isEdit={!!selectedJob}
        initialData={selectedJob}
      />
      <ReviewsDialog
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleSaveReview}
        initialReview={
          service.reviews.find((r) => r.reviewer === authUser._id) || null
        }
      />
    </Container>
  );
};

export default ServiceDetail;

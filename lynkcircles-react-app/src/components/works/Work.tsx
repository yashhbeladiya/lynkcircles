//@ts-nocheck

import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import {
  Button,
  Box,
  Card,
  CardContent,
  Tooltip,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Autocomplete,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
  styled,
} from "@mui/material";

import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaCheckCircle,
  FaEdit,
  FaTrash,
  FaHourglassHalf,
  FaUserCircle,
  FaBriefcase,
  FaTags,
} from "react-icons/fa";
import { MdWork, MdApproval, MdOutlineDescription } from "react-icons/md";
import { set } from "date-fns";

const SKILLS_LIST = [
  // Programming Languages
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "Ruby",
  "Swift",
  "Kotlin",
  "TypeScript",
  "Go",
  "Rust",

  // Web Technologies
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express.js",
  "Django",
  "Flask",
  "Ruby on Rails",

  // Mobile Development
  "React Native",
  "Flutter",
  "Android Development",
  "iOS Development",
  "Xamarin",

  // Design
  "UI/UX Design",
  "Graphic Design",
  "Adobe Photoshop",
  "Adobe Illustrator",
  "Figma",
  "Sketch",

  // Cloud & DevOps
  "AWS",
  "Google Cloud",
  "Azure",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Jenkins",
  "Terraform",

  // Data & AI
  "Machine Learning",
  "Data Science",
  "Python Data Analysis",
  "TensorFlow",
  "PyTorch",
  "SQL",
  "NoSQL",

  // Other Technical Skills
  "Blockchain",
  "Cybersecurity",
  "Network Administration",
  "Linux",
  "Windows Server",

  // Soft Skills
  "Project Management",
  "Communication",
  "Problem Solving",
  "Team Leadership",
  "Agile Methodology",

  // Business & Marketing
  "Digital Marketing",
  "SEO",
  "Content Writing",
  "Social Media Marketing",
  "Business Strategy",
];

const StyledChip = styled(Chip)({
  borderColor: "#333366",
  color: "#333366",
  "& .MuiChip-deleteIcon": {
    color: "#333366",
  },
});

const Work = ({ workPost, authUser } : { workPost: any, authUser: any}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const [title, setTitle] = useState(workPost.jobTitle);
  const [location, setLocation] = useState(workPost.location);
  const [pay, setPay] = useState(workPost.budget);
  const [status, setStatus] = useState(workPost.status);
  const [deadline, setDeadline] = useState(
    workPost.deadline ? new Date(workPost.deadline).toISOString().split("T")[0] : ""
  );
  const [requiredOn, setRequiredOn] = useState(
    workPost.requiredOn
      ? new Date(workPost.requiredOn).toISOString().split("T")[0]
      : ""
  );
  const [description, setDescription] = useState(workPost.description);
  const [skills, setSkills] = useState(workPost.skillsRequired || []);
  const [inputValue, setInputValue] = useState("");

  const navigate = useNavigate();

  const { workPostId } = useParams();
  const isOwner = authUser?._id === workPost.author?._id;

  const queryClient = useQueryClient();

  // Delete Work Post Mutation
  const { mutate: deleteWorkPost, isLoading: isDeletingWorkPost } = useMutation(
    {
      mutationFn: async () => {
        await axiosInstance.delete(`/works/delete/${workPost._id}`);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["workPost", workPostId] });
        queryClient.invalidateQueries({ queryKey: ["workPosts"] });
        toast.success("Work Post deleted successfully");
        navigate("/works");
        setDeleteConfirmOpen(false);
      },
      onError: (error) => {
        toast.error(error?.response?.data?.message || "Something went wrong");
      },
    }
  );

  // update work post
  const { mutate: updateWorkPost } = useMutation({
    mutationFn: async (post) => {
      const res = await axiosInstance.put(`/works/update/${workPost._id}`, post);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workPost", workPostId] });
      queryClient.invalidateQueries({ queryKey: ["workPosts"] });
      toast.success("Work post updated successfully");
      setUpdateModalOpen(false);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update work post");
    },
  });

  // Apply to Work Mutation
  const { mutate: applyToWork, isLoading: isApplyingToWork } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/works/${workPost._id}/apply`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["works"] });
      toast.success("Applied to work successfully");
      setHasApplied(true);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to apply to work");
    },
  });

  // Withdraw Application Mutation
  const { mutate: withdrawApplication, isLoading: isWithdrawingApplication } =
    useMutation({
      mutationFn: async () => {
        const res = await axiosInstance.delete(
          `/works/${workPost._id}/withdraw`
        );
        return res.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["works"] });
        toast.success("Application withdrawn successfully");
        setHasApplied(false);
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to withdraw application"
        );
      },
    });

  const renderDetailItem = (icon, label, value) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
      {icon}
      <Typography variant="body2" color="text.secondary">
        <strong>{label}:</strong> {value}
      </Typography>
    </Box>
  );

  const sortedSkills = useMemo(
    () => SKILLS_LIST.sort((a, b) => a.localeCompare(b)),
    []
  );

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const value = event.target.value.trim();
      if (value && !skills.includes(value)) {
        setSkills([...skills, value]);
      }
      setInputValue('');
    }
  };

  const handleUpdate = () => {
    // Validate required fields
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const postData = {
      title,
      description,
      location,
      skillsRequired: skills,
      pay,
      status,
      deadline,
      requiredOn,
    };
    updateWorkPost(postData);
    setUpdateModalOpen(false);
  }

  return (
    <Card
      sx={{
        mb: 4,
        border: "1px solid #333366",
        borderRadius: 2,
        backgroundColor: "white",
      }}
    >
      <CardContent>
        {/* Author Information */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            src={workPost.author?.profilePicture}
            sx={{ width: 56, height: 56, mr: 2 }}
            alt={`${workPost.author?.firstName} ${workPost.author?.lastName}`}
          />
          <Box>
            <Typography variant="h6" color="#333366">
              {workPost.author?.firstName} {workPost.author?.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" style={{ display: 'flex', alignItems: 'center' }}>
              <FaBriefcase color="#333366" style={{ marginRight: 8 }} />
              {workPost.author?.headline || "Work Post Creator"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Work Post Details */}
        <Typography variant="h5" color="#333366" sx={{ mb: 2 }}>
          {workPost.jobTitle}
        </Typography>

        {/* Detailed Information */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <Box>
            {renderDetailItem(
              <FaMapMarkerAlt color="#333366" />,
              "Location",
              workPost.location || "Not Specified"
            )}
            {renderDetailItem(
              <FaMoneyBillWave color="#333366" />,
              "Pay",
              workPost.budget || "Negotiable"
            )}
            {renderDetailItem(
              <FaCalendarAlt color="#333366" />,
              "Deadline",
              workPost.deadline
                ? new Date(workPost.deadline).toLocaleDateString()
                : "No Deadline"
            )}
          </Box>
          <Box>
            {renderDetailItem(
              <FaCheckCircle color="#333366" />,
              "Status",
              workPost.status
            )}
            {renderDetailItem(
              <MdWork color="#333366" />,
              "Required On",
              workPost.requiredOn
                ? new Date(workPost.requiredOn).toLocaleDateString()
                : "Flexible"
            )}
          </Box>
        </Box>

        {/* Description */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <MdOutlineDescription color="#333366" style={{ marginRight: 8 }} />
            <Typography variant="subtitle1" color="#333366">
              Description
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            {workPost.description}
          </Typography>
        </Box>

        {/* Skills */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <FaTags color="#333366" style={{ marginRight: 8 }} />
            <Typography variant="subtitle1" color="#333366">
              Required Skills
            </Typography>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {workPost.skillsRequired?.map((skill: any) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                color="secondary"
                variant="outlined"
              />
            ))}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          {/* Apply/Withdraw Button */}
          {!isOwner && (
            <Button
              variant="contained"
              color={hasApplied ? "primary" : "primary"}
              sx={{
                backgroundColor: hasApplied ? "#FF6B6B" : "#333366",
                color: "#FFFFFF",
                "&:hover": {
                  backgroundColor: hasApplied ? "#FF4757" : "#222255",
                },
              }}
              onClick={hasApplied ? withdrawApplication : applyToWork}
              disabled={isApplyingToWork || isWithdrawingApplication}
            >
              {hasApplied ? "Withdraw Application" : "Apply Now"}
            </Button>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                color="warning"
                startIcon={<FaEdit />}
                onClick={() => setUpdateModalOpen(true)}
              >
                Update
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<FaTrash />}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this work post?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={deleteWorkPost}
            disabled={isDeletingWorkPost}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Work Post Modal */}
      <Dialog
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Update Work Post</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 3,
              mt: 2,
            }}
          >
            <TextField
              label="Title"
              variant="outlined"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              error={!title.trim()}
              helperText={!title.trim() ? "Title is required" : ""}
            />
            <TextField
              label="Location"
              variant="outlined"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              fullWidth
            />
            <TextField
              label="Pay"
              variant="outlined"
              value={pay}
              onChange={(e) => setPay(e.target.value)}
              fullWidth
              placeholder="e.g., $500 or Negotiable"
            />
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                label="Status"
              >
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </Select>
            </FormControl>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Deadline</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-[#333366]"
              />
            </div>
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Required On</span>
              </label>
              <input
                type="date"
                value={requiredOn}
                onChange={(e) => setRequiredOn(e.target.value)}
                className="input input-bordered w-full focus:outline-none focus:ring-2 focus:ring-[#333366]"
              />
            </div>
          </Box>
          <TextField
            label="Description"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            sx={{ mt: 3 }}
            placeholder="Provide detailed information about the work, expectations, and any specific requirements"
          />
          <Autocomplete
            multiple
            options={sortedSkills}
            value={skills}
            onChange={(event, newValue) => setSkills(newValue)}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) =>
              setInputValue(newInputValue)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Skills"
                helperText="Select all relevant skills for this work post"
                onKeyDown={handleKeyDown}
              />
            )}
            sx={{ mt: 3 }}
            filterSelectedOptions
            freeSolo
            limitTags={5}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <StyledChip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
            }
          />
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => setUpdateModalOpen(false)}>Cancel</Button>
          <Button color="secondary" onClick={() => handleUpdate()}>Update</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default Work;

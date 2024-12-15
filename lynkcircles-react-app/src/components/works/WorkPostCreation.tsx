//@ts-nocheck

import React, { useState, useMemo } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import {
  Box,
  TextField,
  Button,
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
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Comprehensive list of skills (you can expand this or fetch from an API)
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

const WorkPostCreation = ({ user }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState([]);
  const [pay, setPay] = useState("");
  const [status, setStatus] = useState("");
  const [deadline, setDeadline] = useState(null);
  const [requiredOn, setRequiredOn] = useState(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const queryClient = useQueryClient();

  const { mutate: createWorkPost, isLoading: isPending } = useMutation({
    mutationFn: async (post) => {
      const res = await axiosInstance.post("/works/create", post, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: () => {
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["workPosts"] });
      toast.success("Work post created successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const handlePostCreation = async () => {
    // Validate required fields
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const postData = {
      title,
      description,
      location,
      skills,
      pay,
      status,
      deadline,
      requiredOn,
    };
    console.log("postData:", postData);
    createWorkPost(postData);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setSkills([]);
    setPay("");
    setStatus("");
    setDeadline("");
    setRequiredOn("");
  };

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
  };

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

  // Memoized skill sorting for better performance
  const sortedSkills = useMemo(
    () => SKILLS_LIST.sort((a, b) => a.localeCompare(b)),
    []
  );

  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: 3,
        p: 3,
        mb: 4,
        border: "1px solid #ddd",
      }}
    >
      {/* Initial Text Field */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar
          src={user.profilePicture || "/avatar.png"}
          alt={user.name}
          sx={{ width: 48, height: 48, mr: 2 }}
        />
        <TextField
          variant="outlined"
          placeholder="Create a work post"
          fullWidth
          onClick={handleClickOpen}
          InputProps={{
            readOnly: true,
          }}
          sx={{
            cursor: "pointer",
            "& fieldset": {
              borderColor: "#333366",
            },
          }}
        />
      </Box>

      {/* Dialog for Post Creation */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          <Typography variant="h6" color="#333366">
            Create Work Post
          </Typography>
        </DialogTitle>
        <Divider />
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
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#333366",
              "&:hover": { backgroundColor: "#222255" },
              color: "#fff",
              fontWeight: "bold",
              width: "100%",
              mt: 2,
            }}
            onClick={handlePostCreation}
            disabled={isPending || !title.trim()}
          >
            {isPending ? "Creating..." : "Create Post"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkPostCreation;

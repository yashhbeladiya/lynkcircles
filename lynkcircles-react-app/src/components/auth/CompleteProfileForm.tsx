import React from "react";
import { useLocation, useNavigate } from "react-router";
import { TextField, Button, Typography, MenuItem, styled } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import toast from "react-hot-toast";
import CircularProgress from "@mui/material/CircularProgress";

const Form = styled("form")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
}));

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

const CustomButton = styled(Button)({
  backgroundColor: "#333366",
  color: "white",
  "&:hover": {
    backgroundColor: "#1a1a4d",
  },
});

const CompleteProfileForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, password } = location.state || {};

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [role, setRole] = React.useState("");

  const queryClient = useQueryClient();

  const { mutate: signUpMutation, status } = useMutation<any, any, any>({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post("/auth/signup", data);
      return res.data;
    },
    onError: (error: any) => {
      console.log(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Account created successfully");
      navigate("/");
    },
  });

  const handleCompleteProfile = (event: React.FormEvent) => {
    event.preventDefault();
    const data = { firstName, lastName, username, role, email, password };
    signUpMutation(data);
    console.log(data);
  };

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Complete Your Profile
      </Typography>
      <Form noValidate autoComplete="off" onSubmit={handleCompleteProfile}>
        <CustomTextField
          label="First Name"
          variant="outlined"
          fullWidth
          required
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <CustomTextField
          label="Last Name"
          variant="outlined"
          fullWidth
          required
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
        <CustomTextField
          label="Username"
          variant="outlined"
          fullWidth
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <CustomTextField
          label="Role"
          variant="outlined"
          fullWidth
          required
          select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <MenuItem value="Worker">Service Provider/Work Seeker</MenuItem>
          <MenuItem value="Client">Client</MenuItem>
        </CustomTextField>
        <CustomButton
          variant="contained"
          fullWidth
          type="submit"
          disabled={status === "pending"}
        >
          {status === "pending" ? (
            <CircularProgress className="size-5 animate-spin" />
          ) : (
            "Save"
          )}
        </CustomButton>
      </Form>
    </>
  );
};

export default CompleteProfileForm;

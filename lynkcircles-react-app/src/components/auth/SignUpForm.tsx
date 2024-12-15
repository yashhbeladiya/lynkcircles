import React from "react";
import { TextField, Button, Typography, styled } from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

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

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();


  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return toast.error("Passwords do not match");
    }
    navigate("/complete-profile", { state: { email, password } });
  };

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Join Circles and Explore
      </Typography>
      <Form
        noValidate
        autoComplete="off"
        onSubmit={(e) => {
          console.log("Form element rendered");
          handleSignUp(e);
        }}
      >
        <CustomTextField
          label="Email"
          variant="outlined"
          fullWidth
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <CustomTextField
          label="Password"
          type="password"
          variant="outlined"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
        />
        <CustomTextField
          label="Confirm Password"
          type="password"
          variant="outlined"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          fullWidth
          required
        />
        <CustomButton
          variant="contained"
          fullWidth
          type="submit"
        >
          Agree & Join
        </CustomButton>
      </Form>
    </>
  );
};

export default SignUpForm;

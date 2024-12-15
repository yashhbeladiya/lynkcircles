import React from "react";
import { Link, useNavigate } from "react-router";
import { TextField, Button, Typography, styled } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";

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

const SignInForm = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: login, status } = useMutation<void, any>({
    mutationFn: (userData) => axiosInstance.post("/auth/login", userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logged in successfully");
      navigate("/");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
      console.log(error);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userData = { username, password };
    login(userData as any);
  };

  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        Sign In
      </Typography>
      <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <CustomTextField
          label="Username"
          variant="outlined"
          fullWidth
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <CustomTextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <CustomButton variant="contained" fullWidth type="submit">
          {status === "pending" ? "Loading..." : "Sign In"}
        </CustomButton>
      </Form>
      <Typography variant="body2" component="p" style={{ marginTop: "16px" }}>
        Not linked to a lynkCircle yet?{" "}
        <Link to="/signup" style={{ color: "#333366", textDecoration: "none" }}>
          Join now
        </Link>
      </Typography>
    </>
  );
};

export default SignInForm;

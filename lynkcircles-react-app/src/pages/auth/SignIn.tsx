import React from "react";
import { Container, Paper, Typography, styled } from "@mui/material";
import SignInForm from "../../components/auth/SignInForm";

const Root = styled('div')(({ theme }) => ({
  height: "100vh",
  display: "flex",
  [theme.breakpoints.down('sm')]: {
    flexDirection: "column",
  },
}));

const ImageSection = styled('div')(({ theme }) => ({
  flex: 1,
  backgroundImage: "url('/bgauth.png')",
  backgroundSize: "cover",
  backgroundPosition: "center bottom 45%", // Position the image to stick 45% to the bottom
  height: "100%",
  [theme.breakpoints.down('sm')]: {
    display: "none",
  },
}));

const FormSection = styled('div')({
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  height: "100%",
});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  textAlign: "center",
  width: "100%",
  maxWidth: "400px",
}));

const Logo = styled('img')(({ theme }) => ({
  height: '80px',
  marginBottom: '16px',
  display: 'block',
  marginLeft: 'auto',
  marginRight: 'auto',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const SignIn = () => {
  return (
    <Root>
      <ImageSection />
      <FormSection>
        <Container maxWidth="xs">
          <StyledPaper>
            <Logo src="/logolc1.png" alt="Logo" />
            <SignInForm /> {/* Use the SignInForm component */}
          </StyledPaper>
        </Container>
      </FormSection>
    </Root>
  );
};

export default SignIn;
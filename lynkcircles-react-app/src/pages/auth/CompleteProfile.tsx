import React from "react";
import { Container, Paper, styled } from "@mui/material";
import CompleteProfileForm from "../../components/auth/CompleteProfileForm";

const Root = styled('div')(({ theme }) => ({
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  textAlign: "center",
  width: "100%",
  maxWidth: "400px",
}));

const CompleteProfile = () => {
  return (
    <Root>
      <Container maxWidth="xs">
        <StyledPaper>
          <CompleteProfileForm /> {/* Use the CompleteProfileForm component */}
        </StyledPaper>
      </Container>
    </Root>
  );
};

export default CompleteProfile;
import { useState } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CircularProgress from "@mui/material/CircularProgress";
import { UserX } from "lucide-react";

import { EmptyState } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useProfile } from "@/hooks/useProfile";

import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { AboutSection } from "@/components/profile/AboutSection";
import { ServicesSection } from "@/components/profile/ServicesSection";
import { PortfolioSection } from "@/components/profile/PortfolioSection";
import { ReviewsSection } from "@/components/profile/ReviewsSection";
import { ActivitySection } from "@/components/profile/ActivitySection";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { data: authUser } = useAuthUser();
  const { data: profile, isLoading, error } = useProfile(username);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Box
          sx={(theme) => ({
            p: 4,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            backgroundColor: theme.palette.background.paper,
          })}
        >
          <EmptyState
            icon={UserX}
            title="Profile not found"
            description="The user you're looking for doesn't exist or has been removed."
          />
        </Box>
      </Container>
    );
  }

  const isOwn = authUser?._id === profile._id;
  // Marketplace sections only make sense for Workers. Clients hire,
  // they don't list services — empty service/review slots on a Client
  // profile would read as noise instead of substance.
  const isWorker = profile.role === "Worker";

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 3 } }}>
      <ProfileHeader user={profile} isOwn={isOwn} onEdit={() => setEditOpen(true)} />
      <AboutSection user={profile} />
      {isWorker ? (
        <>
          <ServicesSection username={profile.username} isOwn={isOwn} />
          <PortfolioSection username={profile.username} isOwn={isOwn} />
          <ReviewsSection username={profile.username} isOwn={isOwn} />
        </>
      ) : null}
      <ActivitySection username={profile.username} isOwn={isOwn} />
      {isOwn ? (
        <EditProfileDialog
          user={profile}
          open={editOpen}
          onClose={() => setEditOpen(false)}
        />
      ) : null}
    </Container>
  );
};

export default Profile;

import { useState } from "react";
import Box from "@mui/material/Box";

import { useAuthUser } from "@/hooks/useAuthUser";

import { HomeHero } from "@/components/home/HomeHero";
import { HomeLeftRail } from "@/components/home/HomeLeftRail";
import { HomeRightRail } from "@/components/home/HomeRightRail";
import { WorkerDashboard } from "@/components/home/WorkerDashboard";
import { ClientDashboard } from "@/components/home/ClientDashboard";
import { CreateJobPostDialog } from "@/components/works/CreateJobPostDialog";

const Home = () => {
  const { data: user } = useAuthUser();
  const [postJobOpen, setPostJobOpen] = useState(false);

  if (!user) return null;
  const isClient = user.role === "Client";

  return (
    <Box
      sx={{
        maxWidth: 1280,
        mx: "auto",
        px: { xs: 1.5, sm: 2.5, md: 3 },
        py: { xs: 2, md: 3 },
        display: "grid",
        gap: { xs: 2, md: 2.5 },
        gridTemplateColumns: {
          xs: "1fr",
          md: "minmax(0, 1fr) 320px",
          lg: "260px minmax(0, 1fr) 320px",
        },
        alignItems: "start",
      }}
    >
      <Box sx={{ display: { xs: "none", lg: "block" } }}>
        <HomeLeftRail />
      </Box>

      <Box sx={{ minWidth: 0, overflowX: "hidden" }}>
        <HomeHero onPostJob={() => setPostJobOpen(true)} />
        {isClient ? (
          <ClientDashboard onPostJob={() => setPostJobOpen(true)} />
        ) : (
          <WorkerDashboard />
        )}
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <HomeRightRail onPostJob={() => setPostJobOpen(true)} />
      </Box>

      <CreateJobPostDialog
        open={postJobOpen}
        onClose={() => setPostJobOpen(false)}
      />
    </Box>
  );
};

export default Home;

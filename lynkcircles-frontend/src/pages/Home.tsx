import { useState } from "react";
import Container from "@mui/material/Container";

import { useAuthUser } from "@/hooks/useAuthUser";

import { HomeHero } from "@/components/home/HomeHero";
import { WorkerDashboard } from "@/components/home/WorkerDashboard";
import { ClientDashboard } from "@/components/home/ClientDashboard";
import { CreateJobPostDialog } from "@/components/works/CreateJobPostDialog";

/**
 * Role-aware marketplace Home. Hero + role-specific dashboard. No
 * social feed, no PostComposer — that was a LinkedIn-shaped section
 * that didn't earn its space on a trades-marketplace home. The Post
 * model + endpoints still exist (dormant) in case we revisit as a
 * "showcase" surface, but they're off the UI for now.
 *
 * Worker view  → open jobs (skill+distance ranked) + active applications
 * Client view  → workers to consider + own active job posts
 */
const Home = () => {
  const { data: user } = useAuthUser();
  const [postJobOpen, setPostJobOpen] = useState(false);
  const isClient = user?.role === "Client";

  return (
    <Container
      maxWidth="md"
      sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, md: 3 } }}
    >
      <HomeHero onPostJob={() => setPostJobOpen(true)} />

      {isClient ? (
        <ClientDashboard onPostJob={() => setPostJobOpen(true)} />
      ) : (
        <WorkerDashboard />
      )}

      <CreateJobPostDialog
        open={postJobOpen}
        onClose={() => setPostJobOpen(false)}
      />
    </Container>
  );
};

export default Home;

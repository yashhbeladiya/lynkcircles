import { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { MessageCircleHeart } from "lucide-react";

import { EmptyState } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useFeed } from "@/hooks/usePosts";

import { HomeHero } from "@/components/home/HomeHero";
import { WorkerDashboard } from "@/components/home/WorkerDashboard";
import { ClientDashboard } from "@/components/home/ClientDashboard";
import { SectionHeader } from "@/components/home/SectionHeader";
import { PostComposer } from "@/components/posts/PostComposer";
import { PostCard } from "@/components/posts/PostCard";
import { CreateJobPostDialog } from "@/components/works/CreateJobPostDialog";

/**
 * Role-aware Home. Marketplace dashboard above the fold (Worker: open
 * jobs + my applications; Client: workers to hire + my job posts),
 * social feed below as a secondary surface, not the centerpiece.
 *
 * The structural change versus the previous version is deliberate:
 * the old Home was a feed-first LinkedIn shape (sidebar + posts +
 * suggestions). That answered "what's new" but not "what should I do
 * with this app today" — which for a marketplace is the real question.
 */
const Home = () => {
  const { data: user } = useAuthUser();
  const { data: posts, isLoading } = useFeed();
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

      {/* Social section — what's new in your network. Demoted below
          the dashboard so it's still there, but no longer the page's
          headline. */}
      <Box sx={{ mt: 4 }}>
        <SectionHeader
          eyebrow="Your network"
          title="Latest from your circles"
          description="Updates from people you're connected with. Share something to start a conversation."
        />
        <PostComposer />

        {isLoading ? (
          <FeedSkeleton />
        ) : !posts || posts.length === 0 ? (
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
              icon={MessageCircleHeart}
              title="Your feed is quiet"
              description="Posts from you and your network will show up here. Try connecting with someone, or share an update to start the conversation."
            />
          </Box>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}
      </Box>

      <CreateJobPostDialog
        open={postJobOpen}
        onClose={() => setPostJobOpen(false)}
      />
    </Container>
  );
};

const FeedSkeleton = () => (
  <>
    {[0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={(theme) => ({
          p: 2.25,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          backgroundColor: theme.palette.background.paper,
          mb: 2,
        })}
      >
        <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="40%" height={14} />
            <Skeleton width="25%" height={12} />
          </Box>
        </Box>
        <Typography sx={{ mt: 1.5 }}>
          <Skeleton width="100%" />
          <Skeleton width="80%" />
        </Typography>
      </Box>
    ))}
  </>
);

export default Home;

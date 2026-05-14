import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { MessageCircleHeart } from "lucide-react";

import { EmptyState } from "@/components/ui";
import { FeedSidebar } from "@/components/home/FeedSidebar";
import { RecommendedRail } from "@/components/home/RecommendedRail";
import { PostCard } from "@/components/posts/PostCard";
import { PostComposer } from "@/components/posts/PostComposer";
import { useFeed } from "@/hooks/usePosts";

const Home = () => {
  const { data: posts, isLoading } = useFeed();

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, md: 3 },
        px: { xs: 1.5, md: 3 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "240px minmax(0, 1fr)",
            lg: "260px minmax(0, 620px) 300px",
          },
          gap: { xs: 0, md: 3 },
          justifyContent: { lg: "center" },
        }}
      >
        {/* Left rail: hidden on mobile */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <FeedSidebar />
        </Box>

        {/* Feed column */}
        <Box sx={{ minWidth: 0 }}>
          <PostComposer />

          {isLoading ? (
            <FeedSkeleton />
          ) : !posts || posts.length === 0 ? (
            <Box
              sx={{
                p: 4,
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                backgroundColor: "background.paper",
              }}
            >
              <EmptyState
                icon={MessageCircleHeart}
                title="Your feed is quiet"
                description="Posts from you and your network will show up here. Try connecting with someone or share an update to start the conversation."
              />
            </Box>
          ) : (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          )}
        </Box>

        {/* Right rail: hidden on mobile + tablet */}
        <Box sx={{ display: { xs: "none", lg: "block" } }}>
          <RecommendedRail />
        </Box>
      </Box>
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

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { MessageSquareDashed } from "lucide-react";

import { EmptyState } from "@/components/ui";
import { PostCard } from "@/components/posts/PostCard";
import { useUserPosts } from "@/hooks/useProfile";

interface Props {
  username: string;
  isOwn: boolean;
}

export const ActivitySection = ({ username, isOwn }: Props) => {
  const { data: posts, isLoading } = useUserPosts(username);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="overline"
        sx={{ color: "text.secondary", display: "block", mb: 1, px: 0.5 }}
      >
        Activity
      </Typography>

      {isLoading ? (
        <PostsSkeleton />
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
            icon={MessageSquareDashed}
            title={isOwn ? "You haven't posted yet" : "No posts yet"}
            description={
              isOwn
                ? "Share an update from your Home feed to fill out your activity."
                : "When this person posts something, it will appear here."
            }
          />
        </Box>
      ) : (
        posts.map((post) => <PostCard key={post._id} post={post} />)
      )}
    </Box>
  );
};

const PostsSkeleton = () => (
  <>
    {[0, 1].map((i) => (
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
        <Box sx={{ display: "flex", gap: 1.25 }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="40%" height={14} />
            <Skeleton width="25%" height={12} />
          </Box>
        </Box>
        <Skeleton width="100%" height={20} sx={{ mt: 1.5 }} />
        <Skeleton width="70%" height={20} />
      </Box>
    ))}
  </>
);

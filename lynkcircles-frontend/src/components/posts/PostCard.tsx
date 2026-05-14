import { useState } from "react";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Heart,
  MessageSquare,
  MoreHorizontal,
  Send,
  Share2,
  Trash2,
} from "lucide-react";

import { UserAvatar } from "@/components/ui";
import { useAuthUser } from "@/hooks/useAuthUser";
import {
  useCreateComment,
  useDeletePost,
  useLikePost,
} from "@/hooks/usePosts";
import type { Post } from "@/types/post";

interface Props {
  post: Post;
}

export const PostCard = ({ post }: Props) => {
  const { data: user } = useAuthUser();
  const likePost = useLikePost();
  const deletePost = useDeletePost();
  const createComment = useCreateComment();

  const [showComments, setShowComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  const isLiked = !!user && post.likes.includes(user._id);
  const isOwner = user?._id === post.author._id;

  const handleLike = () => likePost.mutate(post._id);
  const handleDelete = () => {
    setMenuAnchor(null);
    if (window.confirm("Delete this post?")) deletePost.mutate(post._id);
  };
  const handleCommentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = commentDraft.trim();
    if (!trimmed) return;
    await createComment.mutateAsync({ postId: post._id, content: trimmed });
    setCommentDraft("");
  };

  return (
    <Box
      sx={(theme) => ({
        p: { xs: 1.75, sm: 2.25 },
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        backgroundColor: theme.palette.background.paper,
        mb: 2,
      })}
    >
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box
          component={Link}
          to={`/profile/${post.author.username}`}
          sx={{ textDecoration: "none", color: "inherit", display: "flex" }}
        >
          <UserAvatar user={post.author} size="md" verified={post.author.verified} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            component={Link}
            to={`/profile/${post.author.username}`}
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {post.author.firstName} {post.author.lastName}
          </Typography>
          <Typography
            variant="caption"
            sx={{ display: "block", color: "text.tertiary", fontSize: "0.6875rem" }}
          >
            {post.author.headline ?? ""}
            {post.author.headline ? " · " : ""}
            {formatDistanceToNowStrict(new Date(post.createdAt))} ago
          </Typography>
        </Box>
        {isOwner ? (
          <>
            <IconButton
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              aria-label="Post options"
            >
              <MoreHorizontal size={16} />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={!!menuAnchor}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={handleDelete} sx={{ color: "error.main", fontSize: "0.8125rem" }}>
                <Trash2 size={14} style={{ marginRight: 8 }} aria-hidden />
                Delete
              </MenuItem>
            </Menu>
          </>
        ) : null}
      </Box>

      {/* Body */}
      {post.content ? (
        <Typography
          variant="body2"
          sx={{ mt: 1.5, fontSize: "0.9375rem", whiteSpace: "pre-wrap" }}
        >
          {post.content}
        </Typography>
      ) : null}
      {post.image ? (
        <Box
          component="img"
          src={post.image}
          alt=""
          loading="lazy"
          sx={{
            display: "block",
            width: "100%",
            mt: 1.5,
            borderRadius: 1.5,
            border: 1,
            borderColor: "divider",
          }}
        />
      ) : null}

      {/* Counts */}
      {post.likes.length > 0 || post.comments.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 1.25,
            color: "text.tertiary",
            fontSize: "0.75rem",
          }}
        >
          <span>{post.likes.length ? `${post.likes.length} likes` : ""}</span>
          <span>
            {post.comments.length ? `${post.comments.length} comments` : ""}
          </span>
        </Box>
      ) : null}

      {/* Action row */}
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          mt: 1,
          pt: 1,
          borderTop: 1,
          borderColor: "divider",
          color: "text.secondary",
        }}
      >
        <ActionButton
          icon={<Heart size={16} fill={isLiked ? "currentColor" : "none"} />}
          label="Like"
          active={isLiked}
          onClick={handleLike}
        />
        <ActionButton
          icon={<MessageSquare size={16} />}
          label="Comment"
          onClick={() => setShowComments((s) => !s)}
        />
        <ActionButton icon={<Share2 size={16} />} label="Share" />
      </Box>

      {/* Comments */}
      {showComments ? (
        <Box sx={{ mt: 1.5 }}>
          {post.comments.map((c) => (
            <Box
              key={c._id}
              sx={{ display: "flex", gap: 1, alignItems: "flex-start", mb: 1 }}
            >
              <UserAvatar user={c.user} size="sm" />
              <Box
                sx={{
                  flex: 1,
                  bgcolor: "action.hover",
                  px: 1.25,
                  py: 0.75,
                  borderRadius: 1.5,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {c.user.firstName} {c.user.lastName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.8125rem", whiteSpace: "pre-wrap" }}
                >
                  {c.content}
                </Typography>
              </Box>
            </Box>
          ))}
          <Box
            component="form"
            onSubmit={handleCommentSubmit}
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              mt: 1,
              border: 1,
              borderColor: "divider",
              borderRadius: 999,
              px: 1.5,
              py: 0.5,
            }}
          >
            <InputBase
              fullWidth
              placeholder="Write a comment…"
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              sx={{ fontSize: "0.8125rem" }}
              inputProps={{ "aria-label": "New comment" }}
            />
            <IconButton
              type="submit"
              size="small"
              color="primary"
              disabled={!commentDraft.trim() || createComment.isPending}
              aria-label="Send comment"
            >
              <Send size={14} />
            </IconButton>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

const ActionButton = ({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <Box
    component="button"
    onClick={onClick}
    sx={{
      flex: 1,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 0.75,
      py: 0.75,
      borderRadius: 1,
      border: "none",
      background: "transparent",
      color: active ? "primary.main" : "inherit",
      fontSize: "0.8125rem",
      fontWeight: 500,
      cursor: onClick ? "pointer" : "default",
      transition: "background 120ms ease",
      "&:hover": { backgroundColor: "action.hover" },
    }}
  >
    {icon}
    <span>{label}</span>
  </Box>
);

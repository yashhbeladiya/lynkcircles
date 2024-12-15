//@ts-nocheck

import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, IconButton, TextField, Typography } from "@mui/material";
import { Loader, Share2, ThumbsUp, Trash, MessageCircle, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Post = ({ post, authUser }: {post: any, authUser: any}) => {
  const { postId } = useParams();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const isOwner = authUser?._id === post.author?._id;
  const isLiked = post.likes.includes(authUser?._id);

  const queryClient = useQueryClient();

  const { mutate: deletePost, isLoading: isDeletingPost } = useMutation({
    mutationFn: async () => {
      await axiosInstance.delete(`/feed/delete/${post._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const { mutate: createComment, isLoading: isCreatingComment } = useMutation({
    mutationFn: async (newComment) => {
      const res = await axiosInstance.post(`/feed/${post._id}/comment`, {
        content: newComment,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create comment");
    },
  });

  const { mutate: likePost, isLoading: isLikingPost } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post(`/feed/${post._id}/like`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to like post");
    },
  });

  const handleDeletePost = () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    deletePost();
  };

  const handleLikePost = () => {
    if (isLikingPost || isLiked) return;
    likePost();
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    createComment(newComment.trim());
    setNewComment("");
    setComments([
      ...comments,
      {
        content: newComment,
        user: {
          _id: authUser._id,
          firstName: authUser.firstName,
          lastName: authUser.lastName,
          profilePicture: authUser.profilePicture,
        },
        createdAt: new Date(),
      },
    ]);
  };

  return (
    <Card sx={{ mb: 4 }}>
      <CardHeader
        avatar={
          <Link to={`/profile/${post.author.username}`}>
            <Avatar src={post.author.profilePicture || "/avatar.png"} alt={post.author.username} />
          </Link>
        }
        action={
          isOwner && (
            <IconButton onClick={handleDeletePost} color="error">
              {isDeletingPost ? <Loader size={18} className="animate-spin" /> : <Trash size={18} />}
            </IconButton>
          )
        }
        title={
          <Link to={`/profile/${post.author.username}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography variant="h6">{post.author.firstName} {post.author.lastName}</Typography>
          </Link>
        }
        subheader={
          <>
            <Typography variant="body2" color="textSecondary">
              {post.author.headline || "LynkCircle's User"}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </Typography>
          </>
        }
      />
      <CardContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {post.content}
        </Typography>
        {post.image && (
          <Box component="img" src={post.image} alt="Post" sx={{ width: '100%', borderRadius: 2, height: "auto", maxHeight: "500px", borderRadius: "8px", objectFit: "contain" }} />
        )}
      </CardContent>
      <CardActions disableSpacing>
        <IconButton onClick={handleLikePost} color={isLiked ? "success" : "default"}>
          <ThumbsUp size={18} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {`Likes (${post.likes.length})`}
          </Typography>
        </IconButton>
        <IconButton onClick={() => setShowComments(!showComments)} color="default">
          <MessageCircle size={18} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            {`Comments (${comments.length})`}
          </Typography>
        </IconButton>
        <IconButton color="default">
          <Share2 size={18} />
          <Typography variant="body2" sx={{ ml: 1 }}>
            Share
          </Typography>
        </IconButton>
      </CardActions>
      {showComments && (
        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ mb: 2, maxHeight: 240, overflowY: 'auto' }}>
            {comments.map((comment) => (
              <Box key={comment._id} sx={{ display: 'flex', mb: 2 }}>
                <Avatar src={comment.user.profilePicture || "/avatar.png"} alt={comment.user.username} sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {comment.user.firstName} {comment.user.lastName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </Typography>
                  <Typography variant="body2">{comment.content}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ flexGrow: 1, mr: 1 }}
            />
            <Button type="submit" variant="contained" color="primary" disabled={isCreatingComment}>
              {isCreatingComment ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
};

export default Post;
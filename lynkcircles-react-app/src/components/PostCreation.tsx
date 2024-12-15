//@ts-nocheck
import React, { useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Loader, Image } from "lucide-react";
import imageCompression from "browser-image-compression";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  SlotProps,
} from "@mui/material";
import { read } from "fs";

const PostCreation = ({ user }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const { mutate: createPost, isLoading: isPending } = useMutation({
    mutationFn: async (post: any) => {
      const res = await axiosInstance.post("/feed/create", post, {
        headers: { "Content-Type": "application/json" },
      });
      return res.data;
    },
    onSuccess: () => {
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post created successfully");
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const handlePostCreation = async () => {
    try {
      const postData = { content, image };
      if (image) postData.image = await readFileAsDataURL(image);
      createPost(postData);
    } catch (error: any) {
      console.log("error in post creation:", error);
    }
  };

  const resetForm = () => {
    setContent("");
    setImage(null);
    setImagePreview(null);
  };

  const handleImageChange = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Compression options
        const options = {
          maxSizeMB: 1, // Max size in MB
          maxWidthOrHeight: 1920, // Resize to fit within these dimensions
          useWebWorker: true, // Enable web workers for better performance
        };

        // Compress the image
      const compressedFile = await imageCompression(file, options);

      // Check if the output is a valid Blob
      if (!(compressedFile instanceof Blob)) {
        throw new Error("Compressed file is not a valid Blob.");
      }

      // Convert the compressed Blob to a Data URL
      const compressedFileBase64 = await readFileAsDataURL(compressedFile);

      // Set state
      setImage(compressedFile); // Save the compressed file
      setImagePreview(compressedFileBase64); // Save the base64 preview

      } catch (error: any) {
        console.error("Error while compressing image:", error);
        toast.error("Failed to process the image.");
      }
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const readFileAsDataURL = (file: any) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: 3,
        p: 2,
        mb: 4,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar
          src={user.profilePicture || "/avatar.png"}
          alt={user.name}
          sx={{ width: 48, height: 48, mr: 2 }}
        />
        <TextField
          variant="outlined"
          placeholder="What's on your mind?"
          fullWidth
          onClick={handleClickOpen}
          slotPropsinput={{
            readOnly: true,
          }}
          sx={{ cursor: "pointer" }}
        />
      </Box>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create a Post</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              src={user.profilePicture || "/avatar.png"}
              alt={user.name}
              sx={{ width: 48, height: 48, mr: 2 }}
            />
            <Typography variant="h7">
              {user.firstName} {user.lastName}
            </Typography>
          </Box>
          <TextField
            variant="outlined"
            placeholder="What's on your mind?"
            fullWidth
            multiline
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ mb: 1 }}
          />
          {imagePreview && (
            <Box sx={{ mb: 2 }}>
              <img
                src={imagePreview}
                alt="Selected"
                style={{ width: "100%", borderRadius: "8px" }}
              />
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton component="label">
              <Image size={24} />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </IconButton>
            <Typography variant="body2" sx={{ ml: 1 }}>
              Photo
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            onClick={handlePostCreation}
            color="primary"
            disabled={isPending || (!content && !image)}
            sx={{
              backgroundColor: "#333366",
              color: "white",
              "&:hover": { backgroundColor: "#2a2a5a" },
            }}
          >
            {isPending ? (
              <Loader size={18} className="animate-spin" />
            ) : (
              "Share"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PostCreation;

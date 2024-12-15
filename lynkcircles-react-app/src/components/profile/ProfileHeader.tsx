//@ts-nocheck
import React, { useState } from "react";
import { AxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import {
  Avatar,
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import {
  UserCheck,
  UserPlus,
  UserMinus,
  MapPin,
  Edit,
  Camera,
} from "lucide-react";

// Types
type AuthUser = {
  _id: string;
  role: string;
};

const ProfileHeader = ({
  userData,
  isOwnProfile,
  onSave,
}: {
  userData: UserData;
  isOwnProfile: boolean;
  onSave: (editedData: EditedData) => void;
}) => {
  const [firstName, setFirstName] = useState(userData.firstName);
  const [lastName, setLastName] = useState(userData.lastName);
  const [headline, setHeadline] = useState(userData.headline);
  const [location, setLocation] = useState(userData.location);
  const [bio, setBio] = useState(userData.bio);
  const [profilePicture, setProfilePicture] = useState(userData.profilePicture);
  const [bannerImage, setbannerImage] = useState(userData.bannerImage);
  const [status, setStatus] = useState(userData.status);
  

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const queryClient = useQueryClient();

  // Get authenticated user
  const { data: authUser } = useQuery<AuthUser>({
    queryKey: ["authUser"],
  });

  // Check connection status
  const isConnected = userData.connections.includes(authUser?._id);
  const isFollowing =
    userData?.role === "Client"
      ? userData.savedWorkers.includes(authUser?._id)
      : userData.followingClients.includes(authUser?._id);

  const isSaved = userData.savedWorkers.includes(authUser?._id || "");

  // Mutation hooks
  const { mutate: toggleConnection } = useMutation({
    mutationFn: () =>
      authUser?.role === "Client"
        ? axiosInstance.post(`/users/save/${userData._id}`)
        : axiosInstance.post(`/connections/request/${userData._id}`),
    onSuccess: () => {
      toast.success(
        authUser?.role === "Client" ? "Worker saved" : "Connection request sent"
      );
      queryClient.invalidateQueries({ queryKey: ["userData", userData._id] });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.message || "An error occurred");
    },
  });

  const { mutate: removeConnection } = useMutation({
    mutationFn: () =>
      authUser?.role === "Client"
        ? axiosInstance.delete(`/workers/unsave/${userData._id}`)
        : axiosInstance.delete(`/connections/${userData._id}`),
    onSuccess: () => {
      toast.success(
        authUser?.role === "Client" ? "Worker removed" : "Connection removed"
      );
      queryClient.invalidateQueries({ queryKey: ["userData", userData._id] });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.message || "An error occurred");
    },
  });

  const { mutate: followClient } = useMutation({
    mutationFn: () => axiosInstance.post(`/users/follow/${userData._id}`),
    onSuccess: () => {
      toast.success("Client followed");
      queryClient.invalidateQueries({ queryKey: ["userData", userData._id] });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.message || "An error occurred");
    },
  });

  const { mutate: unfollowClient } = useMutation({
    mutationFn: () => axiosInstance.delete(`/users/unfollow/${userData._id}`),
    onSuccess: () => {
      toast.success("Client unfollowed");
      queryClient.invalidateQueries({ queryKey: ["userData", userData._id] });
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.message || "An error occurred");
    },
  });

  // handle profile picture change
  const handleProfilePictureChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setProfilePicture(result);
          const editedData: EditedData = {
            profilePicture: result,
          };
          onSave(editedData);
        };
        reader.readAsDataURL(file);
      }
    } catch (error: any) {
      console.error("Error uploading image: ", error);
      toast.error("Error uploading image");
    }
  };

  // handle banner image change
  const handleBannerImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files[0];
      if (file) {
        console.log("file :", file);
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setbannerImage(result);
          const editedData: EditedData = {
            bannerImage: result,
          };
          onSave(editedData);
        };
        reader.readAsDataURL(file);
      }
    } catch (error: any) {
      console.error("Error uploading image: ", error);
      toast.error("Error uploading image");
    }
  };

  // Save profile changes
  const handleSave = () => {
    const editedData: EditedData = {
      firstName,
      lastName,
      headline,
      location,
    };
    onSave(editedData);
    setOpenEditDialog(false);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Banner Image */}
      <div
        className="h-48 bg-cover bg-center relative"
        style={{
          backgroundImage: `url('${bannerImage || "/banner.png"}')`,
        }}
      >
        {isOwnProfile && (
          <label className="absolute top-2 right-2 bg-white/70 p-2 rounded-full cursor-pointer">
            <Camera size={20} />
            <input
              type="file"
              className="hidden"
              name="bannerImage"
              onChange={handleBannerImageChange}
              accept="image/*"
            />
          </label>
        )}
      </div>

      {/* Profile Section */}
      <div className="p-4 relative">
        {/* Profile Picture */}
        <div className="-mt-20 mb-4 flex justify-center">
          <Avatar
            alt={`${userData.firstName} ${userData.lastName}`}
            src={profilePicture || userData.profilePicture || "/avatar.png"}
            sx={{
              width: 128,
              height: 128,
              border: `4px solid ${
                userData.role === "Worker" ? "blue" : "orange"
              }`,
            }}
          />

          {isOwnProfile && (
            <label className="absolute top-6 left-15 bg-white/80 p-2 rounded-full cursor-pointer shadow-md">
              <Camera size={20} />
              <input
                type="file"
                className="hidden"
                name="profilePicture"
                onChange={handleProfilePictureChange}
                accept="image/*"
              />
            </label>
          )}
        </div>

        {/* User Details */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {firstName} {lastName}
          </h1>
          <p className="text-gray-600 mb-2">{headline}</p>

          {location && (
            <div className="flex justify-center items-center mb-2">
              <MapPin size={16} className="text-gray-500 mr-1" />
              <span className="text-gray-500">{location}</span>
            </div>
          )}

          {/* Stats */}
          <div className="flex justify-center space-x-4 mb-4">
            <div className="text-center">
              <span className="font-bold block">
                {userData.connections.length}
              </span>
              <span className="text-gray-500">Connections</span>
            </div>
            {userData.role === "Client" && (
              <div className="text-center">
                <span className="font-bold block">
                  {userData.followingClients.length}
                </span>
                <span className="text-gray-500">Follower</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isOwnProfile ? (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Edit />}
              onClick={() => setOpenEditDialog(true)}
              className="w-full"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex justify-center space-x-2">
              <Button
                variant="contained"
                color={isConnected ? "error" : "primary"}
                startIcon={isConnected ? <UserMinus /> : <UserPlus />}
                onClick={isConnected ? removeConnection : toggleConnection}
              >
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
              {userData.role === "Client" && (
                <Button
                  variant="contained"
                  color={isFollowing ? "error" : "secondary"}
                  startIcon={isFollowing ? <UserMinus /> : <UserPlus />}
                  onClick={isFollowing ? unfollowClient : followClient}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
              {authUser?.role === "Client" && (
                <Button
                  variant="outlined"
                  color={isFollowing ? "error" : "secondary"}
                  startIcon={isFollowing ? <UserMinus /> : <UserPlus />}
                  onClick={isFollowing ? removeConnection : toggleConnection}
                >
                  {isSaved ? "Unsave" : "Save"}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="First Name"
            fullWidth
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Headline"
            fullWidth
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Location"
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="error">
            Cancel
          </Button>
          <Button onClick={handleSave} color="secondary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProfileHeader;

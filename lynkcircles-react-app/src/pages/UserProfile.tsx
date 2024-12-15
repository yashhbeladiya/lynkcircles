//@ts-nocheck
import React from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import ProfileHeader from "../components/profile/ProfileHeader";
import AboutSection from "../components/profile/AboutSection";
import WorkDetails from "../components/profile/WorkDetails";
import SkillsSection from "../components/profile/SkillsSection";
import toast from "react-hot-toast";
import { W } from "react-router/dist/production/fog-of-war-CbNQuoo8";
import { Work } from "@mui/icons-material";

interface UserProfile {
  username: string;
  // Add other user profile fields here
}

interface AuthUser {
  username: string;
  // Add other auth user fields here
}

const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  const queryClient = useQueryClient();

  const { data: authUser, isLoading: isAuthUserLoading } = useQuery<AuthUser>({
    queryKey: ["authUser"],
    queryFn: () => axiosInstance.get("/auth/me").then(res => res.data),
  });

  const { data: userProfile, isLoading: isUserProfileLoading } = useQuery<UserProfile>({
    queryKey: ["userProfile", username],
    queryFn: () => axiosInstance.get(`/users/profile/${username}`).then(res => res.data),
  });

  // get work details 
  const { data: workDetails, isLoading: isWorkDetailsLoading } = useQuery({
    queryKey: ["workDetails", username],
    queryFn: () => axiosInstance.get(`/workdetails/${username}`).then(res => res.data),
  });

  const { mutate: updateProfile } = useMutation({
    mutationFn: async (updatedData: Partial<UserProfile>) => {
      await axiosInstance.put("/users/profile", updatedData);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["userProfile", username] });
    },
  });

  const { mutate: deleteService } = useMutation({
    mutationFn: async (serviceId: string) => {
      await axiosInstance.delete(`/workdetails/delete/${serviceId}`);
    },
    onSuccess: () => {
      toast.success("Service deleted successfully");
      queryClient.invalidateQueries(["workDetails", username]);
    },
  });

  const handleDeleteService = (serviceId: string) => {
    deleteService(serviceId);
  };

   // update work details
   const { mutate: updateService } = useMutation({
    mutationFn: async (serviceData) => {
      // Send service data to backend
      await axiosInstance.put("/workdetails/update", serviceData);
    },
    onSuccess: () => {
      toast.success("Service updated successfully");
      queryClient.invalidateQueries(["workDetails", username]);

      handleClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const { mutate: createService } = useMutation({
    mutationFn: async (serviceData) => {
      // Send service data to backend
      await axiosInstance.post("/workdetails", serviceData);
    },
    onSuccess: () => {
      toast.success("Service created successfully");
      queryClient.invalidateQueries(["workDetails", username]);

      handleClose();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Something went wrong");
    },
  });

  const onSaveWorkDetails = (workDetails) => {
    if (workDetails.id) {
      updateService(workDetails);
    } else {
      createService(workDetails);
    }
  }

  if (isAuthUserLoading || isUserProfileLoading) return null;

  const isOwnProfile = authUser?.username === userProfile?.username;
  const userData = isOwnProfile ? authUser : userProfile;

  const handleSave = (updatedData: Partial<UserProfile>) => {
    updateProfile(updatedData);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ProfileHeader userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
      <AboutSection userData={userData} isOwnProfile={isOwnProfile} onSave={handleSave} />
      <WorkDetails workDetails={workDetails} isOwnProfile={isOwnProfile} onSave={onSaveWorkDetails} onDelete={handleDeleteService} />
    </div>
  );
};

export default ProfilePage;
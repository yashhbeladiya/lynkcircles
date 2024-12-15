// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import PostCreation from "../components/PostCreation";
import Post from "../components/Post";
import { Users } from "lucide-react";
import RecommandedUser from "../components/RecommandedUser";
import { Box, Container, Paper, Typography } from "@mui/material";

export default function Home() {
  const { data: authUser } = useQuery<any>({
    queryKey: ["authUser"],
  });

  const { data: recommendedUsers } = useQuery<any>({
    queryKey: ["recommendedUsers"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/users/suggestions");
        return res.data;
      } catch (error: any) {
        console.log("error :", error);
        return null;
      }
    },
  });

  const { data: postResponse } = useQuery<any>({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/feed");
        return res.data; // Now returning the entire response object
      } catch (error: any) {
        console.log("error :", error);
        return { posts: [] }; // Default to empty posts array
      }
    },
  });

  // Extract posts from the response data
  const postsToRender = postResponse?.posts || [];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={authUser} />
      </div>

      <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
        <PostCreation user={authUser} />

        {postsToRender.length === 0 ? (
          <div className="flex items-center justify-center h-96">
            <div className="mb-6">
              <Users size={64} className="mx-auto" color="#333366" />
              <h2 className="text-lg font-semibold text-center">
                No posts found
              </h2>
              <p className="text-gray-500 text-center">
                Follow users to see their posts
              </p>
            </div>
          </div>
        ) : (
          postsToRender.map((post: any) => (
            <Post key={post._id} post={post} authUser={authUser} />
          ))
        )}
      </div>

        {recommendedUsers && (
          <div className="col-span-1 lg:col-span-1 hidden: lg:block">
            {/* <div className="rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Recommended Users</h2>
              {recommendedUsers.map((user: any) => (
                <RecommandedUser key={user._id} user={user} />
              ))}
            </div> */}
            <Paper sx={{ p: 2, mb: 4, boxShadow: 3, borderRadius: '8px' }}>
              <Typography variant="h6" gutterBottom='true'>
                Recommended Users
              </Typography>
              {recommendedUsers.map((user: any) => (
                <RecommandedUser key={user._id} user={user} />
              ))}
            </Paper>
          </div>
        )}
    </div>
  );
}

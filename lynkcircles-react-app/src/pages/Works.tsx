//@ts-nocheck
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '../components/Sidebar';
import WorkPostCreation from '../components/works/WorkPostCreation';
import { axiosInstance } from '../lib/axios';
import WorkPostCard from '../components/works/WorkPostCard';

const Works = () => {
  const { data: authUser } = useQuery<any>({
    queryKey: ["authUser"],
  });

  // get work posts
  const { data: workPostsResponse } = useQuery<any>({
    queryKey: ["workPosts"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/works");
        console.log("Full work posts response:", res.data);
        return res.data; // Now returning the entire response object
      } catch (error: any) {
        console.log("error :", error);
        return { workPosts: [] }; // Default to empty work posts array
      }
    },
  });

  console.log("workPostsResponse :", workPostsResponse);

  // extract client's own work posts
  const clientWorkPosts = workPostsResponse?.filter((workPost: any) => workPost.author._id === authUser._id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={authUser} />
      </div>

      <div className="col-span-1 lg:col-span-2 order-first lg:order-none">
        {authUser.role === 'Client' && (<WorkPostCreation user={authUser} />)}

        {(workPostsResponse?.length === 0) ? (
          <div className="flex items-center justify-center h-96">
            <h2 className="text-lg font-semibold text-center">
              No work posts yet. Be the first to post!
            </h2>
          </div>
        ) : (
          authUser.role === 'Worker' && workPostsResponse?.map((workPost: any) => (
            <div key={workPost.id} className="mb-4">
              <WorkPostCard workPost={workPost} />
            </div>
          )))}

        {clientWorkPosts?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold">Your Work Posts</h2>
            {clientWorkPosts?.map((workPost: any) => (
              <div key={workPost.id} className="mb-4">
                <WorkPostCard workPost={workPost} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Works
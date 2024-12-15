import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom"
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";


const PostPage = () => {
  const { postId } = useParams();
  const { data: user } = useQuery({ queryKey: ["authUser"]});
  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => axiosInstance.get(`/feed/${postId}`),
  });

  if (postLoading) return <div> Loading Post... </div>
  if (!post?.data) return <div> No Post </div>

  return (
		<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
			<div className='hidden lg:block lg:col-span-1'>
				<Sidebar user={user} />
			</div>

			<div className='col-span-1 lg:col-span-3'>
				<Post post={post.data.post} authUser={user} />
			</div>
		</div>
	);
}

export default PostPage
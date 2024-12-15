import { useQueryClient, useMutation } from "@tanstack/react-query"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ConnectionRequest = ({request}: {request:any}) => {
    const queryClient = useQueryClient();

    const { mutate: acceptConnectionRequest } = useMutation({
        mutationFn: (id) => axiosInstance.put(`/connections/requests/${id}/accept`),
        onSuccess: () => {
            toast.success("Connection request accepted");
            queryClient.invalidateQueries({queryKey : ["connectionRequests"]});
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const { mutate: rejectConnectionRequest } = useMutation({
        mutationFn: (id) => axiosInstance.put(`/connections/requests/${id}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey : ["connectionRequests"]})
        },
        onError: (error) => {
            console.log(error);
        }
    });

  return (
    <div className='bg-white rounded-lg shadow p-4 flex items-center justify-between transition-all hover:shadow-md mb-2' style={{border: '1px solid #333366'}}>
			<div className='flex items-center gap-4'>
				<Link to={`/profile/${request.sender.username}`}>
					<img
						src={request.sender.profilePicture || "/avatar.png"}
						alt={request.username}
						className='w-16 h-16 rounded-full object-cover'
					/>
				</Link>

				<div>
					<Link to={`/profile/${request.sender.username}`} className='font-semibold text-lg'>
						{request.sender.firstName} {request.sender.lastName}
					</Link>
					<p className='text-gray-600'>{request.sender.headline}</p>
				</div>
			</div> 
            <div className='space-x-2'>
				<button
					className=' text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors'
					style={{ backgroundColor: "#333366" }}
					onClick={() => acceptConnectionRequest(request._id)}
				>
					Accept
				</button>
				<button
					className='bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors'
					onClick={() => rejectConnectionRequest(request._id)}
				>
					Reject
				</button>
			</div>
		</div>
  );
}

export default ConnectionRequest
//@ts-nocheck

import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from '../lib/axios'
import Sidebar from '../components/Sidebar'
import Work from '../components/works/Work'

const WorkPage = () => {
  const { workPostId } = useParams();
  const { data: user } = useQuery({ queryKey: ["authUser"]});
  const { data: workPost, isLoading } = useQuery({
    queryKey: ["workPost", workPostId],
    queryFn: () => axiosInstance.get(`/works/${workPostId}`),
  });

  if (isLoading) return <div>Loading Work Post...</div>
  if (!workPost) return <div>No Work Post</div>

  return (
    <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
			<div className='hidden lg:block lg:col-span-1'>
				<Sidebar user={user} />
			</div>

			<div className='col-span-1 lg:col-span-3'>
				<Work workPost={workPost.data} authUser={user} />
			</div>
		</div>
  )
}

export default WorkPage
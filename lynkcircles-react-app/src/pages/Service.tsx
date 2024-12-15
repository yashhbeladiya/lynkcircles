import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import ServiceDetail from "../components/profile/ServiceDetails";

const Service = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { data: user } = useQuery({ queryKey: ["authUser"] });
  const { data: service, isLoading: serviceLoading } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => axiosInstance.get(`/workdetails/id/${serviceId}`),
  });

  if (serviceLoading) return <div>Loading Service...</div>;
  if (!service) return <div>No Service</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={user} />
      </div>

      <div className="col-span-1 lg:col-span-3">
        <ServiceDetail service={service.data} authUser={user} />
      </div>
    </div>
  );
};

export default Service;

import React from "react";
import Sidebar from "../components/Sidebar";
import NewsLynkCircles from "../components/NewsLynkCircles";
import { useQuery } from "@tanstack/react-query";

const News = () => {

    const { data: user } = useQuery({ queryKey: ["authUser"] });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={user} />
      </div>

      <div className="col-span-1 lg:col-span-3">
        <NewsLynkCircles />
      </div>
    </div>
  );
};

export default News;

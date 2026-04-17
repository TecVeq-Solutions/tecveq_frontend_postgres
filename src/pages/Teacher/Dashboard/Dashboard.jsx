import React from "react";
import Navbar from "../../../components/Teacher/Navbar";
import MyClasses from "../../../components/Teacher/Dashboard/MyClasses";
import Announcements from "../../../components/Teacher/Dashboard/Announcements";
import UpcomingClasses from "../../../components/Teacher/Dashboard/UpcomingClasses";
import LastDeliverables from "../../../components/Teacher/Dashboard/LastDeliverables";

import { useBlur } from "../../../context/BlurContext";
import { useTeacher } from "../../../context/TeacherContext";
import { useSidebar } from "../../../context/SidebarContext"
import TeacherGradingWidget from "../../../components/Teacher/Dashboard/TeacherGradingWidget";

const Dashboard = () => {
  const { isBlurred } = useBlur();
  const { allAnnouncements } = useTeacher();
  const { isSidebarOpen } = useSidebar(); 

  return (
    <div className="flex flex-1 bg-[#f9f9f9]/50 font-poppins">
      <div className="flex flex-1 gap-4">
        <div className={`flex flex-col flex-1 px-4 lg:px-5 lg:ml-72`}>
          <div className="flex h-20 md:px-14 lg:px-0">
            <Navbar />
          </div>
          <div
            className={`flex flex-col md:px-10 lg:px-0 lg:mt-0 mt-5 sm:mt-1 md:mt-1 lg:flex-row flex-1 gap-5 my-2 ${isBlurred ? "blur" : ""
              }`}
          >
            <div className="flex flex-[2]">
              <Announcements data={allAnnouncements} />
            </div>
            <div className={`flex flex-[3] ${isSidebarOpen ? "-z-10" : "z-auto"} lg:z-auto`}>
              <UpcomingClasses />
            </div>
          </div>
          <div
            className={`flex flex-col md:px-10 lg:px-0 lg:flex-row flex-1 gap-5 py-2 ${isBlurred ? "blur" : ""
              }`}
          >
            <div className="flex-[6] flex w-full">
              <MyClasses />
            </div>
            <div className="flex-[3.5] flex w-full">
              <TeacherGradingWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

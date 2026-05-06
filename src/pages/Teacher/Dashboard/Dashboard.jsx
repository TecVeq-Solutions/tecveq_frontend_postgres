import React from "react";
import Navbar from "../../../components/Teacher/Navbar";
import MyClasses from "../../../components/Teacher/Dashboard/MyClasses";
import Announcements from "../../../components/Teacher/Dashboard/Announcements";
import UpcomingClasses from "../../../components/Teacher/Dashboard/UpcomingClasses";
import LastDeliverables from "../../../components/Teacher/Dashboard/LastDeliverables";

import { useBlur } from "../../../context/BlurContext";
import { useTeacher } from "../../../context/TeacherContext";
import { useSidebar } from "../../../context/SidebarContext"
const Dashboard = () => {

  const { isBlurred } = useBlur();
  const { allAnnouncements } = useTeacher();
  const { isSidebarOpen } = useSidebar(); // new

  return (
    <div className="flex flex-col flex-1 bg-[#f9f9f9]/50 font-poppins min-h-screen overflow-x-hidden">
      <div className="flex flex-1 flex-col lg:ml-80 transition-all duration-300">
        {/* Navbar Container   z-[500]*/}
        <div className="sticky top-0  bg-white border-b border-gray-100 h-16 sm:h-20 flex items-center lg:pl-0">
          <Navbar />
        </div>

        {/* Content Area */}
        <div className={`flex flex-col p-2 sm:p-4 lg:p-6 gap-6 ${isBlurred ? "blur-md" : ""}`}>

          {/* Top Section: Announcements & Upcoming Classes */}
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 xl:flex-[2] min-w-0">
              <Announcements data={allAnnouncements} />
            </div>
            <div className={`hidden lg:block flex-1 xl:flex-[3] min-w-0 ${isSidebarOpen ? "z-0" : "z-auto"}`}>
              <UpcomingClasses />
            </div>
          </div>

          {/* Bottom Section: My Classes & Last Deliverables */}
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex-1 xl:flex-[6] min-w-0">
              <MyClasses />
            </div>
            <div className="flex-1 xl:flex-[4] min-w-0">
              <LastDeliverables />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;

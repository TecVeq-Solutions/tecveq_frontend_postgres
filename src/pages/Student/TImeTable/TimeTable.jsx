import React from "react";
import MyCalendar from "./components/calendar/calendar";
import Navbar from "../../../components/Student/Dashboard/Navbar";

import { useBlur } from "../../../context/BlurContext";
import { useSidebar } from "../../../context/SidebarContext";

const TimeTable = () => {

  const { isBlurred } = useBlur();
  const { isSidebarOpen } = useSidebar(); // new

  return (
    <>
      <div className="flex flex-1 min-h-screen  bg-[#f9f9f9]/50 font-poppins">
        <div className="flex flex-1 gap-4">
          <div className={`flex flex-col flex-1 px-2 sm:px-5 lg:ml-80`}>
            <div className="flex h-20 md:px-14 lg:px-0">
              <Navbar heading={"Time Table"} />
            </div>
            <div className={`flex px-1 flex-col md:px-10 lg:px-0 lg:flex-row flex-1 gap-5 py-2 ${isBlurred ? "blur" : ""}`} >
              <div className={`flex-1 p-2 sm:p-5 bg-white border rounded-md shadow-lg border-grey/30 relative ${isSidebarOpen ? "-z-10" : "z-auto"} lg:z-auto`}>
                <MyCalendar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimeTable;

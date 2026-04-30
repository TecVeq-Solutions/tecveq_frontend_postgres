import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import MyCalendar from "../../../components/Admin/TimeTable/calendar";
import SchedualClasses from "../../../components/Admin/TimeTable/SchedualClasses";
import { useLocation } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { getAllClasses } from "../../../api/ForAllAPIs";
import { useTeacher } from "../../../utils/TeacherProvider";
import { useSidebar } from "../../../context/SidebarContext";

const TimeTable = () => {

  const location = useLocation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const pageName = pathSegments[pathSegments.length - 1] || "Home";


  console.log(pageName, "page name hhhhhhh");


  const { teacherID, updateTeacherID } = useTeacher();
  const { isSidebarOpen } = useSidebar(); // new

  const { isBlurred } = useBlur();

  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ["timetable", teacherID],
    queryFn: () => getAllClasses(teacherID),
    enabled: !!teacherID, // Ensure query is only enabled if teacherID exists
  });

  if (!isPending) {
    console.log("classea in admin are : ", data);
  }


  useEffect(() => {
    if (!teacherID) {
      // If teacherID is null, fetch all classes
      refetch();
    }
  }, [teacherID, refetch]);

  const [isChatOpen, setIsChatOpen] = useState(false); // new state for chat

  const aiBtn = import.meta.env.VITE_BETA_VER === "true";





  return (
    isPending || isRefetching ? <div className="flex flex-1 justify-start items-center" > <Loader /> </div> :
      <>
        <div className="flex flex-1 bg-[#f9f9f9]/50 font-poppins">
          <div className="flex flex-1 gap-4">
            {/* <div className={`flex flex-col flex-1 px-2 sm:px-5 lg:ml-72 h-screen max-h-screen overflow-hidden`}> */}
            <div className={`flex flex-col flex-1 px-2 sm:px-5 lg:ml-80 min-h-full pb-10`}>
              <div className="flex h-16 sm:h-20 md:px-14 lg:px-0">
                <Navbar heading={"Time Table"} />
              </div>
              <div
                className={`flex flex-col   md:px-10 lg:px-0 w-full gap-3 sm:gap-5 pt-6 pb-2 flex-1 ${isBlurred ? "blur" : ""
                  }`}
              >
                <div className={`flex flex-1 gap-2 sm:gap-4 bg-white w-full relative ${isSidebarOpen ? "-z-10" : "z-auto"} lg:z-auto`}>
                  <div className="border p-2 sm:p-3 lg:px-2 lg:py-5  border-grey/30 rounded-md shadow-lg w-full min-h-[550px]">
                    <MyCalendar data={data} isPending={isPending} refetch={refetch} isRefetching={isRefetching} />
                  </div>
                  {/* <div className="flex-1 p-5 border rounded-md shadow-lg border-grey/30">
                    <SchedualClasses refetch={refetch} data={data} isPending={isPending} />
                  </div> */}
                </div>
              </div>



              {/* Fixed AI Bot Button */}
              {aiBtn && (
                <div
                  className="fixed bottom-6 right-6 bg-grey rounded-full w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer hover:bg-gray-400 transition-all duration-300 animate-bounce"
                  onClick={() => setIsChatOpen(prev => !prev)}
                >
                  <span className="text-white font-bold">AI</span>
                </div>
              )}



              {/* Popup Chat Box */}
              {isChatOpen && (
                <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
                  <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
                    <span>AI Chat</span>
                    <button onClick={() => setIsChatOpen(false)} className="font-bold">X</button>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto">
                    {/* Show Welcome message + Page Name */}
                    <p className="text-gray-700 mb-2">
                      Welcome! You are currently on the page:
                      <span className="font-semibold text-blue-600 capitalize"> {pageName}</span>
                    </p>
                    <p className="text-gray-600">How can I assist you today?</p>
                  </div>
                  <div className="p-2 border-t flex">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      className="flex-1 p-2 rounded-l-lg border border-gray-300 focus:outline-none"
                    />
                    <button className="bg-[#6A00FF] text-white p-2 rounded-r-lg hover:bg-[#6A00FF]">
                      Send
                    </button>
                  </div>
                </div>
              )}



            </div>
          </div>
        </div>
      </>
  );
};

export default TimeTable;

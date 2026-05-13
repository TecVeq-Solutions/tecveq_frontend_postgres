import React from "react";
import Navbar from "../../../components/Teacher/Navbar";
import MyCalendar from "../../../components/Teacher/TimeTable/calendar";
import SchedualClasses from "../../../components/Teacher/TimeTable/SchedualClasses";

import { useQuery } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { getAllClasses } from "../../../api/ForAllAPIs";
import { useTeacher } from "../../../utils/TeacherProvider";
import { useSidebar } from "../../../context/SidebarContext";
import { IoTime } from "react-icons/io5";
import TeacherTimeTableMobile from "../../../components/Teacher/TimeTable/TeacherTimeTableMobile";


const TimeTable = () => {

  const { isBlurred } = useBlur();
  const { isSidebarOpen } = useSidebar(); // new

  const { teacherID, updateTeacherID } = useTeacher();

  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ["timetable", teacherID], // Use teacherID in query key to avoid unnecessary refetches
    queryFn: () => getAllClasses(teacherID), // Fetch classes based on teacherID
    enabled: teacherID !== undefined, // Only fetch if teacherID is neither undefined nor null
  });



  return (
    <div className="flex flex-1 min-h-screen bg-[#f9f9f9]/50 font-poppins">
      <div className="flex flex-1 gap-4">
        <div className={`flex flex-col flex-1 lg:pl-1 lg:pr-4 ml-0 lg:ml-72 xl:ml-80`}>
          <header className="sticky top-0 z-[90] bg-[#f9f9f9]/90 backdrop-blur-sm px-0 flex h-16 sm:h-20 md:px-14 lg:px-0">
            <Navbar heading={"Time Table"} />
          </header>
          <div
            className={`flex px-0 sm:px-4  flex-col md:px-10 lg:px-0 w-full   gap-5 py-2 ${isBlurred ? "blur" : ""
              }`}
          >
            <div className="hidden lg:block w-full">
              <div className={`flex flex-col gap-y-6 gap-1 bg-white w-full relative ${isSidebarOpen ? "-z-10" : "z-auto"}`}>
                <div className={` border px-4  py-3 border-grey/30 rounded-md shadow-lg w-full min-h-[550px]`}>
                  <MyCalendar
                    data={data}
                    isPending={isPending}
                    refetch={refetch}
                    isRefetching={isRefetching}
                  />
                </div>
              </div>
            </div>

            {/* Mobile/Tablet view */}
            <div className="lg:hidden w-full">
              <TeacherTimeTableMobile
                data={data}
                isPending={isPending}
                refetch={refetch}
                isRefetching={isRefetching}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTable;

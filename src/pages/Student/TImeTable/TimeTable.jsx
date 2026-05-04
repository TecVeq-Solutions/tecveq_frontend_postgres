import React from "react";
import MyCalendar from "./components/calendar/calendar";
import Navbar from "../../../components/Student/Dashboard/Navbar";

import { useBlur } from "../../../context/BlurContext";
import { useSidebar } from "../../../context/SidebarContext";
import { IoTime } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { getAllClasses } from "../../../api/ForAllAPIs";
import StudentTimeTableMobile from "../../../components/Student/TimeTable/StudentTimeTableMobile";
import { useParent } from "../../../context/ParentContext";

const TimeTable = () => {

  const { isBlurred } = useBlur();
  const { isSidebarOpen } = useSidebar(); // new
  const parentContext = useParent();

  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ["classe", parentContext?.selectedChild?.id],
    queryFn: () => getAllClasses(parentContext?.parentLogedIn ? { studentID: parentContext?.selectedChild?.id } : undefined),
    enabled: parentContext?.parentLogedIn ? !!parentContext?.selectedChild?.id : true,
  });

  return (
    <>
      <div className="flex flex-1 min-h-screen  bg-[#f9f9f9]/50 font-poppins">
        <div className="flex flex-1 gap-4">
          <div className={`flex flex-col flex-1 px-2 sm:px-5 ml-0 lg:ml-72 xl:ml-80`}>
            <div className="flex h-16 md:px-14 lg:px-0">
              <Navbar heading={"Time Table"} />
            </div>
            <div className={`flex flex-col md:px-10 lg:px-0 w-full gap-3 sm:gap-5 pt-6 pb-2 flex-1 ${isBlurred ? "blur" : ""}`} >
              <div className="hidden lg:block w-full">
                <div className={`flex flex-1 gap-2 sm:gap-4 bg-white w-full relative ${isSidebarOpen ? "-z-10" : "z-auto"} lg:z-auto`}>
                  <div className="border p-2 sm:p-3 lg:px-2 lg:py-5 border-grey/30 rounded-md shadow-lg w-full min-h-[550px]">
                    <MyCalendar
                      data={data}
                      isPending={isPending}
                      refetch={refetch}
                      isRefetching={isRefetching}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile/Tablet View */}
              <div className="lg:hidden w-full">
                <StudentTimeTableMobile
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
    </>
  );
};

export default TimeTable;


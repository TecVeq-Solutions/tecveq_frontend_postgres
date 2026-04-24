import React, { useEffect, useState } from "react";

import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import TotalUsers from "../../../components/Admin/Dashboard/TotalUsers";
import StudentsCard from "../../../components/Admin/Dashboard/StudentsCard";
import SystemOverview from "../../../components/Admin/Dashboard/SystemOverview";

import { useBlur } from "../../../context/BlurContext";
import { useAdmin } from "../../../context/AdminContext";
import { useSidebar } from "../../../context/SidebarContext";


const Dashboard = () => {

  const { isBlurred } = useBlur();
  const { isSidebarOpen } = useSidebar(); // new
  const { adminUsersData, adminUsersDataPending } = useAdmin();

  const [students, setStudents] = useState({
    allEnrolled: adminUsersData.allStudents.filter((item) => item.isAccepted == true),
    allPending: adminUsersData.allStudents.filter((item) => item.isAccepted == false),
    allInactive: adminUsersData.allStudents.filter((item) => item.isBlocked == true)
  })

  useEffect(() => {
    setStudents({
      allEnrolled: adminUsersData.allStudents.filter((item) => item.isAccepted == true),
      allPending: adminUsersData.allStudents.filter((item) => item.isAccepted == false),
      allInactive: adminUsersData.allStudents.filter((item) => item.isBlocked == true)
    })
  }, [adminUsersData])


  // const [isConnected, setIsConnected] = useState(socket.connected);
  // const [fooEvents, setFooEvents] = useState([]);

  // useEffect(() => {
  //   function onConnect() {
  //     console.log("socket connection func")
  //     setIsConnected(true);
  //   }

  //   function sendData() {

  //     let parser = new UAParser();
  //     let parserResults = parser.getResult();
  //     console.log("results are : ", parserResults);
  //     let dataBody = {
  //       userID: userData.id,
  //       browser: parserResults.browser.name,
  //       device: parserResults?.device.type || ""
  //       // device: parserResults?.os.name
  //     }

  //     socket.emit("login", dataBody);

  //     return parserResults;

  //   }


  //   function onDisconnect() {
  //     setIsConnected(false);
  //   }

  //   function onFooEvent(value) {
  //     setFooEvents(previous => [...previous, value]);
  //   }

  //   socket.on('connect', onConnect);
  //   socket.on('disconnect', onDisconnect);
  //   socket.on('foo', onFooEvent);
  //   sendData()


  //   return () => {
  //     socket.off('connect', onConnect);
  //     socket.off('disconnect', onDisconnect);
  //     socket.off('foo', onFooEvent);
  //   };
  // }, []);

  return (
    adminUsersDataPending ? <div className="flex flex-1"> <Loader /> </div> :
      <>
        <div className="flex flex-1 bg-[#f9f9f9]/50 font-poppins overflow-x-hidden w-full">
          <div className="flex flex-1 gap-4 w-full">
            <div className={`flex flex-col flex-1 px-3 sm:px-5 ml-0 lg:ml-80 min-h-full min-w-0`}>
              <div className="flex min-h-20 md:px-14 lg:pt-3 lg:px-0">
                <Navbar heading={"Admin Dashboard"} />
              </div>
              <div
                className={`flex flex-col  md:px-10  sm:py-3 lg:px-0 lg:mt-0 sm:mt-16 sm:mt-1 md:mt-1 lg:flex-row flex-1 gap-5 my-2  ${isBlurred ? "blur" : ""
                  } ${isSidebarOpen ? "-z-10" : "z-auto"} lg:z-auto`}
              >


                {/* grap................................................................ */}
                <div className="flex flex-[5] flex-col gap-3 min-w-0">
                  <p className="text-xl font-semibold">System Overview</p>
                  <SystemOverview />
                </div>

                {/* total user */}
                <div className="flex flex-[2] flex-col gap-4 min-w-0">
                  <div className="flex flex-col gap-1 px-1">
                    <p className="text-xl font-semibold text-slate-800 tracking-tight">Students Statistics</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em]">Enrollment Metrics</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">

                    {/* Total Enrolled - Green Theme */}
                    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden translate-z-0">
                      {/* Left Accent Strip */}
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 z-20" />
                      <div className="p-1"> {/* Padding to prevent content touching the strip */}
                        <StudentsCard
                          title={"Total Enrolled"}
                          value={students?.allEnrolled?.length}
                        />
                      </div>
                    </div>

                    {/* Total Pending - Amber Theme */}
                    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden translate-z-0">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 z-20" />
                      <div className="p-1">
                        <StudentsCard
                          title={"Total Pending"}
                          value={students?.allPending?.length}
                        />
                      </div>
                    </div>

                    {/* Total Inactive - Rose Theme */}
                    <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden translate-z-0">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 z-20" />
                      <div className="p-1">
                        <StudentsCard
                          title={"Total Inactive"}
                          value={students?.allInactive?.length}
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* ...... */}
              </div>
              <div
                className={`flex flex-col md:px-10 lg:px-0 lg:flex-row flex-1 gap-5 py-6 ${isBlurred ? "blur" : ""
                  }`}
              >
                <div className={`flex flex-1 ${isSidebarOpen ? "-z-10" : "z-auto"} lg:z-auto`}>
                  <TotalUsers />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
  );
};

export default Dashboard;

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
        <div className="flex flex-1 bg-[#f9f9f9]/50 font-poppins">
          <div className="flex flex-1 gap-4">
            <div className={`flex flex-col flex-1 px-5 lg:ml-72 min-h-full`}>
              <div className="flex min-h-20 md:px-14 lg:px-0">
                <Navbar heading={"Admin Dashboard"} />
              </div>
              <div
                className={`flex flex-col md:px-10 lg:px-0 lg:mt-0 mt-16 sm:mt-1 md:mt-1 lg:flex-row flex-1 gap-5 my-2  ${isBlurred ? "blur" : ""
                  } ${isSidebarOpen ? "-z-10" : "z-auto"} lg:z-auto`}
              >
                <div className="flex flex-[5] flex-col gap-3 ">
                  <p className="text-xl font-semibold">System Overview</p>
                  <SystemOverview />
                </div>
                <div className="flex flex-[2] flex-col gap-2">
                  <p className="text-xl font-semibold">Students</p>
                  <StudentsCard title={"Total Enrolled"} value={students?.allEnrolled?.length} />
                  <StudentsCard title={"Total Pending"} value={students?.allPending?.length} />
                  <StudentsCard title={"Total Inactive"} value={students?.allInactive?.length} />
                </div>
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

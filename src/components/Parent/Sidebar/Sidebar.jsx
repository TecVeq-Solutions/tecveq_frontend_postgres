import React, { useState } from "react";
import { IoIosLogOut } from "react-icons/io";
import Custombutton from "./Custombutton";
import logo from "../../../assets/logo.png";
import webinar from "../../../assets/webinar.png";
import meet from "../../../assets/meet.png";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utils/Loader";
import { logout } from "../../../api/User/UserApi";
import { IoClose } from "react-icons/io5";
import { useSidebar } from "../../../context/SidebarContext";
import { useUser } from "../../../context/UserContext";
import { useGetSettings } from "../../../api/Admin/SettingsApi";


const Sidebar = () => {
  const navigate = useNavigate();
  const { userData } = useUser();
  // Parent has 'students' relation — first child
  const childId = userData?.students?.[0]?.id || userData?.id;
  const [quizes, setQuizes] = useState(false);
  const [timetable, setTimetable] = useState(false);
  const [reports, setReports] = useState(false);
  const [assignments, setAssignments] = useState(false);
  const [fees, setFees] = useState(false);
  const [dashboard, setDashboard] = useState(true);
  const [loading, setLoading] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();
  const { settings } = useGetSettings();

  const isUniversity = settings?.institutionType === 'university';

  const toggleSidebar = () => {
    console.log("here");
    setIsopen(!isopen);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleDashboardClick = async () => {
    setDashboard(true);
    setQuizes(false);
    setReports(false);
    setAssignments(false);
    setFees(false);
    setTimetable(false);
    setIsSidebarOpen(false);
    setIsopen(false);
    navigate("/parent/dashboard");
  };

  const handleReportsClick = async () => {
    setDashboard(false);
    setQuizes(false);
    setReports(true);
    setAssignments(false);
    setFees(false);
    setTimetable(false);
    setIsSidebarOpen(false);
    setIsopen(false);
    navigate("/parent/reports");
  };

  const handleQuizzesClick = async () => {
    setDashboard(false);
    setQuizes(true);
    setReports(false);
    setAssignments(false);
    setFees(false);
    setTimetable(false);
    setIsSidebarOpen(false);
    setIsopen(false);
    navigate("/parent/quizzes");
  };

  const handleAssignmentsClick = async () => {
    setDashboard(false);
    setQuizes(false);
    setReports(false);
    setAssignments(true);
    setFees(false);
    setTimetable(false);
    setIsSidebarOpen(false);
    setIsopen(false);
    navigate("/parent/assignments");
  };
  
  const handleFeesClick = async () => {
    setDashboard(false);
    setQuizes(false);
    setReports(false);
    setAssignments(false);
    setFees(true);
    setTimetable(false);
    setIsSidebarOpen(false);
    setIsopen(false);
    navigate("/parent/fees");
  };


  const handleLogoutClick = async () => {
    setLoading(true);
    localStorage.clear();
    const response = await logout();
    if (response == "error") {
      console.log("error loggin out")
      navigate("/")
    } else {
      localStorage.clear()
      navigate("/")
    }
    setLoading(false);
  };

  const Menubar = () => (
    <div
      className={`sm:w-72 w-full sm:h-screen h-full shadow-lg bg-[#0B1053]   px-4 md:px-8 flex flex-col justify-between z-50 relative`}
    >
      <div>
        <div className="text-white flex justify-end items-center ">
          <IoClose className="w-6 h-6 mt-3 block lg:hidden hover:scale-105 cursor-pointer" onClick={() => {
            setIsopen(false)
            setIsSidebarOpen(false)
          }} />
        </div>

        <div className="flex justify-start">
          <img className="sm:w-32 sm:h-10 w-5/12 h-5/12 mb-4 sm:mt-6" src={logo} alt="logo-TCA" />
        </div>
        <div className="flex flex-col gap-1 py-2 border-b border-b-black">
          <Custombutton
            icon={"home"}
            title={"Dashboard"}
            active={dashboard}
            onpress={handleDashboardClick}
          />
          <Custombutton
            icon={"graph"}
            title={"Reports"}
            active={reports}
            onpress={handleReportsClick}
          />
          <Custombutton
            icon={"book"}
            title={"Assignments"}
            active={assignments}
            onpress={handleAssignmentsClick}
          />
          <Custombutton
            icon={"quiz"}
            title={"Quizzes"}
            active={quizes}
            onpress={handleQuizzesClick}
          />
          <Custombutton
            icon={"levels"}
            title={"Fees"}
            active={fees}
            onpress={handleFeesClick}
          />
          <Custombutton
            icon={"graph"}
            title={"Report Card"}
            active={false}
            onpress={() => {
              setIsSidebarOpen(false);
              setIsopen(false);
              navigate(`/parent/report-card/${childId}`);
            }}
          />

        </div>
        {isUniversity && (
          <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
             <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest leading-relaxed">
               University Mode: Parent access is currently restricted. Please contact the administrator.
             </p>
          </div>
        )}
        {loading && <div className="flex flex-1"> <Loader /> </div>}
        {!loading &&
          <div
            onClick={handleLogoutClick}
            className={`flex items-center gap-4 px-5 py-3 text-lg rounded-md cursor-pointer text-white`}
          >
            <IoIosLogOut />
            <p>Logout</p>
          </div>
        }
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      <div
        className="px-3 py-3 flex justify-end items-center cursor-pointer lg:hidden h-20"
        onClick={toggleSidebar}
      >

        <div className="flex justify-center items-center bg-[#0B1053] border-2 rounded-md w-8 h-8">
          <div className="flex flex-col gap-2 py-2">
            <p className="w-5 bg-white h-0.5"></p>
            <p className="w-5 bg-white h-0.5"></p>
            <p className="w-5 bg-white h-0.5"></p>
          </div>
        </div>
      </div>
      <div className={`h-full lg:hidden ${isSidebarOpen ? "block" : "hidden"} fixed z-50`}>
        <Menubar />
      </div>
      <div className="max-lg:hidden">
        <Menubar />
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useEffect, useState } from "react";
import { IoIosLogOut } from "react-icons/io";
import Custombutton from "./Custombutton";
import logo from "../../../assets/logo.png";
import webinar from "../../../assets/webinar.png";
import meet from "../../../assets/meet.png";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../api/User/UserApi";
import { useStudent } from "../../../context/StudentContext";
import Loader from "../../../utils/Loader";
import { useSidebar } from "../../../context/SidebarContext";
import { IoClose } from "react-icons/io5";


const Sidebar = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("activeTab") || "dashboard");

  const menuItems = [
    { key: "dashboard", icon: "home", title: "Dashboard", path: "/student/dashboard" },
    { key: "assignments", icon: "book", title: "Assignments", path: "/assignments" },
    { key: "quizzes", icon: "quiz", title: "Quizzes", path: "/quizzes" },
    { key: "reports", icon: "graph", title: "Reports", path: "/reports" },
    { key: "timetable", icon: "time", title: "Time Table", path: "/timetable" },
    { key: "leaves", icon: "time", title: "Leaves", path: "/leaves" },
    { key: "reportCard", icon: "quiz", title: "Report Card", path: "/report-card" },


  ];

  const handleMenuClick = (key, path) => {
    setActiveTab(key);
    localStorage.setItem("activeTab", key);
    setIsSidebarOpen(false);
    setIsopen(false);
    navigate(path);
  };

  const { meetingStart, setStudentLogedIn, setAllAnnouncements, setAllQuizes, setAllClasses, setAllAssignments } = useStudent();

  const handleLogoutClick = async () => {
    setLoading(true);
    localStorage.clear();

    setAllQuizes([]);
    setAllClasses([]);
    setAllAssignments([]);
    setStudentLogedIn(false);
    setAllAnnouncements([]);

    setIsSidebarOpen(false);
    setIsopen(false);
    const response = await logout();
    navigate("/");
    setLoading(false);
  };

  const toggleSidebar = () => setIsopen(!isopen);

  const Menubar = () => (
    <div className="sm:w-72 w-75 h-lvh shadow-lg lg:mt-3 bg-[#0B1053] px-4 flex flex-col justify-between z-50">
      <div className="py-5">
        <div className="text-white flex justify-end items-center ">
          <IoClose className="w-6 h-6 block sm:hidden hover:scale-105 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
        <div className="flex justify-start">
          <img className="w-5/12 h-5/12 mb-4" src={logo} alt="logo-TCA" />
        </div>
        <div className="flex flex-col gap-1 py-2 border-b border-b-black">
          {menuItems.map(({ key, icon, title, path }) => (
            <Custombutton key={key} icon={icon} title={title} active={activeTab === key} onpress={() => handleMenuClick(key, path)} />
          ))}
        </div>
        {loading ? <Loader /> : (
          <div onClick={handleLogoutClick} className="flex items-center gap-4 px-5 py-3 text-lg rounded-md cursor-pointer text-white">
            <IoIosLogOut />
            <p>Logout</p>
          </div>
        )}
      </div>
      {meetingStart?.start && (
        <div className="flex flex-col gap-1 h-1/3">
          <div className="flex justify-center mb-4">
            <img src={webinar} alt="sidebar images" className="w-2/3" />
          </div>
          <div className="flex flex-col gap-3 text-xs text-center text-[#0B1053]">
            <p>Your <span className="font-bold">{meetingStart?.event?.subjectID?.name}</span> class is in progress.</p>
            <p>You can instantly join from here.</p>
            <div className="flex justify-center">
              <a href={meetingStart?.event.meetLink} target="_blank" rel="noopener noreferrer">
                <div className="flex items-center justify-center w-40 py-2 text-center rounded-md cursor-pointer bg-[#0B1053]">
                  <img src={meet} alt="meet png" className="w-1/6" />
                  <p className="text-sm text-white">Join Meeting</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="px-3 cursor-pointer flex items-center lg:hidden h-20" onClick={() => {
        toggleSidebar()
        setIsSidebarOpen(!isSidebarOpen)
      }}>
        <div className="flex justify-center bg-[#0B1053] border-2 rounded-md w-9">
          <div className="flex flex-col gap-2 py-2">
            <p className="w-6 bg-white h-0.5"></p>
            <p className="w-6 bg-white h-0.5"></p>
            <p className="w-6 bg-white h-0.5"></p>
          </div>
        </div>
      </div>
      <div className={`lg:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full w-fit" onClick={(e) => e.stopPropagation()}>
          <Menubar />
        </div>
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 -z-10" onClick={() => setIsSidebarOpen(false)}></div>
        )}
      </div>
      <div className="max-lg:hidden">
        <Menubar />
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Custombutton from "./Custombutton";
import logo from "../../../assets/logo.png";
import { IoIosLogOut } from "react-icons/io";
import { userLogout } from "../../../api/ForAllAPIs";
import Loader from "../../../utils/Loader";
import { useTeacher } from "../../../context/TeacherContext";
import { useSidebar } from "../../../context/SidebarContext";
import { IoClose } from "react-icons/io5";

const Sidebar = () => {
  const navigate = useNavigate();
  const { setTeacherLogedIn } = useTeacher();
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState("home"); // Default active button

  // Load active button from localStorage on mount
  useEffect(() => {
    const storedActiveButton = localStorage.getItem("activeButton");
    if (storedActiveButton) {
      setActiveButton(storedActiveButton);
    }
  }, []);

  const handleButtonClick = (buttonKey, route) => {
    setActiveButton(buttonKey);
    localStorage.setItem("activeButton", buttonKey);
    setIsSidebarOpen(false);
    setIsopen(false);
    navigate(route);
  };

  const handleLogoutClick = async () => {
    setLoading(true);
    localStorage.clear();
    setTeacherLogedIn(false);
    setIsSidebarOpen(false);
    setIsopen(false);
    await userLogout();
    navigate("/");
    setLoading(false);
  };

  const menuItems = [
    { key: "home", title: "Dashboard", icon: "home", route: "/teacher/dashboard" },
    { key: "time", title: "Time Table", icon: "time", route: "/teacher/timetable" },
    { key: "graph", title: "Student Reports", icon: "graph", route: "/teacher/reports" },
    { key: "book", title: "Assignments", icon: "book", route: "/teacher/assignments" },
    { key: "quiz", title: "Quizzes", icon: "quiz", route: "/teacher/quizzes" },
    { key: "attendence", title: "Attendance", icon: "quiz", route: "/teacher/attendence" },
    { key: "classroom", title: "Classroom", icon: "quiz", route: "/teacher/classroom" },
    { key: "exams", title: "Examinations", icon: "graph", route: "/teacher/exams" },
    { key: "leaves", title: "Leave Requests", icon: "announcement", route: "/teacher/leave-requests" },
  ];

  const Menubar = () => (
    <div className="w-full h-full lg:w-72 min-h-screen  shadow-lg px-4 sm:px-8 bg-[#0B1053] text-white">
      <div className="text-white flex justify-end items-center ">
        <IoClose className="w-6 h-6 mt-4 block sm:hidden hover:scale-105 cursor-pointer" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      </div>
      <div className=" py-5 z-50">
        <div className="flex justify-start">
          <img className="w-25 h-8 mb-4" src={logo} alt="logo-TCA" />
        </div>
        <div className="flex flex-col h-full gap-1 py-2 border-b border-b-black">
          {menuItems.map(({ key, title, icon, route }) => (
            <Custombutton
              key={key}
              icon={icon}
              title={title}
              active={activeButton === key}
              onpress={() => handleButtonClick(key, route)}
            />
          ))}
        </div>
        {loading ? (
          <div className="flex"><Loader /></div>
        ) : (
          <div onClick={handleLogoutClick} className="flex items-center gap-4 px-5 py-3 text-lg rounded-md cursor-pointer text-white">
            <IoIosLogOut />
            <p>Logout</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      <div className="px-3 py-3 cursor-pointer lg:hidden h-20 flex justify-center items-center" onClick={() => {
        setIsopen(!isopen)
        setIsSidebarOpen(!isSidebarOpen)
      }
      }>
        <div className="flex justify-center bg-[#0B1053] border-2 rounded-md w-9 h-fit z-50">
          <div className="flex flex-col gap-2 py-2">
            <p className="w-6 bg-white h-0.5"></p>
            <p className="w-6 bg-white h-0.5"></p>
            <p className="w-6 bg-white h-0.5"></p>
          </div>
        </div>
      </div>
      <div className={`lg:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full" onClick={(e) => e.stopPropagation()}>
          <Menubar />
        </div>
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 -z-10" onClick={() => setIsSidebarOpen(false)}></div>
        )}
      </div>
      <div className="max-lg:hidden">
        <Menubar />
      </div>
    </div >
  );
};

export default Sidebar;

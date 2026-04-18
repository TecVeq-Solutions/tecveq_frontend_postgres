import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Custombutton from "./Custombutton";
import logo from "../../../assets/logo.png";
import { IoIosLogOut } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { userLogout } from "../../../api/ForAllAPIs";
import Loader from "../../../utils/Loader";
import { useTeacher } from "../../../context/TeacherContext";
import { useSidebar } from "../../../context/SidebarContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { setTeacherLogedIn } = useTeacher();
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState("home");

  useEffect(() => {
    const stored = localStorage.getItem("activeButton");
    if (stored) setActiveButton(stored);
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

  const mainItems = [
    { key: "home",      title: "Dashboard",       icon: "home",      route: "/teacher/dashboard"  },
    { key: "time",      title: "Time Table",       icon: "time",      route: "/teacher/timetable"  },
    { key: "graph",     title: "Student Reports",  icon: "graph",     route: "/teacher/reports"    },
  ];

  const academicItems = [
    { key: "book",       title: "Assignments", icon: "book",       route: "/teacher/assignments" },
    { key: "quiz",       title: "Quizzes",     icon: "quiz",       route: "/teacher/quizzes"     },
    { key: "attendence", title: "Attendance",  icon: "attendence", route: "/teacher/attendence"  },
    { key: "classroom",  title: "Classroom",   icon: "classroom",  route: "/teacher/classroom"   },
  ];

  const Menubar = () => (
    <div className="flex flex-col w-full lg:w-64 h-screen bg-[#0B1053] text-white shadow-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5 border-b border-white/[0.08]">
        <div>
          <img className="h-7 w-auto" src={logo} alt="TCA Logo" />
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Teacher Portal</p>
        </div>
        <IoClose
          className="w-5 h-5 block sm:hidden text-white/50 hover:text-white cursor-pointer"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">

        <p className="text-[10px] text-white/30 uppercase tracking-widest px-3 pb-2">Main</p>
        {mainItems.map(({ key, title, icon, route }) => (
          <Custombutton
            key={key}
            icon={icon}
            title={title}
            active={activeButton === key}
            onpress={() => handleButtonClick(key, route)}
          />
        ))}

        <p className="text-[10px] text-white/30 uppercase tracking-widest px-3 pt-4 pb-2">Academics</p>
        {academicItems.map(({ key, title, icon, route }) => (
          <Custombutton
            key={key}
            icon={icon}
            title={title}
            active={activeButton === key}
            onpress={() => handleButtonClick(key, route)}
          />
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="px-3 py-3 border-t border-white/[0.08]">
        {loading ? (
          <div className="flex justify-center py-2"><Loader /></div>
        ) : (
          <div
            onClick={handleLogoutClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-150 group"
          >
            <IoIosLogOut size={17} className="flex-shrink-0" />
            <span className="text-sm">Logout</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Mobile hamburger */}
      <div
        className="px-3 py-3 cursor-pointer lg:hidden h-16 flex items-center"
        onClick={() => { setIsopen(!isopen); setIsSidebarOpen(!isSidebarOpen); }}
      >
        <div className="flex flex-col gap-1.5 bg-[#0B1053] border border-white/10 rounded-lg p-2.5">
          <span className="w-5 bg-white h-0.5 rounded-full block" />
          <span className="w-5 bg-white h-0.5 rounded-full block" />
          <span className="w-3.5 bg-white h-0.5 rounded-full block" />
        </div>
      </div>

      {/* Mobile overlay */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full w-fit" onClick={(e) => e.stopPropagation()}>
          <Menubar />
        </div>
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>

      {/* Desktop */}
      <div className="max-lg:hidden">
        <Menubar />
      </div>
    </div>
  );
};

export default Sidebar;
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Custombutton from "./Custombutton";
import logo from "../../../assets/logo.png";
import profile from "../../../assets/images/profilepic.png";
import { IoIosLogOut } from "react-icons/io";
import { IoClose, IoPowerOutline } from "react-icons/io5";
import { FaChevronDown, FaChevronRight } from "react-icons/fa6";
import { GoPerson } from "react-icons/go";
import { LuSettings } from "react-icons/lu";
import { userLogout } from "../../../api/ForAllAPIs";
import Loader from "../../../utils/Loader";
import { useTeacher } from "../../../context/TeacherContext";
import { useSidebar } from "../../../context/SidebarContext";
import { useUser } from "../../../context/UserContext";
import { useBlur } from "../../../context/BlurContext";
import ProfileDetails from "../ProfileDetails";
import useClickOutside from "../../../hooks/useClickOutlise";

const Sidebar = () => {
  const navigate = useNavigate();
  const { setTeacherLogedIn } = useTeacher();
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState("home");
  const [isProfileMenu, setIsProfileMenu] = useState(false);
  const [isProfileDetails, setIsProfileDetails] = useState(false);
  const { toggleBlur } = useBlur();
  const mobileProfileMenuRef = useRef(null);
  const desktopProfileMenuRef = useRef(null);
  useClickOutside([mobileProfileMenuRef, desktopProfileMenuRef], () => setIsProfileMenu(false));
  const { userData } = useUser();

  useEffect(() => {
    const stored = localStorage.getItem("activeButton") || localStorage.getItem("activeTab");
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

  const toggleProfielMenu = () => {
    setIsProfileMenu(!isProfileMenu);
  };

  const toggleProfileDetails = () => {
    toggleBlur();
    setIsProfileDetails(!isProfileDetails);
  };

  const onProfileClick = () => {
    toggleProfielMenu();
    toggleProfileDetails();
  };

  const onSettingsClick = () => {
    handleButtonClick("settings", "/teacher/settings");
    setIsProfileMenu(false);
  };

  const onLogoutClick = async () => {
    handleLogoutClick();
  };

  const menuGroups = [
    {
      label: "Main",
      items: [
        { key: "home", title: "Dashboard", icon: "home", route: "/teacher/dashboard" },
        { key: "time", title: "Time Table", icon: "time", route: "/teacher/timetable" },
        { key: "leaves", title: "My Leaves", icon: "calendar", route: "/teacher/leaves" },
        { key: "graph", title: "Student Reports", icon: "graph", route: "/teacher/reports" },
      ]
    },
    {
      label: "Academics",
      items: [
        { key: "book", title: "Assignments", icon: "book", route: "/teacher/assignments" },
        { key: "materials", title: "Learning Materials", icon: "book", route: "/teacher/materials" },
        { key: "quiz", title: "Quizzes", icon: "quiz", route: "/teacher/quizzes" },
        { key: "attendence", title: "Attendance", icon: "attendence", route: "/teacher/attendence" },
        { key: "attendence-report", title: "Attendance Report", icon: "attendence-report", route: "/teacher/attendence-report" },
        { key: "classroom", title: "Classroom", icon: "classroom", route: "/teacher/classroom" },
        { key: "student-leaves", title: "Student Leaves", icon: "calendar", route: "/teacher/student-leaves" },
      ]
    }
  ];

  const Menubar = ({ isMobile }) => (
    <div className="admin-sidebar flex flex-col w-full sm:w-80 lg:w-72  xl:w-80 h-screen bg-[#0B1053] text-white shadow-xl">
      {/* Header */}
      <div className=" flex items-center justify-between px-[16px] pt-6 pb-5 border-b 
       border-gray-200">
        <div className="w-full">
          <img className="h-full  w-full" src={logo} alt="TCA Logo" />
          {/* .......................  main teacher profile sidebar .............. */}
          <div className="relative mt-6 w-full" ref={isMobile ? mobileProfileMenuRef : desktopProfileMenuRef}>
            <div
              className="flex items-center w-full gap-3 p-2 bg-[#eef2f6] rounded-xl cursor-pointer shadow-sm  hover:bg-[#eef2f6] transition-colors duration-200"
              onClick={toggleProfielMenu}
            >
              <img
                src={userData?.profilePic || profile}
                alt="Profile"
                className="w-10 h-10  rounded-full object-cover bg-white"
              />
              <div className="flex flex-col">
                <p className="font-medium text-[#6A00FF]   text-[15px] leading-tight">{userData?.name || "Teacher Profile"}</p>
                <p className="text-[#6c757d] text-xs mt-0.5">Teacher</p>
              </div>
              {isProfileMenu ? (
                <FaChevronDown className="ml-auto text-[#6A00FF] text-xs mr-1" />
              ) : (
                <FaChevronRight className="ml-auto text-[#6A00FF] text-xs mr-1" />
              )}
            </div>
            {/* .................................................. */}
            {isProfileMenu && (
              <div className="absolute right-0 top-full mt-2 z-50 w-44 bg-white rounded-[1.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-2.5">
                <div className="flex flex-col gap-1">
                  <div
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer text-[#334155]  hover:text-black hover:bg-gray-50 rounded-lg hover:bg-[#F1F3F5] text-sm transition-colors"
                    onClick={onProfileClick}
                  >
                    <GoPerson className="text-lg" />
                    <p className="font-medium">My Profile</p>
                  </div>
                  <div
                    className="hidden flex items-center hover:bg-[#F1F3F5]  gap-3 px-3 py-2 cursor-pointer text-[#334155]  hover:text-black  rounded-lg text-sm transition-colors"
                    onClick={onSettingsClick}
                  >
                    <LuSettings className="text-lg" />
                    <p className="font-medium">Setting</p>
                  </div>

                  <div
                    className="flex items-center gap-3 px-3 py-2.5 mt-1 cursor-pointer text-[#334155] hover:bg-[#F1F3F5]  hover:text-black   rounded-xl text-sm transition-colors"
                    onClick={onLogoutClick}
                  >
                    <IoPowerOutline className="text-lg font-bold" />
                    <p className="font-medium">Log Out</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <IoClose
          className="w-5 h-5 block lg:hidden text-white/50 hover:text-white cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-1">
            <p className="text-[13px] text-white/100 uppercase tracking-widest px-3 mb-2">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(({ key, title, icon, route }) => (
                <Custombutton
                  key={key}
                  icon={icon}
                  title={title}
                  active={activeButton === key}
                  onpress={() => handleButtonClick(key, route)}
                />
              ))}
            </div>
          </div>
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
            <span className="text-sm">Sign Out</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">

      {/* Mobile overlay */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full w-fit" onClick={(e) => e.stopPropagation()}>
          <Menubar isMobile={true} />
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
        <Menubar isMobile={false} />
      </div>

      {isProfileDetails && <ProfileDetails onClose={toggleProfileDetails} />}
    </div>
  );
};

export default Sidebar;
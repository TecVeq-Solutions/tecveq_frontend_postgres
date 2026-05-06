import React, { useState } from "react";
import Notifications from "./Notifications";
import RecentMessages from "./Dashboard/RecentMessages";
import GlobalSearch from "../../commonComponents/GlobalSearch";

import { CiBellOn } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { IoMailOutline } from "react-icons/io5";
import { userLogout } from "../../api/ForAllAPIs";
import { useBlur } from "../../context/BlurContext";

import { useSidebar } from "../../context/SidebarContext";

const Navbar = ({ heading }) => {
  const [mail, setmail] = useState(false);
  const [bell, setBell] = useState(false);

  const { isBlurred, toggleBlur } = useBlur();
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();
  const navigate = useNavigate();

  const toggleMail = () => {
    setmail(!mail);
    setBell(false);
  };

  const togglebell = () => {
    setBell(!bell);
    setmail(false);
  };

  const onLogoutClick = async () => {
    localStorage.clear();
    navigate("/");
    await userLogout();
  };

  return (
    <nav className="w-full bg-white border-b border-gray-100 h-16 sm:h-20 flex items-center sticky top-0  px-0 sm:px-4 md:px-6">
      {/* Mobile Hamburger Trigger  z-[100]*/}
      <div
        className="absolute left-3 top-0 h-16 flex items-center lg:hidden z-50 cursor-pointer"
        onClick={() => {
          setIsopen(!isopen);
          setIsSidebarOpen(!isSidebarOpen);
        }}
      >
        <div className="flex flex-col gap-1.5 bg-[#0B1053] border border-white/10 rounded-lg p-2.5 shadow-sm active:scale-95 transition-transform">
          <span className="w-5 bg-white h-0.5 rounded-full block" />
          <span className="w-5 bg-white h-0.5 rounded-full block" />
          <span className="w-3.5 bg-white h-0.5 rounded-full block" />
        </div>
      </div>

      <div className={`flex items-center justify-between w-full ${isBlurred ? "blur-[2px]" : ""}`}>

        {/* Left: Heading */}
        <div className=" min-w-0 flex flex-col items-start justify-center pr-2">
          <h1 className="text-sm xs:text-base sm:text-lg md:text-2xl pl-14 sm:pl-10 font-bold text-[#1e293b] leading-tight truncate w-full">
            {heading ? heading : "Teacher Dashboard"}
          </h1>
        </div>

        {/* Center: Search (Desktop Only) */}
        <div className="hidden lg:block flex-1 max-w-md mx-8">
          <GlobalSearch desktopOnly={true} />
        </div>

        {/* Right Side: Icons */}
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-3 flex-shrink-0 pr-2 sm:pr-0">

          {/* Mobile Search */}
          <div className="lg:hidden">
            <GlobalSearch mobileOnly={true} />
          </div>

          {/* Mail Icon */}
          <button
            onClick={toggleMail}
            className={`p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl border transition-all duration-300
              ${mail
                ? "bg-[#0B1053] text-white border-[#0B1053]"
                : "bg-white border-gray-200 text-gray-500 shadow-sm hover:bg-gray-50"
              }`}
          >
            <IoMailOutline className="text-base sm:text-xl md:text-2xl" />
          </button>

          {/* Bell Icon */}
          <button
            onClick={togglebell}
            className={`p-1.5 sm:p-2 md:p-2.5 rounded-lg sm:rounded-xl border transition-all duration-300
              ${bell
                ? "bg-[#0B1053] text-white border-[#0B1053]"
                : "bg-white border-gray-200 text-gray-500 shadow-sm hover:bg-gray-50"
              }`}
          >
            <CiBellOn className="text-base sm:text-xl md:text-2xl" />
          </button>
        </div>
      </div>

      {/* Dropdowns */}
      {bell && (
        <Notifications dashboard={true} onclose={togglebell} />
      )}

      {mail && (
        <RecentMessages dashboard={true} onclose={toggleMail} />
      )}
    </nav>
  );
};

export default Navbar;
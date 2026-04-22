import React, { useState } from "react";
import Notifications from "./Notifications";
import RecentMessages from "./Dashboard/RecentMessages";
import GlobalSearch from "../../commonComponents/GlobalSearch";

import { CiBellOn } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { IoMailOutline } from "react-icons/io5";
import { userLogout } from "../../api/ForAllAPIs";
import { useBlur } from "../../context/BlurContext";

const Navbar = ({ heading }) => {
  const [mail, setmail] = useState(false);
  const [bell, setBell] = useState(false);

  const { isBlurred, toggleBlur } = useBlur();
  const navigate = useNavigate();

  const toggleMail = () => {
    toggleBlur();
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
    <nav className="w-full bg-white border-b border-gray-100 h-20 flex items-center relative px-4 md:px-6">
      <div className={`flex items-center justify-between w-full ${isBlurred ? "blur-[2px]" : ""}`}>

        {/* Left: Heading - Yahan width fix ki hai taake mobile par gayab na ho */}
        <div className="flex-1 min-w-0 flex flex-col items-start justify-center pr-2">
          <h1 className="text-lg md:text-2xl font-bold text-[#1e293b] leading-tight truncate w-full">
            {heading ? heading : "Teacher Dashboard"}
          </h1>
        </div>

        {/* Center: Search (Desktop Only) */}
        <div className="hidden lg:block flex-1 max-w-md mx-8">
          <GlobalSearch desktopOnly={true} />
        </div>

        {/* Right Side: Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Mobile Search */}
          <div className="lg:hidden">
            <GlobalSearch mobileOnly={true} />
          </div>

          {/* Mail Icon */}
          <button
            onClick={toggleMail}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-300
              ${mail
                ? "bg-[#0B1053] text-white"
                : "bg-white border-gray-200 text-gray-500 shadow-sm hover:bg-gray-50"
              }`}
          >
            <IoMailOutline className="text-xl sm:text-2xl" />
          </button>

          {/* Bell Icon */}
          <button
            onClick={togglebell}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-300
              ${bell
                ? "bg-[#0B1053] text-white"
                : "bg-white border-gray-200 text-gray-500 shadow-sm hover:bg-gray-50"
              }`}
          >
            <CiBellOn className="text-xl sm:text-2xl" />
          </button>
        </div>
      </div>

      {/* Dropdowns Container */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
        <div className="relative w-full h-full max-w-7xl mx-auto px-4 md:px-6">
          {bell && (
            <div className="pointer-events-auto fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-28 sm:mt-20 w-auto sm:w-80 z-[100]">
              <Notifications dashboard={true} onclose={togglebell} />
            </div>
          )}

          {mail && (
            <div className="pointer-events-auto fixed inset-x-4 top-20 sm:absolute sm:inset-auto sm:right-48 sm:mt-20 w-auto sm:w-80 z-[100]">
              <RecentMessages dashboard={true} onclose={toggleMail} />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useEffect, useState } from "react";
import Notifications from "./Notifications";
import RecentMessages from "./RecentMessages";
import ProfileDetails from "./ProfileDetails";
import GlobalSearch from "../../../commonComponents/GlobalSearch";
import { toast } from "react-toastify";
import { CiBellOn } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { IoMailOutline } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { logout } from "../../../api/User/UserApi";
import { useBlur } from "../../../context/BlurContext";
import { useUser } from "../../../context/UserContext";
import { getAllNotifications } from "../../../api/ForAllAPIs";

const Navbar = ({ heading }) => {
  const [mail, setMail] = useState(false);
  const [bell, setBell] = useState(false);
  const [isProfileDetails, setIsProfileDetails] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const navigate = useNavigate();
  const { isBlurred, toggleBlur } = useBlur();
  const { userData } = useUser();

  const toggleMail = () => {
    setMail(!mail);
    setBell(false);
    toggleBlur();
  };

  const toggleBell = () => {
    setBell(!bell);
    setMail(false);
    setHasNewNotifications(false);
  };

  const toggleProfileDetails = () => {
    toggleBlur();
    setIsProfileDetails(!isProfileDetails);
  };

  const notifyQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: getAllNotifications,
    staleTime: 300000,
    enabled: true
  });

  const [allNotfications, setAllNotifications] = useState([]);

  useEffect(() => {
    if (notifyQuery.isSuccess) {
      setAllNotifications(notifyQuery.data);
      if (notifyQuery.data.length > 0) {
        setHasNewNotifications(true);
      }
    }
  }, [notifyQuery.isSuccess, notifyQuery.data]);

  return (
    <nav className="student-navbar w-full sm:bg-white border-b border-gray-100 h-20 flex items-center relative sm:px-4 md:px-6">
      <div className={`flex items-center justify-between w-full ${isBlurred ? "blur-[2px]" : ""}`}>
        {/* Left: Heading */}
        {/* Left: Heading/Greeting */}
        <div className="flex-shrink-0 flex flex-col items-start justify-center pl-2 sm:pl-0">
          <h1 className="text-lg md:text-2xl pl-10 sm:pl-0 font-bold text-[#1e293b] leading-tight truncate max-w-[130px] sm:max-w-none">
            {heading || "Teacher Dashboard"}
          </h1>
        </div>

        {/* Center: Search (Desktop Only) */}
        <div className="hidden lg:block flex-1 max-w-md mx-8">
          <GlobalSearch desktopOnly={true} />
        </div>

        {/* Right Side: Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Search */}
          <div className="lg:hidden">
            <GlobalSearch mobileOnly={true} />
          </div>

          {/* Mail Icon */}
          <div className="relative">
            <button
              onClick={toggleMail}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-300
                ${mail
                  ? "bg-[#0B1053] text-white"
                  : "bg-white border-gray-200 text-gray-400 shadow-sm hover:bg-gray-50"
                }`}
            >
              <IoMailOutline className="text-xl sm:text-2xl" />
            </button>
          </div>

          {/* Bell Icon */}
          <div className="relative">
            <button
              onClick={toggleBell}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-300
                ${bell
                  ? "bg-[#0B1053] text-white"
                  : "bg-white border-gray-200 text-gray-400 shadow-sm hover:bg-gray-50"
                }`}
            >
              <div className={hasNewNotifications ? "animate-bellShake" : ""}>
                <CiBellOn className="text-xl sm:text-2xl" />
              </div>
              {hasNewNotifications && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {mail && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-[250]">
          <RecentMessages dashboard={true} onclose={toggleMail} />
        </div>
      )}
      {bell && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-80 z-[250]">
          <Notifications data={allNotfications} dashboard={true} onclose={toggleBell} />
        </div>
      )}
      {isProfileDetails && <ProfileDetails onclose={toggleProfileDetails} />}
    </nav>
  );
};

export default Navbar;

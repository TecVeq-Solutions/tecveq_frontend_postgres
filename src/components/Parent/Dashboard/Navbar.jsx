import React, { useEffect, useState, useRef } from "react";
import Notifications from "./Notifications";
import ProfileDetails from "./ProfileDetails";
import RecentMessages from "./RecentMessages";
import GlobalSearch from "../../../commonComponents/GlobalSearch";
import { CiBellOn } from "react-icons/ci";
import { IoMailOutline } from "react-icons/io5";
import { useBlur } from "../../../context/BlurContext";
import { useUser } from "../../../context/UserContext";
import { useQuery } from "@tanstack/react-query";
import { getAllNotifications } from "../../../api/Admin/NotificationApi";

const Navbar = ({ heading }) => {
  const [mail, setMail] = useState(false);
  const [bell, setBell] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const { isBlurred, toggleBlur } = useBlur();
  const { userData } = useUser();

  const mailRef = useRef(null);
  const bellRef = useRef(null);
  const overlayRef = useRef(null);

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: getAllNotifications,
  });

  useEffect(() => {
    const storedNotificationId = localStorage.getItem("lastNotificationId");
    if (data && data.length > 0) {
      const latestNotificationId = data[0].id;
      if (storedNotificationId !== latestNotificationId) {
        setHasNewNotifications(true);
      }
    }
  }, [data]);

  // Outside click handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!document.body.contains(e.target)) return;

      const isInsideMailIcon = mailRef.current && mailRef.current.contains(e.target);
      const isInsideBellIcon = bellRef.current && bellRef.current.contains(e.target);
      const isInsideOverlay = overlayRef.current && overlayRef.current.contains(e.target);

      const isOutsideAll = !isInsideMailIcon && !isInsideBellIcon && !isInsideOverlay;

      if (mail && isOutsideAll) {
        setMail(false);
        if (isBlurred) toggleBlur();
      }
      if (bell && isOutsideAll) {
        setBell(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mail, bell, isBlurred]);

  const toggleMail = () => {
    const isOpening = !mail;
    setMail(isOpening);
    setBell(false);
    if (isOpening !== isBlurred) {
      toggleBlur();
    }
  };

  const closeMail = () => {
    setMail(false);
    if (isBlurred) toggleBlur();
  };

  const handleBellClick = () => {
    setBell(!bell);
    setMail(false);
    if (mail && isBlurred) toggleBlur();
    setHasNewNotifications(false);
  };

  return (
    <nav className="admin w-full sm:bg-white border-b border-gray-100 h-20 flex items-center relative sm:px-4 md:px-6">
      {/* Background layer that blurs */}
      <div
        className={`flex items-center justify-between w-full ${isBlurred ? "blur-[2px]" : ""}`}
      >
        {/* Left: Heading */}
        <div className="flex-shrink-0 max-w-[150px] sm:max-w-none">
          {heading ? (
            <h1 className="text-lg md:text-2xl pl-12 sm:pl-0 font-bold text-[#1e293b] leading-tight truncate">
              {heading}
            </h1>
          ) : (
            <div className="flex flex-col pl-12 sm:pl-0">
              <p className="text-lg md:text-xl font-bold text-[#1e293b]">Hello {userData.name}</p>
              <p className="hidden sm:block text-xs text-gray-500">Welcome to your dashboard!</p>
            </div>
          )}
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
          <div className="relative" ref={mailRef}>
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
          </div>

          {/* Bell Icon */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={handleBellClick}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-300
                ${bell
                  ? "bg-[#0B1053] text-white"
                  : "bg-white border-gray-200 text-gray-500 shadow-sm hover:bg-gray-50"
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

      {/* Overlay layer for Dropdowns (Not affected by blur) */}
      <div className="fixed inset-0 pointer-events-none z-[250]" ref={overlayRef}>
        {mail && (
          <div className="pointer-events-auto absolute inset-y-0 right-0 w-full sm:w-96">
            <RecentMessages dashboard={true} onclose={closeMail} />
          </div>
        )}

        {bell && (
          <div className="pointer-events-auto absolute inset-y-0 right-0 w-full sm:w-80">
            <Notifications data={data} dashboard={true} onclose={handleBellClick} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

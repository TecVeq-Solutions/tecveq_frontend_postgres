import React, { useEffect, useRef, useState } from "react";
import Notifications from "./Notifications";
import RecentMessages from "./Dashboard/RecentMessages";
import GlobalSearch from "../../commonComponents/GlobalSearch";
import { CiBellOn } from "react-icons/ci";
import { IoMailOutline } from "react-icons/io5";
import { useBlur } from "../../context/BlurContext";
import { useQuery } from "@tanstack/react-query";
import { getAllNotifications } from "../../api/Admin/NotificationApi";

import { useSidebar } from "../../context/SidebarContext";

const Navbar = ({ heading }) => {
  const [mail, setMail] = useState(false);
  const [bell, setBell] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const { isBlurred, toggleBlur } = useBlur();
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();

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

  // ✅ Fix 1: Outside click se dono dropdowns band ho jayein
  useEffect(() => {
    const handleClickOutside = (e) => {
      // If the target is no longer in the document, it was likely an internal element
      // (like a tab or button) that was removed during a state update.
      // In this case, we should NOT treat it as an outside click.
      if (!document.body.contains(e.target)) return;

      // Check if click is inside icons or sidebars
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

  // ✅ Fix 2: toggleMail — blur sahi se handle ho
  const toggleMail = () => {
    const isOpening = !mail;
    setMail(isOpening);
    setBell(false);
    // Blur sirf tab toggle ho jab state change ho
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
    // Mail open tha aur blur tha to blur hata do
    if (mail && isBlurred) toggleBlur();
    setHasNewNotifications(false);
  };

  return (
    <nav className=" admin w-full sm:bg-white border-b border-gray-100 h-20 flex items-center relative sm:px-4 md:px-6">
      {/* Mobile Hamburger Trigger */}
      <div
        className="absolute left-3 top-0 h-20 flex items-center lg:hidden z-50 cursor-pointer"
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

      {/* Background layer that blurs */}
      <div
        className="flex items-center justify-between w-full"
      >
        {/* Left: Heading */}
        <div className="flex-shrink-0 max-w-[150px] sm:max-w-none">
          <h1 className="text-lg md:text-2xl pl-12 sm:pl-0 font-bold text-[#1e293b] leading-tight truncate">
            {heading}
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
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none" ref={overlayRef}>
        <div className="relative w-full h-full max-w-7xl mx-auto px-4 md:px-6">
          {mail && (
            <div className="pointer-events-auto">
              {/* Mobile: full width */}
              <div className="fixed inset-x-4 top-20 sm:hidden z-[100]">
                <RecentMessages dashboard={true} onclose={closeMail} />
              </div>
              {/* Desktop: right-aligned dropdown */}
              <div className="hidden sm:block absolute right-24 md:right-28 mt-20 w-80 z-[100]">
                <RecentMessages dashboard={true} onclose={closeMail} />
              </div>
            </div>
          )}

          {bell && (
            <div className="pointer-events-auto">
              {/* Mobile: full width */}
              <div className="fixed inset-x-4 top-20 sm:hidden z-[100]">
                <Notifications dashboard={true} onclose={handleBellClick} />
              </div>
              {/* Desktop: right-aligned dropdown */}
              <div className="hidden sm:block absolute right-6 md:right-10 mt-20 w-80 z-[100]">
                <Notifications dashboard={true} onclose={handleBellClick} />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
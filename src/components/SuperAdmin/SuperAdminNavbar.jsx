import React, { useEffect, useRef, useState } from "react";
import SuperAdminMessages from "./SuperAdminMessages";
import { IoMailOutline } from "react-icons/io5";
import { useBlur } from "../../context/BlurContext";
import { useSidebar } from "../../context/SidebarContext";
import { useUser } from "../../context/UserContext";

const SuperAdminNavbar = ({ heading }) => {
  const [mail, setMail] = useState(false);
  const { isBlurred, toggleBlur } = useBlur();
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();
  const { userData } = useUser();

  const mailRef = useRef(null);
  const overlayRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!document.body.contains(e.target)) return;
      const isInsideMailIcon = mailRef.current && mailRef.current.contains(e.target);
      const isInsideOverlay = overlayRef.current && overlayRef.current.contains(e.target);
      if (mail && !isInsideMailIcon && !isInsideOverlay) {
        setMail(false);
        if (isBlurred) toggleBlur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mail, isBlurred]);

  const toggleMail = () => {
    const isOpening = !mail;
    setMail(isOpening);
    if (isOpening !== isBlurred) toggleBlur();
    // Also open the sidebar as requested
    setIsSidebarOpen(true);
  };

  const closeMail = () => {
    setMail(false);
    if (isBlurred) toggleBlur();
  };

  return (
    <nav className="fixed top-0 left-0 lg:left-72 xl:left-80 right-0 bg-white/95 backdrop-blur-sm h-[72px] flex items-center z-[90] px-3 sm:px-6 md:px-8 border-b border-gray-100/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.04),0_1px_2px_-1px_rgba(0,0,0,0.04)]">

      {/* Mobile Hamburger */}
      <div
        className="flex items-center lg:hidden z-50 cursor-pointer mr-3"
        onClick={() => {
          setIsopen(!isopen);
          setIsSidebarOpen(!isSidebarOpen);
        }}
      >
        <div className="flex flex-col gap-[5px] bg-[#0B1053] rounded-[10px] p-[10px] shadow-md active:scale-95 transition-all duration-150">
          <span className="w-[18px] bg-white h-[2px] rounded-full block" />
          <span className="w-[18px] bg-white h-[2px] rounded-full block" />
          <span className="w-[12px] bg-white h-[2px] rounded-full block" />
        </div>
      </div>

      {/* Content Row */}
      <div className="flex items-center justify-between w-full">

        {/* Left: Heading + Badge */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-[20px] font-bold text-[#0f172a] leading-tight tracking-tight">
              {heading}
            </h1>
            <p className="text-[11px] text-gray-400 font-medium leading-none mt-0.5 hidden sm:block">
              Manage subscriptions &amp; communicate with admins
            </p>
          </div>
          {/* Role badge */}
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-gradient-to-r from-[#0B1053] to-[#3b47c9] text-white shadow-sm select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
            Super Admin
          </span>
        </div>

        {/* Right: Icons + Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Mail Button */}
          <div className="relative" ref={mailRef}>
            {/* <button
              onClick={toggleMail}
              title="Messages"
              className={`relative group flex items-center justify-center w-[42px] h-[42px] rounded-[12px] border transition-all duration-200 ease-in-out
                ${mail
                  ? "bg-[#0B1053] border-[#0B1053] text-white shadow-[0_4px_14px_0_rgba(11,16,83,0.35)]"
                  : "bg-white border-gray-200 text-gray-500 hover:border-[#0B1053]/30 hover:text-[#0B1053] hover:bg-[#0B1053]/5 shadow-sm"
                }`}
            >
              <IoMailOutline className="text-[20px] transition-transform duration-200 group-hover:scale-110" />
             
              {!mail && (
                <span className="absolute top-[9px] right-[9px] w-2 h-2 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />
              )}
            </button> */}
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-7 bg-gray-200 mx-1" />

          {/* User Avatar */}
          <div className="hidden sm:flex items-center gap-2.5 pl-1">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0B1053] to-[#3b47c9] flex items-center justify-center text-white font-bold text-sm shadow-md overflow-hidden ring-2 ring-white">
                {userData?.profilePic
                  ? <img src={userData.profilePic} alt="avatar" className="w-full h-full object-cover" />
                  : (userData?.name?.charAt(0)?.toUpperCase() || "S")
                }
              </div>
              {/* Online dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div className="hidden lg:flex flex-col leading-none">
              <span className="text-[13px] font-semibold text-[#0f172a] truncate max-w-[120px]">
                {userData?.name || "Super Admin"}
              </span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">Super Admin</span>
            </div>
          </div>

        </div>
      </div>

      {/* Messages Overlay */}
      {mail && (
        <div ref={overlayRef}>
          <SuperAdminMessages onclose={closeMail} />
        </div>
      )}
    </nav>
  );
};

export default SuperAdminNavbar;

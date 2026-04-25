import React, { useRef } from "react";
import { GoPerson } from "react-icons/go";
import { LuSettings } from "react-icons/lu";
import { HiOutlinePower } from "react-icons/hi2"; // Image jesa icon
import { useSidebar } from "../../context/SidebarContext";
import useClickOutside from "../../hooks/useClickOutlise";

const ProfileMenu = ({ onProfileClick, onSettingsClick, onLogoutClick, dashboard, userData, onClose }) => {
  const { isSidebarOpen } = useSidebar();
  const menuRef = useRef(null);

  // Functionality bilkul same hai
  useClickOutside(menuRef, onClose);

  return (
    <div
      ref={menuRef}
      // Design update kiya gaya hai image ke mutabiq
      className={`fixed ${isSidebarOpen ? "-z-50" : "z-50"} bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-gray-50 right-4 md:right-10 top-16 w-56 overflow-hidden transition-all`}
    >
      <div className="flex flex-col p-2">

        {/* Profile Item */}
        <div
          onClick={onProfileClick}
          className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 cursor-pointer rounded-xl transition-colors"
        >
          <GoPerson className="text-xl" />
          <span className="text-[15px] font-medium">My Profile</span>
        </div>

        {/* Setting Item */}
        <div
          onClick={onSettingsClick}
          className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 cursor-pointer rounded-xl transition-colors"
        >
          <LuSettings className="text-xl" />
          <span className="text-[15px] font-medium">Setting</span>
        </div>

        {/* Log Out Item */}
        <div
          onClick={onLogoutClick}
          className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-800 cursor-pointer rounded-xl transition-colors"
        >
          <HiOutlinePower className="text-xl" />
          <span className="text-[15px] font-medium">Log Out</span>
        </div>

      </div>
    </div>
  );
};

export default ProfileMenu;
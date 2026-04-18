import React, { useRef } from "react";
import { GoPerson } from "react-icons/go";
import { LuSettings } from "react-icons/lu";
import { IoIosLogOut } from "react-icons/io";
import { useUser } from "../../../context/UserContext";
import { useSidebar } from "../../../context/SidebarContext";
import useClickOutside from "../../../hooks/useClickOutlise";

const ProfileMenu = ({ onProfileClick, onSettingsClick, onLogoutClick, dashboard, onClose }) => {

  const { userData } = useUser();
  const { isSidebarOpen } = useSidebar();
  const menuRef = useRef(null);
  useClickOutside(menuRef, onClose);


  return (
    <div ref={menuRef} className={`fixed flex z-[70] ${!dashboard ? "mt-10" : "mt-2"} bg-white rounded-md shadow-lg right-10 top-16 w-60`}>
    <div className="flex flex-col flex-1 gap-2 px-5 py-5">
      <div className="flex flex-col flex-1 gap-2 py-2 border-b border-black/10">
        <div className="flex flex-col flex-1 gap-2 pb-2 border-b border-black/10 md:hidden">
          <p className="font-medium ">M. {userData.name} </p>

        </div>
        <div className="flex items-center gap-2 cursor-pointer text-grey hover:text-black" onClick={onProfileClick}>
          <GoPerson />
          <p>Profile</p>
        </div>
        {/* <div className="flex items-center gap-2 cursor-pointer text-grey hover:text-black" onClick={onSettingsClick}>
            <LuSettings />
            <p>Settings</p>
          </div> */}
      </div>
      <div className="flex items-center gap-2 cursor-pointer text-[#0B1053] hover:text-[#007EEA]" onClick={onLogoutClick}>
        <IoIosLogOut />
        <p>Logout</p>
      </div>
    </div>
  </div>
  );
};

export default ProfileMenu;

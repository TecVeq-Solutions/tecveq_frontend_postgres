import React, { useEffect, useState } from "react";
import ProfileMenu from "./ProfileMenu";
import Notifications from "./Notifications";
import ProfileDetails from "./ProfileDetails";
import profile from "../../assets/images/profilepic.png";
import RecentMessages from "./Dashboard/RecentMessages";
import GlobalSearch from "../../commonComponents/GlobalSearch";

import { CiBellOn } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { IoMailOutline } from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa6";
import { userLogout } from "../../api/ForAllAPIs";
import { useUser } from "../../context/UserContext";
import { useBlur } from "../../context/BlurContext";
import { useQuery } from "@tanstack/react-query";
import { getAllNotifications } from "../../api/Admin/NotificationApi";
import moment from "moment";
import { Dot } from "recharts";
import { useSidebar } from "../../context/SidebarContext";


const Navbar = ({ heading }) => {

  const [mail, setmail] = useState(false);
  const [bell, setBell] = useState(false);
  const [isProfileMenu, setIsProfileMenu] = useState(false);
  const [isProfileDetails, setIsProfileDetails] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const navigate = useNavigate();
  const { userData } = useUser();
  const { isBlurred, toggleBlur } = useBlur();
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();


  const { data } = useQuery({ queryKey: ["chat"], queryFn: getAllNotifications });


  useEffect(() => {
    const storedNotificationId = localStorage.getItem("lastNotificationId");

    if (data && data.length > 0) {
      // Get the latest notification ID
      const latestNotificationId = data[0].id; // Assuming latest notification is first in the list

      // Compare with stored ID
      if (storedNotificationId !== latestNotificationId) {
        // New notification found
        setHasNewNotifications(true);
        localStorage.setItem("lastNotificationId", latestNotificationId); // Update storage
      }
    }
  }, [data]);

  // Handle bell click
  const handleBellClick = () => {
    setHasNewNotifications(false); // Hide notification
    localStorage.setItem("notificationChecked", "true"); // Persist user check
    togglebell(); // Call the toggle function
  };

  // Restore notification visibility on refresh
  useEffect(() => {
    const isChecked = localStorage.getItem("notificationChecked") === "true";
    if (isChecked) {
      setHasNewNotifications(false); // Don't show notification if already checked
    }
  }, []);
  const toggleProfielMenu = () => {
    setIsProfileMenu(!isProfileMenu);
    setmail(false);
    setBell(false);
  };

  const toggleMail = () => {
    toggleBlur();
    setmail(!mail);
    setIsProfileMenu(false);
    setBell(false);
  };

  const togglebell = () => {
    setBell(!bell);
    setmail(false);
    setIsProfileMenu(false);
    setHasNewNotifications(false);
  };

  const toggleProfileDetails = () => {
    toggleBlur();
    setIsProfileDetails(!isProfileDetails);
  };

  const onProfileClick = () => {
    toggleProfielMenu();
    toggleProfileDetails();
  };

  const onSettingsClick = () => { };

  const onLogoutClick = async () => {
    localStorage.clear();
    await userLogout();
    navigate("/");
  };

  return (
    <>
      <div className="flex justify-end flex-1 h-20">
        <div className={`flex justify-between flex-1 sm:py-5 ml-3 lg:ml-auto ${isBlurred ? "blur" : ""}`}>
          {/* justify-normal sm: */}
          <div className="flex flex-col justify-center px-2">
            <p className="text-[14px]  ml-10 md:ml-0 md:text-2xl sm:font-medium font-normal">{heading} </p>
          </div>
          <GlobalSearch />
          <div className="flex  items-center gap-1">
            <div className="flex gap-2">
              <div
                className={`p-2 border cursor-pointer rounded-md border-black/50 transition-all duration-500 ${mail ? "bg-[#0B1053] text-white" : ""
                  }`}
                onClick={toggleMail}
              >
                <IoMailOutline />
              </div>
              <div className={`relative ${isSidebarOpen ? "-z-50" : "z-auto"}`}>
                <div
                  className={`p-2 border cursor-pointer rounded-md border-black/50 transition-all duration-500 `}
                  onClick={handleBellClick}
                >
                  <div className={`${hasNewNotifications ? "animate-bellShake text-green_dark" : ""}`}>
                    <CiBellOn />
                  </div>

                </div>
                {hasNewNotifications && (
                  <div className="absolute top-1 right-1 w-[9px] h-[9px] rounded-full bg-green"><Dot /></div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-medium hidden md:block">{userData.name}</p>
              <img
                src={userData.profilePic || profile}
                alt="Profile"
                className="w-12 h-12 cursor-pointer rounded-full"
                onClick={toggleProfielMenu}
              />
              <FaChevronDown
                className="cursor-pointer"
                onClick={toggleProfielMenu}
              />
            </div>
            {bell && <Notifications dashboard={true} onclose={togglebell} />}
            {isProfileMenu &&
              <ProfileMenu
                onProfileClick={onProfileClick}
                onSettingsClick={onSettingsClick}
                onLogoutClick={onLogoutClick}
                dashboard={true}
                userData={userData}
                onClose={() => setIsProfileMenu(false)}
              />}
          </div>
        </div>
      </div>
      {mail && <RecentMessages dashboard={true} onclose={toggleMail} />}
      {isProfileDetails && <ProfileDetails onClose={toggleProfileDetails} />}
    </>

  );
};

export default Navbar;

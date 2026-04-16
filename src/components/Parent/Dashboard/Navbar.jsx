import React, { useEffect, useState } from "react";
import ProfileMenu from "./ProfileMenu";
import Notifications from "./Notifications";
import ProfileDetails from "./ProfileDetails";
import IMAGES from "../../../assets/images";
import { logout } from "../../../api/User/UserApi";

import { CiBellOn } from "react-icons/ci";
import { FaChevronDown } from "react-icons/fa6";
import { IoMailOutline } from "react-icons/io5";
import { useBlur } from "../../../context/BlurContext";
import { useUser } from "../../../context/UserContext";
import RecentMessages from "./RecentMessages";
import { useQuery } from "@tanstack/react-query";
import GlobalSearch from "../../../commonComponents/GlobalSearch";
import { getAllNotifications } from "../../../api/Admin/NotificationApi";
import moment from "moment";
import { Dot } from "recharts";
import { useNavigate } from "react-router-dom";
import { useSidebar } from "../../../context/SidebarContext";


const Navbar = ({ heading }) => {

  const [mail, setmail] = useState(false);
  const [bell, setBell] = useState(false);
  const [isProfileMenu, setIsProfileMenu] = useState(false);
  const [isProfileDetails, setIsProfileDetails] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const navigate = useNavigate()


  const { isBlurred, toggleBlur } = useBlur();

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
    setmail(!mail);
    setIsProfileMenu(false);
    setBell(false);
  };

  const togglebell = () => {
    setBell(!bell);
    setmail(false);
    setIsProfileMenu(false);
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
    // setLoading(true);
    localStorage.clear();
    const response = await logout();
    if (response == "error") {
      console.log("error loggin out")
      navigate("/")
    } else {
      localStorage.clear()
      navigate("/")
    }
    // setLoading(false);
  };


  const { userData } = useUser();
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();



  return (
    <div className="flex flex-1 items-center justify-center h-20">
      <div className={`flex justify-between items-center gap-2  md:justify-between flex-1 py-3 md:py-5 ${isBlurred ? "blur" : ""}`}>
        {heading ?
          <div className="flex justify-start items-center text-base sm:text-xl md:text-3xl font-semibold ml-[3rem] sm:ml-[1.4rem] lg:ml-[0rem] ">{heading}</div>
          :
          <div className=" flex-col  md:flex">
            <p className="text-lg sm:text-xl font-semibold ml-[2.5rem]  md:ml-[0rem] ">Hello {userData.name} </p>
            <p className="hidden md:block ">Welcome to your learning space!</p>
          </div>
        }
        <GlobalSearch />
        <div className="flex items-center  gap-2">
          <div className="flex gap-2 sm:gap-4">
            {/* p-1 sm:p-2 border cursor-pointer  rounded-md border-black/50 transition-all duration-500  */}
            <div
              className={`p-1 sm:p-2 sm:auto border cursor-pointer rounded-md border-black/50 transition-all duration-500 ${mail ? "bg-[#0B1053] text-white" : ""
                }`}
              onClick={toggleMail}
            >
              <IoMailOutline />
            </div>
            <div className={`relative ${isSidebarOpen ? "-z-50" : "z-auto"}`}>
              <div
                className={`p-1 sm:p-2  sm:auto border cursor-pointer rounded-md border-black/50 transition-all duration-500 `}
                onClick={handleBellClick}
              >
                <div className={`${hasNewNotifications ? "animate-bellShake text-green_dark" : ""} `}>
                  <CiBellOn />
                </div>

              </div>
              {hasNewNotifications && (
                <div className="absolute top-1 right-1 w-[9px] h-[9px] rounded-full bg-green"><Dot /></div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="font-medium hidden md:block">M. {userData.name} </p>
            <img
              alt="profile"
              src={IMAGES.Profile}
              onClick={toggleProfielMenu}
              className="sm:w-12 w-8 h-8 sm:h-12 cursor-pointer"
            />
            <FaChevronDown
              className="cursor-pointer"
              onClick={toggleProfielMenu}
            />
          </div>
          {isProfileMenu &&
            <ProfileMenu
              dashboard={true}
              onLogoutClick={onLogoutClick}
              onProfileClick={onProfileClick}
              onSettingsClick={onSettingsClick}
              onClose={() => setIsProfileMenu(false)}
            />
          }
        </div>
      </div>
      {bell && <Notifications data={data} dashboard={true} onclose={togglebell} />}
      {mail && <RecentMessages dashboard={true} onclose={toggleMail} />}
      {isProfileDetails && <ProfileDetails onclose={toggleProfileDetails} />}
    </div>
  );
};

export default Navbar;

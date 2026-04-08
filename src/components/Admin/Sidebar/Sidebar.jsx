import React, { useState, useEffect } from "react";
import { IoIosLogOut } from "react-icons/io";


import Custombutton from "./Custombutton";
import logo from "../../../assets/logo.png";
import IMAGES from '../../../assets/images';

import { useNavigate } from "react-router-dom";
import { adminLogout } from "../../../api/Admin/AdminApi";
import Loader from "../../../utils/Loader";
import { useAdmin } from "../../../context/AdminContext";
import { useSidebar } from "../../../context/SidebarContext";
import { useUser } from "../../../context/UserContext";
import { IoClose } from "react-icons/io5";
import { IoMdMenu } from "react-icons/io";


const Sidebar = () => {
  const navigate = useNavigate();
  const { setAdminLogedIn } = useAdmin();
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Load active tab from localStorage on mount
  useEffect(() => {
    const storedTab = localStorage.getItem("activeTab");
    if (storedTab) setActiveTab(storedTab);
  }, []);

  const handleMenuClick = (tab, route) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
    setIsopen(false);
    setIsSidebarOpen(false);
    navigate(route);
  };

  const handleLogoutClick = async () => {
    setLoading(true);
    await adminLogout();
    localStorage.clear();
    setAdminLogedIn(false);
    navigate("/");
    setLoading(false);
  };

  const menuItems = [
    { key: "dashboard", title: "Dashboard", icon: "home", route: "/admin/dashboard" },
    { key: "timetable", title: "Time Table", icon: "time", route: "/admin/timetable" },
    { key: "reports", title: "Student", icon: "graph", route: "/admin/reports" },
    { key: "teachers", title: "Teachers", icon: "teachers", route: "/admin/teachers" },
    { key: "announcements", title: "Announcements", icon: "announcement", route: "/admin/announcements" },
    { key: "manageUsers", title: "Manage Users", icon: "manageUsers", route: "/admin/manageusers" },
    { key: "levels", title: "Levels", icon: "levels", route: "/admin/levels" },
    { key: "attendence-reprt", title: "Attendence Report", icon: "attendence-reprt", route: "/admin/attendence-report" },
    { key: "bulkAssign", title: "Bulk Subject Assign", icon: "subjects", route: "/admin/bulk-subject-assign" },
    { key: "subjects", title: "Subjects", icon: "subjects", route: "/admin/subjects" },
    { key: "classroom", title: "Classroom", icon: "classroom", route: "/admin/classrooms" },
    { key: "fees", title: "Fees", icon: "levels", route: "/admin/fees" },
    { key: "settings", title: "Settings", icon: "setting", route: "/admin/settings" }
  ];

  const { userData } = useUser();
  if (userData?.userType === 'super_admin') {
    menuItems.unshift({ key: "superAdminDashboard", title: "Super Admin", icon: "home", route: "/superadmin/dashboard" });
  }

  const Menubar = () => (
    <>

      <div className="w-full sm:w-72 shadow-lg bg-[#0B1053] text-white z-50 h-full px-4 md:px-8 overflow-y-auto no-scrollbar">
        <div className="py-5">
          <div className="text-white flex justify-end items-center ">
            <IoClose className="w-8 h-8 mt-4 lg:mt-0 lg:w-7 lg:h-7  block sm:hidden hover:scale-105 cursor-pointer fixed" onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          </div>


          <div className="flex justify-start ">
            <img className="w-5/12 h-3/12 md:w-8/12 md:h-6/12 mb-3" src={IMAGES?.logo} alt="logo-TCA" />
          </div>


          <div className="flex flex-col gap-1 py-2 border-b border-b-black">
            {menuItems.map(({ key, title, icon, route }) => (
              <Custombutton
                key={key}
                icon={icon}
                title={title}
                active={activeTab === key}
                onpress={() => handleMenuClick(key, route)}
              />
            ))}
          </div>
          {loading ? (
            <div className="flex flex-1"><Loader /></div>
          ) : (
            <div
              onClick={handleLogoutClick}
              className="flex items-center gap-4 px-5 py-3 text-lg rounded-md cursor-pointer text-white"
            >
              <IoIosLogOut />
              <p>Logout</p>
            </div>
          )}
        </div>
      </div>

    </>
  );

  return (
    <div className="flex flex-col h-screen">
      <div className="px-3 cursor-pointer lg:hidden h-20 flex items-center justify-center tex-white" onClick={() => {
        setIsopen(!isopen)
        setIsSidebarOpen(!isSidebarOpen)
      }}>
        <div className="z-50 fixed ml-12 flex justify-center border-2 bg-[#0B1053] text-white border-[#0B1053] rounded-md w-9 h-fit" onClick={() => { setIsopen(!isopen) }}>
          <IoMdMenu className="w-6 h-6" />
        </div>
      </div>
      <div className={`lg:hidden fixed top-0 left-0 h-full z-50 bg-white transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Menubar />
      </div>
      <div className="max-lg:hidden h-full">
        <Menubar />
      </div>
    </div>
  );
};

export default Sidebar;

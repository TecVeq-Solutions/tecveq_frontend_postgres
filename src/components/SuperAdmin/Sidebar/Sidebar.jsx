import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Custombutton from "./Custombutton";
import logo from "../../../assets/logo.png";
import { IoIosLogOut } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { adminLogout } from "../../../api/Admin/AdminApi";
import Loader from "../../../utils/Loader";
import { useAdmin } from "../../../context/AdminContext";
import { useSidebar } from "../../../context/SidebarContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { setAdminLogedIn } = useAdmin();
  const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [activeButton, setActiveButton] = useState("dashboard");

  useEffect(() => {
    const stored = localStorage.getItem("activeButton") || localStorage.getItem("activeTab");
    if (stored) setActiveButton(stored);
  }, []);

  const handleButtonClick = (buttonKey, route) => {
    setActiveButton(buttonKey);
    localStorage.setItem("activeButton", buttonKey);
    setIsSidebarOpen(false);
    setIsopen(false);
    navigate(route);
  };

  const handleLogoutClick = async () => {
    setLoading(true);
    await adminLogout();
    localStorage.clear();
    setAdminLogedIn(false);
    setIsSidebarOpen(false);
    setIsopen(false);
    navigate("/admin/login");
    setLoading(false);
  };

  const menuGroups = [
    {
      label: "Main",
      items: [
        { key: "dashboard", title: "Dashboard", icon: "home", route: "/superadmin/dashboard" },
        { key: "admins", title: "Admin Management", icon: "user", route: "/superadmin/admins" },
        { key: "packages", title: "Subscription Plans", icon: "levels", route: "/superadmin/packages" },
        { key: "payments", title: "Payments", icon: "fees", route: "/superadmin/payments" },
      ]
    },
    {
      label: "Support",
      items: [
        { key: "chat", title: "Support Chat", icon: "chat", route: "/superadmin/chat" },
        { key: "notifications", title: "Notifications", icon: "notification", route: "/superadmin/notifications" },
      ]
    },
    {
      label: "System",
      items: [
        { key: "reports", title: "System Reports", icon: "report", route: "/superadmin/reports" },
        { key: "blocked", title: "Blocked Accounts", icon: "delete", route: "/superadmin/blocked-accounts" },
        { key: "settings", title: "System Settings", icon: "settings", route: "/superadmin/settings" },
        { key: "profile", title: "My Profile", icon: "profile", route: "/superadmin/profile" },
      ]
    }
  ];

  const Menubar = ({ isMobile }) => (
    <div className="admin-sidebar flex flex-col w-full sm:w-[50] lg:w-72 xl:w-80 h-screen bg-[#0B1053] text-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-[16px] pt-6 pb-5 border-b border-gray-200">
        <div className="w-full">
          <img className="h-full w-full" src={logo} alt="TCA Logo" />
          <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2 text-center">SuperAdmin Portal</p>
        </div>
        <IoClose
          className="w-5 h-5 block lg:hidden text-white/50 hover:text-white cursor-pointer"
          onClick={() => setIsSidebarOpen(false)}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="flex flex-col gap-1">
            <p className="text-[13px] text-white/100 uppercase tracking-widest px-3 mb-2">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(({ key, title, icon, route }) => (
                <Custombutton
                  key={key}
                  icon={icon}
                  title={title}
                  active={activeButton === key}
                  onpress={() => handleButtonClick(key, route)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="px-3 py-3 border-t border-white/[0.08]">
        {loading ? (
          <div className="flex justify-center py-2"><Loader /></div>
        ) : (
          <div
            onClick={handleLogoutClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-150 group"
          >
            <IoIosLogOut size={17} className="flex-shrink-0" />
            <span className="text-sm">Sign Out</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Mobile hamburger */}
      <div
        className="px-3 py-3 cursor-pointer lg:hidden h-16 flex items-center"
        onClick={() => { setIsopen(!isopen); setIsSidebarOpen(!isSidebarOpen); }}
      >
        <div className="flex flex-col gap-1.5 bg-[#0B1053] border border-white/10 rounded-lg p-2.5">
          <span className="w-5 bg-white h-0.5 rounded-full block" />
          <span className="w-5 bg-white h-0.5 rounded-full block" />
          <span className="w-3.5 bg-white h-0.5 rounded-full block" />
        </div>
      </div>

      {/* Mobile overlay */}
      <div className={`lg:hidden fixed inset-0 z-[200] transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full w-fit" onClick={(e) => e.stopPropagation()}>
          <Menubar isMobile={true} />
        </div>
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>

      {/* Desktop */}
      <div className="max-lg:hidden">
        <Menubar isMobile={false} />
      </div>
    </div>
  );
};

export default Sidebar;

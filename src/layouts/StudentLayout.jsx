import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Student/Sidebar/Sidebar";

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("layout is active");
  }, []);
  return (
    <div className="flex w-full h-screen overflow-hidden bg-[#F9F9F9]">
      <div className="fixed top-0 left-0 h-full z-[1000] flex-shrink-0">
        <Sidebar />
      </div>
      <div className="flex-1 h-full overflow-x-hidden overflow-y-auto custom-scrollbar relative">
        {children}
      </div>
    </div>
  );
};

export default StudentLayout;

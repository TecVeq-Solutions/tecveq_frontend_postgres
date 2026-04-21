import React from "react";
import Navbar from "../../../components/Parent/Dashboard/Navbar";
import Attendance from "../../../components/Parent/Dashboard/Attendance";
import SubjectsEnrolled from "../../../components/Parent/Dashboard/SubjectsEnrolled";
import LastDeliverables from "../../../components/Parent/Dashboard/LastDeliverables";




const Dashboard = () => {



  
  return (
    <div className="flex flex-1 bg-[#f9f9f9]/50 font-poppins">
      <div className="flex flex-1 gap-4">
        <div className={`flex flex-col flex-1 px-2 lg:ml-72`}>
          <div className="flex h-20 md:px-14 lg:px-0">
            <Navbar />
          </div>
          <div
            className="flex flex-col md:px-10 lg:px-0 lg:flex-row flex-1 gap-5 py-2"
          >
            <div className="flex-[6] flex w-full">
              <SubjectsEnrolled />
            </div>
          </div>
          <div
            className="flex flex-col md:px-10 lg:px-0 lg:flex-row flex-1 gap-5 pb-10 pt-2 my-2"
          >
            <div className="flex flex-[2]">
              <LastDeliverables />
            </div>
            <div className="flex flex-[2]">
              <Attendance />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

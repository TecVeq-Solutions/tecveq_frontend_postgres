import React from "react";
import Navbar from "../../../components/Parent/Dashboard/Navbar";
import Attendance from "../../../components/Parent/Dashboard/Attendance";
import SubjectsEnrolled from "../../../components/Parent/Dashboard/SubjectsEnrolled";
import LastDeliverables from "../../../components/Parent/Dashboard/LastDeliverables";

const Dashboard = () => {
  return (
    <div
      className="flex flex-1 min-h-screen font-poppins"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f5f0ff 100%)" }}
    >
      {/* Decorative background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #007EEA 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #0B1053 0%, transparent 70%)" }}
        />
      </div>

      <div className="flex flex-1 gap-4 relative z-10">
        {/* px-2 on mobile, px-5 on sm+, lg:ml-80 for sidebar offset */}
        <div className="flex flex-col flex-1 px-2 sm:px-5 lg:ml-80">
          <div className="flex h-16 sm:h-20">
            <Navbar />
          </div>

          {/* Subjects Table Section */}
          <div className="flex flex-col lg:flex-row flex-1 gap-4 sm:gap-5 py-2">
            <div className="flex-[6] flex w-full">
              <SubjectsEnrolled />
            </div>
          </div>

          {/* Bottom Stats Section */}
          <div className="flex flex-col lg:flex-row flex-1 gap-4 sm:gap-5 pb-8 sm:pb-10 pt-2 my-2">
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
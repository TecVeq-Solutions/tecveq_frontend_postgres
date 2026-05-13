import React from "react";
import Navbar from "../../../components/Parent/Dashboard/Navbar";
import Attendance from "../../../components/Parent/Dashboard/Attendance";
import SubjectsEnrolled from "../../../components/Parent/Dashboard/SubjectsEnrolled";
import LastDeliverables from "../../../components/Parent/Dashboard/LastDeliverables";
import ScheduledClasses from "../../../components/Parent/Dashboard/SchedualedClasses";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

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
        <div className="flex flex-col flex-1 px-0 sm:px-5 ml-0 lg:ml-72 xl:ml-80">
          <div className="flex h-16 sm:h-20">
            <Navbar />
          </div>

          {/* Subjects Table Section */}
          <div className="flex px-2 flex-col lg:flex-row flex-1 gap-4 sm:gap-5 pb-8 sm:pb-10 pt-2 my-2">
            <div className="flex flex-col flex-1 gap-2 sm:gap-3 py-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#007EEA] to-[#0B1053]" />
                  <h2 className="text-xl font-bold text-[#0B1053] tracking-tight">Subjects Enrolled</h2>
                </div>
                <Link
                  to="/parent/reports"
                  className="group flex items-center gap-2 text-sm font-semibold text-[#007EEA] hover:text-[#0B1053] transition-all duration-300"
                >
                  <span>View All Reports</span>
                  <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </div>
              <div className="flex w-full">
                <SubjectsEnrolled hideHeader={true} />
              </div>
            </div>

            {/* Scheduled Classes Section */}
            <div className="flex flex-col flex-1 gap-2 sm:gap-3 py-4">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-[#8B3DFF] to-[#6A00FF]" />
                  <h2 className="text-xl font-bold text-gray-800 tracking-tight">Scheduled Classes</h2>
                </div>
                <Link
                  to="/parent/timetable"
                  className="group flex items-center gap-1 sm:gap-2 text-sm font-semibold text-violet-600 hover:text-violet-800 transition-all duration-300"
                >
                  <span className="">Full Timetable</span>
                  <FiArrowRight className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </div>
              <div className="flex w-full">
                <ScheduledClasses hideHeader={true} />
              </div>
            </div>
          </div>

          {/* Bottom Stats Section */}
          <div className="flex flex-col px-2 lg:flex-row flex-1 gap-4 sm:gap-5 pb-8 sm:pb-10 pt-2 my-2">
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
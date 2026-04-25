import React from "react";
import { SlArrowRight } from "react-icons/sl";
import IMAGES from "../../../assets/images";

const DataRows = ({
  index,
  teacherName,
  teacherProfile,
  teacherId,
  subject,
  attendance,
  header,
  onClickFunction,
}) => {
  // Agar header hai to styling alag hogi, row hai to alag
  if (header) {
    return (
      <div className="flex items-center px-6 py-4 bg-[#F8FAFC] border-b border-gray-200 min-w-[800px] gap-4">
        <span className="w-12 text-xs font-bold text-gray-500 uppercase tracking-wider">#</span>
        <span className="w-16 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Avatar</span>
        <span className="flex-[3] text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</span>
        <span className="flex-[2] text-xs font-bold text-gray-500 uppercase tracking-wider">ID / Roll No.</span>
        <span className="flex-[2] text-xs font-bold text-gray-500 uppercase tracking-wider">Subject/Class</span>
        <span className="flex-[3] text-xs font-bold text-gray-500 uppercase tracking-wider">Performance</span>
        <span className="w-10"></span>
      </div>
    );
  }

  return (
    <div
      onClick={onClickFunction}
      className="group flex items-center px-6 py-4 bg-white border-b border-gray-100 hover:bg-blue-50/40 transition-all duration-200 cursor-pointer min-w-[800px] gap-4"
    >
      {/* Index */}
      <div className="w-12 text-sm text-gray-400 font-medium">{index}</div>

      {/* Profile Image */}
      <div className="w-16 flex justify-center">
        <div className="relative">
          <img
            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
            src={teacherProfile || IMAGES?.Profile}
            alt="Profile"
          />
          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
      </div>

      {/* Teacher Name */}
      <div className="flex-[3]">
        <p className="text-sm font-semibold text-[#2B3674] group-hover:text-blue-600 transition-colors">
          {teacherName}
        </p>
      </div>

      {/* Teacher ID */}
      <div className="flex-[2]">
        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
          {teacherId || "N/A"}
        </span>
      </div>

      {/* Subject */}
      <div className="flex-[2]">
        <p className="text-sm text-gray-600">{subject || "Not Assigned"}</p>
      </div>

      {/* Attendance / Progress Bar */}
      <div className="flex-[3] flex items-center gap-3">
        <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            style={{ width: `${attendance}%` }}
            className={`h-full rounded-full transition-all duration-1000 ${attendance > 75 ? "bg-green-500" : attendance > 50 ? "bg-yellow-500" : "bg-red-500"
              }`}
          />
        </div>
        <span className="text-xs font-bold text-gray-700 min-w-[35px]">
          {attendance.toFixed(0)}%
        </span>
      </div>

      {/* Action Icon */}
      <div className="w-10 flex justify-end">
        <div className="p-2 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 text-gray-300 transition-all">
          <SlArrowRight size={14} className="font-bold" />
        </div>
      </div>
    </div>
  );
};

export default DataRows;
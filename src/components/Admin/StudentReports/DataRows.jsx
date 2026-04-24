import React from "react";
import IMAGES from "../../../assets/images";

const avatarColors = [
  { bg: "#dcfce7", text: "#166534" },
  { bg: "#dbeafe", text: "#1e40af" },
  { bg: "#fef9c3", text: "#854d0e" },
  { bg: "#ede9fe", text: "#5b21b6" },
  { bg: "#fee2e2", text: "#991b1b" },
  { bg: "#ffedd5", text: "#9a3412" },
];

const getInitials = (name = "") =>
  name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const getColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length];

const DataRows = ({
  index,
  studentName,
  studentProfile,
  studentRollno,
  studentClass,
  contact,
  header,
  onClickFunction,
}) => {
  const color = getColor(studentName);

  if (header) {
    return (
      <>
        {/* Mobile Header */}
        <div className="flex sm:hidden items-center gap-3 px-3 py-2 rounded-lg bg-gray-100 mb-2">
          <span className="w-6 text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center shrink-0">#</span>
          <div className="w-9 shrink-0" />
          <span className="flex-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Student Info</span>
          <div className="w-5 shrink-0" />
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 mb-2">
          <span className="w-7 text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center shrink-0">#</span>
          <div className="w-10 shrink-0" />
          <span className="flex-[3] text-[10px] font-semibold text-gray-400 uppercase tracking-widest min-w-0">Name</span>
          <span className="flex-[2] text-[10px] font-semibold text-gray-400 uppercase tracking-widest min-w-0">Class</span>
          <span className="flex-[2] text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center min-w-0">Roll No.</span>
          <span className="flex-[3] text-[10px] font-semibold text-gray-400 uppercase tracking-widest min-w-0">Contact</span>
          <div className="w-5 shrink-0" />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile Row */}
      <div
        onClick={onClickFunction}
        className="flex sm:hidden items-center gap-3 px-3 py-3 rounded-xl bg-white border border-gray-200 mb-1.5 cursor-pointer transition-all duration-150 active:bg-blue-50 active:border-blue-300"
      >
        <span className="w-6 text-xs text-gray-400 text-center shrink-0">{index}</span>

        <div className="w-9 shrink-0 flex items-center justify-center">
          {studentProfile ? (
            <img
              src={studentProfile}
              alt={studentName}
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border"
              style={{ backgroundColor: color.bg, color: color.text, borderColor: color.bg }}
            >
              {getInitials(studentName)}
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0 justify-center">
          <span className="text-sm font-medium text-gray-800 truncate">{studentName}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[9px] font-medium px-2 py-0.5 rounded-full shrink-0 truncate max-w-[80px]"
              style={{ backgroundColor: color.bg, color: color.text }}
            >
              {studentClass || "N/A"}
            </span>
            <span className="text-[10px] text-gray-500 truncate">Roll: {studentRollno || "N/A"}</span>
          </div>
        </div>

        <div className="w-5 shrink-0 flex justify-end">
          <svg
            className="w-3.5 h-3.5 text-gray-300"
            viewBox="0 0 14 14" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="5,2 10,7 5,12" />
          </svg>
        </div>
      </div>

      {/* Desktop Row */}
      <div
        onClick={onClickFunction}
        className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 mb-1.5 cursor-pointer transition-all duration-150 hover:bg-blue-50 hover:border-blue-300 hover:translate-x-0.5 group"
      >
        <span className="w-7 text-xs text-gray-400 text-center shrink-0">{index}</span>

        <div className="w-10 shrink-0 flex items-center justify-center">
          {studentProfile ? (
            <img
              src={studentProfile}
              alt={studentName}
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold border"
              style={{ backgroundColor: color.bg, color: color.text, borderColor: color.bg }}
            >
              {getInitials(studentName)}
            </div>
          )}
        </div>

        <span className="flex-[3] text-sm font-medium admin text-gray-800 truncate min-w-0">{studentName}</span>

        <div className="flex-[2] min-w-0">
          <span
            className="text-[11px] font-medium px-2.5 py-1 rounded-full inline-block truncate max-w-full"
            style={{ backgroundColor: color.bg, color: color.text }}
          >
            {studentClass || "N/A"}
          </span>
        </div>

        <span className="flex-[2] text-xs text-gray-500 text-center min-w-0 truncate">{studentRollno || "N/A"}</span>

        <span className="flex-[3] text-xs text-gray-500 truncate min-w-0">{contact}</span>

        <div className="w-5 shrink-0 flex justify-end">
          <svg
            className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-all duration-150 group-hover:translate-x-0.5"
            viewBox="0 0 14 14" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="5,2 10,7 5,12" />
          </svg>
        </div>
      </div>
    </>
  );
};

export default DataRows;
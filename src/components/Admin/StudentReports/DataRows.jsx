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
      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-100 mb-2">
        <span className="w-7 text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center">#</span>
        <div className="w-10 shrink-0" />
        <span className="flex-[3] text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Name</span>
        <span className="flex-[2] text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Class</span>
        <span className="flex-[2] text-[10px] font-semibold text-gray-400 uppercase tracking-widest text-center">Roll No.</span>
        <span className="flex-[3] text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Contact</span>
        <div className="w-5 shrink-0" />
      </div>
    );
  }

  return (
    <div
      onClick={onClickFunction}
      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 mb-1.5 cursor-pointer transition-all duration-150 hover:bg-blue-50 hover:border-blue-300 hover:translate-x-0.5 group"
    >
      {/* Index */}
      <span className="w-7 text-xs text-gray-400 text-center shrink-0">{index}</span>

      {/* Avatar */}
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

      {/* Name */}
      <span className="flex-[3] text-sm font-medium text-gray-800 truncate">{studentName}</span>

      {/* Class Badge */}
      <div className="flex-[2]">
        <span
          className="text-[11px] font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: color.bg, color: color.text }}
        >
          {studentClass || "N/A"}
        </span>
      </div>

      {/* Roll No */}
      <span className="flex-[2] text-xs text-gray-500 text-center">{studentRollno || "N/A"}</span>

      {/* Contact */}
      <span className="flex-[3] text-xs text-gray-500 truncate">{contact}</span>

      {/* Arrow */}
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
  );
};

export default DataRows;
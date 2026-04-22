import React from "react";
import IMAGES from "../../../assets/images";

const getAttendanceLevel = (pct) => {
  if (pct >= 75) return { bar: "from-emerald-500 to-green-600", text: "text-green-600", bg: "bg-green-50", label: pct >= 85 ? "Excellent" : "Good" };
  if (pct >= 60) return { bar: "from-amber-400 to-yellow-500", text: "text-amber-600", bg: "bg-amber-50", label: "Average" };
  return { bar: "from-red-400 to-red-600", text: "text-red-600", bg: "bg-red-50", label: "At Risk" };
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const avatarColors = [
  "bg-indigo-100 text-indigo-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-pink-100 text-pink-700",
  "bg-sky-100 text-sky-700",
];

const DataRows = ({
  index,
  subject,
  studentName,
  studentProfile,
  studentClass,
  attendance,
  header,
  onClickFunction,
}) => {
  if (header) {
    return (
      <div className="grid grid-cols-[48px_48px_1.5fr_1fr_1fr_200px] gap-4 items-center px-5 py-3 bg-[#F8F9FF] border-b border-[#E8EAEF] min-w-[800px] lg:min-w-full">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">#</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">Profile</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">Student Name</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">Class</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">Subject</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">Attendance</span>
      </div>
    );
  }

  const level = getAttendanceLevel(attendance);
  const avatarColor = avatarColors[(index - 1) % avatarColors.length];

  return (
    <div
      onClick={onClickFunction}
      className="grid grid-cols-[48px_48px_1.5fr_1fr_1fr_200px] gap-4 items-center px-5 py-4 border-b border-[#F0F2F8] cursor-pointer hover:bg-[#F8F9FF] transition-colors duration-150 last:border-b-0 min-w-[800px] lg:min-w-full"
    >
      {/* Index */}
      <span className="text-sm font-semibold text-[#B0B6D3]">
        {String(index).padStart(2, "0")}
      </span>

      {/* Profile */}
      <div className="flex justify-start">
        {studentProfile ? (
          <img
            className="w-8 h-8 rounded-full object-cover border border-gray-100"
            src={studentProfile}
            alt={studentName}
          />
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold ${avatarColor}`}>
            {getInitials(studentName)}
          </div>
        )}
      </div>

      {/* Student Name */}
      <div>
        <p className="text-sm font-semibold text-[#0B1053]">{studentName}</p>
      </div>

      {/* Class */}
      <div>
        <p className="text-sm font-medium text-gray-600">{studentClass}</p>
      </div>

      {/* Subject */}
      <div>
        <p className="text-sm font-medium text-gray-600">{subject}</p>
      </div>

      {/* Attendance bar */}
      <div className="flex flex-col gap-1">
        <div className={`flex justify-between text-xs font-semibold ${level.text}`}>
          <span>{level.label}</span>
          <span>{Number(attendance).toFixed(1)}%</span>
        </div>
        <div className="bg-[#F0F2F8] rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${level.bar} transition-all duration-500`}
            style={{ width: `${attendance}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default DataRows;

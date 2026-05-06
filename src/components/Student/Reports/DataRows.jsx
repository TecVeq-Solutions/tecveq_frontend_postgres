import React from "react";

const getAttendanceLevel = (pct) => {
  if (pct >= 75) return { bar: "from-[#10b981] to-[#059669]", text: "text-[#059669]", bg: "bg-[#ecfdf5]", label: pct >= 85 ? "Excellent" : "Good" };
  if (pct >= 60) return { bar: "from-[#fbbf24] to-[#eab308]", text: "text-[#d97706]", bg: "bg-[#fffbeb]", label: "Average" };
  return { bar: "from-[#f87171] to-[#dc2626]", text: "text-[#dc2626]", bg: "bg-[#fef2f2]", label: "At Risk" };
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

const DataRows = ({ index, subject, instructor, attendance, header, onClickFunction }) => {
  /* ─── HEADER ─── */
  if (header) {
    return (
      <>
        {/* Mobile header — 3 visible cols */}
        <div className="flex sm:hidden items-center px-4 py-2.5 bg-[#F8F9FF] border-b border-[#E8EAEF]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B92B3] w-7 shrink-0">#</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B92B3] flex-1">Subject</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8B92B3]">Attendance</span>
        </div>

        {/* Desktop header — 4 cols */}
        <div className="hidden sm:grid grid-cols-[48px_1fr_1fr_200px] gap-4 items-center px-5 py-3 bg-[#F8F9FF] border-b border-[#E8EAEF]">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">#</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">Subject</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">Instructor</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">Attendance</span>
        </div>
      </>
    );
  }

  const level = getAttendanceLevel(attendance);
  const avatarColor = avatarColors[(index - 1) % avatarColors.length];

  return (
    <>
      {/* ─── MOBILE ROW (< sm) ─── */}
      <div
        onClick={onClickFunction}
        className="sm:hidden px-4 py-3.5 border-b border-[#F0F2F8] last:border-b-0 cursor-pointer active:bg-[#F8F9FF] transition-colors"
      >
        {/* Line 1: index + subject + badge */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-[#B0B6D3] w-6 shrink-0">
            {String(index).padStart(2, "0")}
          </span>
          <p className="text-sm font-semibold text-[#0B1053] flex-1 truncate">{subject}</p>
          <span className={`text-[10px] font-semibold ${level.text} ${level.bg} px-2 py-0.5 rounded-full shrink-0`}>
            {level.label}
          </span>
        </div>

        {/* Line 2: instructor + percentage + bar */}
        <div className="pl-8 flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${avatarColor}`}>
                {getInitials(instructor)}
              </div>
              <span className="text-xs text-gray-500 truncate">{instructor}</span>
            </div>
            <span className={`text-xs font-bold shrink-0 ml-2 ${level.text}`}>{attendance}%</span>
          </div>
          <div className="bg-[#F0F2F8] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${level.bar} transition-all duration-500`}
              style={{ width: `${attendance}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── DESKTOP ROW (≥ sm) ─── */}
      <div
        onClick={onClickFunction}
        className="hidden sm:grid grid-cols-[48px_1fr_1fr_200px] gap-4 items-center px-5 py-4 border-b border-[#F0F2F8] last:border-b-0 cursor-pointer hover:bg-[#F8F9FF] transition-colors duration-150"
      >
        <span className="text-sm font-semibold text-[#B0B6D3]">
          {String(index).padStart(2, "0")}
        </span>

        <div>
          <p className="text-sm font-semibold text-[#0B1053]">{subject}</p>
        </div>

        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor}`}>
            {getInitials(instructor)}
          </div>
          <p className="text-sm font-medium text-gray-700 truncate">{instructor}</p>
        </div>

        <div className="flex flex-col gap-1">
          <div className={`flex justify-between text-xs font-semibold ${level.text}`}>
            <span>{level.label}</span>
            <span>{attendance}%</span>
          </div>
          <div className="bg-[#F0F2F8] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${level.bar} transition-all duration-500`}
              style={{ width: `${attendance}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DataRows;
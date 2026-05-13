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
  if (!header && subject === instructor) return null;

  if (header) {
    return (
      // Desktop header only — hidden on mobile
      <div className="hidden sm:grid grid-cols-[48px_1fr_1fr_200px] gap-4 items-center px-5 py-3 bg-[#F8F9FF] border-b border-[#E8EAEF]">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">#</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">Subject</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">Instructor</span>
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B92B3]">Attendance</span>
      </div>
    );
  }

  const level = getAttendanceLevel(attendance);
  const avatarColor = avatarColors[(index - 1) % avatarColors.length];

  return (
    <>
      {/* ── Mobile card layout (hidden on sm+) ── */}
      <div
        onClick={onClickFunction}
        className="sm:hidden flex flex-col gap-2 px-2 sm:px-4 py-4 border-b border-[#F0F2F8] cursor-pointer active:bg-[#F8F9FF] transition-colors"
      >
        {/* Row 1: index + subject name + badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#B0B6D3]">
              {String(index).padStart(2, "0")}
            </span>
            <p className="text-sm font-semibold text-[#0B1053]">{subject}</p>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${level.text} ${level.bg}`}>
            {level.label}
          </span>
        </div>

        {/* Row 2: instructor avatar + name */}
        <div className="flex items-center gap-2 pl-6">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${avatarColor}`}>
            {getInitials(instructor)}
          </div>
          <p className="text-xs font-medium text-gray-500">{instructor}</p>
        </div>

        {/* Row 3: progress bar */}
        <div className="pl-6 flex flex-col gap-1">
          <div className={`flex justify-between text-[11px] font-semibold ${level.text}`}>
            <span>Attendance</span>
            <span>{attendance || 0}%</span>
          </div>
          <div className="bg-[#F0F2F8] rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${level.bar} transition-all duration-500`}
              style={{ width: `${attendance || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Desktop table row (hidden on mobile) ── */}
      <div
        onClick={onClickFunction}
        className="hidden sm:grid grid-cols-[48px_1fr_1fr_200px] gap-4 items-center px-5 py-4 border-b border-[#F0F2F8] cursor-pointer hover:bg-[#F8F9FF] transition-colors duration-150 last:border-b-0"
      >
        <span className="text-sm font-semibold text-[#B0B6D3]">
          {String(index).padStart(2, "0")}
        </span>

        <div>
          <p className="text-sm font-semibold text-[#0B1053]">{subject}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor}`}>
            {getInitials(instructor)}
          </div>
          <p className="text-sm font-medium text-gray-700 truncate">{instructor}</p>
        </div>

        <div className="flex flex-col gap-1">
          <div className={`flex justify-between text-xs font-semibold ${level.text}`}>
            <span>{level.label}</span>
            <span>{attendance || 0}%</span>
          </div>
          <div className="bg-[#F0F2F8] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${level.bar} transition-all duration-500`}
              style={{ width: `${attendance || 0}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default DataRows;
import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const roleConfig = {
  student: {
    label: "Student",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-400",
  },
  teacher: {
    label: "Teacher",
    bg: "bg-violet-50",
    text: "text-violet-600",
    dot: "bg-violet-500",
  },
  parent: {
    label: "Parent",
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-400",
  },
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-400 to-teal-500",
  "from-pink-500 to-rose-500",
  "from-amber-400 to-orange-500",
];

const getAvatarColor = (name = "") => {
  const code = name.charCodeAt(0) || 0;
  return avatarColors[code % avatarColors.length];
};

const DataRows = ({
  data,
  index,
  header,
  userName,
  role,
  userId,
  userclass,
  contact,
  onClickFunction,
  toggleClassMenu,
}) => {
  if (header) {
    return (
      <div className="flex flex-row items-center px-4 py-3 min-w-[640px] mb-2
        bg-gradient-to-r from-[#0B1053] to-[#1a1f7a]
        rounded-2xl shadow-[0_4px_20px_rgba(11,16,83,0.25)]">

        {/* Sr No */}
        <div className="w-[5%] min-w-[44px] text-center">
          <span className="text-xs font-semibold text-white uppercase tracking-widest">#</span>
        </div>

        {/* Name */}
        <div className="w-[28%] min-w-[130px] pl-10">
          <span className="text-xs font-semibold text-white uppercase tracking-widest">Name</span>
        </div>

        {/* Role */}
        <div className="w-[14%] min-w-[90px] text-center">
          <span className="text-xs font-semibold text-white uppercase tracking-widest">Role</span>
        </div>

        {/* ID */}
        <div className="w-[18%] min-w-[100px] text-center">
          <span className="text-xs font-semibold text-white uppercase tracking-widest">
            {userId}
          </span>
        </div>

        {/* Class */}
        <div className="w-[12%] min-w-[70px] text-center">
          <span className="text-xs font-semibold text-white uppercase tracking-widest">Class</span>
        </div>

        {/* Contact */}
        <div className="w-[18%] min-w-[110px] text-center">
          <span className="text-xs font-semibold text-white uppercase tracking-widest">Contact</span>
        </div>

        {/* Actions */}
        <div className="w-[5%] min-w-[44px]" />
      </div>
    );
  }

  const config = roleConfig[role?.toLowerCase()] || roleConfig.student;
  const initials = getInitials(userName);
  const avatarGrad = getAvatarColor(userName);

  return (
    <div
      onClick={onClickFunction}
      className="group flex flex-row items-center px-4 py-3 min-w-[640px] my-1
        bg-white border border-[#f0f0f8]
        rounded-2xl cursor-pointer
        shadow-[0_1px_4px_rgba(11,16,83,0.06)]
        hover:shadow-[0_6px_24px_rgba(106,0,255,0.12)]
        hover:border-[#6A00FF]/20
        hover:bg-gradient-to-r hover:from-white hover:to-[#faf8ff]
        transition-all duration-200 ease-out
        relative overflow-hidden"
    >
      {/* Left accent bar on hover */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl
        bg-gradient-to-b from-[#6A00FF] to-[#a855f7]
        scale-y-0 group-hover:scale-y-100
        transition-transform duration-200 origin-center" />

      {/* Sr No */}
      <div className="w-[5%] min-w-[44px] text-center">
        <span className="text-xs font-bold text-[#0B1053]/30">{index}</span>
      </div>

      {/* Avatar + Name */}
      <div className="w-[28%] min-w-[130px] flex items-center gap-3">
        <div className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${avatarGrad}
          flex items-center justify-center
          shadow-[0_2px_8px_rgba(0,0,0,0.15)]
          text-white text-xs font-bold tracking-wide`}>
          {initials}
        </div>
        <span className="text-sm font-semibold text-[#0B1053] truncate group-hover:text-[#6A00FF] transition-colors duration-200">
          {userName}
        </span>
      </div>

      {/* Role Badge */}
      <div className="w-[14%] min-w-[90px] flex justify-center">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {role?.charAt(0).toUpperCase() + role?.slice(1)}
        </span>
      </div>

      {/* User ID */}
      <div className="w-[18%] min-w-[100px] text-center">
        <span className="text-xs font-mono font-medium text-[#0B1053]/60 bg-[#f4f4fb] px-2 py-1 rounded-lg">
          {userId}
        </span>
      </div>

      {/* Class */}
      <div className="w-[12%] min-w-[70px] text-center">
        <span className="text-sm text-[#0B1053]/60 font-medium">{userclass || "—"}</span>
      </div>

      {/* Contact */}
      <div className="w-[18%] min-w-[110px] text-center">
        <span className="text-sm text-[#0B1053]/60">{contact}</span>
      </div>

      {/* Actions */}
      <div className="w-[5%] min-w-[44px] flex justify-center">
        <button
          onClick={(e) => { e.stopPropagation(); toggleClassMenu(data); }}
          className="w-8 h-8 rounded-xl flex items-center justify-center
            text-[#0B1053]/30
            hover:bg-[#6A00FF]/10 hover:text-[#6A00FF]
            opacity-0 group-hover:opacity-100
            transition-all duration-150"
        >
          <BsThreeDotsVertical size={16} />
        </button>
      </div>
    </div>
  );
};

export default DataRows;
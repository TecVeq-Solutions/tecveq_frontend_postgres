import React from "react";
import { GoHome } from "react-icons/go";
import { VscGraph, VscLayers } from "react-icons/vsc";
import { LuCalendar, LuBookOpen, LuUsers, LuLayoutDashboard } from "react-icons/lu";
import { CiCalendarDate } from "react-icons/ci";
import { IoIosSettings } from "react-icons/io";
import { SiGoogleclassroom } from "react-icons/si";
import { GiTeacher } from "react-icons/gi";
import { MdAnnouncement, MdOutlineSubject } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { TbReport } from "react-icons/tb";

const iconMap = {
  home: GoHome,
  time: CiCalendarDate,
  graph: VscGraph,
  book: LuBookOpen,
  quiz: LuCalendar,
  teachers: GiTeacher,
  announcement: MdAnnouncement,
  manageUsers: FaUsers,
  levels: VscLayers,
  "attendence-reprt": TbReport,
  "attendence-report": TbReport,
  subjects: MdOutlineSubject,
  classroom: LuLayoutDashboard,
  setting: IoIosSettings,
  calendar: LuCalendar,
};

const Custombutton = ({ title, active, onpress, icon }) => {
  const Icon = iconMap[icon] || LuCalendar;

  return (
    <div
      onClick={onpress}
      className={`dashboard relative   flex items-center gap-3.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group overflow-hidden
        ${active
          ? "bg-gradient-to-r from-white/[0.12] to-white/[0.02] border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.15)] backdrop-blur-md"
          : "hover:bg-white/[0.06] hover:translate-x-1.5"
        }`}
    >
      {/* Active Line Indicator */}
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-[4px] bg-white rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
        />
      )}

      {/* Icon with hover & active scaling and glow */}
      <Icon
        size={20}
        className={`flex-shrink-0 transition-all duration-300 relative z-10 ${active
          ? "text-white opacity-100 scale-110 drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]"
          : "text-white/70 group-hover:text-white group-hover:opacity-100 group-hover:scale-110 group-hover:drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]"
          }`}
      />

      {/* Title */}
      <span
        className={`text-[14px] sm:text-[16px] transition-all duration-300 relative z-10 ${active
          ? "text-white font-semibold tracking-wide"
          : "text-white/70 group-hover:text-white font-medium"
          }`}
      >
        {title}
      </span>

      {/* Subtle hover background highlight right side */}
      {!active && (
        <span className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </div>
  );
};

export default Custombutton;

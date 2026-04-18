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
};

const Custombutton = ({ title, active, onpress, icon }) => {
  const Icon = iconMap[icon] || LuCalendar;

  return (
    <div
      onClick={onpress}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 group
        ${active ? "bg-white/10" : "hover:bg-white/[0.06]"}`}
    >
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#e8e9f5] rounded-r-full" />
      )}
      <Icon
        size={17}
        className={`flex-shrink-0 transition-opacity ${active ? "opacity-100" : "opacity-50 group-hover:opacity-70"}`}
        color="white"
      />
      <span
        className={`text-sm transition-all ${
          active ? "text-white font-medium" : "text-white/55 group-hover:text-white/75"
        }`}
      >
        {title}
      </span>
    </div>
  );
};

export default Custombutton;

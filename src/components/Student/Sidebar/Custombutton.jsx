import React from "react";
import { GoHome } from "react-icons/go";
import { VscGraph, VscLayers } from "react-icons/vsc";
import { LuCalendar, LuBookOpen, LuUsers, LuLayoutDashboard } from "react-icons/lu";
import { CiCalendarDate } from "react-icons/ci";

const iconMap = {
  home: GoHome,
  time: CiCalendarDate,
  graph: VscGraph,
  book: LuBookOpen,
  quiz: LuCalendar,
  attendence: LuUsers,
  classroom: LuLayoutDashboard,
  levels: VscLayers,
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

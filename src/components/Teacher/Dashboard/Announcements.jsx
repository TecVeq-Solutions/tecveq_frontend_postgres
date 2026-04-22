import React from "react";
import { useGetAnnoucementByUserType } from "../../../api/Teacher/Annoucement";
import { HiOutlineSpeakerphone, HiOutlineArrowNarrowRight } from "react-icons/hi";
import { LuCalendarDays, LuBellRing } from "react-icons/lu";

const Announcements = () => {
  const { announcementByUsertype, isLoading } = useGetAnnoucementByUserType();

  const filteredData = announcementByUsertype?.filter(
    (item) => (item.visibility === "all" || item.visibility === "teacher") && item.type === "annoouncement"
  ) || [];

  const AnnouncementCard = ({ item }) => (
    <div className="relative bg-white mt-1 p-5 mb-5 rounded-2xl border border-blue-100 shadow-md shadow-blue-500/5 transition-transform duration-300 hover:scale-[1.01] overflow-hidden text-xs">

      {/* 1. Default Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-transparent" />

      {/* 2. Side Accent Bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-r-lg" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-3 gap-3">
          <div className="flex items-start gap-3">
            {/* Active Icon Style */}
            <span className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 shrink-0">
              <LuBellRing size={16} />
            </span>
            <h4 className="text-[16px] font-bold text-slate-800 leading-tight">
              {item.title}
            </h4>
          </div>

          {/* Calendar Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[10px] font-bold text-blue-600 shadow-sm uppercase shrink-0">
            <LuCalendarDays size={12} />
            {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Description */}
        <p className="text-[13px] text-slate-600 leading-relaxed ml-11 break-all">
          {item.description}
        </p>

        {/* 3. Bottom Footer */}
        <div className="mt-4 ml-11 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1 uppercase tracking-wider">
            Important Update <HiOutlineArrowNarrowRight />
          </span>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 gap-6 h-full sm:p-2">
      {/* Modern Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-2xl shadow-xl shadow-slate-200">
            <HiOutlineSpeakerphone className="text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800 tracking-tight leading-none">
              Announcements
            </h2>
            <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">Campus Feed</span>
          </div>
        </div>
      </div>

      {/* Main List Container */}
      <div
        className="flex flex-col w-full px-2 sm:px-4 py-4 bg-slate-100/40 rounded-xl overflow-y-auto register-scrollbar border border-white shadow-inner"
        style={{
          maxHeight: "340px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0,0,0,0.1) transparent",
        }}
      >

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-full gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold text-sm tracking-widest animate-pulse">SYNCING DATA...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="space-y-1">
            {filteredData.map((item, index) => (
              <AnnouncementCard key={item.id || index} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-50 text-center">
              <span className="text-6xl block mb-4">✨</span>
              <h3 className="text-lg font-black text-slate-800">Clear Skies!</h3>
              <p className="text-slate-500 text-sm">No new announcements for today.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;


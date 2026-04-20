import React from "react";
import { IoClose, IoNotificationsOutline, IoMegaphoneOutline } from "react-icons/io5";
import { GoDotFill } from "react-icons/go";
import { useQuery } from "@tanstack/react-query";
import { getAllAnnouncements } from "../../api/ForAllAPIs";
import moment from 'moment';

const Notifications = ({ onclose, dashboard }) => {
  const { data } = useQuery({ queryKey: ["announcements"], queryFn: getAllAnnouncements });

  const Notification = ({ item }) => {
    const isNew = moment().diff(moment(item.createdAt), 'minutes') < 5;

    return (
      <div className="relative group mb-4 transition-all duration-300">
        {/* Subtle Glow Effect on Hover */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-20 transition duration-300 blur"></div>

        <div className="relative flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex gap-4">
            {/* Dynamic Icon Box */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isNew ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-400'
              }`}>
              {isNew ? <IoMegaphoneOutline size={22} /> : <IoNotificationsOutline size={22} />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[11px] font-bold uppercase tracking-widest ${isNew ? 'text-blue-600' : 'text-slate-400'}`}>
                  {isNew ? "Recent Update" : "Announcement"}
                </span>
                {!item.isRead && (
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                )}
              </div>

              <h4 className="text-[14px] font-bold text-slate-800 leading-tight mb-1 group-hover:text-blue-700 transition-colors">
                {item.title || "New System Update"}
              </h4>

              <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2">
                {item.description || item.message}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-slate-100"></div>
                <span className="text-[10px] font-semibold text-slate-400 italic">
                  {moment(item.createdAt).fromNow()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`fixed inset-y-0 right-0 z-[200] flex flex-col bg-[#F8FAFC] border-l border-slate-200 shadow-[0_0_50px_-12px_rgba(0,0,0,0.15)] transition-all duration-500 md:w-[420px] w-full ${!dashboard ? "pt-20" : "pt-0"}`}>

      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden bg-white px-3 sm:px-6 py-8 border-b border-slate-100">
        {/* Abstract Background Shapes for Visual Interest */}
        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-blue-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-indigo-50 rounded-full blur-2xl"></div>

        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Feed <span className="text-blue-600">.</span>
            </h2>
            <p className="text-sm font-medium text-slate-500">
              You have <span className="text-blue-600 font-bold">{data?.length || 0}</span> updates today
            </p>
          </div>
          <button
            onClick={onclose}
            className="group p-2 bg-slate-50 hover:bg-red-50 rounded-xl transition-all duration-300"
          >
            <IoClose size={24} className="text-slate-400 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-6 no-scrollbar custom-scroll">
        {data && data.length > 0 ? (
          data.map((item, index) => (
            <div key={item.id} className="animate-in slide-in-from-right duration-500" style={{ animationDelay: `${index * 50}ms` }}>
              <Notification item={item} />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <IoNotificationsOutline size={40} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No new announcements</p>
            <p className="text-xs text-slate-400 px-10">We'll notify you when something important arrives.</p>
          </div>
        )}
      </div>

      {/* Premium Footer */}
      <div className="p-6 bg-white border-t border-slate-100">
        <button className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95">
          Clear All Notifications
        </button>
      </div>
    </div>
  );
};

export default Notifications;
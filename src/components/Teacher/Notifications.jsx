import React, { useState } from "react";
import { IoClose, IoNotificationsOutline, IoMegaphoneOutline } from "react-icons/io5";
import { CiBellOn } from "react-icons/ci";
import pdf from "../../assets/pdf.png";
import { GoDotFill } from "react-icons/go";
import { useGetAnnoucementByUserType } from "../../api/Teacher/Annoucement";
import { useGetNotifications } from "../../api/Teacher/NotificationApi";
import moment from "moment";

const Notifications = ({ onclose, dashboard }) => {
  const [activeTab, setActiveTab] = useState("notification");
  const { notifications, isLoading: notificationsLoading } = useGetNotifications();

  // Notification Item Component
  const NotificationItem = ({ data }) => {
    const [moredetails, setMoredetails] = useState(false);
    return (
      <div className="relative group mb-4 transition-all duration-300">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#149B9A] to-[#0B1053] rounded-2xl opacity-0 group-hover:opacity-10 transition duration-300 blur"></div>
        <div className="relative flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="flex gap-4">
            <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 bg-slate-50 text-[#149B9A]`}>
              <IoNotificationsOutline size={22} />
            </div>
            <div className="flex-1 min-w-0" onClick={() => setMoredetails(!moredetails)}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#149B9A]">
                  {data.userID?.name || "Student"}
                </span>
                <span className={`h-2 w-2 rounded-full ${!data.isRead ? "bg-[#149B9A] animate-pulse" : "bg-slate-200"}`} />
              </div>
              <h4 className="text-[13px] font-bold text-slate-800 leading-tight mb-1 group-hover:text-[#0B1053] transition-colors">
                {data.message}
              </h4>
              <p className="text-slate-500 text-[12px] leading-relaxed line-clamp-2">
                <span className="text-[#0B1053] font-medium">{data.subjectName} {data.classroomName}</span>
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-[1px] flex-1 bg-slate-50"></div>
                <span className="text-[10px] font-semibold text-slate-400">
                  {moment(data.createdAt).fromNow()}
                </span>
              </div>
            </div>
          </div>
          {moredetails && data.file && (
            <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-3 ml-1">
              <img src={pdf} alt="pdf" className="w-8 h-8 object-contain" />
              <a href={data.file.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-medium text-[#149B9A] hover:underline truncate">
                {data.file.name}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Announcement List Component
  const AnnouncementList = () => {
    const { announcementByUsertype } = useGetAnnoucementByUserType();
    const [activeId, setActiveId] = useState(null);

    return (
      <div className="space-y-4">
        {announcementByUsertype && announcementByUsertype.length > 0 ? (
          announcementByUsertype.map((item) => (
            <div key={item.id} className="relative group transition-all duration-300">
              <div className="relative flex flex-col p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-4 cursor-pointer" onClick={() => setActiveId(activeId === item.id ? null : item.id)}>
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <IoMegaphoneOutline size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600">
                        {item.type || "Global"}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {moment(item.date).format("MMM DD")}
                      </span>
                    </div>
                    <h4 className="text-[14px] font-bold text-slate-800 leading-tight mb-1">
                      {item.title}
                    </h4>
                    <p className={`text-slate-500 text-[12px] leading-relaxed ${activeId === item.id ? "" : "line-clamp-2"}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <IoMegaphoneOutline size={40} className="text-slate-200 mb-2" />
            <p className="text-slate-400 text-sm font-medium">No announcements found</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed top-16 sm:top-20 right-0 bottom-0 z-[200] flex flex-col bg-[#F8FAFC] border-l border-slate-200 animate-slide-in md:w-[400px] w-full shadow-2xl`}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .notifications-scroll::-webkit-scrollbar { width: 5px; }
        .notifications-scroll::-webkit-scrollbar-track { background: transparent; }
        .notifications-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      {/* Header */}
      <div className="relative overflow-hidden bg-white px-3 sm:px-6 py-8 border-b border-slate-100">
        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-[#149B9A]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-[#149B9A]/5 rounded-full blur-2xl opacity-60"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Updates <span className="text-[#149B9A]">.</span>
            </h2>
            <div className="mt-4 flex bg-slate-50 gap-2 p-1 rounded-xl border border-slate-100">
              <button
                className={`flex-1 py-2 px-2 text-[12px] font-bold rounded-lg transition-all ${activeTab === "notification" ? "bg-white text-[#0B1053] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                onClick={() => setActiveTab("notification")}
              >
                Notifications
              </button>
              <button
                className={`flex-1 py-2 px-2 text-[12px] font-bold rounded-lg transition-all ${activeTab === "announcement" ? "bg-white text-[#0B1053] shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                onClick={() => setActiveTab("announcement")}
              >
                Announcements
              </button>
            </div>
          </div>
          <button onClick={onclose} className="p-2 hover:bg-red-50 rounded-xl transition-all group">
            <IoClose size={24} className="text-slate-400 group-hover:text-red-500" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto notifications-scroll">
        {activeTab === "notification" ? (
          notificationsLoading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />)}
            </div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} data={notification} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <IoNotificationsOutline size={40} className="text-slate-200 mb-2" />
              <p className="text-slate-400 text-sm font-medium">No new notifications</p>
            </div>
          )
        ) : (
          <AnnouncementList />
        )}
      </div>

      {/* Footer */}
      <div className="p-6 bg-white border-t border-slate-100">
        <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          End of Updates
        </p>
      </div>
    </div>
  );
};

export default Notifications;

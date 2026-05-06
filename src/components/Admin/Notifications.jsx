import React from "react";
import { IoClose, IoNotificationsOutline, IoMegaphoneOutline } from "react-icons/io5";
import { CiBellOn } from "react-icons/ci";
import { GoDotFill } from "react-icons/go";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllAnnouncements } from "../../api/ForAllAPIs";
import { getAllNotifications, clearAllNotifications } from "../../api/Admin/NotificationApi";
import moment from 'moment';
import { toast } from "react-toastify";

const Notifications = ({ onclose, dashboard }) => {
  const queryClient = useQueryClient();
  const { data: announcements, isPending: isPendingAnn } = useQuery({ queryKey: ["announcements"], queryFn: getAllAnnouncements });
  const { data: notifications, isPending: isPendingNoti } = useQuery({ queryKey: ["notifications"], queryFn: getAllNotifications });

  const clearMutation = useMutation({
    mutationFn: clearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notifications cleared!");
    },
    onError: () => {
      toast.error("Failed to clear notifications");
    }
  });

  const allData = [
    ...(announcements || []).map(a => ({ ...a, _type: 'announcement' })),
    ...(notifications || []).map(n => ({ ...n, _type: 'notification' }))
  ].sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)));

  const NotificationItem = ({ item }) => {
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
                  {item._type === 'announcement' ? (isNew ? "Recent Update" : "Announcement") : "Notification"}
                </span>
                {item.isRead === false && (
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
    <div className={`fixed top-20 right-0 bottom-0 z-[200] flex flex-col bg-[#F8FAFC] border-l border-slate-200 animate-slide-in md:w-[420px] w-full shadow-2xl`}>
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

      {/* Header with Gradient Background */}
      <div className="relative overflow-hidden bg-white px-3 sm:px-6 py-8 border-b border-slate-100">
        <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-blue-50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-24 h-24 bg-indigo-50 rounded-full blur-2xl opacity-60"></div>

        <div className="relative flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Feed</h2>
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse mt-2"></div>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm font-medium">
              You have <span className="text-blue-600 font-bold">{allData.length}</span> updates today
            </p>
          </div>
          <button
            onClick={onclose}
            className="group p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <IoClose size={20} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>
        </div>
      </div>

      {/* Notifications List - Now Scrollable */}
      <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto notifications-scroll">
        {(isPendingNoti || isPendingAnn) ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 opacity-40">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold tracking-widest uppercase">Loading</p>
          </div>
        ) : allData.length > 0 ? (
          allData.map((item, idx) => (
            <NotificationItem key={item.id || idx} item={item} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 shadow-inner">
              <CiBellOn size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-900 font-bold text-base mb-1">All caught up!</p>
            <p className="text-slate-400 text-xs">No new updates or announcements for you right now.</p>
          </div>
        )}
      </div>

      {/* Premium Footer */}
      {/* <div className="p-6 bg-white border-t border-slate-100">
        <button
          onClick={() => clearMutation.mutate()}
          disabled={clearMutation.isPending}
          className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {clearMutation.isPending ? "Clearing..." : "Clear All Notifications"}
        </button>
      </div> */}
    </div>
  );
};

export default Notifications;
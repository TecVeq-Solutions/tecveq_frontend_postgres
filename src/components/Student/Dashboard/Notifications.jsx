import React, { useEffect, useState } from "react";
import pdf from "../../../assets/pdf.png";
import profile from "../../../assets/profile.png";

import { IoClose } from "react-icons/io5";
import { useUser } from "../../../context/UserContext";
import { useStudent } from "../../../context/StudentContext";
import { useQuery } from "@tanstack/react-query";
import { getMyChats } from "../../../api/UserApis";
import { useGetAnnoucementByUserType } from "../../../api/Teacher/Annoucement";
import { formatDate } from "../../../constants/formattedDate";

const Notifications = ({ onclose, dashboard, data }) => {
  const [activeTab, setActiveTab] = useState("notification");
  const { socketContext } = useUser();
  const { allAssignments } = useStudent();

  useEffect(() => {
    console.log("now rendering navbar");
  }, []);

  const chatquery = useQuery({ queryKey: ["chat"], queryFn: getMyChats });

  // Helper: initials from name
  const getInitials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors = [
    "linear-gradient(135deg, #667eea, #764ba2)",
    "linear-gradient(135deg, #f093fb, #f5576c)",
    "linear-gradient(135deg, #4facfe, #00f2fe)",
    "linear-gradient(135deg, #43e97b, #38f9d7)",
    "linear-gradient(135deg, #fa709a, #fee140)",
  ];

  const getAvatarColor = (name = "") => {
    const idx = name.charCodeAt(0) % avatarColors.length;
    return avatarColors[idx];
  };

  const Notification = ({ item, isAssignment = true }) => {
    const [moredetails, setMoredetails] = useState(false);

    const teacherName = isAssignment
      ? item?.createdBy?.name || "Teacher"
      : item?.userID?.name || "Teacher";

    const timeDisplay = isAssignment
      ? formatDate(item?.dueDate)
      : formatDate(item?.createdAt);

    const message = isAssignment
      ? "Added an Assignment"
      : item?.message || "Notification";

    const subjectName = isAssignment
      ? item?.subjectID?.name || "Subject"
      : item?.subjectName || "";

    const className = isAssignment
      ? item?.classroomID?.name || "Class"
      : item?.classroomName || "";

    return (
      <div
        className="flex gap-3 p-3 rounded-xl cursor-pointer border border-transparent hover:bg-[#f8f9ff] hover:border-[#e0e3f5] transition-all duration-150 mb-1"
        onClick={() => setMoredetails(!moredetails)}
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold"
          style={{ background: getAvatarColor(teacherName) }}
        >
          {getInitials(teacherName)}
        </div>

        {/* Body */}
        <div className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <span className="text-sm font-semibold text-gray-900">{teacherName}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-gray-400 whitespace-nowrap">{timeDisplay}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">
            {message}{" "}
            <span className="text-[#0B1053] font-medium">
              {subjectName}
              {className && ` - ${className}`}
            </span>
          </p>

          {/* File preview */}
          {moredetails && isAssignment && item?.files?.length > 0 && (
            <div className="flex items-center gap-2 mt-2 bg-[#f3f4ff] border border-[#d4d8f5] rounded-lg px-3 py-2">
              <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                PDF
              </div>
              <div>
                <a
                  href={item.files[0]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#0B1053] hover:underline block"
                >
                  {item.files[0]?.name || "Assignment File"}
                </a>
                <p className="text-[11px] text-gray-400">{item.title}</p>
              </div>
            </div>
          )}

          {moredetails && !isAssignment && item?.file && (
            <div className="flex items-center gap-2 mt-2 bg-[#f3f4ff] border border-[#d4d8f5] rounded-lg px-3 py-2">
              <div className="w-8 h-8 rounded-md bg-red-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                PDF
              </div>
              <div>
                <a
                  href={item.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#0B1053] hover:underline block"
                >
                  {item.file.name}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const Announcement = () => {
    const { announcementByUsertype, isLoading } = useGetAnnoucementByUserType();
    const [activeAnnouncement, setActiveAnnouncement] = useState(null);

    const handleToggleDetails = (id) => {
      setActiveAnnouncement((prevId) => (prevId === id ? null : id));
    };

    return (
      <div className="py-2 w-full">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-3">
          📢 Announcements
        </p>
        {announcementByUsertype && announcementByUsertype.length > 0 ? (
          announcementByUsertype.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-2.5 hover:shadow-sm transition-shadow duration-200"
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => handleToggleDetails(announcement.id)}
              >
                <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest">
                  {announcement.type}
                </p>
                <h3 className="text-sm font-semibold text-gray-900 mt-1">
                  {announcement.title}
                </h3>
                <p className="text-[11px] text-gray-400 mt-1">
                  {new Date(announcement.date).toLocaleString()}
                </p>
              </div>

              {activeAnnouncement === announcement.id && (
                <div className="px-4 pb-4 pt-2 bg-[#f8f9ff] border-t border-gray-100">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {announcement.description}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm py-10">
            No announcements have been created
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className="z-10 fixed flex flex-col px-0 overflow-hidden bg-white top-20 right-0 md:right-2 w-80 md:w-96 h-[calc(100vh-80px)] animate-slide-in shadow-2xl"
      style={{ boxShadow: "0 8px 32px rgba(11,16,83,0.12)", borderRadius: "0 0 0 16px" }}
    >
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar { width: 5px; }
        .no-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .no-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
      {/* Header */}
      <div className="px-5 pt-5 pb-0 bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-[#0B1053]">Inbox</h2>
          <button
            onClick={onclose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <IoClose size={15} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl mb-4">
          <button
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === "notification"
                ? "bg-[#0B1053] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("notification")}
          >
            Notification
          </button>
          <button
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              activeTab === "announcement"
                ? "bg-[#0B1053] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("announcement")}
          >
            Announcement
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3">
        {activeTab === "notification" ? (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Recent
            </p>
            {data && data.length > 0 ? (
              data
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map((not) => (
                  <Notification key={not.id} item={not} isAssignment={false} />
                ))
            ) : allAssignments && allAssignments.length > 0 ? (
              allAssignments
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((assignment) => (
                  <Notification key={assignment.id} item={assignment} isAssignment={true} />
                ))
            ) : (
              <p className="text-center text-gray-400 text-sm py-10">
                No notifications yet
              </p>
            )}
          </>
        ) : (
          <Announcement />
        )}
      </div>
    </div>
  );
};

export default Notifications;
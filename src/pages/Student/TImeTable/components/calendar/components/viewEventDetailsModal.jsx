import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import ConfirmModal from "./ConfirmModal";
import meet from "../../../../../../assets/meet.png";
import IMAGES from "../../../../../../assets/images";
import useClickOutside from "../../../../../../hooks/useClickOutlise";

import { GoArrowRight } from "react-icons/go";
import { useStudent } from "../../../../../../context/StudentContext";

export default function ViewEventDetailsModal({
  open,
  setopen,
  event,
  setevents,
}) {
  const [confirmDeleteModalOpen, setconfirmDeleteModalOpen] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => setopen(false));

  const [isMeetingTime, setIsMeetingTime] = useState(false);

  const handleDeleteEvent = () => {
    console.log("dell event method");
  };

  useEffect(() => {
    if (!open || !event?.startTime || !event?.endTime) return;

    const checkMeeting = () => {
      let nowTime = new Date();
      let eventTime = new Date(event.startTime);
      let eventEndTime = new Date(event.endTime);

      if (nowTime >= eventTime && nowTime <= eventEndTime) {
        setIsMeetingTime(true);
      } else {
        setIsMeetingTime(false);
      }
    };

    checkMeeting();
  }, [open, event?.startTime, event?.endTime]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={() => setopen(false)}
      />

      <div
        ref={ref}
        className="relative bg-white p-3 sm:p-6 sm:p-8 w-full max-w-[450px] text-black rounded-3xl shadow-2xl transform transition-all"
      >
        <ConfirmModal
          isOpen={confirmDeleteModalOpen}
          title={"Confirm Delete"}
          description={"Are you sure you want to delete this event?"}
          onconfirm={(e) => {
            e.stopPropagation();
            handleDeleteEvent();
          }}
          onclose={(e) => {
            e.stopPropagation();
            setconfirmDeleteModalOpen(false);
          }}
        />

        <div className="flex flex-col w-full gap-6">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5 flex-1">
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.1em] font-poppins">Event Subject</p>
              <h2 className="text-2xl font-black text-gray-900 leading-tight font-poppins">
                {event?.name || event?.subject?.name || event?.subject || event?.title || "No Subject"}
              </h2>
            </div>
            <button
              onClick={() => setopen(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <img src={IMAGES.CloseIcon} className="w-4 h-4 opacity-50 group-hover:opacity-100" alt="close" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Instructor Card */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-poppins">Assigned Instructor</p>
              <div className="flex items-center gap-4 bg-indigo-50/50 border border-indigo-100/50 p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-200">
                  {(event?.teacher?.name || "U")[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 font-poppins">{event?.teacher?.name || "Unknown Instructor"}</p>
                  <p className="text-[10px] text-indigo-600 font-medium font-poppins">Professional Educator</p>
                </div>
              </div>
            </div>

            {/* Date Card */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-poppins">Session Date</p>
              <div className="flex justify-between items-center bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 text-indigo-600 font-bold">
                    📅
                  </div>
                  <p className="text-sm font-bold text-gray-700 font-poppins">
                    {moment.utc(event.start).format("dddd, DD MMMM YYYY")}
                  </p>
                </div>
              </div>
            </div>

            {/* Time Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-poppins">Start Time</p>
                <div className="flex items-center justify-center bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                  <p className="text-sm font-black text-gray-700 font-poppins">
                    {moment.utc(event.start).tz("Asia/Karachi").format("hh:mm A")}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-poppins">End Time</p>
                <div className="flex items-center justify-center bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                  <p className="text-sm font-black text-gray-700 font-poppins">
                    {moment.utc(event.end).tz("Asia/Karachi").format("hh:mm A")}
                  </p>
                </div>
              </div>
            </div>

            {/* Join Section */}
            {event?.meetingUrl && (
              <div className="pt-2">
                <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer">
                  <button className="group relative flex items-center justify-center w-full py-4 text-center rounded-2xl bg-indigo-600 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img src={meet} alt="meet" className="w-5 h-5 mr-3" />
                    <span className="text-sm font-black text-white font-poppins tracking-wide">Enter Live Classroom</span>
                  </button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

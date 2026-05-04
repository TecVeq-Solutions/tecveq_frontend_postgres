import React, { useRef } from "react";
import meet from "../../../assets/meet.png";
import moment from "moment";
import { formatTimeInPKT } from "../../../utils/timeUtils";
import { IoClose } from "react-icons/io5";
import useClickOutside from "../../../hooks/useClickOutlise";
import { Clock, Calendar, User, Monitor, Link2 } from "lucide-react";

export default function ViewEventDetailsModal({ isOpen, onClose, event }) {
  const ref = useRef(null);
  useClickOutside(ref, () => onClose());

  if (!isOpen || !event) return null;

  const fullMeetingUrl = event?.meetingUrl?.startsWith("http")
    ? event.meetingUrl
    : `https://${event?.meetingUrl}`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

      <div
        ref={ref}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-indigo-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-tight">Class Details</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-400">{event.subject?.name || "No Subject"}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
                <span className="text-xs font-medium text-indigo-600">{event?.classroom?.name}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <InfoCard
              icon={<User size={13} className="text-indigo-600" />}
              label="Instructor"
              initial={event.teacher?.name?.charAt(0) || "T"}
              value={event.teacher?.name || "Not assigned"}
              accent="indigo"
            />
            <InfoCard
              icon={<Monitor size={13} className="text-emerald-500" />}
              label="Classroom"
              initial="C"
              value={event?.classroom?.name || "N/A"}
              accent="emerald"
            />
          </div>

          {/* Title */}
          <Field label="Topic / Title" icon={<Calendar size={13} />}>
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-medium">
              {event.title || "Untitled Session"}
            </div>
          </Field>

          {/* Date & Time */}
          <div className="grid grid-cols-1 gap-3">
            <Field label="Scheduled Date" icon={<Calendar size={13} />}>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-medium">
                {moment(event.startTime).format("DD MMMM, YYYY")}
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start Time" icon={<Clock size={13} />}>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-medium">
                  {formatTimeInPKT(event.startTime, "hh:mm A")}
                </div>
              </Field>
              <Field label="End Time" icon={<Clock size={13} />}>
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-medium">
                  {formatTimeInPKT(event.endTime, "hh:mm A")}
                </div>
              </Field>
            </div>
          </div>

          {/* Meeting Link Preview */}
          {event.meetingUrl && (
            <Field label="Meeting Link" icon={<Link2 size={13} />}>
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-indigo-600 font-medium truncate">
                {event.meetingUrl}
              </div>
            </Field>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white">
          {event?.meetingUrl?.trim() ? (
            <a href={fullMeetingUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
              <div className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-indigo-200">
                <img src={meet} alt="meet" className="w-5 h-5" />
                Join Google Meeting
              </div>
            </a>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Helper Components ── */

function Field({ label, icon, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest px-0.5">
        <span className="text-gray-400">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}

function InfoCard({ icon, label, initial, value, accent }) {
  const accentMap = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", avatarBg: "bg-indigo-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", avatarBg: "bg-emerald-100" },
  };
  const c = accentMap[accent] || accentMap.indigo;

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-white border border-gray-100 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-gray-400">{icon}</span>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className={`w-7 h-7 rounded-full ${c.avatarBg} flex items-center justify-center ${c.text} text-[11px] font-bold shrink-0`}>
          {initial}
        </div>
        <p className="text-sm font-medium text-gray-700 truncate">{value}</p>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import meet from "../../../assets/meet.png";
import moment from "moment";
import ConfirmModal from "./ConfirmModal";
import { formatTimeInPKT } from "../../../utils/timeUtils";
import { IoClose } from "react-icons/io5";
import useClickOutside from "../../../hooks/useClickOutlise";
import { useTeacher } from "../../../context/TeacherContext";
import { cancelClass, updateClasses } from "../../../api/Teacher/Class";
import { toast } from "react-toastify";
import Loader from "../../../utils/Loader";
import { teacherPresent } from "../../../api/Teacher/Attendence";
import { useUser } from "../../../context/UserContext";
import { useMutation } from "@tanstack/react-query";
import { convertToISOWithTimezoneOffset } from "../../../utils/ConvertTimeZone";
import { Pencil, Clock, Calendar, User, Monitor, Link2 } from "lucide-react";

export default function ViewEventDetailsModal({ open, setopen, event, setevents, refetch }) {
  const { classesRefetch } = useTeacher();
  const { userData } = useUser();
  const [confirmDeleteModalOpen, setconfirmDeleteModalOpen] = useState(false);
  const [eventType, setEventType] = useState(false);
  const [loading, setLoading] = useState(false);

  const [startDate, setStartDate] = useState(
    moment(event.startTime).format("YYYY-MM-DD")
  );

  const [classObj, setClassObj] = useState({
    title: event.title,
    startTime: formatTimeInPKT(event.startTime, "HH:mm"),
    endTime: formatTimeInPKT(event.endTime, "HH:mm"),
    oneTime: true,
    meetingUrl: event.meetingUrl,
    classroomID: event.classroomID,
    subjectID: event.subjectID,
    startEventDate: event.startEventDate,
    endEventDate: event.endEventDate,
    teacher: { teacherID: userData.id, status: "absent" },
    updateSeries: false,
  });

  const ref = useRef(null);
  useClickOutside(ref, () => setopen(false));

  useEffect(() => {
    if (open && event) {
      setClassObj({
        title: event.title,
        startTime: formatTimeInPKT(event.startTime, "HH:mm"),
        endTime: formatTimeInPKT(event.endTime, "HH:mm"),
        oneTime: true,
        meetingUrl: event.meetingUrl,
        classroomID: event.classroomID,
        subjectID: event.subjectID,
        startEventDate: event.startEventDate,
        endEventDate: event.endEventDate,
        teacher: { teacherID: userData.id, status: "absent" },
        updateSeries: false,
      });
      setStartDate(moment(event.startTime).format("YYYY-MM-DD"));
      setEventType(false);
    }
  }, [open, event, userData.id]);

  const convertToISOWithTimezoneOffsetEnd = (date, time) =>
    `${date}T${time}:00.000Z`;

  const handleUpdateClass = () => {
    const isoStart = new Date(convertToISOWithTimezoneOffset(startDate, classObj.startTime));
    const isoEnd = new Date(convertToISOWithTimezoneOffsetEnd(startDate, classObj.endTime));
    const endEventDate = new Date(classObj.endEventDate).toISOString().split("T")[0];

    classUpdateMutate.mutate({
      classID: event.id,
      title: classObj.title,
      startTime: isoStart,
      endTime: isoEnd,
      oneTime: true,
      meetingUrl: classObj.meetingUrl,
      classroomID: classObj.classroomID,
      subjectID: classObj.subjectID,
      startEventDate: startDate,
      endEventDate,
      teacher: { teacherID: userData.id, status: classObj.status },
      updateSeries: eventType,
    });
  };

  const classUpdateMutate = useMutation({
    mutationFn: async (data) => await updateClasses(data),
    onSettled: (data, error) => {
      if (!error) {
        toast.success("Class updated successfully");
        refetch();
        setopen(false);
      } else {
        toast.error(error?.response?.data?.error || "Update failed");
      }
    },
  });

  const handleCancelMeeting = async () => {
    setLoading(true);
    const response = await cancelClass(event.id);
    if (response !== "error") {
      await classesRefetch();
      setLoading(false);
      toast.success("Class cancelled successfully!");
      setopen(false);
    } else {
      setLoading(false);
      toast.error("Failed to cancel class.");
    }
  };

  const fullMeetingUrl = event?.meetingUrl?.startsWith("http")
    ? event.meetingUrl
    : `https://${event?.meetingUrl}`;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setopen(false)} />

      <div
        ref={ref}
        className="relative w-full max-w-lg  top-14 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden"
      >
        <ConfirmModal
          isOpen={confirmDeleteModalOpen}
          title="Confirm Delete"
          description="Are you sure you want to delete this event?"
          onconfirm={(e) => { e.stopPropagation(); }}
          onclose={(e) => { e.stopPropagation(); setconfirmDeleteModalOpen(false); }}
        />

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-maroon" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-tight">Class Details</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-gray-400">{event.subject?.name || "No Subject"}</span>
                <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
                <span className="text-xs font-medium text-maroon">{event?.classroom?.name}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => { setopen(false); setClassObj({}); }}
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
              icon={<User size={13} className="text-maroon" />}
              label="Instructor"
              initial={event.teacher?.name?.charAt(0) || "T"}
              value={event.teacher?.name || "Not assigned"}
              accent="red"
            />
            <InfoCard
              icon={<Monitor size={13} className="text-orange-500" />}
              label="Classroom"
              initial="C"
              value={event?.classroom?.name || "N/A"}
              accent="orange"
            />
          </div>

          {/* Topic */}
          <Field label="Topic / Title" icon={<Pencil size={13} />}>
            <div className="relative">
              <input
                type="text"
                value={classObj.title}
                onChange={(e) => setClassObj((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter class title"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-gray-800 font-medium outline-none focus:border-maroon focus:ring-4 focus:ring-red-50 transition-all"
              />
              <Pencil size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </Field>

          {/* Date */}
          <Field label={event.groupID ? "Class Schedule" : "Scheduled Date"} icon={<Calendar size={13} />}>
            {event.groupID ? (
              <div className="grid grid-cols-2 gap-3">
                <DateDisplay value={moment(event.startTime).format("DD MMM, YYYY")} />
                <DateDisplay value={moment(event.endTime).format("DD MMM, YYYY")} />
              </div>
            ) : (
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-medium outline-none focus:border-maroon focus:ring-4 focus:ring-red-50 transition-all appearance-none"
                />
              </div>
            )}
          </Field>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Time" icon={<Clock size={13} />}>
              <input
                type="time"
                value={classObj.startTime}
                onChange={(e) => setClassObj((p) => ({ ...p, startTime: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-medium outline-none focus:border-maroon focus:ring-4 focus:ring-red-50 transition-all"
              />
            </Field>
            <Field label="End Time" icon={<Clock size={13} />}>
              <input
                type="time"
                value={classObj.endTime}
                onChange={(e) => setClassObj((p) => ({ ...p, endTime: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-medium outline-none focus:border-maroon focus:ring-4 focus:ring-red-50 transition-all"
              />
            </Field>
          </div>

          {/* Meeting URL */}
          <Field label="Meeting URL" icon={<Link2 size={13} />}>
            <div className="relative">
              <Link2 size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={classObj.meetingUrl}
                onChange={(e) => setClassObj((p) => ({ ...p, meetingUrl: e.target.value }))}
                placeholder="https://meet.google.com/..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-800 font-medium outline-none focus:border-maroon focus:ring-4 focus:ring-red-50 transition-all"
              />
            </div>
          </Field>

          {/* Update Series Toggle */}
          {event.groupID && (
            <button
              type="button"
              onClick={() => setEventType((p) => !p)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left
                ${eventType
                  ? "bg-red-50 border-maroon/30"
                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
                }`}
            >
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider ${eventType ? "text-maroon" : "text-gray-600"}`}>
                  Update Entire Series
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">Apply changes to all future instances</p>
              </div>
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all
                ${eventType ? "bg-maroon border-maroon" : "border-gray-300 bg-white"}`}>
                {eventType && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 space-y-3 bg-white">
          {event?.meetingUrl?.trim() && (
            <a href={fullMeetingUrl} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl bg-[#6A00FF] hover:bg-[#5800D6] text-white text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-purple-500/20">
                <img src={meet} alt="meet" className="w-5 h-5" />
                Join Google Meeting
              </div>
            </a>
          )}

          {loading || classUpdateMutate.isPending ? (
            <div className="flex justify-center py-3"><Loader /></div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleUpdateClass}
                className="flex-1 py-2.5 rounded-xl bg-maroon hover:bg-[#8B1929] text-white text-sm font-semibold shadow-md shadow-red-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancelMeeting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Cancel Meeting
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Small reusable sub-components ── */

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
    red: { bg: "bg-red-50", text: "text-maroon", avatarBg: "bg-red-100" },
    orange: { bg: "bg-orange-50", text: "text-orange-600", avatarBg: "bg-orange-100" },
  };
  const c = accentMap[accent] || accentMap.red;

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-gray-200 transition-colors">
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

function DateDisplay({ value }) {
  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 py-2.5 px-4 rounded-xl text-sm text-gray-700 font-medium">
      <span>{value}</span>
      <Calendar size={13} className="text-gray-400 shrink-0" />
    </div>
  );
}
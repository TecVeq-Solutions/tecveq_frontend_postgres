import React, { useRef, useState } from "react";
import FilterButton from "./FilterButton";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";

import { toast } from "react-toastify";
import { IoClose, IoCalendarOutline, IoTimeOutline, IoLinkOutline, IoBookOutline, IoPeopleOutline, IoRocketOutline } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { useUser } from "../../../context/UserContext";
import { createClasses } from "../../../api/Teacher/Class";
import { useTeacher } from "../../../context/TeacherContext";
import { useGetAllTeacherSubjects } from "../../../api/Teacher/TeacherSubjectApi";
import { convertToISOWithTimezoneOffset } from "../../../utils/ConvertTimeZone";
import CustomSelectableField from "../../../commonComponents/CustomSelectableField";
import CustomMultiSelectableField from "../../../commonComponents/MultiSelectableField";
import { CusotmInputField } from "../../../commonComponents/CusotmInputField";

const SchedualClasses = ({ refetch, addScheduleModalOpen, setAddScheduleModalOpen }) => {
  const { allSubjects, allClassrooms } = useTeacher();
  const { userData } = useUser();
  const { teacherSubjects } = useGetAllTeacherSubjects(userData.id);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClassrooms, setSelectedClassrooms] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);

  const [classObj, setClassObj] = useState({
    title: "",
    startTime: "",
    endTime: "",
    oneTime: true,
    meetingUrl: "",
    classroomID: "",
    subjectID: "",
    startEventDate: "",
    endEventDate: "",
    teacher: { teacherID: userData.id, status: "absent" },
  });

  const handleDayToggle = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleScheduleClass = () => {
    if (!selectedSubject) {
      toast.error("Please select a subject");
      return;
    }
    if (selectedClassrooms.length === 0) {
      toast.error("Please select at least one classroom");
      return;
    }

    const isoEndTime = new Date(convertToISOWithTimezoneOffset(classObj.startEventDate, classObj.endTime));
    const isoStartTime = new Date(convertToISOWithTimezoneOffset(classObj.startEventDate, classObj.startTime));

    selectedClassrooms.forEach((classroomID) => {
      const payload = {
        ...classObj,
        subjectID: JSON.parse(selectedSubject).id,
        classroomID,
        startTime: isoStartTime,
        endTime: isoEndTime,
        selectedDays,
      };
      classCreateMutate.mutate(payload);
    });
  };

  const classCreateMutate = useMutation({
    mutationFn: async (data) => await createClasses(data),
    onSettled: (data, error) => {
      if (!error) {
        toast.success("Class scheduled successfully");
        refetch();
        setAddScheduleModalOpen(false);
      } else {
        toast.error(error?.response?.data?.error || "Failed to schedule class");
      }
    },
  });

  if (!addScheduleModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex justify-end items-start bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="mr-0 sm:mr-6 mt-6  w-[440px] bg-white rounded-0 sm:rounded-[24px] shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] flex flex-col max-h-[100vh] sm:max-h-[92vh] animate-in slide-in-from-right duration-500 overflow-hidden border  border-blue-50">

        {/* Header - Royal Blue Gradient (Same as Admin) */}
        <div className="relative px-3 sm:px-8 py-6 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <IoRocketOutline size={100} className="text-white rotate-12" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <IoCalendarOutline size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">Schedule Class</h3>
                <p className="text-blue-100 text-xs font-medium opacity-80">Teacher Portal • Session Planner</p>
              </div>
            </div>
            <button
              onClick={() => setAddScheduleModalOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-6 px-3 sm:px-8 py-6 overflow-y-auto custom-scrollbar bg-white">

          {/* Section: Academic Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-[13px] uppercase tracking-widest">
              <IoBookOutline size={18} className="text-blue-500" />
              <span>Subject & Topic</span>
            </div>

            <div className="space-y-4">
              <CustomSelectableField
                options={teacherSubjects}
                label="Assign Subject"
                selectedOption={selectedSubject}
                setSelectedOption={setSelectedSubject}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Class Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Organic Chemistry"
                  value={classObj.title}
                  onChange={(e) => setClassObj((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

          {/* Section: Logistics */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-[13px] uppercase tracking-widest">
              <IoPeopleOutline size={18} className="text-blue-500" />
              <span>Classrooms & Venue</span>
            </div>

            <CustomMultiSelectableField
              label="Select Classrooms"
              options={allClassrooms}
              selectedOption={selectedClassrooms}
              setSelectedOption={setSelectedClassrooms}
              isMulti={true}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Live Meeting URL</label>
              <div className="relative group">
                <IoLinkOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 transition-colors group-focus-within:text-blue-700" size={18} />
                <input
                  type="text"
                  placeholder="https://zoom.us/j/..."
                  value={classObj.meetingUrl}
                  onChange={(e) => setClassObj((prev) => ({ ...prev, meetingUrl: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

          {/* Section: Timing */}
          <div className="space-y-4 pb-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-[13px] uppercase tracking-widest">
              <IoTimeOutline size={18} className="text-blue-500" />
              <span>Timing & Recurrence</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Start Date</label>
                <input
                  type="date"
                  value={classObj.startEventDate}
                  onChange={(e) => setClassObj((prev) => ({ ...prev, startEventDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 sm:px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">End Date</label>
                <input
                  type="date"
                  value={classObj.endEventDate}
                  onChange={(e) => setClassObj((prev) => ({ ...prev, endEventDate: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 sm:px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Repeating Days</label>
              <div className="flex gap-2 flex-wrap">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
                  const active = selectedDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`h-9 px-3.5 rounded-xl text-[12px] font-semibold transition-all duration-300 border
                        ${active
                          ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 scale-105"
                          : "bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
                        }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Start Time</label>
                <input
                  type="time"
                  value={classObj.startTime}
                  onChange={(e) => setClassObj((prev) => ({ ...prev, startTime: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 sm:px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">End Time</label>
                <input
                  type="time"
                  value={classObj.endTime}
                  onChange={(e) => setClassObj((prev) => ({ ...prev, endTime: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 sm:px-4 py-2.5 text-sm text-slate-700 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100">
          <div className="flex gap-4">
            {classCreateMutate.isPending ? (
              <div className="w-full flex justify-center py-2"><Loader color="#2563eb" /></div>
            ) : (
              <>
                <button
                  onClick={() => setAddScheduleModalOpen(false)}
                  className="flex-1 py-3.5 rounded-xl text-slate-600 text-sm font-bold hover:bg-slate-200/50 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleClass}
                  className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-sm font-bold shadow-[0_10px_20px_rgba(37,_99,_235,_0.3)] hover:shadow-[0_12px_25px_rgba(37,_99,_235,_0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  Schedule Class
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedualClasses;
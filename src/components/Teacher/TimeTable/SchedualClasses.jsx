import React, { useRef, useState } from "react";
import FilterButton from "./FilterButton";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";

import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
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
    <div className="absolute top-0 right-0 z-10 w-96 bg-white rounded-xl shadow-xl border border-gray-100 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-maroon_10 flex items-center justify-center">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#A41D30" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className="text-base font-medium text-grey_700">Schedule Class</span>
        </div>
        <button
          onClick={() => setAddScheduleModalOpen(false)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
        >
          <IoClose size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 px-5 py-4 overflow-y-auto max-h-[80vh] custom-scrollbar">
        {/* Subject */}
        <CustomSelectableField
          options={teacherSubjects}
          label="Select Subject"
          selectedOption={selectedSubject}
          setSelectedOption={setSelectedSubject}
        />

        {/* Topic */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-grey_600 uppercase tracking-wide">Topic</label>
          <input
            type="text"
            placeholder="e.g. Introduction to Calculus"
            value={classObj.title}
            onChange={(e) => setClassObj((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-grey_700 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon_10 transition"
          />
        </div>

        {/* Classrooms */}
        <CustomMultiSelectableField
          label="Select Classroom"
          options={allClassrooms}
          selectedOption={selectedClassrooms}
          setSelectedOption={setSelectedClassrooms}
          isMulti={true}
        />

        {/* Meeting URL */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-grey_600 uppercase tracking-wide">Meeting URL</label>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <input
              type="text"
              placeholder="https://meet.google.com/..."
              value={classObj.meetingUrl}
              onChange={(e) => setClassObj((prev) => ({ ...prev, meetingUrl: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm text-grey_700 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon_10 transition"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-grey_600 uppercase tracking-wide">Start Date</label>
            <input
              type="date"
              value={classObj.startEventDate}
              onChange={(e) => setClassObj((prev) => ({ ...prev, startEventDate: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-grey_700 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon_10 transition"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-grey_600 uppercase tracking-wide">End Date</label>
            <input
              type="date"
              value={classObj.endEventDate}
              onChange={(e) => setClassObj((prev) => ({ ...prev, endEventDate: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-grey_700 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon_10 transition"
            />
          </div>
        </div>

        {/* Day Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-grey_600 uppercase tracking-wide">Repeat On</label>
          <div className="flex gap-2 flex-wrap">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => {
              const active = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-all
                    ${active
                      ? "bg-maroon_10 border-maroon text-maroon"
                      : "bg-gray-50 border-gray-200 text-grey_600 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Times */}
        <div className="flex gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-grey_600 uppercase tracking-wide">Start Time</label>
            <input
              type="time"
              value={classObj.startTime}
              onChange={(e) => setClassObj((prev) => ({ ...prev, startTime: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-grey_700 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon_10 transition"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs font-medium text-grey_600 uppercase tracking-wide">End Time</label>
            <input
              type="time"
              value={classObj.endTime}
              onChange={(e) => setClassObj((prev) => ({ ...prev, endTime: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-grey_700 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon_10 transition"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-100 mt-1">
          {classCreateMutate.isPending ? (
            <div className="w-full flex justify-center py-2"><Loader /></div>
          ) : (
            <>
              <button
                onClick={handleScheduleClass}
                className="flex-1 py-2 rounded-lg bg-maroon hover:bg-[#8B1929] text-white text-sm font-medium transition"
              >
                Schedule Class
              </button>
              <button
                onClick={() => setAddScheduleModalOpen(false)}
                className="flex-1 py-2 rounded-lg border border-gray-200 bg-white text-grey_700 text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedualClasses;
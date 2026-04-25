import React from "react";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";
import Navbar from "../../../components/Teacher/Navbar";
import Card from "../../../components/Teacher/StudentReports/Card";
import AttendanceTable from "../../../components/Teacher/StudentReports/AttendanceTable";
import QuizAssignmentsTable from "../../../components/Teacher/StudentReports/QuizAssignmentsTable";

import { LuPhone } from "react-icons/lu";
import { IoMailOutline } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { getStudentReport } from "../../../api/Teacher/StudentReport";
import moment from "moment";
import { useBlur } from "../../../context/BlurContext";
import { BookOpen, CheckSquare } from "lucide-react";

const SubjectReport = () => {
  const location = useLocation();
  const { isBlurred } = useBlur();

  const { data, isPending, isSuccess, isError, refetch, isRefetching } = useQuery({
    queryKey: [
      "studentReports",
      location.state?.id,
      location.state?.classroom?.id,
      location.state?.subject?.id,
    ],
    queryFn: async () => {
      if (!location.state?.id) return null;
      return await getStudentReport(
        location.state.id,
        location.state.classroom.id,
        location.state.subject.id
      );
    },
    enabled: !!location.state?.id,
  });

  if (!location.state)
    return (
      <div className="flex items-center justify-center h-screen bg-[#F4F6FB] font-poppins">
        <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">
            Student not found. Please go back and select a student.
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex flex-1 bg-[#F4F6FB] font-poppins min-h-screen relative min-w-0">
      <div className="flex flex-1 min-w-0">
        <div className="flex-grow w-full px-3 sm:px-8 lg:px-16 lg:ml-72 pb-12 min-w-0">
          <Navbar heading={"Student Report"} />

          <div className={`${isBlurred ? "blur" : ""} transition-all duration-300`}>
            {isPending || isRefetching ? (
              <div className="flex justify-center items-center py-20">
                <Loader />
              </div>
            ) : !data || isError ? (
              <div className="flex justify-center items-center py-20 w-full">
                <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-red-50">
                  <p className="text-red-400 text-sm font-medium">
                    Error loading report data.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* ── Student Profile Card ── */}
                <div className="mt-2 sm:mt-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Banner */}
                    <div className="h-16 sm:h-24 bg-gradient-to-r from-[#0B1053] via-[#1a237e] to-[#283593] relative">
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
                        }}
                      />
                    </div>

                    {/* Profile info
                      FIX 2: mt-10 on mobile (was mt-14) so avatar sits closer to banner */}
                    <div className="px-3 sm:px-6 pb-4 sm:pb-6 mt-0 sm:mt-14 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 min-w-0">

                        {/* Avatar + name */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 min-w-0">
                          <div className="ring-4 ring-white rounded-full shadow-lg shrink-0">
                            <img
                              src={location.state?.profilePic || IMAGES.Profile}
                              alt="student profile"
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                            />
                          </div>
                          <div className="text-center sm:text-left pb-1 min-w-0">
                            <p className="text-xl font-bold text-gray-900 leading-tight truncate">
                              {location.state?.name}
                            </p>
                            <p className="text-sm text-[#0B1053] font-medium mt-0.5">
                              Student
                            </p>
                          </div>
                        </div>

                        {/* Contact pills
                          FIX 3: items-stretch on mobile so pills fill full width
                          FIX 4: email max-w wider on mobile  */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-end pb-1">
                          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 w-full sm:w-auto">
                            <LuPhone className="text-[#0B1053] shrink-0" size={15} />
                            <span className="truncate">{location.state?.phoneNumber}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 w-full sm:w-auto min-w-0">
                            <IoMailOutline className="text-[#0B1053] shrink-0" size={15} />
                            {/* FIX 4: max-w adapts — wider on mobile (full pill minus icon) */}
                            <span className="truncate max-w-full sm:max-w-[180px]">
                              {location.state?.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Performance Overview heading ── */}
                <div className="mt-6 sm:mt-8">
                  <p className="text-xl font-bold text-gray-900">
                    Performance Overview
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Summary of student's academic standing
                  </p>
                </div>

                {/* ── Overview Cards ── */}
                <div className="mt-4 sm:mt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <Card
                      percentage={
                        data?.averageAssignmentMarks?.percentage === "NaN"
                          ? 0
                          : data?.averageAssignmentMarks?.percentage || 0
                      }
                      data={"Assignments"}
                      grade={data?.averageAssignmentMarks?.grade || "F"}
                      type={"Percentage"}
                    />
                    <Card
                      percentage={
                        data?.averageQuizMarks?.percentage === "NaN"
                          ? 0
                          : data?.averageQuizMarks?.percentage || 0
                      }
                      data={"Quizes"}
                      grade={data?.averageQuizMarks?.grade || "F"}
                      type={"Percentage"}
                    />
                    <Card
                      percentage={
                        data?.attendance?.avgAttendancePer === "NaN" ||
                          data?.attendance?.avgAttendencePer === "NaN"
                          ? 0
                          : data?.attendance?.avgAttendancePer ??
                          data?.attendance?.avgAttendencePer ??
                          0
                      }
                      data={"Attendance"}
                      type={"Percentage"}
                    />
                  </div>
                </div>

                {/* ── Detail Tables ── */}
                <div className="mt-5 sm:mt-6 space-y-4 sm:space-y-6">

                  {/* Assignments */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-[#0B1053]" />
                      </div>
                      <p className="font-semibold text-gray-800">Assignments</p>
                    </div>
                    <div className="p-3 sm:p-4 overflow-x-auto">
                      <QuizAssignmentsTable data={data?.assignments || []} type={"a"} />
                    </div>
                  </div>

                  {/* Quizzes */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <CheckSquare className="w-4 h-4 text-[#0B1053]" />
                      </div>
                      <p className="font-semibold text-gray-800">Quizzes</p>
                    </div>
                    <div className="p-3 sm:p-4 overflow-x-auto">
                      <QuizAssignmentsTable data={data?.quizes || []} type={"q"} />
                    </div>
                  </div>

                  {/* Attendance */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                        <svg
                          className="w-4 h-4 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="font-semibold text-gray-800">Attendance</p>
                    </div>
                    <div className="p-3 sm:p-4 overflow-x-auto">
                      <AttendanceTable
                        data={data?.attendance?.classes || []}
                        type="att"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Teacher Notes ── */}
                <div className="mt-6 sm:mt-8">
                  <div className="flex items-center gap-3 px-1 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                      <IoMailOutline className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="font-bold text-gray-900 text-base sm:text-lg leading-tight">
                      Teacher's Notes & Observations
                    </p>
                  </div>

                  {data?.notes?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.notes.map((note, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md hover:border-[#0B1053]/10 transition-all duration-200"
                        >
                          {/* Author row */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#0B1053]/5 flex items-center justify-center text-[#0B1053] font-bold text-xs uppercase flex-shrink-0">
                              {note.teacher?.name?.charAt(0) || "T"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-gray-800 truncate">
                                {note.teacher?.name || "Teacher"}
                              </p>
                              <p className="text-[10px] text-gray-400">
                                {moment(note.date).format("MMM DD, YYYY")}
                              </p>
                            </div>
                          </div>

                          <div className="h-px bg-gray-50" />

                          <p className="text-sm text-gray-600 leading-relaxed italic">
                            "{note.content}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 sm:py-14 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <IoMailOutline className="text-gray-300 text-lg" />
                      </div>
                      <p className="text-gray-400 text-sm px-4">
                        No notes or observations recorded for this student.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default SubjectReport;
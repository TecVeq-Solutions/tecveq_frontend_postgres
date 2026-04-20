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

const SectionHeading = ({ children }) => (
  <div className="flex items-center gap-3 mb-4">
    <p className="text-[15px] font-semibold text-gray-700 tracking-wide uppercase">{children}</p>
    <div className="flex-1 h-px bg-gradient-to-r from-indigo-100 to-transparent" />
  </div>
);

const SubjectReport = () => {
  const location = useLocation();
  const { isBlurred } = useBlur();

  const { data, isPending, isSuccess, isError, refetch, isRefetching } = useQuery({
    queryKey: ["studentReports", location.state?.id, location.state?.classroom?.id, location.state?.subject?.id],
    queryFn: async () => {
      if (!location.state?.id) return null;
      let result = await getStudentReport(location.state.id, location.state.classroom.id, location.state.subject.id);
      return result;
    },
    enabled: !!location.state?.id
  });

  if (!location.state)
    return (
      <div className="flex items-center justify-center h-screen bg-[#F9F9F9]">
        <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">Student not found. Please go back and select a student.</p>
        </div>
      </div>
    );

  if (isPending || isRefetching)
    return <div className="flex justify-start flex-1"><Loader /></div>;

  if (!data || isError)
    return (
      <div className="flex justify-center items-center h-screen w-full bg-[#F9F9F9]">
        <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-red-50">
          <p className="text-red-400 text-sm font-medium">Error loading report data.</p>
        </div>
      </div>
    );

  return (
    <div className={`flex flex-1 bg-[#F9F9F9] font-poppins ${isBlurred ? "blur" : ""}`}>
      <div className="flex flex-1">
        <div className="flex-grow w-full px-3 lg:px-20 sm:px-10 lg:ml-72">
          <div className="pt-1">
            <Navbar heading={"Student Report"} />

            {/* ── Profile Hero ── */}
            <div className="mt-8 mb-8">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-8 py-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={location.state?.profilePic || IMAGES.Profile}
                    alt=""
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-indigo-50"
                  />
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full ring-2 ring-white" />
                </div>

                {/* Info */}
                <div className="flex flex-col items-center sm:items-start gap-1.5 flex-1">
                  <p className="text-xl font-bold text-gray-900 tracking-tight">{location.state?.name}</p>

                  <div className="flex flex-col sm:flex-row gap-2 mt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                      <LuPhone className="text-indigo-400" />
                      {location.state?.phoneNumber}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                      <IoMailOutline className="text-indigo-400" />
                      {location.state?.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Overview Cards ── */}
            <div className="mb-8">
              <SectionHeading>Overview</SectionHeading>
              <div className="flex flex-col sm:flex-row gap-3">
                <Card
                  percentage={data?.averageAssignmentMarks?.percentage || 0}
                  data={"Assignments"}
                  grade={data?.averageAssignmentMarks?.grade || "F"}
                  type={"Percentage"}
                />
                <Card
                  percentage={data?.averageQuizMarks?.percentage || 0}
                  data={"Quizes"}
                  grade={data?.averageQuizMarks?.grade || "F"}
                  type={"Percentage"}
                />
                <Card
                  percentage={data?.attendance?.avgAttendancePer?.toFixed(1) || 0}
                  data={"Attendance"}
                  type={"Percentage"}
                />
              </div>
            </div>

            {/* ── Assignments ── */}
            <div className="mb-8">
              <SectionHeading>Assignments</SectionHeading>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <QuizAssignmentsTable data={data?.assignments || []} type={"a"} />
              </div>
            </div>

            {/* ── Quizzes ── */}
            <div className="mb-8">
              <SectionHeading>Quizzes</SectionHeading>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <QuizAssignmentsTable data={data?.quizes || []} type={"q"} />
              </div>
            </div>

            {/* ── Attendance ── */}
            <div className="mb-8">
              <SectionHeading>Attendance</SectionHeading>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <AttendanceTable data={data?.attendance?.classes || []} type="att" />
              </div>
            </div>

            {/* ── Teacher Notes ── */}
            <div className="mb-12">
              <SectionHeading>Teacher's Notes & Observations</SectionHeading>

              {data?.notes?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3 hover:shadow-md hover:border-indigo-100 transition-all duration-200"
                    >
                      {/* Author row */}
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase flex-shrink-0">
                          {note.teacher?.name?.charAt(0) || "A"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{note.teacher?.name || "Administrator"}</p>
                          <p className="text-[10px] text-gray-400">{moment(note.date).format("MMM DD, YYYY")}</p>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-gray-50" />

                      {/* Content */}
                      <p className="text-sm text-gray-600 leading-relaxed italic">
                        "{note.content}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-14 text-center bg-white rounded-2xl border-2 border-dashed border-gray-100">
                  <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IoMailOutline className="text-gray-300 text-lg" />
                  </div>
                  <p className="text-gray-400 text-sm">No notes or observations recorded for this student.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectReport;
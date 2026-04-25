import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";
import LargeLoader from "../../../utils/LargeLoader";
import Navbar from "../../../components/Admin/Navbar";
import Card from "../../../components/Admin/StudentReports/Card";
import ActivityCard from "../../../components/Admin/StudentReports/ActivityCard";
import SystemOverview from "../../../components/Admin/StudentReports/SystemOverview";
import QuizAssignmentsTable from "../../../components/Admin/StudentReports/QuizAssignmentsTable";
import AttendanceTable from "../../../components/Admin/StudentReports/AttendanceTable";
import { X, ChevronDown, BookOpen, Edit3, CheckSquare } from "lucide-react";
import { LuPhone } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import { IoMailOutline } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStudentSubjectsForAdmin,
  getStudentSubjectsWithLevel,
  updateStudentSubjects,
} from "../../../api/Admin/UsersApi";
import {
  getStudentReport,
  getStudentSubjectReport,
} from "../../../api/Admin/AdminApi";
import { toast } from "react-toastify";
import { useGetAllSubjectOfStudent } from "../../../api/Admin/SubjectsApi";

const SubjectReport = () => {
  const location = useLocation();
  const queryClient = useQueryClient();

  const [studentData, setStudentData] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);
  const [editSubject, setEditSubject] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectQueryFlag, setSubjectQueryFlag] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    setStudentData(location.state);
  }, [location.state]);

  const { data: report, isPending, isError } = useQuery({
    queryKey: ["report", location.state?.id],
    queryFn: async () => await getStudentReport(location.state?.id),
    enabled: !!location.state?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: subjects, isSuccess, isPending: subjectPending } = useQuery({
    queryKey: ["subjectofstudents", location.state?.id],
    queryFn: async () => await getStudentSubjectsForAdmin(location.state?.id),
    enabled: !!location.state?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: subjectReport, isPending: subjectReportPending } = useQuery({
    queryKey: [
      "student-assignments-quizes",
      location.state?.id,
      selectedSubject && JSON.parse(selectedSubject).id,
    ],
    queryFn: async () =>
      await getStudentSubjectReport(
        location.state?.id,
        JSON.parse(selectedSubject).id
      ),
    enabled: !!selectedSubject && !!location.state?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isSuccess) setAllSubjects(subjects);
  }, [isSuccess, subjects]);

  const { data: studentSubjectWithLevel } = useQuery({
    queryKey: ["studentSubjectwithLevel", studentData?.levelID],
    queryFn: async () => await getStudentSubjectsWithLevel(studentData?.levelID),
    enabled: !!studentData?.levelID,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const handleCheckboxChange = (subjectId) => {
    setSelectedSubjects((prevSelected) =>
      prevSelected.includes(subjectId)
        ? prevSelected.filter((id) => id !== subjectId)
        : [...prevSelected, subjectId]
    );
  };

  const mutation = useMutation({
    mutationFn: updateStudentSubjects,
    onSuccess: (data) => {
      toast.success("Subjects assigned successfully!");
      queryClient.invalidateQueries({ queryKey: ["subjectofstudents", studentData?.id] });
      queryClient.invalidateQueries({ queryKey: ["studentSubjects", studentData?.id] });
      refetchStudentSubjects();
      setTimeout(() => setEditSubject(false), 100);
    },
    onError: (error) => {
      toast.error("Error assigning subjects!");
    },
  });

  const { studentSubject, refetch: refetchStudentSubjects } =
    useGetAllSubjectOfStudent(studentData?.id);

  useEffect(() => {
    if (editSubject && studentSubject?.subjects) {
      const assignedSubjects = studentSubject.subjects.map((subj) => subj.id);
      setSelectedSubjects(assignedSubjects || []);
    }
  }, [editSubject, studentSubject]);

  useEffect(() => {
    if (editSubject && studentSubject?.subjects) {
      const assignedSubjects = studentSubject.subjects.map((subj) => subj.id);
      setSelectedSubjects(assignedSubjects || []);
    }
  }, [studentSubject]);

  if (isPending || subjectPending) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F4F6FB]">
        <LargeLoader />
      </div>
    );
  }

  return (
    <div className="flex flex-1 bg-[#F4F6FB] font-poppins min-h-screen relative overflow-x-hidden w-full">
      <div className="flex flex-1 w-full max-w-full">
        <div className="flex-grow w-full px-3 sm:px-4 sm:px-8 lg:px-16 lg:ml-72 pb-12 min-w-0">
          <Navbar heading={"Subjects Report"} />

          {/* ── Student Profile Card ── */}
          <div className=" mt-2 sm:mt-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Banner */}
              <div className="h-16 sm:h-24 bg-gradient-to-r from-[#0B1053] via-[#1a237e] to-[#283593] relative">
                <div className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
                  }}
                />
              </div>

              {/* Profile info */}
              <div className="px-3 sm:px-6 pb-6 mt-14" >
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10">
                    <div className="ring-4 ring-white rounded-full shadow-lg">
                      <img
                        src={studentData.profilePic || IMAGES.Profile}
                        alt="student profile"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                      />
                    </div>
                    <div className="text-center sm:text-left pb-1">
                      <p className="text-xl font-bold text-gray-900 leading-tight">
                        {studentData.name}
                      </p>
                      <p className="text-sm text-[#0B1053] font-medium mt-0.5">Student</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-end pb-1">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600">
                      <LuPhone className="text-[#0B1053] shrink-0" />
                      <span>{studentData.phoneNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600">
                      <IoMailOutline className="text-[#0B1053] shrink-0" />
                      <span className="truncate max-w-[180px]">{studentData.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Subject Selector + Edit Button ── */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Section title */}
            <div>
              <p className="text-xl font-bold text-gray-900">Performance Overview</p>
              <p className="text-sm text-gray-500 mt-0.5">Select a subject to view detailed stats</p>
            </div>

            <div className="flex flex-col xs:flex-row gap-3 w-full sm:w-auto">
              {/* Subject dropdown */}
              <div className="relative flex-1 sm:flex-none">
                <select
                  className="w-full sm:w-60 appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B1053]/30 focus:border-[#0B1053] transition cursor-pointer"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">— Select Subject —</option>
                  {isSuccess &&
                    subjects?.subjects?.map((sub, index) => (
                      <option key={sub.id || index} value={JSON.stringify(sub)}>
                        {sub?.name}
                      </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Edit subjects button */}
              <button
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B1053] hover:bg-[#1a237e] text-white text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 whitespace-nowrap"
                onClick={() => {
                  refetchStudentSubjects();
                  setEditSubject(!editSubject);
                }}
              >
                <Edit3 className="w-4 h-4" />
                Edit Subjects
              </button>
            </div>
          </div>

          {/* ── Cards Row ── */}
          <div className="mt-5">
            {selectedSubject !== "" && subjectReportPending ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : (
              selectedSubject !== "" &&
              subjectReport && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card
                    type="Percentage"
                    data="Assignment"
                    grade={subjectReport.assignments?.avgGrade}
                    percentage={subjectReport.assignments?.avgMarksPer || 0}
                  />
                  <Card
                    type="Percentage"
                    data="Quizes"
                    grade={subjectReport.quizes?.avgGrade}
                    percentage={subjectReport.quizes?.avgMarksPer || 0}
                  />
                  <Card
                    type="Percentage"
                    data="Attendence"
                    percentage={Math.round(subjectReport.attendance?.avgAttendencePer) || 0}
                  />
                </div>
              )
            )}
          </div>

          {/* ── Detail Tables ── */}
          {selectedSubject !== "" && !subjectReportPending && subjectReport && (
            <div className="mt-6 space-y-6">
              {/* Assignments */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-[#0B1053]" />
                  </div>
                  <p className="font-semibold text-gray-800">Assignments</p>
                </div>
                <div className="p-1 sm:p-4">
                  <QuizAssignmentsTable data={subjectReport.assignments?.data || []} />
                </div>
              </div>

              {/* Quizzes */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <CheckSquare className="w-4 h-4 text-[#0B1053]" />
                  </div>
                  <p className="font-semibold text-gray-800">Quizzes</p>
                </div>
                <div className="p-1 sm:p-4">
                  <QuizAssignmentsTable data={subjectReport.quizes?.data || []} />
                </div>
              </div>

              {/* Attendance */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800">Attendance</p>
                </div>
                <div className="p-1 sm:p-4">
                  <AttendanceTable data={subjectReport.attendance?.classes || []} />
                </div>
              </div>
            </div>
          )}

          {/* ── System Overview ── */}
          <div className="mt-8">
            <SystemOverview />
          </div>
        </div>
      </div>

      {/* ── Edit Subject Sidebar/Modal ── */}
      {editSubject && studentSubjectWithLevel?.subjects?.length > 0 && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setEditSubject(false)}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#0B1053]">
              <div>
                <h2 className="text-white font-bold text-lg">Edit Subjects</h2>
                <p className="text-blue-200 text-xs mt-0.5">
                  {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? "s" : ""} selected
                </p>
              </div>
              <button
                onClick={() => setEditSubject(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subject list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
              {studentSubjectWithLevel?.subjects.map((subject) => {
                const isChecked = selectedSubjects.includes(subject.id);
                return (
                  <label
                    key={subject.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer border transition-all duration-150 ${isChecked
                      ? "bg-[#0B1053]/5 border-[#0B1053]/30"
                      : "bg-gray-50 border-transparent hover:bg-gray-100"
                      }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${isChecked
                        ? "bg-[#0B1053] border-[#0B1053]"
                        : "border-gray-300 bg-white"
                        }`}
                    >
                      {isChecked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isChecked}
                      onChange={() => handleCheckboxChange(subject.id)}
                    />
                    <span className={`text-sm font-medium ${isChecked ? "text-[#0B1053]" : "text-gray-700"}`}>
                      {subject.subjectName}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => {
                  if (!studentData?.id) return;
                  mutation.mutate({
                    studentId: studentData?.id,
                    subjects: selectedSubjects,
                  });
                }}
                disabled={mutation.isPending}
                className="w-full bg-[#0B1053] hover:bg-[#1a237e] disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-sm text-sm"
              >
                {mutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
              <button
                onClick={() => setEditSubject(false)}
                className="w-full mt-2 py-2.5 rounded-xl text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
};

export default SubjectReport;
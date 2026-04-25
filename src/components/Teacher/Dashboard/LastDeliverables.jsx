import { useQuery } from "@tanstack/react-query";
import { Circle } from "rc-progress";
import React from "react";
import { getAllAssignments } from "../../../api/Teacher/Assignments";
import { getAllQuizes } from "../../../api/Teacher/Quiz";
import Loader from "../../../utils/Loader";
import { useSidebar } from "../../../context/SidebarContext";

import { CheckCircle2 } from "lucide-react";

const LastDeliverables = () => {
  // Use staleTime: 0 to ensure data is always fetched fresh from the backend
  const { data: assignments, isPending: assignmentsPending, refetch: refetchAssignments } = useQuery({
    queryKey: ["assignments"],
    queryFn: getAllAssignments,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: quizes, isPending: quizesPending, refetch: refetchQuizes } = useQuery({
    queryKey: ["quizes"],
    queryFn: getAllQuizes,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { isSidebarOpen } = useSidebar();

  // ─── Process Assignments ───
  const sortedAssignments = Array.isArray(assignments) ? [...assignments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
  const latestAssignment = sortedAssignments[0];
  const totalAssignmentsCount = sortedAssignments.length;
  const totalAssignmentSubmissions = sortedAssignments.reduce((acc, a) => acc + (Array.isArray(a.submissions) ? a.submissions.length : 0), 0);
  const totalStudentsInAssignments = sortedAssignments.reduce((acc, a) => acc + (a.classroomID?.students?.length || 0), 0);

  // ─── Process Quizzes ───
  const sortedQuizes = Array.isArray(quizes) ? [...quizes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
  const latestQuiz = sortedQuizes[0];
  const totalQuizesCount = sortedQuizes.length;
  const totalQuizSubmissions = sortedQuizes.reduce((acc, q) => acc + (Array.isArray(q.submissions) ? q.submissions.length : 0), 0);
  const totalStudentsInQuizes = sortedQuizes.reduce((acc, q) => acc + (q.classroomID?.students?.length || 0), 0);

  const getStatusColor = (pct) => {
    if (pct >= 75) return { stroke: "#10B981", bg: "bg-emerald-50", text: "text-emerald-600", label: "On Track" };
    if (pct >= 40) return { stroke: "#F59E0B", bg: "bg-amber-50", text: "text-amber-600", label: "In Progress" };
    return { stroke: "#EF4444", bg: "bg-red-50", text: "text-red-500", label: "Low Response" };
  };

  const DeliverableComponent = ({ deliverable, type }) => {
    const sub = Array.isArray(deliverable?.submissions) ? deliverable.submissions.length : 0;
    const totalStudentsInClass = deliverable?.classroomID?.students?.length || 0;
    const pct = totalStudentsInClass > 0 ? Math.round((sub / totalStudentsInClass) * 100) : 0;
    const s = getStatusColor(pct);

    return (
      <div className="relative flex flex-col items-center w-full gap-5">
        {/* Circle Progress */}
        <div className="relative flex items-center justify-center" style={{ width: 105, height: 105 }}>
          <Circle
            percent={pct}
            strokeColor={s.stroke}
            strokeWidth={9}
            trailColor="#F1F5F9"
            trailWidth={9}
            style={{ width: 105, height: 105 }}
          />
          <div className={`absolute flex flex-col items-center justify-center ${isSidebarOpen ? "-z-50" : "z-10"}`}>
            <span className="text-xl font-bold text-[#0B1053] leading-none">{pct}%</span>
            <span className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5 uppercase">Done</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between w-full px-1 gap-2">
          <div className="flex flex-col items-center flex-1 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
            <span className="text-lg font-bold text-[#0B1053]">{sub}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Submissions</span>
          </div>
          <div className="flex flex-col items-center flex-1 py-2.5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
            <span className="text-lg font-bold text-[#0B1053]">{totalStudentsInClass}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Students</span>
          </div>
        </div>

        {/* Status badge */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${s.bg} border border-${s.stroke}20`}>
          <span className={`w-1.5 h-1.5 rounded-full ${s.text.replace("text-", "bg-")}`} />
          <span className={`text-[10px] font-bold uppercase tracking-tight ${s.text}`}>{s.label}</span>
        </div>
      </div>
    );
  };

  const SummarySection = ({ label, total, submitted, students, colorClass }) => (
    <div className="flex items-center justify-between px-3 py-3 bg-white rounded-2xl border border-slate-100 shadow-inner">
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${colorClass.replace("bg-", "animate-pulse bg-")}`} />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label} Summary</span>
        </div>
        <span className="text-[13px] font-extrabold text-[#0B1053] mt-0.5">
          {submitted} <span className="text-slate-300 font-medium text-[11px]">Submissions</span>
        </span>
      </div>
      <div className={`px-2.5 py-1 rounded-lg ${colorClass} text-white truncate font-black text-[11px] shadow-sm`}>
        {total} {label.toUpperCase()}
      </div>
    </div>
  );

  if (assignmentsPending || quizesPending) {
    return (
      <div className="flex items-center justify-center p-8 min-h-[300px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 gap-5 md:py-6">
        {/* Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl shadow-sm border border-indigo-100/50">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-lg font-bold text-[#0B1053] tracking-tight">Last Deliverables</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Data
          </div>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
          {/* Assignment Card */}
          <div className="flex flex-col gap-5 px-3 sm:px-6 2xl:px-3 py-6 bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <SummarySection
              label="Assignments"
              total={totalAssignmentsCount}
              submitted={totalAssignmentSubmissions}
              students={totalStudentsInAssignments}
              colorClass="bg-indigo-500"
            />

            {latestAssignment ? (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Latest Active</p>
                  <p className="text-[15px] font-black text-[#0B1053] leading-tight truncate mt-0.5">{latestAssignment.title}</p>
                </div>
                <DeliverableComponent deliverable={latestAssignment} type="assignment" />
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-slate-300 text-xs font-medium italic">No assignments found</p>
              </div>
            )}
          </div>

          {/* Quiz Card */}
          <div className="flex flex-col gap-5 px-3 sm:px-6 2xl:px-3  py-6 bg-white rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <SummarySection
              label="Quizzes"
              total={totalQuizesCount}
              submitted={totalQuizSubmissions}
              students={totalStudentsInQuizes}
              colorClass="bg-purple-500"
            />

            {latestQuiz ? (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300">Latest Active</p>
                  <p className="text-[15px] font-black text-[#0B1053] leading-tight truncate mt-0.5">{latestQuiz.title}</p>
                </div>
                <DeliverableComponent deliverable={latestQuiz} type="quiz" />
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-slate-300 text-xs font-medium italic">No quizzes found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastDeliverables;
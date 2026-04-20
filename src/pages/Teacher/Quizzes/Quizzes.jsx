import React, { useState } from "react";
import Navbar from "../../../components/Teacher/Navbar";
import AssignmentMenu from "../../../components/Teacher/QuizAssignment/AssignmentMenu";
import CreateQuizAssignmentModal from "../../../components/Teacher/QuizAssignment/CreateQuizAssignmentModal";
import EditQuizAssignmentModal from "../../../components/Teacher/QuizAssignment/EditQuizAssignmentModal";
import ShowQuizAssignmentModal from "../../../components/Teacher/QuizAssignment/ShowQuizAssignmentModal";

import { FaEye } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteQuiz, getAllQuizes } from "../../../api/Teacher/Quiz";
import LargeLoader from "../../../utils/LargeLoader";
import { ClipboardList, Plus, Users, CheckSquare, Clock, FileText, GraduationCap } from "lucide-react";
import moment from "moment";

const Quizzes = () => {
  const [isAssignmentMenuOpen, setIsAssignmentMenuOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [selectedAssignments, setSelectedAssignments] = useState(null);
  const [quizdata, setQuizdata] = useState({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [changeDeadlineClick, setChangeDeadlineClick] = useState(false);

  const navigate = useNavigate();
  const { toggleBlur } = useBlur();

  const { data, isPending, isRefetching, refetch } = useQuery({
    queryKey: ["quizes"],
    queryFn: getAllQuizes,
  });

  const quizDellMutate = useMutation({
    mutationFn: async (id) => await deleteQuiz(id),
    onSettled: async () => {
      await refetch();
      toast.success("Quiz deleted successfully");
    },
  });

  const toggleAssignmentMenuOpen = (data) => {
    setQuizdata(data);
    setIsAssignmentMenuOpen((p) => !p);
  };

  const onViewSubmission = () => navigate(`/teacher/quizzes/submissions`, { state: quizdata });
  const onGradingAssignment = () => navigate(`/teacher/quizzes/GradingQuizzes`, { state: quizdata });
  const onChangeDeadline = () => setChangeDeadlineClick((p) => !p);

  /* ── Derived stats ── */
  const totalQuizzes = data?.length || 0;
  const totalSubmissions = data?.reduce((acc, q) => acc + (q.submissions?.length || 0), 0) || 0;
  const totalStudents = data?.reduce((acc, q) => acc + (q.classroomID?.students?.length || 0), 0) || 0;

  if (isPending || isRefetching) {
    return (
      <div className="flex flex-col flex-1 bg-[#F9F9F9] lg:ml-72">
        <Navbar heading="Quizzes" />
        <div className="flex flex-1 items-center justify-center py-24">
          <LargeLoader />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F9F9F9] font-poppins lg:pl-72 transition-all duration-300">
        <div className="w-full min-w-0 overflow-x-hidden">
          <Navbar heading="Quizzes" />

            <div className="px-3 sm:px-6 lg:px-12 py-6 space-y-6">

              {/* ── Page Header ── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-semibold text-gray-800 leading-tight">Quizzes</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Manage and track all class quizzes</p>
                </div>
                <button
                  onClick={() => { setCreateModalOpen(true); toggleBlur(); }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6A00FF] hover:bg-[#5800D6] text-white text-sm font-semibold rounded-xl shadow-md shadow-purple-200 transition-all active:scale-95"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Create new</span>
                </button>
              </div>

              {/* ── Stats Cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <StatCard
                  icon={<ClipboardList size={16} className="text-purple-600" />}
                  bg="bg-purple-50"
                  label="Total quizzes"
                  value={totalQuizzes}
                />
                <StatCard
                  icon={<CheckSquare size={16} className="text-blue-600" />}
                  bg="bg-blue-50"
                  label="Total submissions"
                  value={totalSubmissions}
                />
                <StatCard
                  icon={<Users size={16} className="text-emerald-600" />}
                  bg="bg-emerald-50"
                  label="Students assigned"
                  value={totalStudents}
                  className="sm:col-span-2 lg:col-span-1"
                />
              </div>

              {/* ── Table ── */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                  {["#", "Title", "Subject", "Assigned On", "Deadline", "Submissions", "Actions"].map((h, i) => (
                    <div
                      key={h}
                      className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest
                        ${i === 0 ? "col-span-1" : ""}
                        ${i === 1 ? "col-span-2" : ""}
                        ${i === 2 ? "col-span-1" : ""}
                        ${i === 3 ? "col-span-2" : ""}
                        ${i === 4 ? "col-span-2" : ""}
                        ${i === 5 ? "col-span-1 text-center" : ""}
                        ${i === 6 ? "col-span-3 text-center" : ""}
                      `}
                    >
                      {h}
                    </div>
                  ))}
                </div>

                {/* Table Rows */}
                {data && data.length > 0 ? (
                  <div className="divide-y divide-gray-50">
                    {data.map((quiz, index) => {
                      const expectedCount = quiz?.classroomID?.students?.length || 0;
                      const submittedCount = quiz.submissions?.length || 0;
                      const submissionPct = expectedCount > 0
                        ? Math.round((submittedCount / expectedCount) * 100)
                        : 0;
                      const isOverdue = new Date(quiz.dueDate) < new Date();

                      return (
                        <div
                          key={quiz.id || index}
                          className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 px-4 md:px-5 py-5 md:py-4 items-start md:items-center hover:bg-gray-50/70 transition-colors border-b md:border-b-0 last:border-b-0"
                        >
                          {/* # (Desktop: col-span-1, Mobile: hidden) */}
                          <div className="hidden md:flex md:col-span-1 items-center">
                            <span className="text-xs font-medium text-gray-400">{index + 1}</span>
                          </div>

                          {/* Title (Mobile: Row with Index, Desktop: col-span-2) */}
                          <div className="w-full md:col-span-2 flex items-start gap-3">
                            <span className="md:hidden flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500 shrink-0">
                              {index + 1}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold md:font-semibold text-gray-800 truncate">{quiz.title}</p>
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                {quiz.classroomID?.name || "No classroom"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:contents w-full gap-4 md:gap-2">
                            {/* Subject */}
                            <div className="md:col-span-1">
                              <p className="md:hidden text-[10px] uppercase font-bold text-gray-400 mb-1">Subject</p>
                              <span className="inline-block text-[11px] font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full truncate max-w-full">
                                {quiz.subjectID?.name || "—"}
                              </span>
                            </div>

                            {/* Assigned On - Hidden on mobile, shown on md+ */}
                            <div className="hidden md:block md:col-span-2">
                              <p className="text-xs text-gray-500">
                                {moment(quiz.createdAt).format("DD MMM YYYY")}
                              </p>
                            </div>

                            {/* Deadline */}
                            <div className="md:col-span-2">
                              <p className="md:hidden text-[10px] uppercase font-bold text-gray-400 mb-1">Deadline</p>
                              <span className={`inline-flex items-center gap-1 text-[11px] md:text-xs font-medium px-2 py-0.5 rounded-full
                                ${isOverdue ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"}`}
                              >
                                <Clock size={10} />
                                {moment(quiz.dueDate).format("DD MMM")}
                              </span>
                            </div>

                            {/* Submissions */}
                            <div className="md:col-span-1">
                              <p className="md:hidden text-[10px] uppercase font-bold text-gray-400 mb-1 text-center">Stats</p>
                              <div className="flex flex-col items-center md:items-center gap-1">
                                <span className="text-xs font-semibold text-gray-700">
                                  {submittedCount}/{expectedCount}
                                </span>
                                <div className="w-full md:w-full max-w-[60px] md:max-w-none bg-gray-100 rounded-full h-1">
                                  <div
                                    className="bg-purple-500 h-1 rounded-full transition-all"
                                    style={{ width: `${submissionPct}%` }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="md:col-span-3 flex items-center justify-end md:justify-center gap-1.5 md:gap-1 mt-2 md:mt-0">
                               <p className="md:hidden text-[10px] uppercase font-bold text-gray-400 mr-2">Actions:</p>
                              <ActionBtn
                                onClick={() => navigate(`/teacher/quizzes/submissions`, { state: quiz })}
                                color="text-indigo-500 hover:bg-indigo-50 bg-indigo-50/50 md:bg-transparent"
                                title="Submissions"
                              >
                                <FileText size={14} />
                              </ActionBtn>
                              <ActionBtn
                                onClick={() => navigate(`/teacher/quizzes/GradingQuizzes`, { state: quiz })}
                                color="text-purple-500 hover:bg-purple-50 bg-purple-50/50 md:bg-transparent"
                                title="Grade"
                              >
                                <GraduationCap size={15} />
                              </ActionBtn>
                              <ActionBtn
                                onClick={() => { setSelectedAssignments(quiz); setIsEdit(true); toggleBlur(); }}
                                color="text-blue-500 hover:bg-blue-50 bg-blue-50/50 md:bg-transparent"
                                title="Edit"
                              >
                                <MdEdit size={15} />
                              </ActionBtn>
                              <ActionBtn
                                onClick={() => { setSelectedAssignments(quiz); setIsShow(true); toggleBlur(); }}
                                color="text-emerald-500 hover:bg-emerald-50 bg-emerald-50/50 md:bg-transparent"
                                title="View"
                              >
                                <FaEye size={13} />
                              </ActionBtn>
                              <ActionBtn
                                onClick={() => quizDellMutate.mutate(quiz?.id)}
                                color="text-red-400 hover:bg-red-50 bg-red-50/50 md:bg-transparent"
                                title="Delete"
                              >
                                <MdDelete size={15} />
                              </ActionBtn>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Empty State */
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                      <ClipboardList size={24} className="text-gray-300" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-500">No quizzes yet</p>
                      <p className="text-xs text-gray-400 mt-0.5">Click "Create new" to add your first quiz</p>
                    </div>
                    <button
                      onClick={() => { setCreateModalOpen(true); toggleBlur(); }}
                      className="mt-1 flex items-center gap-1.5 px-4 py-2 bg-[#6A00FF] hover:bg-[#5800D6] text-white text-xs font-semibold rounded-xl transition-all"
                    >
                      <Plus size={13} /> Create quiz
                    </button>
                  </div>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <CreateQuizAssignmentModal
        isQuiz={true}
        refetch={refetch}
        open={createModalOpen}
        setopen={setCreateModalOpen}
      />
      <CreateQuizAssignmentModal
        isQuiz={true}
        data={quizdata}
        isEditTrue={true}
        refetch={refetch}
        open={changeDeadlineClick}
        setopen={setChangeDeadlineClick}
      />
      <AssignmentMenu
        isQuizz={true}
        onEditGradeClick={() => {}}
        isopen={isAssignmentMenuOpen}
        setIsOpen={setIsAssignmentMenuOpen}
        onViewSubmissionClick={onViewSubmission}
        onChangeDeadlineClick={onChangeDeadline}
        onGradeAssignemntClick={onGradingAssignment}
      />
      {isEdit && selectedAssignments && (
        <EditQuizAssignmentModal
          data={selectedAssignments}
          refetch={refetch}
          isEditTrue={true}
          isQuiz={true}
          setIsEdit={setIsEdit}
        />
      )}
      {isShow && selectedAssignments && (
        <ShowQuizAssignmentModal
          data={selectedAssignments}
          setIsShow={setIsShow}
          isQuiz={true}
        />
      )}
    </>
  );
};

/* ── Tiny helpers ── */
const StatCard = ({ icon, bg, label, value, className = "" }) => (
  <div className={`bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 ${className}`}>
    <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-lg font-semibold text-gray-800 leading-tight">{value}</p>
    </div>
  </div>
);

const ActionBtn = ({ onClick, color, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-7 h-7 flex items-center justify-center rounded-lg ${color} transition-colors`}
  >
    {children}
  </button>
);

export default Quizzes;
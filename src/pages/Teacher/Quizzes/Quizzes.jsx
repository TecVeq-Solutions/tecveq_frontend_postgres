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
import Loader from "../../../utils/Loader";
import {
  ClipboardList,
  Plus,
  Users,
  CheckSquare,
  Clock,
  FileText,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import moment from "moment";

const Quizzes = () => {
  const [isAssignmentMenuOpen, setIsAssignmentMenuOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isShow, setIsShow] = useState(false);
  const [selectedAssignments, setSelectedAssignments] = useState(null);
  const [quizdata, setQuizdata] = useState({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [changeDeadlineClick, setChangeDeadlineClick] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const { toggleBlur } = useBlur();

  const { data, isPending, isSuccess, isRefetching, refetch } = useQuery({
    queryKey: ["quizes"],
    queryFn: getAllQuizes,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
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

  const onViewSubmission = () =>
    navigate(`/teacher/quizzes/submissions`, { state: quizdata });

  const onGradingAssignment = () =>
    navigate(`/teacher/quizzes/GradingQuizzes`, { state: quizdata });

  const onChangeDeadline = () => setChangeDeadlineClick((p) => !p);

  /* ── Derived stats ── */
  const totalQuizzes = data?.length || 0;

  const totalSubmissions =
    data?.reduce((acc, q) => acc + (q.submissions?.length || 0), 0) || 0;

  const totalStudents =
    data?.reduce(
      (acc, q) => acc + (q.classroomID?.students?.length || 0),
      0
    ) || 0;

  // Pagination logic
  const totalItems = data?.length || 0;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  const paginatedQuizzes = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return data?.slice(startIndex, endIndex) || [];
  }, [data, currentPage, rowsPerPage]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (isPending && !data) {
    return (
      <div className="flex flex-col flex-1 bg-[#F9F9F9] lg:ml-80">
        <Navbar heading="Quizzes" />
        <div className="flex flex-1 items-center justify-center py-24">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F9F9F9] font-poppins lg:ml-80 transition-all duration-300">
        <div className="w-full min-w-0 overflow-x-hidden">
          <Navbar heading="Quizzes" />

          <div className="px-3 sm:px-6 lg:px-12 py-6 space-y-6">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-800 leading-tight">
                  Quizzes
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Manage and track all class quizzes
                </p>
              </div>

              <button
                onClick={() => {
                  setCreateModalOpen(true);
                  toggleBlur();
                }}
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
                {[
                  "#",
                  "Title",
                  "Subject",
                  "Assigned On",
                  "Deadline",
                  "Submissions",
                  "Actions",
                ].map((h, i) => (
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
                <>
                  <div className="divide-y divide-gray-50">
                    {paginatedQuizzes.map((quiz, index) => {
                      const expectedCount =
                        quiz?.classroomID?.students?.length || 0;

                      const submittedCount = quiz.submissions?.length || 0;

                      const submissionPct =
                        expectedCount > 0
                          ? Math.round((submittedCount / expectedCount) * 100)
                          : 0;

                      const isOverdue = new Date(quiz.dueDate) < new Date();

                      return (
                        <div
                          key={quiz.id || index}
                          className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 px-3 sm:px-4 md:px-5 py-5 md:py-4 items-start md:items-center hover:bg-gray-50/70 transition-colors border-b md:border-b-0 last:border-b-0"
                        >
                          {/* # */}
                          <div className="hidden md:flex md:col-span-1 items-center">
                            <span className="text-xs font-medium text-gray-400">
                              {(currentPage - 1) * rowsPerPage + index + 1}
                            </span>
                          </div>

                          {/* Title */}
                          <div className="w-full md:col-span-2 flex items-start gap-3">
                            <span className="md:hidden flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100 text-[10px] font-bold text-gray-500 shrink-0">
                              {(currentPage - 1) * rowsPerPage + index + 1}
                            </span>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold md:font-semibold text-gray-800 truncate">
                                {quiz.title}
                              </p>

                              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                {quiz.classroomID?.name || "No classroom"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:contents w-full gap-2 sm:gap-4 md:gap-2">
                            {/* Subject */}
                            <div className="md:col-span-1">
                              <p className="md:hidden text-[10px] uppercase font-bold text-gray-400 mb-1">
                                Subject
                              </p>

                              <span className="inline-block text-[11px] font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full truncate max-w-full">
                                {quiz.subjectID?.name || "—"}
                              </span>
                            </div>

                            {/* Assigned On */}
                            <div className="hidden md:block md:col-span-2">
                              <p className="text-xs text-gray-500">
                                {moment(quiz.createdAt).format("DD MMM YYYY")}
                              </p>
                            </div>

                            {/* Deadline */}
                            <div className="md:col-span-2">
                              <p className="md:hidden text-[10px] uppercase font-bold text-gray-400 mb-1">
                                Deadline
                              </p>

                              <span
                                className={`inline-flex items-center gap-1 text-[11px] md:text-xs font-medium px-2 py-0.5 rounded-full
                                ${isOverdue
                                    ? "bg-red-50 text-red-500"
                                    : "bg-green-50 text-green-600"
                                  }`}
                              >
                                <Clock size={10} />
                                {moment(quiz.dueDate).format("DD MMM")}
                              </span>
                            </div>

                            {/* Submissions */}
                            <div className="md:col-span-1">
                              <p className="md:hidden text-[10px] uppercase font-bold text-gray-400 mb-1 sm:text-center">
                                Stats
                              </p>

                              <div className="flex flex-col sm:items-center md:items-center gap-1">
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
                            <div className="flex-col md:col-span-3 flex sm:items-center sm:justify-end md:justify-center gap-1.5 md:gap-1 mt-2 md:mt-0">
                              <div>
                                <p className="md:hidden text-[10px] uppercase font-bold text-gray-400 mr-2">
                                  Actions:
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <ActionBtn
                                  onClick={() =>
                                    navigate(`/teacher/quizzes/submissions`, {
                                      state: quiz,
                                    })
                                  }
                                  color="text-indigo-500 hover:bg-indigo-50 bg-indigo-50/50 md:bg-transparent"
                                  title="Submissions"
                                >
                                  <FileText size={14} />
                                </ActionBtn>

                                <ActionBtn
                                  onClick={() =>
                                    navigate(`/teacher/quizzes/GradingQuizzes`, {
                                      state: quiz,
                                    })
                                  }
                                  color="text-purple-500 hover:bg-purple-50 bg-purple-50/50 md:bg-transparent"
                                  title="Grade"
                                >
                                  <GraduationCap size={15} />
                                </ActionBtn>

                                <ActionBtn
                                  onClick={() => {
                                    setSelectedAssignments(quiz);
                                    setIsEdit(true);
                                    toggleBlur();
                                  }}
                                  color="text-blue-500 hover:bg-blue-50 bg-blue-50/50 md:bg-transparent"
                                  title="Edit"
                                >
                                  <MdEdit size={15} />
                                </ActionBtn>

                                <ActionBtn
                                  onClick={() => {
                                    setSelectedAssignments(quiz);
                                    setIsShow(true);
                                    toggleBlur();
                                  }}
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
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination + Selector Footer */}
                  {totalItems > 0 && (
                    <div className="mt-4 sm:mt-6 mb-4 flex lg:flex-row items-center justify-between sm:gap-4 gap-2 rounded-[15px] sm:rounded-3xl border border-[#E8E3FF] bg-white/80 backdrop-blur-md px-1 sm:px-6 py-4 shadow-[0_8px_30px_rgba(106,0,255,0.08)]">
                      {/* Rows selector */}
                      <div className="flex flex-row items-center gap-1 sm:gap-3 w-full lg:w-auto justify-center lg:justify-start">
                        <span className="text-sm font-semibold text-[#0B1053]/70">
                          Rows per page
                        </span>

                        <div className="relative">
                          <select
                            value={rowsPerPage}
                            onChange={(e) => {
                              setRowsPerPage(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="appearance-none min-w-[40px] sm:min-w-[92px] cursor-pointer rounded-2xl border border-[#DCD4FF] bg-gradient-to-br from-white to-[#F6F3FF] px-2 sm:pl-4 pr-7 sm:pr-10 py-2.5 text-sm font-bold text-[#6A00FF] outline-none shadow-[0_4px_14px_rgba(106,0,255,0.10)] hover:border-[#6A00FF]/50 focus:border-[#6A00FF] transition-all duration-200"
                          >
                            {[2, 4, 6, 10].map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>

                          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                            <svg
                              className="w-4 h-4 text-[#6A00FF]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Showing info */}
                      <div className="hidden sm:flex flex-col items-center text-center">
                        <p className="text-sm font-semibold text-[#0B1053]">
                          Showing{" "}
                          <span className="text-[#6A00FF]">
                            {startItem}
                          </span>{" "}
                          to{" "}
                          <span className="text-[#6A00FF]">
                            {endItem}
                          </span>{" "}
                          of{" "}
                          <span className="text-[#6A00FF]">
                            {totalItems}
                          </span>{" "}
                          Quizzes
                        </p>

                        <p className="text-xs text-[#0B1053]/45 mt-0.5">
                          Page {currentPage} of {totalPages}
                        </p>
                      </div>

                      {/* Pagination buttons */}
                      <div className="flex items-center gap-2 w-full lg:w-auto justify-center lg:justify-end">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="group flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 sm:py-2.5 py-1.5 rounded-2xl text-sm font-bold border border-[#DCD4FF] bg-white text-[#0B1053] shadow-[0_3px_12px_rgba(106,0,255,0.08)] hover:bg-[#F6F3FF] hover:text-[#6A00FF] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#0B1053] active:scale-95 transition-all duration-200"
                        >
                          <IoChevronBackOutline className="sm:hidden inline" size={18} />
                          <span className="hidden sm:inline">Previous</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter((page) => {
                              return (
                                page === 1 ||
                                page === totalPages ||
                                Math.abs(page - currentPage) <= 1
                              );
                            })
                            .map((page, index, arr) => (
                              <React.Fragment key={page}>
                                {index > 0 && page - arr[index - 1] > 1 && (
                                  <span className="px-1 text-gray-400 text-sm">
                                    ...
                                  </span>
                                )}

                                <button
                                  onClick={() => goToPage(page)}
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 ${currentPage === page
                                    ? "bg-gradient-to-br from-[#7B1FFF] to-[#5500CC] text-white shadow-[0_5px_16px_rgba(106,0,255,0.35)]"
                                    : "bg-[#F6F3FF] text-[#6A00FF] hover:bg-[#ECE6FF]"
                                    }`}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            ))}
                        </div>

                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="group flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 sm:py-2.5 py-1.5 rounded-2xl text-sm font-bold border border-[#DCD4FF] bg-white text-[#0B1053] shadow-[0_3px_12px_rgba(106,0,255,0.08)] hover:bg-[#F6F3FF] hover:text-[#6A00FF] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#0B1053] active:scale-95 transition-all duration-200"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <IoChevronForwardOutline className="sm:hidden inline" size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <ClipboardList size={24} className="text-gray-300" />
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-500">
                      No quizzes yet
                    </p>

                    <p className="text-xs text-gray-400 mt-0.5">
                      Click "Create new" to add your first quiz
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCreateModalOpen(true);
                      toggleBlur();
                    }}
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
        onEditGradeClick={() => { }}
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
  <div
    className={`bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 ${className}`}
  >
    <div
      className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}
    >
      {icon}
    </div>

    <div>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </p>

      <p className="text-lg font-semibold text-gray-800 leading-tight">
        {value}
      </p>
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
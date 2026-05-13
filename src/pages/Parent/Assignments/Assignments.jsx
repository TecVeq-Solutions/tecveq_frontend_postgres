import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../../components/Parent/Dashboard/Navbar";
import QuizAssignmentRow from "../../../components/Student/QuizAssignment/QuizAssignmentRow";
import { useBlur } from "../../../context/BlurContext";
import { useParent } from "../../../context/ParentContext";
import { useSidebar } from "../../../context/SidebarContext";
import { ClipboardList } from "lucide-react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

const Assignments = () => {
  const { isSidebarOpen } = useSidebar();
  const { isBlurred } = useBlur();
  const { allAssignments } = useParent();

  const studentAssignments = allAssignments || [];

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Pagination logic
  const totalItems = studentAssignments.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  const paginatedAssignments = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return studentAssignments.slice(startIndex, endIndex);
  }, [studentAssignments, currentPage, rowsPerPage]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return (
    <div
      className="flex flex-1 min-h-screen font-poppins"
      style={{
        background:
          "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f9f9f9 100%)",
      }}
    >
      <div className="flex flex-1">
        <div className="w-full lg:px-20 sm:px-10 px-3 flex-grow ml-0 lg:ml-72 xl:ml-80">
          <div className="pt-1">
            <Navbar heading={"Assignments"} />

            <div
              className={`${isBlurred ? "blur" : ""} relative ${isSidebarOpen ? "-z-10" : "z-auto"
                } lg:z-auto`}
            >
              {/* Header Banner */}
              <div
                className="mt-3 mb-3 sm:mt-6 sm:mb-6 rounded-2xl px-3 sm:px-6 py-5 flex items-center gap-4"
                style={{
                  background:
                    "linear-gradient(135deg, #6A00FF 0%, #9B4DFF 60%, #C084FC 100%)",
                }}
              >
                <div className="bg-white/20 rounded-xl p-3">
                  <ClipboardList className="text-white" size={28} />
                </div>

                <div>
                  <h2 className="text-white font-bold text-xl leading-tight">
                    Assignments
                  </h2>

                  <p className="text-purple-200 text-sm mt-0.5">
                    {studentAssignments.length} assignment
                    {studentAssignments.length !== 1 ? "s" : ""} assigned
                  </p>
                </div>
              </div>

              {/* Table Wrapper */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100/70 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div
                  className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 text-xs font-semibold text-purple-700 tracking-wide uppercase"
                  style={{
                    background: "rgba(106,0,255,0.07)",
                    borderBottom: "1px solid rgba(106,0,255,0.12)",
                  }}
                >
                  <div className="col-span-1 text-center">#</div>
                  <div className="col-span-2 text-center">Subject</div>
                  <div className="col-span-3 text-center">Title</div>
                  <div className="col-span-2 text-center">Deadline</div>
                  <div className="col-span-1 text-center">Marks</div>
                  <div className="col-span-1 text-center">File</div>
                  <div className="col-span-2 text-center">Status</div>
                </div>

                {/* Assignment Cards */}
                {studentAssignments.length > 0 ? (
                  <>
                    <div className="space-y-3 p-3">
                      {paginatedAssignments.map((assignment, index) => {
                        const rowIndex =
                          (currentPage - 1) * rowsPerPage + index + 1;

                        return (
                          <QuizAssignmentRow
                            alldata={assignment}
                            isQuiz={false}
                            index={rowIndex}
                            id={assignment.id}
                            key={assignment.id}
                            subject={
                              assignment?.subject?.name ||
                              assignment?.subjectID?.name
                            }
                            title={assignment?.title}
                            deadline={assignment?.dueDate}
                            header={false}
                            total_marks={assignment?.totalMarks}
                            download={assignment?.files?.[0]?.url}
                            upload={true}
                            text={assignment?.text}
                          />
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
                              className="appearance-none min-w-[50px] sm:min-w-[92px] cursor-pointer rounded-2xl border border-[#DCD4FF] bg-gradient-to-br from-white to-[#F6F3FF] px-2 sm:pl-4 sm:pr-10 py-2.5 text-sm font-bold text-[#6A00FF] outline-none shadow-[0_4px_14px_rgba(106,0,255,0.10)] hover:border-[#6A00FF]/50 focus:border-[#6A00FF] transition-all duration-200"
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
                            Assignments
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
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="bg-purple-100 rounded-full p-6">
                      <ClipboardList size={48} className="text-purple-400" />
                    </div>

                    <p className="font-semibold text-xl text-gray-500">
                      No assignments yet
                    </p>

                    <p className="text-gray-400 text-sm">
                      No assignments have been posted.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments;
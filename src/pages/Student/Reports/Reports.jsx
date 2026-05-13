import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../../../components/Student/Dashboard/Navbar";
import DataRows from "../../../components/Student/Reports/DataRows";

import { useNavigate } from "react-router-dom";
import { useBlur } from "../../../context/BlurContext";
import { useStudent } from "../../../context/StudentContext";
import { getAllSubjects } from "../../../api/Student/Subjects";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../../context/UserContext";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

const Reports = () => {
  const navigate = useNavigate();
  const { isBlurred, toggleBlur } = useBlur();
  const { allSubjects, setAllSubjects } = useStudent();
  const { userData } = useUser();

  // Reset blur when this page mounts (in case user navigated from another page with blur on)
  useEffect(() => {
    if (isBlurred) toggleBlur();
  }, []);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleFunctionClick = (report) => {
    navigate(`/reports/${report.name}`, { state: report });
  };

  const subjectQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const results = await getAllSubjects(userData.id);
      setAllSubjects(results);
      return results;
    },
    staleTime: 300000,
    enabled: allSubjects.length == 0,
  });

  const subjects = allSubjects?.subjects || [];

  // Pagination logic
  const totalItems = subjects.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  const paginatedSubjects = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return subjects.slice(startIndex, endIndex);
  }, [subjects, currentPage, rowsPerPage]);

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
    <div className="flex flex-1 bg-[#F4F6FB] font-poppins">
      <div className="flex flex-1">
        <div className="w-full min-h-screen px-4 sm:px-4 sm:px-10 lg:px-20 ml-0 lg:ml-72 sm:py-6">
          {/* Navbar */}
          <div className="flex items-center justify-between mb-3">
            <Navbar heading={"Reports"} />
          </div>

          <div className="mb-3">
            {subjects.length > 0 && (
              <span className="bg-[#E8EEFF] text-[#0B1053] text-xs font-semibold px-3 py-1.5 rounded-full">
                {subjects.length} Subjects
              </span>
            )}
          </div>

          <div className={`${isBlurred ? "blur" : ""}`}>
            {/* Stats cards */}
            {subjects.length > 0 &&
              (() => {
                const avg = Math.round(
                  subjects.reduce((s, r) => s + r.avgAttendancePer, 0) /
                  subjects.length
                );

                const atRisk = subjects.filter(
                  (r) => r.avgAttendancePer < 60
                ).length;

                return (
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                    {[
                      {
                        label: "Total Subjects",
                        value: subjects.length,
                        color: "text-[#0B1053]",
                      },
                      {
                        label: "Avg Attendance",
                        value: `${avg}%`,
                        color:
                          avg >= 75
                            ? "text-green-600"
                            : avg >= 60
                              ? "text-amber-600"
                              : "text-red-600",
                      },
                      {
                        label: "At Risk",
                        value: atRisk,
                        color:
                          atRisk > 0 ? "text-red-600" : "text-green-600",
                      },
                    ].map(({ label, value, color }) => (
                      <div
                        key={label}
                        className="bg-white rounded-2xl border border-[#E8EAEF] p-3 sm:p-4"
                      >
                        <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8B92B3] mb-1 leading-tight">
                          {label}
                        </p>

                        <p className={`text-xl sm:text-2xl font-bold ${color}`}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })()}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[#E8EAEF] overflow-hidden shadow-sm">
              <DataRows
                index={"#"}
                subject={"Subject"}
                instructor={"Instructor"}
                attendance={"Attendance"}
                header={true}
              />

              {subjects.length > 0 ? (
                <>
                  <div>
                    {paginatedSubjects.map((report, index) => {
                      const rowIndex =
                        (currentPage - 1) * rowsPerPage + index + 1;

                      return (
                        <DataRows
                          key={rowIndex}
                          index={rowIndex}
                          subject={report.name}
                          instructor={report.teacher}
                          attendance={report.avgAttendancePer}
                          header={false}
                          onClickFunction={() => handleFunctionClick(report)}
                        />
                      );
                    })}
                  </div>

                  {/* Pagination + Selector */}
                  <div className="mt-4 sm:mt-6 mb-4 flex flex-row items-center justify-between sm:gap-4 gap-4 rounded-[15px] sm:rounded-3xl border border-[#E8E3FF] bg-white/80 backdrop-blur-md px-1 sm:px-6 py-4 shadow-[0_8px_30px_rgba(106,0,255,0.08)]">
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
                        Showing <span className="text-[#6A00FF]">{startItem}</span> to{" "}
                        <span className="text-[#6A00FF]">{endItem}</span> of{" "}
                        <span className="text-[#6A00FF]">{totalItems}</span> Subjects
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
                                <span className="px-1 text-gray-400 text-sm">...</span>
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
                </>
              ) : (
                <div className="flex justify-center py-16">
                  <p className="font-medium text-xl text-gray-400">
                    No subjects to display
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
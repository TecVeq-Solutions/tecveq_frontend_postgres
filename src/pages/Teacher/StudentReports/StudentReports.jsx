import React, { useRef, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Teacher/Navbar";
import useClickOutside from "../../../hooks/useClickOutlise";
import DataRows from "../../../components/Teacher/StudentReports/DataRows";

import { FiFilter } from "react-icons/fi";
import {
  IoClose,
  IoSearch,
  IoChevronBack,
  IoChevronForward,
  IoChevronBackOutline,
  IoChevronForwardOutline
} from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import { useBlur } from "../../../context/BlurContext";
import { useTeacher } from "../../../context/TeacherContext";
import { getAllStudentsOfTeacher } from "../../../api/Teacher/StudentReport";
import { getTeacherSubjectsOfClassroom } from "../../../api/Teacher/TeacherSubjectApi";
import { useQuery } from "@tanstack/react-query";

const FilterPopup = ({
  open,
  setopen,
  subject,
  applyFilter,
  setSubject,
  classroom,
  setClassroom,
}) => {
  const ref = useRef(null);
  useClickOutside(ref, () => setopen(false));
  const { allClassrooms } = useTeacher();

  const { data: teacherSubjectOfClassroom } = useQuery({
    queryKey: ["teacherSubjectsOfClassrooms", classroom?.id],
    queryFn: async () =>
      await getTeacherSubjectsOfClassroom({
        classroomIDs: [classroom.id],
      }),
    enabled: !!classroom?.id,
  });

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-10 bg-black/20 sm:hidden"
        onClick={() => setopen(false)}
      />

      <div
        ref={ref}
        className="
          fixed z-20 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden
          left-3 right-3 bottom-4
          sm:fixed sm:left-auto sm:right-4 sm:bottom-auto sm:top-auto sm:w-80
          md:absolute md:fixed-none
        "
      >
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#6A00FF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-800">Filter</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setopen(false);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <IoClose size={16} />
          </button>
        </div>

        <div className="flex flex-col gap-4 px-4 sm:px-5 py-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Classroom
            </label>

            <div className="relative">
              <select
                value={classroom ? JSON.stringify(classroom) : ""}
                onChange={(e) =>
                  setClassroom(e.target.value ? JSON.parse(e.target.value) : "")
                }
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all cursor-pointer"
              >
                <option value="">Select classroom</option>

                {allClassrooms?.map((item) => (
                  <option key={item.id} value={JSON.stringify(item)}>
                    {item.name}
                  </option>
                ))}
              </select>

              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Subject
            </label>

            <div className="relative">
              <select
                value={subject ? JSON.stringify(subject) : ""}
                onChange={(e) =>
                  setSubject(e.target.value ? JSON.parse(e.target.value) : "")
                }
                disabled={!classroom?.id}
                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!classroom?.id
                    ? "Select a classroom first"
                    : "Select subject"}
                </option>

                {teacherSubjectOfClassroom?.subjects?.map((item) => (
                  <option key={item.id} value={JSON.stringify(item)}>
                    {item.subjectName}
                  </option>
                ))}
              </select>

              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {!classroom?.id && (
              <p className="text-[10px] text-gray-400 px-0.5">
                Choose a classroom to load subjects
              </p>
            )}
          </div>

          <button
            onClick={() => {
              applyFilter();
              setopen(false);
            }}
            className="w-full py-2.5 rounded-xl bg-[#6A00FF] hover:bg-[#5800D6] text-white text-sm font-semibold shadow-md shadow-purple-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </>
  );
};

const StudentReports = () => {
  const navigate = useNavigate();
  const { isBlurred } = useBlur();

  const [subject, setSubject] = useState("");
  const [classroom, setClassroom] = useState("");
  const [searchText, setSearchText] = useState("");
  const [openFilterModal, setOpenFilterModal] = useState(false);

  const [filterActive, setFilterActive] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleFunctionClick = (std) => {
    return () => {
      navigate(`/teacher/reports/${std.name}`, { state: std });
    };
  };

  const { data, isPending } = useQuery({
    queryKey: ["teacherStudets"],
    queryFn: async () => {
      let result = await getAllStudentsOfTeacher();
      return result;
    },
    staleTime: 1000 * 60 * 5,
  });

  const applyFilter = () => {
    if (!isPending) {
      let temparr = data?.filter((item) => {
        return (
          item?.classroom?.id === classroom?.id &&
          item?.subject?.id === subject?.subjectId
        );
      });

      setFilterActive(true);
      setFilteredData(temparr);
      setCurrentPage(1);
    }
  };

  const stats = React.useMemo(() => {
    if (!data || data.length === 0) return { total: 0, avg: 0, atRisk: 0 };

    const uniqueStudents = new Set(data.map((s) => s.name)).size;

    const avg = Math.round(
      data.reduce((s, r) => s + (r.avgAttendancePer || 0), 0) / data.length
    );

    const atRisk = data.filter((r) => (r.avgAttendancePer || 0) < 60).length;

    return { total: uniqueStudents, avg, atRisk };
  }, [data]);

  const displayData = filterActive ? filteredData : data;

  const searchedData = searchText
    ? displayData?.filter(
      (std) =>
        std?.classroom?.name
          ?.toLowerCase()
          .includes(searchText.toLowerCase()) ||
        std?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        std?.subject?.name
          ?.toLowerCase()
          .includes(searchText.toLowerCase())
    )
    : displayData;

  // Pagination logic
  const totalItems = searchedData?.length || 0;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return searchedData?.slice(startIndex, endIndex) || [];
  }, [searchedData, currentPage, rowsPerPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterActive, rowsPerPage]);

  if (isPending && !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F4F6FB] lg:ml-80">
        <Loader />
      </div>
    );
  }

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-1 bg-[#F4F6FB] font-poppins min-h-screen overflow-x-hidden">
      <div className="flex flex-1 min-w-0">
        <div className="w-full max-w-full min-h-screen px-3 sm:px-6 md:px-10 lg:ml-80 py-4 sm:py-6 overflow-x-hidden">
          <header className="sticky top-0 z-[90]  bg-[#F4F6FB] flex h-16 sm:h-20 -mx-3 sm:-mx-6 md:-mx-10 px-3 sm:px-6 md:px-10">
            <Navbar heading={"Student Reports"} />
          </header>

          <div className="py-4">
            {data?.length > 0 && (
              <span className="bg-[#E8EEFF] text-[#0B1053] text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full">
                {data.length} Reports
              </span>
            )}
          </div>

          <div
            className={`${isBlurred ? "blur" : ""
              } transition-all duration-300`}
          >
            {data?.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-6">
                {[
                  {
                    label: "Total Students",
                    value: stats.total,
                    color: "text-[#0B1053]",
                  },
                  {
                    label: "Avg Attendance",
                    value: `${stats.avg}%`,
                    color:
                      stats.avg >= 75
                        ? "text-green-600"
                        : stats.avg >= 60
                          ? "text-amber-600"
                          : "text-red-600",
                  },
                  {
                    label: "At Risk Students",
                    value: stats.atRisk,
                    color:
                      stats.atRisk > 0 ? "text-red-600" : "text-green-600",
                  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="bg-white rounded-xl sm:rounded-2xl border border-[#E8EAEF] p-2.5 sm:p-4 shadow-sm min-w-0"
                  >
                    <p className="text-[8px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8B92B3] mb-1 truncate">
                      {label}
                    </p>
                    <p
                      className={`text-base sm:text-2xl font-bold truncate ${color}`}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 mb-5 sm:mb-6">
              <div className="relative w-full">
                <IoSearch
                  className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />

                <input
                  type="text"
                  value={searchText}
                  placeholder="Search students, subjects, classes..."
                  className="w-full bg-white border border-[#E8EAEF] rounded-xl py-2.5 pl-9 sm:pl-11 pr-4 text-sm outline-none focus:border-[#6A00FF] focus:ring-2 focus:ring-purple-50 transition-all shadow-sm"
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="flex items-center gap-2">
                {filterActive && (
                  <button
                    onClick={() => {
                      setFilterActive(false);
                      setFilteredData([]);
                      setClassroom("");
                      setSubject("");
                      setCurrentPage(1);
                    }}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-red-100 text-red-500 text-xs sm:text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors shadow-sm flex-shrink-0"
                  >
                    <IoClose size={16} />
                    <span>Clear</span>
                  </button>
                )}

                <button
                  onClick={() => setOpenFilterModal(true)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm flex-shrink-0 ${filterActive
                    ? "bg-[#6A00FF] text-white"
                    : "bg-white border border-[#E8EAEF] text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <FiFilter size={16} />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            <div className="w-full overflow-x-auto rounded-2xl border border-[#E8EAEF] shadow-sm bg-white">
              <DataRows
                header={true}
                index={"#"}
                subject={"Subject"}
                studentName={"Student Name"}
                studentClass={"Class"}
                attendance={"Attendance"}
              />

              <div className=" min-h-[200px] sm:min-h-[400px]">
                {paginatedData?.length > 0 ? (
                  paginatedData.map((std, index) => (
                    <DataRows
                      key={std.id}
                      header={false}
                      index={(currentPage - 1) * rowsPerPage + index + 1}
                      studentName={std.name}
                      subject={std.subject.name}
                      attendance={std.avgAttendancePer}
                      studentClass={std.classroom.name}
                      onClickFunction={handleFunctionClick(std)}
                      studentProfile={std.profilePic}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 sm:py-20 opacity-60">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                      <IoSearch size={24} className="text-gray-400 sm:hidden" />
                      <IoSearch
                        size={32}
                        className="text-gray-400 hidden sm:block"
                      />
                    </div>

                    <p className="font-medium text-base sm:text-lg text-gray-500">
                      No reports found
                    </p>

                    <p className="text-xs sm:text-sm text-gray-400 text-center px-4">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
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
                      Reports
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
            </div>
          </div>
        </div>
      </div>

      <FilterPopup
        subject={subject}
        classroom={classroom}
        open={openFilterModal}
        setSubject={setSubject}
        applyFilter={applyFilter}
        setClassroom={setClassroom}
        setopen={setOpenFilterModal}
      />
    </div>
  );
};

export default StudentReports;
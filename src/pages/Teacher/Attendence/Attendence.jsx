import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Teacher/Navbar";
import DataRow from "../../../components/Teacher/Attendence/DataRow";
import ClassMenu from "../../../components/Teacher/Attendence/ClassMenu";
import { BiSearch, BiCalendarCheck, BiFilterAlt } from "react-icons/bi";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getTodayClasses,
  cancelAttendence,
} from "../../../api/Teacher/Attendence";
import { getAllClassrooms } from "../../../api/Teacher/ClassroomApi";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

const Attendence = () => {
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [editClassData, setEditClassData] = useState({});
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const { userData } = useUser();
  const [head, setHead] = useState(false);
  const { isBlurred } = useBlur();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading: isLoadingClass, refetch } = useQuery({
    queryKey: ["today-classes"],
    queryFn: getTodayClasses,
  });

  const { data: classrooms, isLoading: isLoadingClassroom } = useQuery({
    queryKey: ["classroom"],
    queryFn: getAllClassrooms,
  });

  const toggleClassMenuOpen = (data) => {
    setEditClassData(data);
    setIsClassMenuOpen(!isClassMenuOpen);
  };

  const handleEditClass = () => {
    if (editClassData?.allData) {
      navigate("/teacher/attendence/submission", {
        state: editClassData?.allData,
      });
    }
  };

  const cancelAttendenceMutation = useMutation({
    mutationFn: async (id) => await cancelAttendence(id),
    onSuccess: async () => {
      await refetch();
      setIsClassMenuOpen(false);
      toast.success("Attendance cancelled successfully");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to cancel attendance"
      );
    },
  });

  const handleDeleteClass = async () => {
    cancelAttendenceMutation.mutate(editClassData?.allData?.id);
  };

  useEffect(() => {
    if (!isLoadingClassroom && classrooms) {
      const userId = userData?.id || userData?._id;

      const hasHeadTeacher = classrooms.some((classroom) =>
        classroom?.teachers?.some(
          (t) =>
            t.type === "head" &&
            (t.teacherID === userId || t.teacher === userId)
        )
      );

      setHead(hasHeadTeacher);
    }
  }, [classrooms, isLoadingClassroom, userData]);

  const filteredData = searchText
    ? data?.filter(
      (cls) =>
        cls.title.toLowerCase().includes(searchText.toLowerCase()) ||
        cls.subject?.name?.toLowerCase().includes(searchText.toLowerCase())
    )
    : data;

  // Pagination logic
  const totalItems = filteredData?.length || 0;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return filteredData?.slice(startIndex, endIndex) || [];
  }, [filteredData, currentPage, rowsPerPage]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  if (isLoadingClass || isLoadingClassroom)
    return (
      <div className="flex justify-center items-center h-screen w-full bg-[#F9F9F9]">
        <Loader />
      </div>
    );

  return (
    <div className="flex flex-1 bg-[#FDFDFD] font-poppins min-h-screen">
      <div className="flex flex-1 min-w-0">
        <div className="w-full flex-grow lg:ml-80 min-w-0">
          <div className="h-screen flex flex-col">
            <Navbar heading={"Attendance Management"} />

            <main
              className={`px-3 sm:px-4 lg:px-10 flex flex-col flex-1 min-h-0 transition-all duration-500 ${isBlurred ? "blur-md scale-[0.99]" : "blur-0"
                }`}
            >
              {/* ── Enhanced Header/Toolbar ── */}
              <div className="py-8">
                <div className="flex flex-col md:flex-row gap-5 w-full justify-between items-center bg-white border border-gray-100 p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm bg-white/80">
                  <div className="flex flex-col gap-1 w-full md:w-auto">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                      Today's Schedule
                    </h2>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                      Manage and track student presence
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* Search Field */}
                    <div className="relative group w-full sm:w-72">
                      <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-[#6A00FF] transition-colors" />

                      <input
                        type="text"
                        value={searchText}
                        placeholder="Search class or subject..."
                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl outline-none focus:bg-white focus:border-[#6A00FF] focus:ring-4 focus:ring-purple-100 transition-all duration-300 text-sm font-medium text-gray-700"
                        onChange={(e) => {
                          setSearchText(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    {/* Head Teacher Action */}
                    {head && (
                      <button
                        className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#6A00FF] hover:bg-[#5a00e0] active:scale-[0.97] text-white text-sm font-bold px-3 sm:px-7 py-3.5 rounded-2xl shadow-lg shadow-purple-200 transition-all duration-300 overflow-hidden"
                        onClick={() =>
                          navigate("/teacher/classroom/head-attendence", {
                            state: data,
                          })
                        }
                      >
                        <BiCalendarCheck className="text-xl transition-transform group-hover:rotate-12" />
                        <span className="relative z-10">
                          Classroom Attendance
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Professional Data Table ── */}
              <div className="flex-1 min-h-0 mb-8">
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col h-[65vh] overflow-hidden">
                  <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">
                    <div className="teacher-attednece min-w-[800px] md:min-w-full flex flex-col flex-1">
                      {/* Table Header */}
                      <div className="bg-gray-50/50 border-b border-gray-100 py-2">
                        <DataRow
                          isQuiz={true}
                          index={"#"}
                          classname={"Class Name"}
                          subject={"Subject Name"}
                          students={"Total Students"}
                          teachers={"Classroom"}
                          startDate={null}
                          header={true}
                          threeDots={true}
                        />
                      </div>

                      {/* Table Body */}
                      <div className="flex-1 overflow-y-auto scrollbar-hide hover:scrollbar-default transition-all">
                        {paginatedData?.length > 0 ? (
                          <div className="divide-y divide-gray-50">
                            {paginatedData.map((cls, index) => {
                              const rowIndex =
                                (currentPage - 1) * rowsPerPage + index + 1;

                              return (
                                <div
                                  key={cls.id || index}
                                  className="hover:bg-gray-50/80 transition-colors group"
                                >
                                  <DataRow
                                    data={cls}
                                    allData={cls}
                                    toggleClassMenu={toggleClassMenuOpen}
                                    index={
                                      rowIndex < 10 ? `0${rowIndex}` : rowIndex
                                    }
                                    classname={cls.title}
                                    subject={
                                      cls?.subject?.name ||
                                      cls?.subjectID?.name ||
                                      "Unassigned"
                                    }
                                    students={
                                      cls?.classroom?.students?.length ||
                                      cls?.classroom?.studentDetails?.length ||
                                      0
                                    }
                                    teachers={cls?.classroom?.name || "General"}
                                    startDate={cls.startTime}
                                    bgColor={"transparent"}
                                    header={false}
                                    threeDots={true}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* Minimalist Empty State */
                          <div className="flex flex-col items-center justify-center h-full py-20">
                            <div className="relative mb-6">
                              <div className="absolute inset-0 bg-purple-100 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                              <div className="relative w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-gray-50">
                                <BiFilterAlt className="text-gray-300 text-3xl" />
                              </div>
                            </div>

                            <h3 className="text-gray-800 font-bold text-lg">
                              No matches found
                            </h3>

                            <p className="text-gray-400 text-sm mt-2 max-w-[280px] text-center leading-relaxed">
                              We couldn't find any classes matching your current
                              search criteria.
                            </p>

                            {searchText && (
                              <button
                                onClick={() => {
                                  setSearchText("");
                                  setCurrentPage(1);
                                }}
                                className="mt-6 text-[#6A00FF] font-bold text-sm hover:underline"
                              >
                                Clear Search
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
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
                          Scheduled Sessions
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
            </main>
          </div>
        </div>
      </div>

      <ClassMenu
        editClassRoom={handleEditClass}
        deleteClassRoom={handleDeleteClass}
        isopen={isClassMenuOpen}
        setIsOpen={setIsClassMenuOpen}
        markAttendanceData={editClassData}
      />
    </div>
  );
};

export default Attendence;
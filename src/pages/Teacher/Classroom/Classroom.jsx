import React, { useEffect, useState, useMemo } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Teacher/Navbar";
import DataRow from "../../../components/Teacher/Classroom/DataRow";
import ClassMenu from "../../../components/Teacher/Classroom/ClassMenu";
import ClassModal from "../../../components/Teacher/Classroom/ClassModal";

import { BiSearch, BiPlus } from "react-icons/bi";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteClassroom } from "../../../api/Admin/classroomApi";
import { getAllClassrooms } from "../../../api/Teacher/ClassroomApi";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";

const Classroom = () => {
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [editClassData, setEditClassData] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [createClassModal, setCreateClassModal] = useState(false);
  const { isBlurred, toggleBlur } = useBlur();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Logic remains identical
  const { data, isPending, isSuccess, isRefetching, refetch } = useQuery({
    queryKey: ["classroom"],
    queryFn: getAllClassrooms,
    staleTime: 1000 * 60 * 5,
  });

  const classroomDellMutate = useMutation({
    mutationFn: async (id) => await deleteClassroom(id),
    onSettled: async () => {
      await refetch();
      setIsClassMenuOpen(false);
      return toast.success("Classroom deleted successfully");
    },
  });

  const toggleClassMenuOpen = (data) => {
    setEditClassData(data);
    setIsClassMenuOpen(!isClassMenuOpen);
  };

  const handleEditClass = () => {
    setEditModal(true);
    setIsClassMenuOpen(false);
  };

  const handleDeleteClass = async () => {
    classroomDellMutate.mutate(editClassData.data.id);
  };

  const onAddClass = () => {
    setCreateClassModal(!createClassModal);
    toggleBlur();
  };

  // Improved Filtering Logic for UI Cleanliness
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!searchText) return data;

    return data.filter((cls) =>
      cls?.name?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

  // Pagination logic
  const totalItems = filteredData?.length || 0;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;

    return filteredData.slice(startIndex, endIndex);
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

  if (isPending && !data) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-[#F9F9F9]">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-[#F9F9F9] font-poppins">
        <div className="flex-1 lg:ml-80 flex flex-col min-w-0">
          <Navbar heading={"Classroom"} />

          <main
            className={`flex-1 px-3 sm:px-4 md:px-10 py-6 transition-all duration-300 ${isBlurred ? "blur-md scale-[0.99]" : ""
              }`}
          >
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 self-start md:self-center">
                Manage Classrooms
              </h2>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                  <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />

                  <input
                    type="text"
                    value={searchText}
                    placeholder="Search classroom..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#6A00FF]/20 focus:border-[#6A00FF] transition-all shadow-sm"
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <button
                  onClick={onAddClass}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#6A00FF] hover:bg-[#5800d4] text-white rounded-2xl transition-colors shadow-lg shadow-[#6A00FF]/20 font-medium whitespace-nowrap"
                >
                  <BiPlus className="text-xl" />
                  Add New
                </button>
              </div>
            </div>

            {/* Data Table Container */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[1000px]">
                  <DataRow
                    isQuiz={true}
                    index={"Sr. No"}
                    classname={"Classroom Name"}
                    classesSchedualled={"Scheduled"}
                    students={"Students"}
                    teachers={"Teachers"}
                    levelName={"Level"}
                    createdBy={"Role"}
                    bgColor={"#FDFDFD"}
                    header={true}
                    threeDots={true}
                  />

                  <div className="max-h-[calc(100vh-380px)] overflow-y-auto custom-scrollbar">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((cls, index) => {
                        const rowIndex =
                          (currentPage - 1) * rowsPerPage + index + 1;

                        return (
                          <div
                            key={cls.id || index}
                            className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-none"
                          >
                            <DataRow
                              data={cls}
                              toggleClassMenu={toggleClassMenuOpen}
                              index={rowIndex}
                              classname={cls.name}
                              classesSchedualled={cls.classes?.length || 0}
                              students={cls.students?.length || 0}
                              teachers={cls.teachers?.length || 0}
                              levelName={cls.levelName || "N/A"}
                              createdBy={
                                cls.creator?.userType ||
                                cls.createdBy?.userType
                              }
                              bgColor={"transparent"}
                              header={false}
                              threeDots={true}
                            />
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <p className="text-lg font-medium">
                          No classrooms found
                        </p>
                        <p className="text-sm">
                          Try adjusting your search or add a new classroom.
                        </p>
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
                      Classrooms
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
          </main>
        </div>
      </div>

      {/* Modals - Logic Intact */}
      <ClassModal
        refetch={refetch}
        open={createClassModal}
        isEditTrue={false}
        setopen={setCreateClassModal}
      />

      {editModal && (
        <ClassModal
          editData={editClassData}
          refetch={refetch}
          isEditTrue={true}
          open={editModal}
          setopen={setEditModal}
        />
      )}

      <ClassMenu
        editClassRoom={handleEditClass}
        deleteClassRoom={handleDeleteClass}
        isopen={isClassMenuOpen}
        setIsOpen={setIsClassMenuOpen}
      />
    </>
  );
};

export default Classroom;
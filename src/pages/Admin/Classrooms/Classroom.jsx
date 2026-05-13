import React, { useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import DataRow from "../../../components/Admin/Classrooms/DataRow";
import ClassMenu from "../../../components/Admin/Classrooms/ClassMenu";
import ClassModal from "../../../components/Admin/Classrooms/ClassModal";
import EditClassModel from "../../../components/Admin/Classrooms/EditClassModel";
import PromoteModal from "../../../components/Admin/Classrooms/PromoteModal";
import { BiSearch } from "react-icons/bi";
import { useBlur } from "../../../context/BlurContext";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteClassroom, getAllClassroom } from "../../../api/Admin/classroomApi";

const Classroom = () => {
  const { isBlurred, toggleBlur } = useBlur();

  const [searchText, setSearchText] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editClassData, setEditClassData] = useState({});
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [createClassModal, setCreateClassModal] = useState(false);
  const [promotePopupMenu, setPromotePopupMenu] = useState(false);
  const [classroomData, setClassroomData] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(2);

  const toggleClassMenuOpen = (data) => {
    setEditClassData(data);
    setClassroomData(data);
    console.log("single data of classroom", data);
    setIsClassMenuOpen(!isClassMenuOpen);
  };

  const handleEditClass = () => {
    // TODO: Pending this function
    setEditModal(true);
  };

  const handleDeleteClass = async () => {
    classroomDellMutate.mutate(editClassData.id);
  };

  const onAddClass = () => {
    setCreateClassModal(!createClassModal);
    toggleBlur();
  };

  const classroomDellMutate = useMutation({
    mutationFn: async (id) => await deleteClassroom(id),
    onSettled: async () => {
      await refetch();
      return toast.success("Classroom deleted successfully");
    },
  });

  const handlePromoteStudents = () => {
    setPromotePopupMenu(!promotePopupMenu);
  };

  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ["classroom"],
    queryFn: getAllClassroom,
  });

  // Filtered data for search + pagination
  const filteredClassrooms = Array.isArray(data)
    ? data.filter((cls) => {
      if (!searchText) return true;

      const searchLower = searchText.toLowerCase();

      return (
        cls?.name?.toLowerCase()?.includes(searchLower) ||
        cls?.createdBy?.userType?.toLowerCase()?.includes(searchLower)
      );
    })
    : [];

  const totalPages = Math.ceil(filteredClassrooms.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;

  const paginatedClassrooms = filteredClassrooms.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return isPending ? (
    <div className="flex flex-1 justify-center items-center min-h-screen">
      <Loader />
    </div>
  ) : (
    <>
      <div className="flex flex-col flex-1 bg-[#F9F9F9] font-poppins w-full">
        <div className="flex flex-1">
          <div className="w-full lg:px-10 px-4 flex-grow lg:ml-80 transition-all duration-300 min-w-0 overflow-x-hidden">
            <div className="min-h-screen pb-6">
              <Navbar heading={"Classroom"} />

              <div className={`${isBlurred ? "blur" : ""}`}>
                {/* Search & Add Classroom Section */}
                <div className="py-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-1">
                    {/* Left Section: Context & Title */}
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                        Classrooms
                      </h2>

                      <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Manage your classrooms efficiently
                      </p>
                    </div>

                    {/* Right Section: Actions */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                      {/* Search Input Group */}
                      <div className="relative group w-full sm:w-80">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <BiSearch className="text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300 size-5" />
                        </div>

                        <input
                          type="text"
                          placeholder="Search classrooms..."
                          value={searchText}
                          onChange={(e) => {
                            setSearchText(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm transition-all duration-300 
                          outline-none focus:bg-white focus:ring-4 focus:ring-purple-100 focus:border-purple-400 
                          placeholder:text-gray-400 text-gray-700 shadow-sm"
                        />
                      </div>

                      {/* Add Classroom Button */}
                      <button
                        onClick={onAddClass}
                        className="relative flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3 
                        bg-gradient-to-r from-[#6A00FF] to-[#8B33FF] 
                        text-white text-sm font-semibold rounded-2xl
                        shadow-[0_10px_20px_-5px_rgba(106,0,255,0.3)]
                        hover:shadow-[0_15px_25px_-5px_rgba(106,0,255,0.4)]
                        hover:-translate-y-0.5 active:translate-y-0
                        transition-all duration-300 group overflow-hidden"
                      >
                        <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:bg-transparent transition-colors"></span>

                        <span className="relative flex items-center gap-2">
                          <span className="text-lg">+</span> Add Classroom
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Table Container */}
                <div className="mt-6 w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto w-full">
                    <div className="min-w-[600px] lg:min-w-full">
                      <DataRow
                        header={true}
                        index={"#"}
                        classname={"Classroom"}
                        classesSchedualled={"Scheduled"}
                        students={"Students"}
                        teachers={"Teachers"}
                        createdBy={"Created By"}
                      />

                      {/* Paginated Classroom Rows */}
                      {paginatedClassrooms.map((cls, index) => (
                        <DataRow
                          data={cls}
                          key={cls.id}
                          header={false}
                          index={startIndex + index + 1}
                          classname={cls.name}
                          students={cls._count?.students || 0}
                          teachers={cls._count?.teachers || 0}
                          createdBy={cls.createdBy?.userType || "N/A"}
                          toggleClassMenu={toggleClassMenuOpen}
                          classesSchedualled={cls?._count?.classes || 0}
                        />
                      ))}

                      {/* Empty State */}
                      {filteredClassrooms.length === 0 && (
                        <div className="text-center py-20 bg-gray-50/50">
                          <p className="text-xl font-semibold text-gray-300 italic">
                            No classrooms found!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attractive Pagination + Selector */}
                {filteredClassrooms.length > 0 && (
                  <div className="mt-4 sm:mt-6 mb-4 flex lg:flex-row items-center justify-between sm:gap-4 gap-2 rounded-[15px] sm:rounded-3xl border border-[#E8E3FF] bg-white/80 backdrop-blur-md px-1 sm:px-6 py-4 shadow-[0_8px_30px_rgba(106,0,255,0.08)]">
                    {/* Rows Selector */}
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
                          <option value={2}>2</option>
                          <option value={4}>4</option>
                          <option value={6}>6</option>
                          <option value={10}>10</option>
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

                    {/* Showing Text */}
                    <div className="hidden sm:flex flex-col items-center text-center">
                      <p className="text-sm font-semibold text-[#0B1053]">
                        Showing{" "}
                        <span className="text-[#6A00FF]">
                          {startIndex + 1}
                        </span>{" "}
                        to{" "}
                        <span className="text-[#6A00FF]">
                          {Math.min(
                            startIndex + rowsPerPage,
                            filteredClassrooms.length
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="text-[#6A00FF]">
                          {filteredClassrooms.length}
                        </span>{" "}
                        classrooms
                      </p>

                      <p className="text-xs text-[#0B1053]/45 mt-0.5">
                        Page {currentPage} of {totalPages}
                      </p>
                    </div>

                    {/* Pagination Buttons */}
                    <div className="flex items-center gap-2 w-full lg:w-auto justify-center lg:justify-end">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        className="group flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 sm:py-2.5 py-1.5 rounded-2xl text-sm font-bold border border-[#DCD4FF] bg-white text-[#0B1053] shadow-[0_3px_12px_rgba(106,0,255,0.08)] hover:bg-[#F6F3FF] hover:text-[#6A00FF] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0B1053] active:scale-95 transition-all duration-200"
                      >
                        <IoChevronBackOutline className="sm:hidden inline" size={18} />
                        <span className="hidden sm:inline">Previous</span>
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }).map(
                          (_, pageIndex) => {
                            const pageNumber = pageIndex + 1;

                            return (
                              <button
                                key={pageNumber}
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 ${currentPage === pageNumber
                                  ? "bg-gradient-to-br from-[#7B1FFF] to-[#5500CC] text-white shadow-[0_5px_16px_rgba(106,0,255,0.35)]"
                                  : "bg-[#F6F3FF] text-[#6A00FF] hover:bg-[#ECE6FF]"
                                  }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className="group flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 sm:py-2.5 py-1.5 rounded-2xl text-sm font-bold border border-[#DCD4FF] bg-white text-[#0B1053] shadow-[0_3px_12px_rgba(106,0,255,0.08)] hover:bg-[#F6F3FF] hover:text-[#6A00FF] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#0B1053] active:scale-95 transition-all duration-200"
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
      </div>

      {/* Create Classroom Modal */}
      {createClassModal && (
        <ClassModal
          refetch={refetch}
          isEditTrue={false}
          open={createClassModal}
          setopen={setCreateClassModal}
        />
      )}

      {/* Edit Classroom Modal */}
      {editModal && (
        <EditClassModel
          open={editModal}
          refetch={refetch}
          isEditTrue={true}
          setopen={setEditModal}
          editData={editClassData}
        />
      )}

      {/* Classroom Menu */}
      <ClassMenu
        isopen={isClassMenuOpen}
        setIsOpen={setIsClassMenuOpen}
        editClassRoom={handleEditClass}
        deleteClassRoom={handleDeleteClass}
        promoteStudentsPopup={handlePromoteStudents}
      />

      {/* Promote Students Modal */}
      {promotePopupMenu && (
        <PromoteModal
          classrooms={data}
          setPromotePopupMenu={handlePromoteStudents}
          classroomStudents={classroomData}
        />
      )}
    </>
  );
};

export default Classroom;
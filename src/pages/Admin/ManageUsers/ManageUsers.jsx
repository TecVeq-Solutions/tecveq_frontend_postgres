import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import DotsMenu from "../../../components/Admin/ManageUsers/DotsMenu";
import DataRows from "../../../components/Admin/ManageUsers/DataRows";
import RequestModal from "../../../components/Admin/ManageUsers/RequestModal";
import AddUserModal from "../../../components/Admin/ManageUsers/AddUserModal";
import EditUserModal from "../../../components/Admin/ManageUsers/EditUserModal";

import { toast } from "react-toastify";
import { IoSearch, IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { useAdmin } from "../../../context/AdminContext";
import { deleteUser, updateUser } from "../../../api/Admin/UsersApi";

const ManageUsers = () => {
  const { isBlurred, toggleBlur } = useBlur();

  const [isMenu, setIsMenu] = useState(false);
  const [editData, setEditData] = useState({});
  const [requestCount, setReqCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [selectText, setSelectText] = useState("student");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [requestsModal, setRequestsModal] = useState(false);
  const [isAddUserModal, setIsAddUserModal] = useState(false);
  const [isEditUserModal, setIsEditUserModal] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(2);

  const {
    adminUsersDataPending,
    adminUsersData,
    adminUsersRefecth,
    allLevels,
  } = useAdmin();

  const toggleRequestModal = () => {
    setRequestsModal(!requestsModal);
  };

  const toggleAddUserModal = () => {
    setIsAddUserModal(!isAddUserModal);
  };

  const toggleEditUserModal = () => {
    setIsEditUserModal(!isEditUserModal);
    toggleBlur();
    setIsMenu(false);
  };

  const accessMutation = useMutation({
    mutationKey: ["access", "fees"],
    mutationFn: async () => {
      let result;

      if (!editData.isBlocked && editData.feesPaid) {
        result = await updateUser(
          { isBlocked: true, feesPaid: false },
          editData.id
        );
      } else {
        result = await updateUser(
          { isBlocked: false, feesPaid: true },
          editData.id
        );
      }

      await adminUsersRefecth();
      return result;
    },
    onSettled: async (data, error) => {
      setIsMenu(false);

      if (error) {
        console.log("error in toggle access : ", error);
        return;
      }

      console.log(" data after toggle access is : ", data);
      return;
    },
  });

  const toggleMenu = (data) => {
    console.log("user data is : ", data);
    setEditData(data);
    setIsMenu(!isMenu);
  };

  const handleFunctionClick = (usr) => { };

  useEffect(() => {
    let count = 0;

    adminUsersData.allUsers.map((item) => {
      if (item.isAccepted == false) {
        count++;
      }
    });

    setReqCount(count);
  }, [adminUsersData.allUsers]);

  const handleDeleteUser = async () => {
    userDellMutation.mutate(editData.id);
  };

  const userDellMutation = useMutation({
    mutationKey: ["deleteuser"],
    mutationFn: async (id) => {
      const result = await deleteUser(id);
      await adminUsersRefecth();
      return result;
    },
    onSettled: async (data) => {
      toast.success("user deleted successfully");
      setIsMenu(false);
      console.log(data);
    },
  });

  return accessMutation.isPending ||
    adminUsersDataPending ||
    userDellMutation.isPending ? (
    <div className="flex flex-1">
      <Loader />
    </div>
  ) : (
    <>
      <div className="w-full bg-[#F9F9F9] font-poppins">
        <div className="flex flex-1">
          <div className={`w-full h-[100vh] lg:px-10 sm:px-6 px-3 flex-grow lg:ml-80`}>
            <div className="min-h-full">
              <Navbar heading={"Manage Users"} />

              <div className={`${isBlurred ? "blur" : ""}`}>
                {/* ─── Toolbar ─── */}
                <div className="flex flex-col sm:flex-row-reverse gap-3 my-4">
                  {/* Right group: search + select + buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-3 w-full sm:w-auto">
                    {/* Search input */}
                    <div
                      className="group flex items-center gap-2 px-4 py-2.5 rounded-2xl w-full sm:w-auto
                      bg-white/70 backdrop-blur-md border border-white/60
                      shadow-[0_2px_12px_rgba(106,0,255,0.08)]
                      hover:shadow-[0_4px_20px_rgba(106,0,255,0.14)]
                      hover:border-[#6A00FF]/30
                      transition-all duration-300 ease-out"
                    >
                      <IoSearch className="shrink-0 text-[#6A00FF] opacity-60 group-hover:opacity-100 transition-opacity duration-200 text-base" />

                      <input
                        type="text"
                        className="bg-transparent outline-none w-full sm:w-44 text-[#0B1053] placeholder:text-[#0B1053]/35 text-sm font-medium"
                        placeholder="Search users..."
                        value={searchText}
                        onChange={(e) => {
                          setSearchText(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>

                    {/* Class dropdown */}
                    <div
                      className="group flex items-center px-4 py-2.5 rounded-2xl w-full sm:w-auto
                      bg-white/70 backdrop-blur-md border border-white/60
                      shadow-[0_2px_12px_rgba(106,0,255,0.08)]
                      hover:shadow-[0_4px_20px_rgba(106,0,255,0.14)]
                      hover:border-[#6A00FF]/30
                      transition-all duration-300 ease-out"
                    >
                      <select
                        className="w-full sm:w-32 bg-transparent outline-none text-sm font-medium text-[#0B1053] cursor-pointer"
                        value={selectedLevel}
                        onChange={(e) => {
                          setSelectedLevel(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Classes</option>

                        {allLevels?.map((level) => (
                          <option key={level.id} value={level.id}>
                            {level.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select dropdown */}
                    <div
                      className="group flex items-center px-4 py-2.5 rounded-2xl w-full sm:w-auto
                      bg-white/70 backdrop-blur-md border border-white/60
                      shadow-[0_2px_12px_rgba(106,0,255,0.08)]
                      hover:shadow-[0_4px_20px_rgba(106,0,255,0.14)]
                      hover:border-[#6A00FF]/30
                      transition-all duration-300 ease-out"
                    >
                      <select
                        className="w-full sm:w-32 bg-transparent outline-none text-sm font-medium text-[#0B1053] cursor-pointer"
                        value={selectText}
                        onChange={(e) => {
                          setSelectText(e.target.value);
                          setCurrentPage(1);
                        }}
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="parent">Parent</option>
                      </select>
                    </div>

                    {/* Requests modal */}
                    <div>
                      {requestsModal && (
                        <RequestModal
                          onclose={() => setRequestsModal(false)}
                          refetch={adminUsersRefecth}
                          data={adminUsersData.allUsers}
                        />
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                      {/* Requests button */}
                      <button
                        onClick={toggleRequestModal}
                        className="group flex-1 sm:flex-none cursor-pointer flex py-2.5 px-5 rounded-2xl
                        bg-gradient-to-br from-[#dde0ff] to-[#c8ccff]
                        text-[#0B1053] text-sm font-semibold items-center justify-center gap-2
                        border border-[#b0b5f5]/60
                        shadow-[0_2px_8px_rgba(106,0,255,0.12)]
                        hover:shadow-[0_6px_20px_rgba(106,0,255,0.22)]
                        hover:from-[#cfd3ff] hover:to-[#b8beff]
                        active:scale-95
                        transition-all duration-200 ease-out"
                      >
                        <span>Requests</span>

                        <span
                          className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5
                          bg-[#6A00FF] text-white text-xs font-bold rounded-full
                          shadow-[0_2px_6px_rgba(106,0,255,0.35)]
                          group-hover:shadow-[0_3px_10px_rgba(106,0,255,0.5)]
                          transition-shadow duration-200"
                        >
                          {requestCount}
                        </span>
                      </button>

                      {/* Add User button */}
                      <button
                        onClick={toggleAddUserModal}
                        className="flex-1 sm:flex-none cursor-pointer flex py-2.5 px-5 rounded-2xl
                        bg-gradient-to-br from-[#7B1FFF] to-[#5500CC]
                        text-white text-sm font-semibold items-center justify-center gap-2
                        shadow-[0_4px_14px_rgba(106,0,255,0.4)]
                        hover:shadow-[0_6px_22px_rgba(106,0,255,0.55)]
                        hover:from-[#8A2FFF] hover:to-[#6600EE]
                        active:scale-95
                        transition-all duration-200 ease-out"
                      >
                        <span className="text-lg leading-none -mt-px">+</span>
                        <span>Add User</span>
                      </button>
                    </div>
                  </div>
                </div>
                {/* ─── End Toolbar ─── */}
                <div className="my-2 min-h-[340px] sm:min-h-[400px]">
                  <div className="overflow-x-auto px-1">
                    <DataRows
                      header={true}
                      role={"Role"}
                      userId={
                        selectText === "teacher" || selectText === "parent"
                          ? "Reference No"
                          : "Roll No"
                      }
                      index={"Sr No"}
                      userName={"Name"}
                      userclass={"Class"}
                      contact={"Contact"}
                    />

                    {(() => {
                      const filteredUsers = adminUsersData?.allUsers?.filter(
                        (usr) => {
                          const searchLower = searchText.toLowerCase();

                          const matchesSearch =
                            !searchText ||
                            usr.name?.toLowerCase().includes(searchLower) ||
                            (usr.rollNo && usr.rollNo.includes(searchText));

                          const matchesUserType =
                            !selectText ||
                            usr.userType === selectText.toLowerCase();

                          let matchesClass = true;

                          if (selectedLevel) {
                            if (usr.userType === "student") {
                              matchesClass =
                                usr.levelID == selectedLevel ||
                                usr.level?.id == selectedLevel;
                            } else if (usr.userType === "teacher") {
                              matchesClass = usr.classroomTeachers?.some(
                                (ct) => ct.classroom?.levelID == selectedLevel
                              );
                            } else if (usr.userType === "parent") {
                              matchesClass = usr.students?.some(
                                (s) =>
                                  s.levelID == selectedLevel ||
                                  s.level?.id == selectedLevel
                              );
                            }
                          }

                          return matchesSearch && matchesUserType && matchesClass;
                        }
                      );

                      if (filteredUsers?.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-100 mt-4">
                            <div className="text-gray-300 mb-2">
                              <svg
                                className="w-12 h-12"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1}
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                              </svg>
                            </div>

                            <p className="text-lg font-medium text-gray-500">
                              No users found matching your criteria
                            </p>
                          </div>
                        );
                      }

                      const totalPages = Math.ceil(
                        filteredUsers.length / rowsPerPage
                      );

                      const startIndex = (currentPage - 1) * rowsPerPage;

                      const paginatedUsers = filteredUsers.slice(
                        startIndex,
                        startIndex + rowsPerPage
                      );

                      return (
                        <>
                          {paginatedUsers.map((usr, index) => (
                            <DataRows
                              data={usr}
                              key={usr.id}
                              header={false}
                              index={startIndex + index + 1}
                              userName={usr.name}
                              role={usr.userType}
                              userclass={
                                usr.userType === "student"
                                  ? usr.level?.name ||
                                  allLevels.find((l) => l.id === usr.levelID)
                                    ?.name ||
                                  "—"
                                  : usr.userType === "teacher"
                                    ? Array.from(
                                      new Set(
                                        usr.classroomTeachers
                                          ?.map((ct) => ct.classroom?.name)
                                          .filter(Boolean)
                                      )
                                    ).join(", ") || "—"
                                    : usr.userType === "parent"
                                      ? Array.from(
                                        new Set(
                                          usr.students
                                            ?.map(
                                              (s) =>
                                                s.level?.name ||
                                                allLevels.find(
                                                  (l) => l.id === s.levelID
                                                )?.name
                                            )
                                            .filter(Boolean)
                                        )
                                      ).join(", ") || "—"
                                      : "—"
                              }
                              contact={usr.phoneNumber}
                              userId={
                                usr?.userType === "teacher"
                                  ? `${usr.referenceNo ||
                                  usr.id.slice(0, 6).toUpperCase()
                                  }`
                                  : usr?.userType === "parent"
                                    ? usr?.id.slice(0, 5).toUpperCase()
                                    : usr?.rollNo || "Not Assigned"
                              }
                              toggleClassMenu={(e) => toggleMenu(e)}
                              onClickFunction={() => handleFunctionClick(usr)}
                            />
                          ))}
                        </>
                      );
                    })()}
                  </div>

                  {(() => {
                    const filteredUsers = adminUsersData?.allUsers?.filter((usr) => {
                      const searchLower = searchText.toLowerCase();
                      const matchesSearch = !searchText || usr.name?.toLowerCase().includes(searchLower) || (usr.rollNo && usr.rollNo.includes(searchText));
                      const matchesUserType = !selectText || usr.userType === selectText.toLowerCase();
                      let matchesClass = true;
                      if (selectedLevel) {
                        if (usr.userType === "student") { matchesClass = usr.levelID == selectedLevel || usr.level?.id == selectedLevel; }
                        else if (usr.userType === "teacher") { matchesClass = usr.classroomTeachers?.some((ct) => ct.classroom?.levelID == selectedLevel); }
                        else if (usr.userType === "parent") { matchesClass = usr.students?.some((s) => s.levelID == selectedLevel || s.level?.id == selectedLevel); }
                      }
                      return matchesSearch && matchesUserType && matchesClass;
                    });
                    
                    if (filteredUsers?.length === 0) return null;

                    const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
                    const startIndex = (currentPage - 1) * rowsPerPage;

                    return (
                      <div className="mt-4 sm:mt-6 mb-4 flex lg:flex-row items-center justify-between sm:gap-4 gap-2 rounded-[15px] sm:rounded-3xl border border-[#E8E3FF] bg-white/80 backdrop-blur-md px-1 sm:px-6 py-4 shadow-[0_8px_30px_rgba(106,0,255,0.08)]">
                        {/* Rows Selector */}
                        <div className="flex flex-row items-center gap-1 sm:gap-3 w-full lg:w-auto justify-center lg:justify-start">
                          <span className="text-sm font-semibold text-[#0B1053]/70">Rows per page</span>
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
                              <svg className="w-4 h-4 text-[#6A00FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                            </div>
                          </div>
                        </div>

                        {/* Showing Text */}
                        <div className="hidden sm:flex flex-col items-center text-center">
                          <p className="text-sm font-semibold text-[#0B1053]">
                            Showing <span className="text-[#6A00FF]">{startIndex + 1}</span> to <span className="text-[#6A00FF]">{Math.min(startIndex + rowsPerPage, filteredUsers.length)}</span> of <span className="text-[#6A00FF]">{filteredUsers.length}</span> users
                          </p>
                          <p className="text-xs text-[#0B1053]/45 mt-0.5">Page {currentPage} of {totalPages}</p>
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
                            {Array.from({ length: totalPages }).map((_, pageIndex) => {
                              const pageNumber = pageIndex + 1;
                              return (
                                <button
                                  key={pageNumber}
                                  onClick={() => setCurrentPage(pageNumber)}
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 ${currentPage === pageNumber ? "bg-gradient-to-br from-[#7B1FFF] to-[#5500CC] text-white shadow-[0_5px_16px_rgba(106,0,255,0.35)]" : "bg-[#F6F3FF] text-[#6A00FF] hover:bg-[#ECE6FF]"}`}
                                >
                                  {pageNumber}
                                </button>
                              );
                            })}
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
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    <DotsMenu
      isopen={isMenu}
      data={editData}
      toggleAccess={accessMutation.mutate}
      setIsOpen={setIsMenu}
      deleteUser={handleDeleteUser}
      editUser={toggleEditUserModal}
    />

    {isAddUserModal && (
      <AddUserModal
        refetch={adminUsersRefecth}
        closeModal={toggleAddUserModal}
      />
    )}

    {isEditUserModal && (
      <EditUserModal
        refetch={adminUsersRefecth}
        closeModal={toggleEditUserModal}
        data={editData}
      />
    )}
  </>
);
};

export default ManageUsers;
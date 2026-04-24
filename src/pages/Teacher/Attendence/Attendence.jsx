import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Teacher/Navbar";
import DataRow from "../../../components/Teacher/Attendence/DataRow";
import ClassMenu from "../../../components/Teacher/Attendence/ClassMenu";
import { BiSearch, BiCalendarCheck, BiFilterAlt } from "react-icons/bi";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getTodayClasses, cancelAttendence } from "../../../api/Teacher/Attendence";
import { getAllClassrooms } from "../../../api/Teacher/ClassroomApi";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import { toast } from "react-toastify";

const Attendence = () => {
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [editClassData, setEditClassData] = useState({});
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const { userData } = useUser();
  const [head, setHead] = useState(false);
  const { isBlurred } = useBlur();

  const { data, isLoading: isLoadingClass, refetch } = useQuery({
    queryKey: ["today-classes"],
    queryFn: getTodayClasses
  });

  const { data: classrooms, isLoading: isLoadingClassroom } = useQuery({
    queryKey: ["classroom"],
    queryFn: getAllClassrooms
  });

  const toggleClassMenuOpen = (data) => {
    setEditClassData(data);
    setIsClassMenuOpen(!isClassMenuOpen);
  };

  const handleEditClass = () => {
    if (editClassData?.allData) {
      navigate("/teacher/attendence/submission", { state: editClassData?.allData });
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
      toast.error(error.response?.data?.message || "Failed to cancel attendance");
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
          (t) => t.type === "head" && (t.teacherID === userId || t.teacher === userId)
        )
      );
      setHead(hasHeadTeacher);
    }
  }, [classrooms, isLoadingClassroom, userData]);

  const filteredData = searchText
    ? data?.filter((cls) =>
      cls.title.toLowerCase().includes(searchText.toLowerCase()) ||
      cls.subject?.name?.toLowerCase().includes(searchText.toLowerCase())
    )
    : data;

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

            <main className={`px-3 sm:px-4 lg:px-10 flex flex-col flex-1 min-h-0 transition-all duration-500 ${isBlurred ? "blur-md scale-[0.99]" : "blur-0"}`}>

              {/* ── Enhanced Header/Toolbar ── */}
              <div className="py-8">
                <div className="flex flex-col md:flex-row gap-5 w-full justify-between items-center bg-white border border-gray-100 p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-sm bg-white/80">

                  <div className="flex flex-col gap-1 w-full md:w-auto">
                    <h2 className="text-xl font-bold text-gray-800 tracking-tight">Today's Schedule</h2>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Manage and track student presence</p>
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
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>

                    {/* Head Teacher Action */}
                    {head && (
                      <button
                        className="group relative w-full sm:w-auto inline-flex items-center justify-center  gap-2 bg-[#6A00FF] hover:bg-[#5a00e0] active:scale-[0.97] text-white text-sm font-bold px-3  sm:px-7 py-3.5 rounded-2xl shadow-lg shadow-purple-200 transition-all duration-300 overflow-hidden"
                        onClick={() => navigate("/teacher/classroom/head-attendence", { state: data })}
                      >
                        <BiCalendarCheck className="text-xl transition-transform group-hover:rotate-12" />
                        <span className="relative z-10">Classroom Attendance</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── Professional Data Table ── */}
              <div className="flex-1 min-h-0 mb-8">
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col h-[65vh] overflow-hidden">
                  <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">
                    <div className="min-w-[800px] md:min-w-full flex flex-col flex-1">
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
                        {filteredData?.length > 0 ? (
                          <div className="divide-y divide-gray-50">
                            {filteredData.map((cls, index) => (
                              <div key={cls.id || index} className="hover:bg-gray-50/80 transition-colors group">
                                <DataRow
                                  data={cls}
                                  allData={cls}
                                  toggleClassMenu={toggleClassMenuOpen}
                                  index={index + 1 < 10 ? `0${index + 1}` : index + 1}
                                  classname={cls.title}
                                  subject={cls?.subject?.name || cls?.subjectID?.name || "Unassigned"}
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
                            ))}
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
                            <h3 className="text-gray-800 font-bold text-lg">No matches found</h3>
                            <p className="text-gray-400 text-sm mt-2 max-w-[280px] text-center leading-relaxed">
                              We couldn't find any classes matching your current search criteria.
                            </p>
                            {searchText && (
                              <button
                                onClick={() => setSearchText("")}
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

                  {/* Footer Stats */}
                  <div className="px-8 py-4 bg-gray-50/30 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Showing {filteredData?.length || 0} Scheduled Sessions
                    </p>
                  </div>
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
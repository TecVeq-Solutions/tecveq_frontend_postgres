import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Teacher/Navbar";
import DataRow from "../../../components/Teacher/Attendence/DataRow";
import ClassMenu from "../../../components/Teacher/Attendence/ClassMenu";
import ClassModal from "../../../components/Teacher/Classroom/ClassModal";

import { BiSearch } from "react-icons/bi";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteClassroom } from "../../../api/Admin/classroomApi";
import { getTodayClasses, cancelAttendence } from "../../../api/Teacher/Attendence";
import { getAllClassrooms } from "../../../api/Teacher/ClassroomApi";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../../context/UserContext";
import { toast } from "react-toastify";

const Attendence = () => {
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [editClassData, setEditClassData] = useState({});
  const navigate = useNavigate();
  const [editModal, setEditModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { userData } = useUser();
  const [head, setHead] = useState(false);

  const { data, isPending, refetch, isLoading: isLoadingClass } = useQuery({ queryKey: ["today-classes"], queryFn: getTodayClasses });
  const { data: classrooms, isLoading: isLoadingClassroom } = useQuery({ queryKey: ["classroom"], queryFn: getAllClassrooms });

  const toggleClassMenuOpen = (data) => {
    setEditClassData(data);
    setIsClassMenuOpen(!isClassMenuOpen);
  };

  const handleEditClass = () => {
    if (editClassData?.allData) {
      navigate("/teacher/attendence/submission", { state: editClassData?.allData });
    }
  };

  const handleDeleteClass = async () => {
    cancelAttendenceMutation.mutate(editClassData?.allData?.id);
  };

  const { isBlurred } = useBlur();

  const cancelAttendenceMutation = useMutation({
    mutationFn: async (id) => await cancelAttendence(id),
    onSuccess: async () => {
      await refetch();
      setIsClassMenuOpen(false);
      return toast.success("Attendance cancelled successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to cancel attendance");
    },
  });

  useEffect(() => {
    if (!isLoadingClassroom && classrooms) {
      const hasHeadTeacher = classrooms.some((classroom) =>
        classroom?.teachers?.some(
          (teacher) =>
            teacher.type === "head" &&
            (teacher.teacherID === (userData?.id || userData?._id) ||
              teacher.teacher === (userData?.id || userData?._id))
        )
      );
      setHead(hasHeadTeacher);
    }
  }, [classrooms, isLoadingClassroom]);

  const filteredData = searchText
    ? data?.filter((cls) =>
        cls.title.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
      )
    : data;

  if (isLoadingClass || isLoadingClassroom)
    return (
      <div className="flex justify-center items-center flex-1 mt-20">
        <Loader />
      </div>
    );

  return (
    <>
      <div className="flex flex-1 bg-[#F9F9F9] font-poppins min-w-0">
        <div className="flex flex-1 min-w-0">
          <div className="w-full h-screen flex-grow lg:ml-72 min-w-0">
            <div className="h-screen flex flex-col">
              <Navbar heading={"Attendance"} />

              <div className={`px-3 lg:px-10 sm:px-10 flex flex-col flex-1 min-h-0 ${isBlurred ? "blur" : ""}`}>

                {/* ── Toolbar ── */}
                <div className="py-5">
                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-between items-start sm:items-center">

                    {/* Search */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:border-indigo-200 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all duration-150 min-w-[220px]">
                      <BiSearch className="text-gray-400 flex-shrink-0" />
                      <input
                        type="text"
                        value={searchText}
                        placeholder="Search classes…"
                        className="outline-none bg-transparent text-sm text-gray-700 placeholder-gray-400 w-full"
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>

                    {/* Head Teacher Button */}
                    {head && (
                      <button
                        className="inline-flex items-center gap-2 bg-[#6A00FF] hover:bg-[#5a00e0] active:bg-[#4a00c0] text-white text-sm font-medium px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
                        onClick={() => navigate("/teacher/classroom/head-attendence", { state: data })}
                      >
                        Classroom Attendance
                        <span className="text-base leading-none">+</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Table ── */}
                <div className="flex-1 min-h-0 overflow-auto pb-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Header row */}
                    <DataRow
                      isQuiz={true}
                      index={"Sr. No"}
                      classname={"Class Name"}
                      subject={"Subject"}
                      students={"Students"}
                      teachers={"Classroom"}
                      startDate={null}
                      bgColor={"#F9F9F9"}
                      header={true}
                      threeDots={true}
                    />

                    {/* Data rows */}
                    {filteredData?.map((cls, index) => (
                      <DataRow
                        key={cls.id || index}
                        data={cls}
                        allData={cls}
                        toggleClassMenu={toggleClassMenuOpen}
                        index={index + 1}
                        classname={cls.title}
                        subject={cls?.subject?.name || cls?.subjectID?.name || "N/A"}
                        students={
                          cls?.classroom?.students?.length ||
                          cls?.classroom?.studentDetails?.length ||
                          cls?.classroom?.studentdetails?.length ||
                          0
                        }
                        teachers={cls?.classroom?.name}
                        startDate={cls.startTime}
                        bgColor={"#FFFFFF"}
                        header={false}
                        threeDots={true}
                      />
                    ))}

                    {/* Empty state */}
                    {filteredData?.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 px-6">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                          <BiSearch className="text-gray-300 text-xl" />
                        </div>
                        <p className="text-gray-400 text-sm font-medium">
                          {searchText ? "No classes match your search." : "No attendance to display today."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
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
    </>
  );
};

export default Attendence;
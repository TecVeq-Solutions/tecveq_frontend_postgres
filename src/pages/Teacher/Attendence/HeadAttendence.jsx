import React, { useEffect, useState } from "react";
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
import { useUser } from "../../../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const HeadAttendence = () => {
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [editClassData, setEditClassData] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [classOfHeadTeacher, setClassOfHeadTeacher] = useState([]);

  const { isBlurred, toggleBlur } = useBlur();
  const { userData } = useUser();
  const navigate = useNavigate();
  const [createClassModal, setCreateClassModal] = useState(false);

  const { data, isPending, refetch, isRefetching } = useQuery({
    queryKey: ["classroom"],
    queryFn: getAllClassrooms
  });

  const toggleClassMenuOpen = (data) => {
    setEditClassData(data);
    setIsClassMenuOpen(!isClassMenuOpen);
  };

  const handleEditClass = () => {
    console.log("Edit logic here", editClassData);
  };

  const classroomDellMutate = useMutation({
    mutationFn: async (id) => await deleteClassroom(id),
    onSettled: async () => {
      await refetch();
      toast.success("Classroom deleted successfully");
    }
  });

  const handleDeleteClass = async () => {
    classroomDellMutate.mutate(editClassData.data.id);
  };

  useEffect(() => {
    if (data) {
      const HeadTeacherClass = data.filter((item) =>
        item.teachers.some(
          (teach) => teach.type === "head" && (teach?.teacherID === (userData?.id || userData?._id) || teach?.teacher === (userData?.id || userData?._id))
        )
      );
      setClassOfHeadTeacher(HeadTeacherClass);
    }
  }, [data, userData]);

  const filteredClasses = classOfHeadTeacher?.filter(cls =>
    cls?.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (isPending || isRefetching) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-[#F9F9F9]">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 bg-[#FDFDFD] font-poppins min-h-screen">
        <div className="flex flex-1 min-w-0">
          <div className="w-full flex-grow lg:ml-80 min-w-0">
            <div className="h-screen flex flex-col">
              <Navbar heading={"Head Teacher Dashboard"} />

              <div className={`px-4 lg:px-10 flex flex-col flex-1 transition-all duration-300 ${isBlurred ? "blur-md scale-[0.99]" : ""}`}>

                {/* --- Search Toolbar --- */}
                <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-gray-800">Assigned Classrooms</h2>
                    <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Manage classroom attendance and reports</p>
                  </div>

                  <div className="group flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:ring-4 focus-within:ring-purple-50 focus-within:border-indigo-400 transition-all duration-200 w-full sm:w-72">
                    <BiSearch className="text-gray-400 text-lg group-focus-within:text-indigo-500" />
                    <input
                      type="text"
                      value={searchText}
                      placeholder="Find a classroom..."
                      className="outline-none bg-transparent text-sm w-full font-medium text-gray-700"
                      onChange={(e) => setSearchText(e.target.value)}
                    />
                  </div>
                </div>

                {/* --- Table Container --- */}
                <div className="flex-1 min-h-0 bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col mb-6">
                  <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">
                    <div className="min-w-[800px] md:min-w-full flex flex-col flex-1">
                      {/* Header */}
                      <div className="bg-gray-50/50 border-b border-gray-100">
                        <DataRow
                          isQuiz={true}
                          index={"#"}
                          classname={"Classroom Name"}
                          classesSchedualled={"Schedules"}
                          students={"Total Students"}
                          teachers={"Staff"}
                          createdBy={"Creator"}
                          status={"Status"}
                          bgColor={"transparent"}
                          header={true}
                        />
                      </div>

                      {/* Body */}
                      <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {filteredClasses.length > 0 ? (
                          filteredClasses.map((cls, index) => (
                            <div
                              key={cls.id || index}
                              className="hover:bg-indigo-50/30 transition-colors cursor-pointer group"
                              onClick={() => navigate("/teacher/classroom/attendence/submission", { state: cls })}
                            >
                              <DataRow
                                data={cls}
                                toggleClassMenu={toggleClassMenuOpen}
                                index={index + 1 < 10 ? `0${index + 1}` : index + 1}
                                classname={cls.name}
                                classesSchedualled={cls.classes.length}
                                students={cls.students.length}
                                teachers={cls.teachers.length}
                                levelName={cls.level?.name || "N/A"}
                                createdBy={cls.createdBy?.name || "System"}
                                bgColor={"transparent"}
                                header={false}
                                threeDots={searchText ? false : true}
                              />
                            </div>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                              <BiSearch className="text-gray-300 text-2xl" />
                            </div>
                            <p className="text-gray-500 font-semibold text-lg">No classrooms found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your search or check your assignments.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Stats */}
                  <div className="px-8 py-3 bg-gray-50/30 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Total Assigned: {classOfHeadTeacher?.length || 0}
                    </p>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modals & Menus --- */}
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

export default HeadAttendence;
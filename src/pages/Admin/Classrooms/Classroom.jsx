import React, { useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import DataRow from "../../../components/Admin/Classrooms/DataRow";
import ClassMenu from "../../../components/Admin/Classrooms/ClassMenu";
import ClassModal from "../../../components/Admin/Classrooms/ClassModal";
import EditClassModel from "../../../components/Admin/Classrooms/EditClassModel"
import PromoteModal from "../../../components/Admin/Classrooms/PromoteModal"
import { BiSearch } from "react-icons/bi";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteClassroom, getAllClassroom } from "../../../api/Admin/classroomApi";

const Classroom = () => {

  const { isBlurred, toggleBlur } = useBlur();
  const [searchText, setSearchText] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editClassData, setEditClassData] = useState({});
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [createClassModal, setCreateClassModal] = useState(false);
  const [promotePopupMenu, setPromotePopupMenu] = useState(false)
  const [classroomData, setClassroomData] = useState({})

  const toggleClassMenuOpen = (data) => {
    setEditClassData(data);
    setClassroomData(data)
    console.log("single data of classroom", data);
    setIsClassMenuOpen(!isClassMenuOpen);
  };



  const handleEditClass = () => {
    // TODO: Pending this function
    setEditModal(true)
  }

  const handleDeleteClass = async () => {
    classroomDellMutate.mutate(editClassData.id);
  }


  const onAddClass = () => {
    setCreateClassModal(!createClassModal);
    toggleBlur();
  }

  const classroomDellMutate = useMutation({
    mutationFn: async (id) => await deleteClassroom(id),
    onSettled: async () => {
      await refetch();
      return toast.success("Classroom deleted successfully");
    }
  });

  const handlePromoteStudents = () => {
    setPromotePopupMenu(!promotePopupMenu)
  }

  const { data, isPending, refetch, isRefetching } = useQuery({ queryKey: ["classroom"], queryFn: getAllClassroom });

  return (
    isPending || isRefetching ? (
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
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Classrooms</h2>
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
                            onChange={(e) => setSearchText(e.target.value)}
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
                  <div className="mt-4 w-full bg-white rounded-xl shadow-sm border border-black/10 overflow-hidden">
                    <div className="overflow-x-auto w-full">
                      <div className="min-w-[550px] lg:min-w-full">
                        <DataRow
                          header={true}
                          isQuiz={true}
                          index={"Sr. No"}
                          bgColor={"#F9F9F9"}
                          students={"Students"}
                          teachers={"Teachers"}
                          createdBy={"Created By"}
                          classname={"Classroom"}
                          classesSchedualled={"Classes Scheduled"}
                        />

                        {searchText === "" &&
                          data.map((cls, index) => (
                            <DataRow
                              data={cls}
                              key={cls.id}
                              header={false}
                              index={index + 1}
                              bgColor={"#FFFFFF"}
                              classname={cls.name}
                              students={cls.students.length}
                              teachers={cls.teachers.length}
                              createdBy={cls.createdBy.userType}
                              toggleClassMenu={toggleClassMenuOpen}
                              classesSchedualled={cls?.classes?.length}
                            />
                          ))}

                        {searchText &&
                          data.map((cls, index) => {
                            if (
                              cls.name.toLowerCase().includes(searchText.toLowerCase()) ||
                              cls.createdBy.userType.toLowerCase().includes(searchText.toLowerCase())
                            ) {
                              return (
                                <DataRow
                                  data={cls}
                                  key={cls.id}
                                  header={false}
                                  index={index + 1}
                                  bgColor={"#FFFFFF"}
                                  classname={cls.name}
                                  students={cls.students.length}
                                  teachers={cls.teachers.length}
                                  createdBy={cls.createdBy.userType}
                                  toggleClassMenu={toggleClassMenuOpen}
                                  classesSchedualled={cls.classes.length}
                                />
                              );
                            }
                          })}

                        {data.length === 0 && (
                          <div className="text-center py-8 text-xl font-medium text-gray-400">
                            No classrooms to display!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
    )
  );
};

export default Classroom;




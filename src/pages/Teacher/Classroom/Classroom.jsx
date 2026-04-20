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

const Classroom = () => {
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [editClassData, setEditClassData] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [createClassModal, setCreateClassModal] = useState(false);
  const { isBlurred, toggleBlur } = useBlur();

  // Logic remains identical
  const { data, isPending, refetch, isRefetching } = useQuery({ 
    queryKey: ["classroom"], 
    queryFn: getAllClassrooms 
  });

  const classroomDellMutate = useMutation({
    mutationFn: async (id) => await deleteClassroom(id),
    onSettled: async () => {
      await refetch();
      setIsClassMenuOpen(false);
      return toast.success("Classroom deleted successfully");
    }
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

  if (isPending || isRefetching) {
    return <div className="flex justify-center items-center h-screen w-full bg-[#F9F9F9]"> <Loader /> </div>;
  }

  return (
    <>
      <div className="flex min-h-screen bg-[#F9F9F9] font-poppins">
        <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
          <Navbar heading={"Classroom"} />

          <main className={`flex-1 px-4 md:px-10 py-6 transition-all duration-300 ${isBlurred ? "blur-md scale-[0.99]" : ""}`}>
            
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
                    onChange={(e) => setSearchText(e.target.value)}
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
                <div className="min-w-[1000px]"> {/* Ensures no squishing on mobile within scroll */}
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
                  
                  <div className="max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
                    {filteredData.length > 0 ? (
                      filteredData.map((cls, index) => (
                        <div key={cls.id || index} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-none">
                          <DataRow
                            data={cls}
                            toggleClassMenu={toggleClassMenuOpen}
                            index={index + 1}
                            classname={cls.name}
                            classesSchedualled={cls.classes?.length || 0}
                            students={cls.students?.length || 0}
                            teachers={cls.teachers?.length || 0}
                            levelName={cls.levelName || "N/A"}
                            createdBy={cls.creator?.userType || cls.createdBy?.userType}
                            bgColor={"transparent"}
                            header={false}
                            threeDots={true}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <p className="text-lg font-medium">No classrooms found</p>
                        <p className="text-sm">Try adjusting your search or add a new classroom.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
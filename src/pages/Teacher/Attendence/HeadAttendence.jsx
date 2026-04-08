import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Teacher/Navbar";
import DataRow from "../../../components/Teacher/Classroom/DataRow";
import ClassMenu from "../../../components/Teacher/Classroom/ClassMenu";
import ClassModal from "../../../components/Teacher/Classroom/ClassModal";

import { BiSearch } from "react-icons/bi";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteClassroom } from "../../../api/Admin/classroomApi";
import { getAllClassrooms } from "../../../api/Teacher/ClassroomApi";
import { useUser } from "../../../context/UserContext";
import { useNavigate } from "react-router-dom";

const HeadAttendence = () => {
  const [isClassMenuOpen, setIsClassMenuOpen] = useState(false);
  const [editClassData, setEditClassData] = useState({});
  const [editModal, setEditModal] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [classOfHeadTeacher, setClassOfHeadTeacher] = useState()

  const toggleClassMenuOpen = (data) => {
    console.log("data is in menu ", data)
    setEditClassData(data);
    setIsClassMenuOpen(!isClassMenuOpen);
  };

  const handleEditClass = () => {
    // TODO: Pending this function
    console.log("data on edit clas is : ", editClassData);
  }

  const handleDeleteClass = async () => {
    classroomDellMutate.mutate(editClassData.data.id);
  }


  const { isBlurred, toggleBlur } = useBlur();
  const { userData } = useUser();
  const navigate = useNavigate();
  console.log(userData, "Its Me User")
  const [createClassModal, setCreateClassModal] = useState(false);

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


  const { data, isPending, refetch, isRefetching } = useQuery({ queryKey: ["classroom"], queryFn: getAllClassrooms });


  console.log(data, "dats stored in")
  useEffect(() => {
    if (data) {
      const HeadTeacherClass = data.filter((item) =>
        item.teachers.some(
          (teach) => teach.type === "head" && (teach?.teacherID === (userData?.id || userData?._id) || teach?.teacher === (userData?.id || userData?._id))
        )
      );
      setClassOfHeadTeacher(HeadTeacherClass)

      console.log(HeadTeacherClass, "Classroom Of All Head");

    }
  }, [data, userData]);


  console.log(classOfHeadTeacher, "class of head teacher");




  return (
    isPending || isRefetching ? <div className="flex justify-start flex-1"> <Loader /> </div> :
      <>
        <div className="flex flex-1 bg-[#F9F9F9] font-poppins min-w-0">
          <div className="flex flex-1 min-w-0">
            <div
              className={`w-full h-screen  flex-grow lg:ml-72 min-w-0`}
            >
              <div className="h-screen pt-1">
                <Navbar heading={"Classroom"} />
                <div className={`px-3 lg:px-20 sm:px-10 ${isBlurred ? "blur" : ""}`}>
                  <div className="py-4">
                    <div className="flex items-center justify-end">


                      <div className="flex flex-col w-full md:flex-row md:w-auto  gap-2">

                        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-3xl">
                          <BiSearch />
                          <input
                            type="text"
                            value={searchText}
                            placeholder="Search"
                            className="outline-none "
                            onChange={(e) => setSearchText(e.target.value)}
                          />
                        </div>



                      </div>
                    </div>
                  </div>
                  <div className="mt-8 h-[80%] overflow-auto  hellow">
                    <DataRow
                      isQuiz={true}
                      index={"Sr. No"}
                      classname={"Classroom Name"}
                      classesSchedualled={"Classes Scheduled"}
                      students={"Students"}
                      teachers={"Teachers"}
                      createdBy={"Created By"}
                      status={"Status"}
                      bgColor={"#F9F9F9"}
                      header={true}
                    />
                    {

                      searchText == "" && classOfHeadTeacher?.map((cls, index) => (
                        <div className="cursor-pointer" onClick={() => navigate("/teacher/classroom/attendence/submission", { state: cls })}>
                          <DataRow
                            data={cls}
                            toggleClassMenu={toggleClassMenuOpen}
                            index={index + 1}
                            classname={cls.name}
                            classesSchedualled={cls.classes.length}
                            students={cls.students.length}
                            teachers={cls.teachers.length}
                            levelName={cls.level?.name || "N/A"}
                            createdBy={cls.createdBy?.name || cls.creator?.name || cls.createdBy?.userType || "N/A"}
                            bgColor={"#FFFFFF"}
                            header={false}
                          />
                        </div>

                      )

                      )
                    }
                    {searchText && classOfHeadTeacher && classOfHeadTeacher?.map((cls, index) => {
                      if (cls?.name?.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())) {
                        return <div className="cursor-pointer" onClick={() => navigate("/teacher/classroom/attendence/submission")}>
                          <DataRow
                            data={cls}
                            toggleClassMenu={toggleClassMenuOpen}
                            index={index + 1}
                            classname={cls.name}
                            classesSchedualled={cls.classes.length}
                            students={cls.students.length}
                            teachers={cls.teachers.length}
                            levelName={cls.level?.name || "N/A"}
                            createdBy={cls.createdBy?.name || cls.creator?.name || cls.createdBy?.userType || "N/A"}
                            bgColor={"#FFFFFF"}
                            header={false}
                            threeDots={false}

                          />
                        </div>

                      }
                    })}

                    {data?.length == 0 && (
                      <div className="text-center py-4 text-3xl font-medium">
                        No classrooms to display!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div >
        <ClassModal
          refetch={refetch}
          open={createClassModal}
          isEditTrue={false}
          setopen={setCreateClassModal}
        />

        {
          editModal &&
          <ClassModal
            editData={editClassData}
            refetch={refetch}
            isEditTrue={true}
            open={editModal}
            setopen={setEditModal}
          />
        }

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

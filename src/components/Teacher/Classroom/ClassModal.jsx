import React, { useState, useRef, useEffect } from 'react';

import Loader from '../../../utils/Loader';
import IMAGES from "../../../assets/images";

import { IoIosArrowDown } from "react-icons/io";
import { useMutation } from '@tanstack/react-query';
import { useUser } from '../../../context/UserContext';
import { useBlur } from "../../../context/BlurContext";
import { useTeacher } from '../../../context/TeacherContext';
import { createClassroom } from '../../../api/Admin/classroomApi';
import { CusotmInputField } from '../../../commonComponents/CusotmInputField';
import CustomSelectableField from "../../../commonComponents/CustomSelectableField"
import MultiSelectField from '../../../commonComponents/MultiSelectField';
import useClickOutside from '../../../hooks/useClickOutlise';
import { toast } from 'react-toastify';


const ClassModal = ({ open, setopen, isEditTrue, refetch }) => {

  const ref = useRef(null);
  const { toggleBlur } = useBlur()


  useClickOutside(ref, () => {
    if (open) {
      setopen(false);
      toggleBlur();
    }

  });
  const [classObj, setClassObj] = useState({
    title: "",
  })
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [newSelectedStudents, setNewSelectedStudents] = useState([]);
  const [allowedEdit, setAllowedEdit] = useState(false);

  const { userData } = useUser();

  const { allSubjects, teacherData, allLevels } = useTeacher();

  const handleMultiSelectStudentsChange = (options) => {
    console.log('Selected options:', options);
  };


  useEffect(() => {

    if (selectedStudents.length > 0) {
      setNewSelectedStudents(selectedStudents);
    }

  }, [selectedStudents])


  const handleCreateClass = async () => {

    if (selectedLevel && newSelectedStudents.length > 0) {
      let students = newSelectedStudents.map((item) => item.id);
      let data = {
        name: classObj.title,
        students,
        teachers: [userData.id],
        subject: JSON.parse(selectedSubject).id,
      }

      createClassroomMutation.mutate(data);

    } else {
      alert("fill all fields first");
    }
  }

  const createClassroomMutation = useMutation({
    mutationKey: ["teacherCreateClassroom"], mutationFn: async (data) => {
      const result = await createClassroom(data);
      console.log("result of classroom creation is : ", result);
      return result;
    }, onSettled: async () => {
      await refetch();
      toggleBlur();
      setopen(false);
    },
    onSuccess: () => {
      toast.success('Classroom created successfully!');
    },
  })


  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none hidden"}`}>
      <div
        ref={ref}
        className="bg-white p-3 md:p-8 w-[95%] md:w-[600px] lg:w-[800px] px-4 md:px-10 border border-black/20 shadow-2xl text-black rounded-2xl flex max-h-[90vh] overflow-hidden"
      >
        <div className="flex flex-1 gap-2">
          <div className="flex flex-col w-full gap-4 max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
            <div className="flex items-center justify-between">
              <div className="flex justify-center flex-1 w-[fit] gap-2 items-center">
                <p className="text-2xl font-semibold cursor-text">
                  Create Classroom
                </p>
              </div>
              <div className="flex items-center gap-2 cursor-pointer">
                <img
                  src={IMAGES.CloseIcon}
                  className="w-[15px] h-[15px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBlur();
                    setopen(false);
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex flex-col flex-1 gap-1">
                <p className="text-xs font-semibold text-grey_700">Classroom name</p>
                <CusotmInputField
                  type={"text"}
                  icon={"mail"}
                  name={"title"}
                  title={"Select Class"}
                  selectable={false}
                  status={allowedEdit}
                  value={classObj.title}
                  valuesObj={classObj}
                  setValue={setClassObj}

                />
              </div>
            </div>
            {/* <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1 gap-1">
              <p className="text-xs font-semibold text-grey_700">Level name</p>
              <Selectable
                allLevels={allLevels}
                selectedLevel={selectedLevel}
                setSelectedLevel={setSelectedLevel}
              />
            </div>
          </div> */}
            <div className="flex flex-col">
              <div className="flex flex-col flex-1 gap-1">
                <p className="text-xs font-semibold text-grey_700">
                  Select Subjects
                </p>
                <CustomSelectableField
                  options={allSubjects}
                  selectedOption={selectedSubject}
                  setSelectedOption={setSelectedSubject}
                />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex flex-col flex-1 gap-1">
                {/* <p className="text-xs font-semibold text-grey_700">
                Select Students
              </p> */}
                <MultiSelectField
                  placeholder="Select Students"
                  onSelect={setSelectedStudents}
                  options={teacherData.allStudents}
                  onChange={handleMultiSelectStudentsChange}
                />
              </div>
              <div className="flex justify-end py-1 text-xs text-[#0B1053]">
                <p>Students Selected: {newSelectedStudents.length}</p>
              </div>
            </div>
            {createClassroomMutation.isPending && <div className='' > <Loader /> </div>}
            {!createClassroomMutation.isPending &&
              <div className="flex items-center gap-3">
                <div
                  onClick={() => {
                    handleCreateClass();
                  }}
                  className="flex items-center justify-center w-full py-2 text-center rounded-md cursor-pointer bg-[#6A00FF]"
                >
                  <p className="text-sm text-white">Create</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassModal;

import React, { useState, useRef, useEffect } from 'react';

import Loader from '../../../utils/Loader';
import IMAGES from "../../../assets/images";

import { IoIosArrowDown } from "react-icons/io";
import { useMutation } from '@tanstack/react-query';
import { useUser } from '../../../context/UserContext';
import { useBlur } from "../../../context/BlurContext";
import { useTeacher } from '../../../context/TeacherContext';
import { createClassroom } from '../../../api/Admin/classroomApi';



const MultiSelect = ({ options, placeholder, onChange, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const ref = useRef();

  const handleOptionClick = (option) => {
    setSelectedOptions((prevSelected) => {
      if (prevSelected.includes(option)) {
        return prevSelected.filter((item) => item !== option);
      } else {
        return [...prevSelected, option];
      }
    });
  };

  const handleClickOutside = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsOpen(false);
      onSelect(selectedOptions);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    onChange(selectedOptions);
  }, [selectedOptions]);

  return (
    <div className="relative inline-block w-full" ref={ref}>
      <div
        className="bg-white border border-[#00000040] rounded-md cursor-pointer"
        onClick={() => {
          if (isOpen) {
            onSelect(selectedOptions)
          };
          setIsOpen(!isOpen)
        }}
      >
        <div className="p-1 py-2 text-sm flex justify-between items-center px-4">
          <p>

            {selectedOptions.length > 0
              ? selectedOptions.map((option) => option.name).join(', ')
              : placeholder}
          </p>
          <p>
            <IoIosArrowDown />
          </p>
        </div>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full h-60 overflow-y-auto register-scrollbar bg-white border border-[#00000020] rounded shadow-md">
          {options.map((option) => (
            <div
              key={option.id}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedOptions.includes(option) ? 'bg-gray-500' : ''
                }`}
              onClick={() => handleOptionClick(option)}
            >
              <p className='bg-[#00000005] px-2 py-1 rounded-sm font-medium'>
                p
                {option.name}
                <span className='font-normal text-[#00000040]'>{option?.qualification}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomSelectable = ({ label, options, setSelectedOption, selectedOption }) => {
  return (
    <div className='flex flex-col text-start py-1'>
      <div className='flex flex-col gap-1'>
        <div className='font-medium'>
          {label}
        </div>
        <div>
          <select value={selectedOption} onChange={(e) => { setSelectedOption(e.target.value) }}
            className='border outline-none rounded-md border-black/20 px-4 w-full py-2'>
            <option value={""}>Select</option>
            {options.map((item) => {
              return <option key={item.id} value={JSON.stringify(item)}>{item.name}</option>
            })}
          </select>
        </div>
      </div>
    </div>
  )
}

const CusotmInput = ({ label, value, setvalue, type, status, icon, name }) => {
  return (
    <div className="my-1 text-sm flex-1 w-full">
      <div className="flex items-center gap-4 ">
        <div
          className={`flex px-2 py-1 w-full border justify-between rounded-md items-center border-grey/70 ${status ? "text-black" : "text-grey"
            }`}
        >
          <input
            value={value}
            placeholder={name}
            type={type || "text"}
            className="flex flex-1 w-full py-1 outline-none"
            onChange={(e) => { setvalue(e.target.value) }}
          />
        </div>
      </div>
    </div>
  );
};

const ClassModal = ({ open, setopen, isEditTrue, refetch }) => {

  const ref = useRef(null);
  const [className, setClassName] = useState("");
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [newSelectedStudents, setNewSelectedStudents] = useState([]);

  const { userData } = useUser();
  const { toggleBlur } = useBlur();
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
        students,
        name: className,
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
    }
  })


  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none hidden"}`}>
      <div
        ref={ref}
        className="bg-white p-8 w-[90%] md:w-[500px] px-4 md:px-20 border border-black/20 shadow-2xl text-black rounded-2xl flex flex-col max-h-[90vh]"
      >
      <div className="flex flex-1 gap-2">
        <div className="flex flex-col w-full gap-4">
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
              <p className="text-xs font-semibold text-grey_700">Class name</p>
              <CusotmInput label={"ClassName"}
                type={"text"}
                value={className}
                name={"Select Class"}
                setvalue={setClassName}
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
              <CustomSelectable
                options={allSubjects}
                selectedOption={selectedSubject}
                setSelectedOption={setSelectedSubject}
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col flex-1 gap-1">
              <p className="text-xs font-semibold text-grey_700">
                Select Students
              </p>
              <MultiSelect
                placeholder="Select Students"
                onSelect={setSelectedStudents}
                options={teacherData.allStudents}
                onChange={handleMultiSelectStudentsChange}
              />
            </div>
            <div className="flex justify-end py-1 text-xs text-maroon">
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
                className="flex items-center justify-center w-full py-2 text-center rounded-md cursor-pointer bg-maroon"
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

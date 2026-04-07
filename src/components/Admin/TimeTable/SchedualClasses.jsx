import React, { useRef, useState } from "react";
import FilterButton from "./FilterButton";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";
import FilterClassesModal from "./FilterClassesModal";

import { useEffect } from "react";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { useUser } from "../../../context/UserContext";
import { getAllClasses } from "../../../api/ForAllAPIs";
import { useAdmin } from "../../../context/AdminContext";
import { createClasses } from "../../../api/Teacher/Class";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllClassroom } from "../../../api/Admin/classroomApi";
import { convertToISOWithTimezoneOffset } from "../../../utils/ConvertTimeZone";
import CustomSelectableField from "../../../commonComponents/CustomSelectableField";
import { CusotmInputField } from "../../../commonComponents/CusotmInputField";
import { useGetTeacherSubject } from "../../../api/Admin/SubjectsApi";
import useClickOutside from "../../../hooks/useClickOutlise";
import CustomMultiSelectableField from "../../../commonComponents/MultiSelectableField";

const SchedualClasses = ({ refetch, addScheduleModalOpen, setAddScheduleModalOpen }) => {

  const SchedualClassesComponent = ({ onclose, isOpen, setIsOpen }) => {
    const [allowedEdit, setAllowedEdit] = useState(false);

    const handleEditClick = () => {
      setAllowedEdit(true);
    };

    const { userData } = useUser();
    const { allSubjects, adminUsersData } = useAdmin();
    const [selectedSubject, setSelctedSubject] = useState();
    const [selectedTeacher, setSelectedTeacher] = useState();
    const [selectedClassrooms, setSelectedClassrooms] = useState([]);
    const [selectedDays, setSelectedDays] = useState(["Monday"]);




    const { data: classroomsData, isPending: classroomsPending } = useQuery({ queryKey: ["classroom"], queryFn: getAllClassroom });

    const filteredClassrooms = React.useMemo(() => {
      if (!classroomsData) return [];
      if (!selectedSubject) return classroomsData;

      try {
        const subject = JSON.parse(selectedSubject);
        // If the subject has a specific classroomId (from teacherSubject hook)
        if (subject.classroomId) {
          return classroomsData.filter(c => c.id === subject.classroomId);
        }
        // If the subject has a levelID (from allSubjects)
        if (subject.levelID) {
          return classroomsData.filter(c => c.levelID === subject.levelID);
        }
      } catch (e) {
        console.error("Error parsing subject", e);
      }
      return classroomsData;
    }, [classroomsData, selectedSubject]);

    console.log(userData, "user data is ");


    // "{\n  \"title\": \"this is topic\",\n
    // \"startTime\": \"2024-02-18T09:00:13.386+00:00\",\n
    // \"endTime\": \"2024-02-18T10:29:13.386+00:00\",\n
    // \"oneTime\": true,\n  
    // \"classroomID\": \"65cd344d324a603b2040a6bc\",\n
    // \"subjectID\": \"65ccaae6fc6ffe2ac4fe3f88\",\n
    // \"teacher\": {\n
    // \"teacherID\": \"65cca68c9747c80928061e71\",\n
    // \"status\": \"present\"\n
    // }\n}",

    const handleDayCheckboxChange = (day) => {
      setSelectedDays((prev) =>
        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
      );
    };


    const parsedTeacher = selectedTeacher ? JSON.parse(selectedTeacher) : null;

    const [classObj, setClassObj] = useState({
      title: "",
      startTime: "",
      endTime: "",
      oneTime: true,
      startEventDate: "",
      endEventDate: "",
      classroomID: "",
      subjectID: "",
      meetingUrl: "",
    })

    const handleSaveDetails = () => { };

    const handleSchedualClass = () => {
      const isoFormattedStringEndTime = new Date(convertToISOWithTimezoneOffset(classObj.startEventDate, classObj.endTime));
      const isoFormattedStringStartTime = new Date(convertToISOWithTimezoneOffset(classObj.startEventDate, classObj.startTime));





      selectedClassrooms.forEach((classroomID) => {
        const myobj = {
          ...classObj,
          teacher: { teacherID: parsedTeacher.id, status: "absent" },
          subjectID: JSON.parse(selectedSubject).id,
          classroomID, // Send one by one
          startTime: isoFormattedStringStartTime,
          endTime: isoFormattedStringEndTime,
          selectedDays,
          meetingUrl: classObj.meetingUrl || "",
        };

        console.log("Sending to backend:", myobj);
        classCreateMutate.mutate(myobj);
      });


    }
    const classCreateMutate = useMutation({
      mutationFn: async (data) => await createClasses(data),
      onSuccess: async (data) => {
        toast.success("Class created successfully");
        await refetch();
        setAddScheduleModalOpen(false);
        setaddEventModalOpen(false);
      },
      onError: (error) => {
        const message = error?.response?.data?.error || "An unexpected error occurred";
        toast.error(message);
      }
    });




    const ref = useRef(null);

    // useClickOutside(ref, () => {
    //   setAddScheduleModalOpen(false);

    // });


    console.log(parsedTeacher?.id, "parse teacher status");

    const { teacherSubject, isLoading, error } = useGetTeacherSubject(parsedTeacher?.id);




    console.log(selectedTeacher, " teacher data loaded");

    return (
      <div
        className={`absolute top-0 right-0 flex-1 z-10 flex bg-white rounded-md shadow-lg w-full sm:w-96 ${isOpen ? "" : "hidden"
          } `}
        ref={ref}
      >
        <div className="flex flex-col flex-1 w-full">
          <div className="flex justify-between sm:px-5 px-2 py-5 border-b border-b-black/10">
            <p className="text-xl font-medium">Schedule Class</p>
            <IoClose
              onClick={() => {
                onclose();
                setAddScheduleModalOpen(false);
              }}
              className="cursor-pointer w-8 h-8 md:w-5 md:h-5"
            />
          </div>
          <div className="flex flex-col flex-1 w-full">
            <div className="flex flex-col justify-center px-8 flex-1 w-full">
              <div className="flex justify-end">
                <div className="p-2 border-grey/10"></div>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <img src={IMAGES.classModal} alt="" className="w-28 h-28" />
              </div>
              <div className="flex flex-col w-full  flex-1 gap-1 px-2 py-1 overflow-y-auto custom-scrollbar">

                <CustomSelectableField
                  label={"Select Teacher"}
                  selectedOption={selectedTeacher}
                  options={adminUsersData.allTeachers}
                  setSelectedOption={setSelectedTeacher}
                />

                <CustomSelectableField
                  options={teacherSubject || allSubjects}
                  label={"Select Subject"}
                  selectedOption={selectedSubject}
                  setSelectedOption={setSelctedSubject}
                />
                <CusotmInputField
                  type={"text"}
                  icon={"mail"}
                  name={"title"}
                  title={"Topic"}
                  selectable={false}
                  status={allowedEdit}
                  valuesObj={classObj}
                  value={classObj.title}
                  setValue={setClassObj}
                />
                <CustomMultiSelectableField
                  label={"Select Classroom"}
                  options={filteredClassrooms}
                  selectedOption={selectedClassrooms}
                  setSelectedOption={setSelectedClassrooms}
                  isMulti={true}
                />
                {/* <CustomSelectableField
                  label={"Select Classroom"}
                  options={allClassrooms}
                  selectedOption={selectedClassroom}
                  setSelectedOption={setSelectedClassroom}
                /> */}
                <div>
                  <CusotmInputField
                    icon={"cap"}
                    type={"date"}
                    title={"Start Event Date"}
                    name={"startEventDate"}
                    selectable={false}
                    valuesObj={classObj}
                    status={allowedEdit}
                    setValue={setClassObj}
                    value={classObj.startEventDate}
                  />
                  <CusotmInputField
                    icon={"cap"}
                    type={"date"}
                    title={"End Event Date"}
                    name={"endEventDate"}
                    selectable={false}
                    valuesObj={classObj}
                    status={allowedEdit}
                    setValue={setClassObj}
                    value={classObj.endEventDate}
                  />
                </div>

                <div className="flex gap-2 my-4 flex-wrap">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <label key={day} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(day)}
                        onChange={() => handleDayCheckboxChange(day)}
                      />
                      {day}
                    </label>
                  ))}
                </div>



                <div className="flex flex-col sm:flex-row gap-2">
                  <CusotmInputField
                    type={"time"}
                    icon={"calendar"}
                    selectable={false}
                    name={"startTime"}
                    valuesObj={classObj}
                    status={allowedEdit}
                    title={"Start Time"}
                    setValue={setClassObj}
                    value={classObj.startTime}
                  />
                  <CusotmInputField
                    type={"time"}
                    icon={"cake"}
                    name={"endTime"}
                    title={"End Time"}
                    selectable={false}
                    status={allowedEdit}
                    valuesObj={classObj}
                    setValue={setClassObj}
                    value={classObj.endTime}
                  />
                </div>

                <CusotmInputField
                  type={"text"}
                  icon={"mail"}
                  name={"meetingUrl"}
                  title={"Meet Link (Optional)"}
                  selectable={false}
                  status={allowedEdit}
                  valuesObj={classObj}
                  value={classObj.meetingUrl}
                  setValue={setClassObj}
                  placeholder="https://meet.google.com/your-meeting-link"
                />


                <div className="py-4 w-full border-t border-black/20">
                  <div className="flex w-full items-center gap-2">
                    <div className="flex w-full sm:flex-row flex-col justify-between gap-4 py-2">
                      {classCreateMutate.isPending && <div className="flex justify-center items-center"><Loader /></div>}
                      {!classCreateMutate.isPending &&
                        <>
                          <FilterButton text={"Schedule Class"} className={"px-2 w-full py-2 text-sm"} clickHandler={() => handleSchedualClass()} />
                          <FilterButton text={"Cancel"} className={"px-2 text-sm py-2 bg-[#0B1053] border w-full !text-white"} clickHandler={() => {
                            setaddEventModalOpen(false)
                            onclose();
                            setAddScheduleModalOpen(false);
                          }} />
                        </>
                      }
                    </div>
                  </div>
                </div>

                {allowedEdit &&
                  <div className="flex justify-center my-4">
                    <p
                      onClick={handleSaveDetails}
                      className="flex items-center justify-center w-1/2 px-1 py-2 text-center text-white cursor-pointer rounded-3xl bg-[#6A00FF]"
                    >
                      Save
                    </p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const { data, isPending } = useQuery({ queryKey: ["classes"], queryFn: getAllClasses });

  const [addEventModalOpen, setaddEventModalOpen] = useState(false);
  const [classModal, setClassModal] = useState(false);
  const [isOpen, setIsOpen] = useState(addScheduleModalOpen);
  return (
    <div>
      <div>
        <div>
          <SchedualClassesComponent
            onclose={() => setAddScheduleModalOpen(false)} // Ensure parent state updates
            isOpen={addScheduleModalOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default SchedualClasses;

import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import ConfirmModal from "./ConfirmModal";
import { formatTimeInPKT } from "../../../utils/timeUtils";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";
import useClickOutside from "../../../hooks/useClickOutlise";
import { useMutation } from "@tanstack/react-query";
import { CusotmInputField } from "../../../commonComponents/CusotmInputField";
import CustomSelectableField from "../../../commonComponents/CustomSelectableField";
import { convertToISOWithTimezoneOffset } from "../../../utils/ConvertTimeZone";

import { toast } from "react-toastify";
import { GoArrowRight } from "react-icons/go";
import { useAdmin } from "../../../context/AdminContext";
import { useUser } from "../../../context/UserContext";
import { cancelClass } from "../../../api/Admin/ClassesApi";
import { updateClasses } from "../../../api/Teacher/Class";
import { useGetTeacherSubject } from "../../../api/Admin/SubjectsApi";
import meet from "../../../assets/meet.png";


export default function ViewEventDetailsModal({
  open,
  event,
  setopen,
  setevents,
  refetch,
  isRefetching
}) {

  const ref = useRef(null);
  const eventNameRef = useRef();
  const { userData } = useUser();
  const { allSubjects, adminUsersData } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [isOutside, setisOutside] = useState(false);
  const [editingName, seteditingName] = useState(false);
  const [isYAxisOutside, setisYAxisOutside] = useState(false);
  const [confirmDeleteModalOpen, setconfirmDeleteModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [eventType, setEventType] = useState(false);

  // Initialize form state with event data
  const prevStartTime = formatTimeInPKT(event.startTime, 'HH:mm');
  const prevEndTime = formatTimeInPKT(event.endTime, 'HH:mm');

  const [startDate, setStartDate] = useState(
    moment.utc(event.startTime).format("YYYY-MM-DD")
  );

  const [classObj, setClassObj] = useState({
    title: event.title,
    startTime: prevStartTime,
    endTime: prevEndTime,
    oneTime: true,
    meetingUrl: event.meetingUrl || "",
    classroomID: event.classroomID,
    subjectID: event.subjectID,
    startEventDate: event.startEventDate,
    endEventDate: event.endEventDate,
    teacher: { teacherID: event.teacherID, status: "absent" },
    updateSeries: eventType
  });

  const [selectedTeacher, setSelectedTeacher] = useState(
    JSON.stringify(event.teacher)
  );
  const [selectedSubject, setSelectedSubject] = useState(
    JSON.stringify(event.subject)
  );

  // const parsedTeacher = selectedTeacher ? JSON.parse(selectedTeacher) : null;
  // const { teacherSubject } = useGetTeacherSubject(parsedTeacher?.id);
  const parsedTeacher = selectedTeacher 
  ? (typeof selectedTeacher === 'string' ? JSON.parse(selectedTeacher) : selectedTeacher) 
  : null;
const { teacherSubject } = useGetTeacherSubject(parsedTeacher?.id);

  useClickOutside(ref, () => setopen(false));

  const handleDeleteEvent = () => {
    // deleteEvent({ eventId: event.id })
    //   .then((res) => {
    //     setAlert("Event deleted successfully", "success");
    //     setevents((eve) => eve.filter((e) => e.id != event.id));
    //   })
    //   .catch((err) => {});
    console.log("dell event method");
  };

  const handleUpdateEvent = () => {
    // updateEvent({
    //   data: { eventName: eventNameRef.current.innerText },
    //   id: event.id,
    // })
    //   .then((res) => {
    //     setevents((eve) => {
    //       const eventsCopy = [...eve];
    //       const foundEve = eventsCopy.find((e) => e.id == event.id);
    //       foundEve.eventName = eventNameRef.current.innerText;
    //       return eventsCopy;
    //     });
    //   })
    //   .catch((err) => {});
    console.log("update event method");
  };

  useEffect(() => {
    if (open) {
      function adjustPosition() {
        const childRect = ref?.current?.getBoundingClientRect();
        setisYAxisOutside(childRect.bottom > window.innerHeight);
        if (childRect.right > window.innerWidth) {
          setisOutside(true);
        } else {
          setisOutside(false);
        }
      }

      window.addEventListener("resize", adjustPosition);
      adjustPosition();

      return () => {
        window.removeEventListener("resize", adjustPosition);
      };
    }
  }, [open]);


  const handleUpdateClass = () => {
    if (!selectedTeacher || !selectedSubject) {
      toast.error("Please select teacher and subject");
      return;
    }

    const isoFormattedStringEndTime = new Date(
      convertToISOWithTimezoneOffset(startDate, classObj.endTime)
    );
    const isoFormattedStringStartTime = new Date(
      convertToISOWithTimezoneOffset(startDate, classObj.startTime)
    );

    const obj = {
      classID: event.id,
      title: classObj.title,
      meetingUrl: classObj.meetingUrl,
      teacher: { teacherID: parsedTeacher.id, status: "absent" },
      subjectID: JSON.parse(selectedSubject).id,
      startTime: isoFormattedStringStartTime,
      endTime: isoFormattedStringEndTime,
      startEventDate: startDate,
      endEventDate: startDate,
      updateSeries: eventType,
    };

    classUpdateMutate.mutate(obj);
  };

  const classUpdateMutate = useMutation({
    mutationFn: async (data) => await updateClasses(data),
    onSuccess: async () => {
      toast.success("Class updated successfully");
      refetch();
      setopen(false);
      setIsEditMode(false);
    },
    onError: (error) => {
      const message = error?.response?.data?.error || "Failed to update class";
      toast.error(message);
    }
  });

  // Prepare meeting URL
  const fullMeetingUrl = event?.meetingUrl?.startsWith("http")
    ? event.meetingUrl
    : `https://${event?.meetingUrl}`;

  const hasValidMeetingUrl = event?.meetingUrl && event?.meetingUrl.trim() !== "";

  const handleCancelMeeting = async () => {
    setLoading(true);
    const response = await cancelClass(event.id);
    if (response != "error") {
      await refetch();
      setLoading(false);
      toast.success("Class Cancelled successfully!");
    }
  };


  console.log(event, "class event are here");

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 ${open ? "" : "hidden"}`}>
      <div
        ref={ref}
        className={`bg-white text-black rounded-xl p-4 sm:p-6 w-full ${isEditMode ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto shadow-2xl border border-black/20 relative`}
      >


        <ConfirmModal
          isOpen={confirmDeleteModalOpen}
          title={"Confirm Delete"}
          description={"Are you sure you want to delete this event?"}
          onconfirm={(e) => {
            e.stopPropagation();
            handleDeleteEvent();
          }}
          onclose={(e) => {
            e.stopPropagation();
            setconfirmDeleteModalOpen(false);
          }}
        />
        <div className="flex gap-2">
          <div className="flex flex-col w-full gap-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-800">
                  {event.subject?.name}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    console.log("Edit button clicked, current isEditMode:", isEditMode);
                    setIsEditMode(!isEditMode);
                  }}
                  className="px-4 py-2 text-sm font-medium bg-[#0B1053] text-white rounded-lg hover:bg-[#007EEA] transition-colors shadow-sm border"
                  style={{ color: 'white' }}
                >
                  {isEditMode ? "Cancel Edit" : "Edit Class"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setopen(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <img
                    src={IMAGES.CloseIcon}
                    className="w-4 h-4"
                    alt="Close"
                  />
                </button>
              </div>
            </div>
            {!isEditMode ? (
              // View Mode
              <>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col flex-1 gap-1">
                    <p className="text-xs font-semibold text-grey_700">Teacher</p>
                    <div className="flex justify-between border-[1.5px] py-2 px-4 rounded-lg w-full items-center border-grey/50">
                      <p className="text-sm text-custom-gray-3">{event.teacher?.name}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col flex-1 gap-1">
                    <p className="text-xs font-semibold text-grey_700">Topic</p>
                    <div className="flex justify-between border-[1.5px] py-2 px-4 rounded-lg w-full items-center border-grey/50">
                      <p className="text-sm text-custom-gray-3">{event.title}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col flex-1 gap-1">
                    <p className="text-xs font-semibold text-grey_700">Date</p>
                    <div className="flex justify-between border-[1.5px] py-2 px-4 rounded-lg w-full items-center border-grey/50">
                      <p className="text-sm text-custom-gray-3">
                        {moment.utc(event.startTime).format("DD MMMM, YYYY")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-flex flex-col sm:flex-row sm:items-center sm:gap-3 w-full">
                  <div className="flex flex-col w-full sm:w-auto">
                    <p className="text-xs font-semibold text-grey_700">Start Time</p>
                    <div className="flex items-center justify-between gap-3 px-3 py-2 border-[1.5px] rounded-lg w-36 border-grey/30">
                      <p className="text-sm text-custom-gray-3">
                        {formatTimeInPKT(event.startTime, "hh:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="sm:mt-5 display-none sm:display-block">
                    <p className="mx-1">
                      <GoArrowRight className="text-grey/70" />
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold text-grey_700">End Time</p>
                    <div className="flex items-center justify-between gap-3 px-3 py-2 border-[1.5px] rounded-lg w-36 border-grey/30">
                      <p className="text-sm text-custom-gray-3">
                        {formatTimeInPKT(event.endTime, "hh:mm a")}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Edit Mode
              <>
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
                  setSelectedOption={setSelectedSubject}
                />

                <CusotmInputField
                  type={"text"}
                  icon={"mail"}
                  name={"title"}
                  title={"Topic"}
                  selectable={false}
                  status={true}
                  valuesObj={classObj}
                  value={classObj.title}
                  setValue={setClassObj}
                />

                <CusotmInputField
                  icon={"cap"}
                  type={"date"}
                  title={"Event Date"}
                  name={"startEventDate"}
                  selectable={false}
                  status={true}
                  valuesObj={{ startEventDate: startDate }}
                  value={startDate}
                  setValue={(obj) => setStartDate(obj.startEventDate)}
                />

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">

                  <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <CusotmInputField
                      type={"time"}
                      icon={"calendar"}
                      selectable={false}
                      name={"startTime"}
                      valuesObj={classObj}
                      status={true}
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
                      status={true}
                      valuesObj={classObj}
                      setValue={setClassObj}
                      value={classObj.endTime}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-2">
                  <CusotmInputField
                    type={"text"}
                    icon={"mail"}
                    name={"meetingUrl"}
                    title={"Google Meet Link"}
                    selectable={false}
                    status={true}
                    valuesObj={classObj}
                    value={classObj.meetingUrl}
                    setValue={setClassObj}
                    placeholder="Enter meeting link"
                  />
                </div>

                {event.groupID && (
                  <div className="flex flex-col gap-3 mt-4">
                    <p className="text-sm font-medium text-black">Update Future Events</p>
                    <div className="flex items-center gap-3 px-4 py-3 border-[1.5px] rounded-lg border-grey/30 bg-gray-50/50">
                      <input
                        type="checkbox"
                        checked={eventType}
                        onChange={() => setEventType(!eventType)}
                        className="w-4 h-4 text-[#0B1053] bg-gray-100 border-gray-300 rounded focus:ring-[#0B1053] focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">Update all Future Events</span>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-3 flex-col">
              {!isEditMode && hasValidMeetingUrl && (
                <a
                  href={fullMeetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <div className="flex items-center justify-center w-full py-2 text-center rounded-md bg-[#6A00FF] hover:bg-[#007EEA] transition-colors duration-200">
                    <img src={meet} alt="meet img" className="w-4 h-4 mr-2" />
                    <p className="text-sm text-white">Join Meeting</p>
                  </div>
                </a>
              )}

              {loading && (
                <div className="flex justify-center items-center">
                  <Loader />
                </div>
              )}

              {!loading && isEditMode && (
                <div className="flex items-center gap-3 w-full mt-6">
                  <button
                    onClick={handleUpdateClass}
                    className="flex items-center justify-center w-full py-3 text-center rounded-lg bg-[#0B1053] text-white font-medium hover:bg-[#0B1053] transition-colors shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              )}

              {!loading && !isEditMode && (
                <div
                  onClick={handleCancelMeeting}
                  className="flex items-center justify-center w-full py-2 text-center rounded-md border-[#0B1053] border cursor-pointer hover:bg-red-50 transition-colors"
                >
                  <p className="text-sm text-[#0B1053]">Cancel Class</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

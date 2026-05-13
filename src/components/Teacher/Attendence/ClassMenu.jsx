import React, { useEffect, useRef } from "react";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdOutlinePlaylistAddCheck } from "react-icons/md";
import useClickOutside from "../../../hooks/useClickOutlise";

const ClassMenu = ({
  isopen,
  setIsOpen,
  deleteClassRoom,
  editClassRoom,
  markAttendanceData
}) => {
  const ref = useRef(null);
  useClickOutside(ref, () => {
    setIsOpen(false);
  });

  useEffect(() => {
    if (isopen) {
      console.log("Attendance Menu Opened for:", markAttendanceData);
    }
  }, [isopen, markAttendanceData]);

  const hasAttendance = markAttendanceData?.allData?.attendance?.length > 0;

  return (
    <>
      <div
        ref={ref}
        className={`fixed z-10 bg-white right-0 mr-32 top-80 shadow-lg border border-[#00000010] rounded-xl ${isopen ? "" : "hidden"
          }`}
      >
        <div className="flex p-2 sm:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 cursor-pointer text-[#0B1053]" onClick={() => {
              console.log("Action: Mark / Edit Attendance", markAttendanceData);
              editClassRoom();
            }}>
              {hasAttendance ? <FaRegEdit /> : <MdOutlinePlaylistAddCheck className="text-xl" />}
              <p>{hasAttendance ? "Edit Attendance" : "Mark Attendance"}</p>
            </div>
            {hasAttendance && (
              <div className="flex items-center gap-2 cursor-pointer text-maroon " onClick={() => {
                console.log("Action: Cancel Attendance", markAttendanceData);
                deleteClassRoom();
              }}>
                <RiDeleteBin6Line />
                <p>Cancel Attendance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};


export default ClassMenu;

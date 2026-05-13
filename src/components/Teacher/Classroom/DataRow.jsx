import React, { useEffect, useState } from "react";
import IMAGES from "../../../assets/images/index";
import { BsThreeDotsVertical } from "react-icons/bs";

const DataRow = (props) => {
  const [showAdminPopup, setShowAdminPopup] = useState(false);

  // Hide popup automatically after 2 seconds
  useEffect(() => {
    if (showAdminPopup) {
      const timer = setTimeout(() => setShowAdminPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showAdminPopup]);



  return (
    <div className="min-w-[700px] md:min-w-full">
      <div
        style={{ backgroundColor: props.bgColor }}
        className={` px-2 min-w-full border-b flex border-grey items-center`}
      >
        <div className="flex flex-row space-x-3 items-center flex-1 py-[4px] mt-1 md:pl-3 md:pr-5 ">
          <p
            className={`w-full md:flex-[1] flex-[1] md:text-[14px] text-[11px] text-center md:text-left ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.index + "."}
          </p>
          <p
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.classname}
          </p>
          <p
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.classesSchedualled}
          </p>
          <p
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.students}
          </p>
          <p
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.teachers}
          </p>
          <p
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.levelName}
          </p>
          <p
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.createdBy}
          </p>
          {/* <p
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px] text-[11px] ${props.header ? "font-semibold" : ""}`}
          >
            {props.header ? props.status : props.status ? "Attendance Submitted" : "Not Submitted"}
          </p> */}
        </div>
        <div className="relative ml-3 mr-2 lg:mr-5">
          <button
            onClick={() => {
              if (props.createdBy !== "admin") {
                props.toggleClassMenu(props);
              } else {
                setShowAdminPopup(true);
              }
            }}
            className={`p-1 text-[20px] ${props.header ? "hidden" : ""}`}
          >
            {props.threeDots && <BsThreeDotsVertical />}
          </button>

          {/* Popup for admin warning */}
          {showAdminPopup && (
            <div
              className="fixed bg-[#dadbf3] text-[#0B1053] text-xs py-2 px-3 rounded shadow-lg z-[9999] w-48 right-0"
            >
              You cannot delete admin entries!
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default DataRow;

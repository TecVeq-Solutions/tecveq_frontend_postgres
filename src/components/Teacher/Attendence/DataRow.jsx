import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";


const DataRow = (props) => {

  useEffect(() => { }, []);
  const navigate = useNavigate();

  console.log(props?.allData, "all data of props");


  return (
    <div className="min-w-[700px] md:min-w-full cursor-pointer" onClick={() => { !props.header && !props.threeDots && navigate("/teacher/attendence/submission", { state: props?.allData }) }}>
      <div
        style={{ backgroundColor: props.bgColor }}
        className={`min-w-full border-b flex border-grey items-center`}
      >
        <div className="flex flex-row items-center flex-1 py-[4px] mt-1 md:pl-3 md:pr-5 space-x-5 " onClick={() => { !props.header && navigate("/teacher/attendence/submission", { state: props?.allData }) }}>
          <p
            className={`w-full md:flex-[1] flex-[1] md:text-[14px] sm:text-[11px] text-[9px] text-center md:text-left ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.index + "."}
          </p>
          <p
            className={`w-full md:flex-[2] my-1 md:my-0 text-center md:text-center md:text-[14px] sm:text-[11px]  text-[9px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.classname}
          </p>
          <p
            className={`w-full md:flex-[2] my-1 md:my-0 text-center md:text-center md:text-[14px] sm:text-[11px] text-[9px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.subject}
          </p>
          {/* <p
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${
              props.header ? "font-semibold" : ""
            }`}
          >
            {props.classesSchedualled}
          </p> */}
          <p
            className={`w-full md:flex-[2] my-1 md:my-0 text-center md:text-center md:text-[14px] sm:text-[11px] text-[9px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.students}
          </p>
          <p
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px] sm:text-[11px] text-[9px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.teachers}
          </p>
          <p
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px] sm:text-[11px] text-[9px] ${props.header ? "sm:font-semibold" : ""
              }`}
          >
            {props?.startDate && !isNaN(new Date(props.startDate))
              ? new Date(props.startDate).toLocaleString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              : "Start Date"}
          </p>
          <p
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.header ? "Status" : (props?.allData?.attendance?.length > 0) ? "Already Submitted" : "Not submitted yet"}
          </p>
        </div>
        <div className="relative ml-2 mr-2 lg:mr-5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              props.toggleClassMenu(props);
            }}
            className={`p-1 text-[20px] ${props.header ? "hidden" : ""}`}
          >
            {props.threeDots && <BsThreeDotsVertical />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataRow;

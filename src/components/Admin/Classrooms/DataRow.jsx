import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

const DataRow = (props) => {
  // HEADER STYLE
  if (props.header) {
    return (
      <div className="flex items-center w-full bg-[#F9FAFB] border-b border-gray-200 py-4 px-4">
        <div className="w-[8%] text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">{props.index}</div>
        <div className="w-[22%] text-left pl-4 text-[11px] font-bold uppercase tracking-wider text-gray-500">{props.classname}</div>
        <div className="w-[18%] text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">{props.classesSchedualled}</div>
        <div className="w-[15%] text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">{props.students}</div>
        <div className="w-[15%] text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">{props.teachers}</div>
        <div className="w-[17%] text-center text-[11px] font-bold uppercase tracking-wider text-gray-500">{props.createdBy}</div>
        <div className="w-[5%]"></div>
      </div>
    );
  }

  // DATA ROW STYLE
  return (
    <div className="flex items-center w-full bg-white border-b border-gray-50 hover:bg-blue-50/40 transition-all duration-200 py-4 px-4 group">
      {/* Index */}
      <div className="w-[8%] text-center text-sm font-medium text-gray-400">
        {props.index}
      </div>

      {/* Classroom Name */}
      <div className="w-[22%] text-left pl-4">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
          {props.classname}
        </p>
      </div>

      {/* Classes Scheduled - Modern Badge */}
      <div className="w-[18%] text-center">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
          {props.classesSchedualled} Classes
        </span>
      </div>

      {/* Counts */}
      <div className="w-[15%] text-center text-sm text-gray-600 font-medium">{props.students}</div>
      <div className="w-[15%] text-center text-sm text-gray-600 font-medium">{props.teachers}</div>

      {/* Created By - Modern Tag */}
      <div className="w-[17%] text-center">
        <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-tight">
          {props.createdBy}
        </span>
      </div>

      {/* Action Button */}
      <div className="w-[5%] flex justify-center">
        <button
          onClick={() => props.toggleClassMenu(props.data)}
          className="p-1.5 rounded-md text-gray-400 hover:bg-white hover:text-gray-600 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
        >
          <BsThreeDotsVertical size={18} />
        </button>
      </div>
    </div>
  );
};

export default DataRow;
import React from "react";
import { HiOutlineCalendarDays } from "react-icons/hi2";

export default function FilterButton({
  icon,
  text,
  clickHandler,
  className,
  disabled,
  style,
}) {
  return (
    <button
      className={`text-white py-1 rounded-3xl flex gap-1 items-center justify-center bg-[#6A00FF] ${className}`}
      onClick={clickHandler}
      disabled={disabled ? disabled : false}
      style={style}
    >
       {icon? 
       <HiOutlineCalendarDays size={20} /> 
      : <></>} 
      {text}
    </button>
  );
}

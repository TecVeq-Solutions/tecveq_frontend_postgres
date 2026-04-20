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
      className={`text-sm py-2 rounded-3xl flex gap-1 items-center justify-center ${className}`}
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

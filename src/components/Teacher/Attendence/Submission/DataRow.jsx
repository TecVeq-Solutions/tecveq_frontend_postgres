import React, { useEffect, useState } from "react";
import { IoMdRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";


const DataRow = (props) => {


  useEffect(() => {
    console.log("Student Attendance DataRow for:", props.data?.name, props.data);
  }, [props.data]);

  const [present, setPresent] = useState(true);
  const [late, setLate] = useState(false);
  const [absent, setAbsent] = useState(false);
  const [leave, setLeave] = useState(false);


  useEffect(() => {
    // Set the initial state based on attendance data
    if (props.attendeceData) {
      const studentAttendance = props.attendeceData.find(
        (item) => item.studentID === props.data?.id
      );

      if (studentAttendance) {
        setPresent(studentAttendance.isPresent);
        setLate(studentAttendance.late || false);
        setAbsent(!studentAttendance.isPresent);
      }
    }
  }, [props.attendeceData, props.data]);



  const onPresentClick = () => {
    let temparray = props.attendeceData;
    console.log(temparray);
    console.log(props.index);
    temparray[props.index - 1] = { studentID: props?.data?.id, isPresent: true, late: false };
    // temparray[props.index-1] = {studentID: props.classname, status: "present" } ;
    console.log("after : ", temparray)
    props.setAttendenceData(temparray);
    setPresent(true);
    setAbsent(false);
    setLeave(false);
    setLate(false);
  }

  const onAbsentClick = () => {
    let temparray = props.attendeceData;
    temparray[props.index - 1] = { studentID: props?.data?.id, isPresent: false, late: false };
    props.setAttendenceData(temparray);
    setPresent(false);
    setAbsent(true);
    setLeave(false);
    setLate(false)
  }

  const onLateClick = () => {
    let temparray = props.attendeceData;
    temparray[props.index - 1] = { studentID: props?.data?.id, isPresent: true, late: true };
    props.setAttendenceData(temparray);
    setPresent(false);
    setLate(true);
    setAbsent(false);
    setLeave(false);
  }


  return (
    <div className=" min-w-[700px] sm:min-w-full ">
      <div
        style={{ backgroundColor: props.bgColor }}
        className={`min-w-full border-b flex border-grey items-center`}
      >
        <div className="submission flex flex-row items-center flex-1 py-[4px] mt-1 md:pl-3 md:pr-5 space-x-5 ">
          <div
            className={`w-full md:flex-[1] flex-[1] md:text-[14px] text-[11px] text-center md:text-left ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.index + "."}
          </div>
          <div
            className={`w-full flex items-center gap-4 md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.header ? " " :
              <img src={props.profile} alt="" className="w-10 h-10 object-cover rounded-full" />
            }
            {props.classname}
          </div>
          <div
            className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.classesSchedualled}
          </div>


          <div className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
            }`}>
            {!props.header ?
              <>
                <div className="flex items-center">
                  <div
                    className={`w-full flex gap-2 items-center md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
                      }`}
                  >
                    <div className="flex gap-2" onClick={onPresentClick}>
                      {present ? <IoMdRadioButtonOn className="text-[#0B1053]" /> : <IoMdRadioButtonOff className="text-[#0B1053]" />}
                    </div>
                    Present
                  </div>
                  <div
                    className={`w-full flex gap-2 items-center md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
                      }`}
                  >
                    <div className="flex gap-2" onClick={onAbsentClick}>
                      {absent ? <IoMdRadioButtonOn className="text-[#0B1053]" /> : <IoMdRadioButtonOff className="text-[#0B1053]" />}
                    </div>
                    Absent
                  </div>
                  <div
                    className={`w-full flex gap-2 items-center md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
                      }`}
                  >
                    <div className="flex gap-2" onClick={onLateClick}>
                      {late ? <IoMdRadioButtonOn className="text-[#0B1053]" /> : <IoMdRadioButtonOff className="text-[#0B1053]" />}
                    </div>
                    Late
                  </div>
                </div>
              </>
              : <>
                <div className={`w-full md:flex-[3] my-1 md:my-0 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
                  }`} >
                  Attendnece
                </div>
              </>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DataRow;

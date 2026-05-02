import React, { useEffect, useState } from "react";
import meet from "../../../assets/meet.png";
import { FiClock } from "react-icons/fi";

import dayjs from "dayjs";

import { FaPlus } from "react-icons/fa";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { MdKeyboardArrowRight } from "react-icons/md";
import { IoCalendar } from "react-icons/io5";

const ScheduledClasses = () => {
  const data = [
    {
      subject: "Physics",
      topic: "Law of thermodynamics",
      instructor: "John smith",
      startTime: "8:30 PM",
      date: "2024 February 24",
      meetingLink: "",
      status: true,
      id:1,
    },
    {
      subject: "Chemistry",
      topic: "Bohr's Model",
      instructor: "John Doe",
      startTime: "11:30 PM",
      date: "2024 February 24",
      meetingLink: "",
      status: false,
      id:2,
    },
    {
      subject: "Biology",
      topic: "Reproduction",
      instructor: "Umer Iqbal",
      startTime: "9:30 PM",
      date: "2024 March 20",
      meetingLink: "",
      status: false,
      id:3
    },
    {
      subject: "Chemistry",
      topic: "Organic Chemistry",
      instructor: "Muneeb Jutt",
      startTime: "9:30 PM",
      date: "2024 March 12",
      meetingLink: "",
      status: false,
      id:4
    },
    {
      subject: "Physics",
      topic: "Law of thermodynamics",
      instructor: "Thomas Shelby",
      startTime: "8:30 PM",
      date: "2024 February 13",
      meetingLink: "",
      status: false,
      id:5,
    },
    {
      subject: "Space Science",
      topic: "Laws of space",
      instructor: "Stephen",
      startTime: "8:30 PM",
      date: "2024 February 14",
      meetingLink: "",
      status: false,
      id:6,
    },
  ];

  const [selectedDate, setSelectedDate] = useState(null);
  const [filteredclasses, setFilteredClasses] = useState([]);

  const handleJoinClass = () => {};

  const filterClasses = () =>{
    console.log("selected Date is : ", selectedDate);
    let arr = []
     arr = data.filter((item) => item.date == selectedDate).map((item)=>item);
     console.log(arr)
     setFilteredClasses(arr);
    // data.map((item) => console.log("date is : ", item.date == selectedDate))
  }

  useEffect(() =>{
    filterClasses();
  }, [selectedDate])

  const EventComponet = ({ item }) => {
    return (
      <div
        className={`flex flex-col  w-full text-xs border-l-2 gap-1 ${
          item.subject == "Physics"
            ? "border-l-maroon bg-maroon_100"
            : item.subject == "Chemistry"
            ? "border-l-orange bg-orange_light"
            : item.subject == "Biology"
            ? "border-l-green bg-green/10"
            : "border-l-green bg-green/10"
        }  px-2 py-2 rounded-lg w-60`}
      >
        <div className="flex justify-between">
          <p>{item.subject}</p>
          <p>{item.instructor}</p>
        </div>
        <div className="text-sm font-medium">
          <p>{item.topic} </p>
        </div>

        {item.status ? (
          <div className="flex items-center justify-between">
            <p className="text-maroon">class has started...</p>
            <div>
              <div
                onClick={handleJoinClass}
                className="flex items-center justify-center px-2 py-1 text-center cursor-pointer bg-maroon rounded-3xl"
              >
                <img src={meet} alt="" className="w-8 h-3" />
                <p className="text-white " style={{ fontSize: 8 }}>
                  Join class
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <FiClock />
            <p>{item.startTime} </p>
          </div>
        )}
      </div>
    );
  };

  const CustomCalender = ({ setSelectedDateFromChild, classesArray }) => {

    const [selectedDate, setSelectedDate] = useState(dayjs());

    const [dateForEvent, setDateForEvent] = useState("");


    const renderDays = () => {
      const startOfMonth = selectedDate.startOf("month");
      const endOfMonth = selectedDate.endOf("month");

      const days = [];
      let currentDay = startOfMonth;
      // console.log("start of moth is : ", currentDay.format("d"));
      if (currentDay.format("d") > 3) {
        let iter = currentDay.format("d");
        let prevmonth = currentDay.subtract(iter, "day");
        console.log(iter);
        for (let i = 0; i < iter; i++) {
          prevmonth = prevmonth.add(1, "day");
          days.push(prevmonth);
        }
      }
      currentDay = currentDay.add(1, "day");

      while (currentDay.isBefore(endOfMonth, "day")) {
        days.push(currentDay);
        currentDay = currentDay.add(1, "day");
      }

      return days.map((day) => {
        const formattedDate = day.format("YYYY MMMM DD");

        const eventsForDay = classesArray
          ? classesArray.filter((event) => event.date === formattedDate)
          : [];

          // console.log("day event are : ", eventsForDay)

        return (
          <div
            key={formattedDate}
            className={`text-center text-[12px] text-black cursor-pointer hover:bg-gray-200 relative`}
            onClick={() => {
              setSelectedDateFromChild(formattedDate);
              setSelectedDate(day);
              setDateForEvent(formattedDate);
            }}
          >
            <div className={`flex flex-col w-10 h-10 items-center px-5 py-1 ${selectedDate == formattedDate? "bg-maroon text-white":""} text-xs group text-maroon hover:bg-maroon hover:text-white rounded-3xl`}>
              <div className="text-sm text-black group-hover:text-white">{day.format("D")}</div>

                {eventsForDay?.length > 0? 
                <GoDotFill size={10} className="group-hover:text-white" />
                : ""}
            </div>
          </div>
        );
      });
    };

    return (
      <div className="text-black">
        <div className="flex items-center justify-between mb-4">
          <p
            className=""
            onClick={() => setSelectedDate(selectedDate.subtract(1, "month"))}
          >
            <MdKeyboardArrowLeft className=""  size={20} />
          </p>
          <h2 className="text-sm">{selectedDate.format("MMMM YYYY")}</h2>
          <p
            className=""
            onClick={() => setSelectedDate(selectedDate.add(1, "month"))}
          >
            <MdKeyboardArrowRight className="" size={20} />
          </p>
        </div>

        <div className="relative grid grid-cols-7 gap-2 ">
          <div className="px-3 font-semibold text-[10px] ">Mon</div>
          <div className="px-3 font-semibold text-[10px] ">Tue</div>
          <div className="px-3 font-semibold text-[10px] ">Wed</div>
          <div className="px-3 font-semibold text-[10px] ">Thu</div>
          <div className="px-3 font-semibold text-[10px] ">Fri</div>
          <div className="px-3 font-semibold text-[10px] ">Sat</div>
          <div className="px-3 font-semibold text-[10px] ">Sun</div>
          {renderDays()}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1">
      <div className="hidden lg:flex flex-col flex-1 gap-2">
        <div className="flex">
          <p className="flex text-lg font-medium">Sheduled Classes</p>
        </div>
        <div className="flex flex-col gap-1 p-3 bg-white rounded-lg lg:flex-row">
          <div className="flex-1 p-2  ">
            <CustomCalender setSelectedDateFromChild={setSelectedDate} classesArray={data} />
          </div>

          <div className="flex flex-col flex-1 gap-1">
            {filteredclasses.length > 0 ? "" : "No Scheduled classes right now"}
            {filteredclasses.map((item) => (
              <EventComponet item={item} key={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Only Message */}
      <div className="lg:hidden flex flex-col items-center justify-center p-8 w-full bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
          <IoCalendar size={28} />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Desktop Only</h3>
        <p className="text-gray-500 text-xs text-center mt-2">Scheduled classes view is optimized for desktop screens (1024px+).</p>
      </div>
    </div>
  );
};

export default ScheduledClasses;

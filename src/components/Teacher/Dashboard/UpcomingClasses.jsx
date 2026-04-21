import React, { useEffect, useState } from "react";
import meet from "../../../assets/meet.png";
import { FiClock } from "react-icons/fi";
import dayjs from "dayjs";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { GoDotFill } from "react-icons/go";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useTeacher } from "../../../context/TeacherContext";
import { useFetcher } from "react-router-dom";
import moment from "moment/moment";

const UpcomingClasses = () => {
  const { allClasses, classesIsPending } = useTeacher();
  const [filterActive, setFilterActive] = useState(false);

  const data = [
    {
      subject: "Physics",
      topic: "Law of thermodynamics",
      instructor: "John smith",
      startTime: "8:30 PM",
      date: "2024 February 24",
      meetingLink: "",
      status: true,
      id: 1,
    },
    {
      subject: "Chemistry",
      topic: "Bohr's Model",
      instructor: "John Doe",
      startTime: "11:30 PM",
      date: "2024 February 24",
      meetingLink: "",
      status: false,
      id: 2,
    },
    {
      subject: "Biology",
      topic: "Reproduction",
      instructor: "Umer Iqbal",
      startTime: "9:30 PM",
      date: "2024 March 20",
      meetingLink: "",
      status: false,
      id: 3
    },
    {
      subject: "Chemistry",
      topic: "Organic Chemistry",
      instructor: "Muneeb Jutt",
      startTime: "9:30 PM",
      date: "2024 March 12",
      meetingLink: "",
      status: false,
      id: 4
    },
    {
      subject: "Physics",
      topic: "Law of thermodynamics",
      instructor: "Thomas Shelby",
      startTime: "8:30 PM",
      date: "2024 February 13",
      meetingLink: "",
      status: false,
      id: 5,
    },
    {
      subject: "Space Science",
      topic: "Laws of space",
      instructor: "Stephen",
      startTime: "8:30 PM",
      date: "2024 February 14",
      meetingLink: "",
      status: false,
      id: 6,
    },
  ];

  const [selectedDate, setSelectedDate] = useState(new Date(Date.now()).toDateString());
  const [filteredclasses, setFilteredClasses] = useState([]);

  const handleJoinClass = () => { };

  const filterClasses = () => {
    if (!allClasses) return;
    const targetDate = new Date(selectedDate).toDateString();
    let arr = allClasses.filter((item) => new Date(item.startTime).toDateString() === targetDate);

    const lsUser = localStorage.getItem("tcauser");
    if (lsUser) {
      try {
        const user = JSON.parse(lsUser);
        if (user && user.userType === "teacher") {
          arr = arr.filter(item => {
            const tId = item.teacher?.id || item.teacher?._id || item.teacher?.teacherID?.id || item.teacher?.teacherID?._id || item.teacherId || item.teacherID;
            return tId === user.id || tId === user._id;
          });
        }
      } catch (e) {}
    }

    setFilteredClasses(arr);
  }

  useEffect(() => {
    filterClasses();
  }, [allClasses, selectedDate, classesIsPending])

  const EventComponet = ({ item }) => {
    const subjectName = item.subject?.name || "";
    const classroomName = item.classroom?.name || "";
    
    return (
      <div
        className={`flex flex-col  w-full text-xs border-l-2 gap-1 ${subjectName == "Physics"
          ? "border-l-[#0B1053] bg-maroon_100"
          : subjectName == "AI"
            ? "border-l-orange bg-orange_light"
            : subjectName == "Biology"
              ? "border-l-green bg-green/10"
              : "border-l-green bg-green/10"
          }  px-2 py-2 rounded-lg w-60`}
      >
        <div className="flex justify-between">
          <p>{subjectName}</p>
          <p>{classroomName}</p>
        </div>
        <div className="text-sm font-medium">
          <p>{item.title} </p>
        </div>

        {item?.status ? (
          <div className="flex items-center justify-between">
            <p className="text-[#0B1053]">class has started...</p>
            <div>
              <div
                onClick={handleJoinClass}
                className="flex items-center justify-center px-2 py-1 text-center cursor-pointer bg-[#0B1053] rounded-3xl"
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

            <p>{moment(item.startTime).format("hh:mm A")} - {moment(item.endTime).format("hh:mm A ")} </p>
          </div>
        )}
      </div>
    );
  };

  const CustomCalender = ({ setSelectedDateFromChild, selectedDateFromChild, classesArray }) => {

    const [selectedDate, setSelectedDate] = useState(dayjs());

    const [dateForEvent, setDateForEvent] = useState("");


    const renderDays = () => {
      const startOfMonth = selectedDate.startOf("month");
      const endOfMonth = selectedDate.endOf("month");

      const days = [];

      // Calculate the starting day of the week (0 = Sunday, 1 = Monday)
      let currentDay = startOfMonth.startOf("week");

      // Fill days for a complete 6-week grid (42 days)
      for (let i = 0; i < 42; i++) {
        days.push(currentDay);
        currentDay = currentDay.add(1, "day");
      }

      // Render days
      return days.map((day) => {
        const formattedDate = day.format("YYYY-MM-DD");
        const isCurrentMonth = day.month() === selectedDate.month();
        const isToday = day.isSame(new Date(), "day");

        const eventsForDay = classesArray
          ? classesArray.filter(
            (event) =>
              new Date(event.startTime).toDateString() ===
              new Date(formattedDate).toDateString()
          )
          : [];

        return (
          <div
            key={formattedDate}
            className={`text-center text-[12px] cursor-pointer hover:bg-gray-200 ${isToday ? "bg-grey/15 rounded-full text-[#0B1053] h-10 w-10" : "text-black"} ${!isCurrentMonth ? "text-gray-400" : ""}`}
            onClick={() => {
              setSelectedDate(day);
              setDateForEvent(formattedDate);
              setSelectedDateFromChild(formattedDate);
            }}
          >
            <div
              className={`flex flex-col w-10 h-10 items-center px-5 py-1 rounded-full ${!filterActive && selectedDateFromChild == formattedDate
                ? "bg-[#0B1053] text-white"
                : ""
                } ${filterActive &&
                  (new Date(formattedDate).toDateString() ===
                    new Date(filterStartDate).toDateString() ||
                    new Date(formattedDate).toDateString() ===
                    new Date(filterEndDate).toDateString())
                  ? "bg-[#0B1053] text-white"
                  : ""
                } group hover:bg-[#0B1053] hover:text-white`}
            >
              <div className="text-sm">{day.format("D")}</div>

              {eventsForDay.length > 0 && (
                <GoDotFill
                  size={10}
                  className="text-[#0B1053] group-hover:text-white"
                />
              )}
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
            <MdKeyboardArrowLeft className="" size={20} />
          </p>
          <h2 className="text-sm">{selectedDate.format("MMMM YYYY")}</h2>
          <p
            className=""
            onClick={() => setSelectedDate(selectedDate.add(1, "month"))}
          >
            <MdKeyboardArrowRight className="" size={20} />
          </p>
        </div>

        <div className="relative grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="px-3 font-semibold text-[10px]">
              {day}
            </div>
          ))}
          {renderDays()}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1 ">
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex">
          <p className="flex text-lg font-medium">Upcoming Classes</p>
        </div>
        <div className="flex flex-col gap-1 p-3 bg-white rounded-lg lg:flex-row">
          <div className="flex-1 p-2 ">
            <CustomCalender setSelectedDateFromChild={setSelectedDate} classesArray={allClasses} />
          </div>

          <div className="flex flex-col flex-1 gap-1">
            {filteredclasses && filteredclasses.length > 0 ? "" : "No Scheduled classes right now"}
            {filteredclasses && filteredclasses.map((item) => (
              <EventComponet item={item} key={item.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingClasses;

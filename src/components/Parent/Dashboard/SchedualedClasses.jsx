import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import meet from "../../../assets/meet.png";
import { FiClock, FiVideo } from "react-icons/fi";
import { GoDotFill } from "react-icons/go";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import moment from "moment";
import { useSidebar } from "../../../context/SidebarContext";
import { useParent } from "../../../context/ParentContext";
import { CalendarDays } from 'lucide-react';

const ScheduledClasses = ({ hideHeader }) => {
  const { allClasses, parentLogedIn, selectedChild, classesIsPending } = useParent();

  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [filteredClasses, setFilteredClasses] = useState([]);
  const { isSidebarOpen } = useSidebar();

  useEffect(() => {
    if (allClasses && allClasses.length > 0) {
      filterClasses();
    } else {
      setFilteredClasses([]);
    }
  }, [selectedDate, allClasses]);

  const filterClasses = () => {
    let filtered = (allClasses || []).filter((item) => {
      const classDate = item.startTime || item.startDate;
      return classDate && moment(classDate).format("YYYY-MM-DD") === selectedDate;
    });
    setFilteredClasses(filtered);
  };

  const EventComponent = ({ item }) => {
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
      const now = moment();
      const classStart = item.startTime || item.startDate;
      const classEnd = item.endTime || item.endDate;

      if (classStart && classEnd) {
        const eventStart = moment(classStart);
        const eventEnd = moment(classEnd);
        if (now.isBetween(eventStart, eventEnd)) {
          setIsStarted(true);
        }
      }
    }, [item]);

    const color = item.subject?.color || item.subjectID?.color || "#6A00FF";

    return (
      <div
        className="group relative flex flex-col w-full shrink-0 gap-2 py-4 px-3 sm:px-5 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
        style={{
          background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
          border: `1px solid ${color}30`,
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ backgroundColor: color }}
        />

        {isStarted && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: "#22c55e" }}
              />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[10px] font-semibold text-green-500 tracking-wide uppercase">Live</span>
          </div>
        )}

        <div className="flex justify-between items-center pl-1 sm:pl-3">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${color}25`, color: color }}
          >
            {item.subject?.name || item.subjectID?.name || "Subject"}
          </span>
          <span className=" parent mt-4 text-[11px] text-gray-400 font-medium">
            {item.teacher?.name || item.teacher?.teacherID?.name || "Teacher"}
          </span>
        </div>

        <div className="pl-1 sm:pl-3">
          <p className="text-sm font-semibold text-gray-800 leading-snug">{item.title}</p>
        </div>

        {isStarted ? (
          <div className="flex items-center justify-between pl-1 sm:pl-3 mt-1">
            <div className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
              <FiVideo size={13} />
              <span>Class is live now</span>
            </div>
            <a href={item?.meetingUrl} target="_blank" rel="noopener noreferrer">
              <button
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold text-white shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{ background: `linear-gradient(135deg, #22c55e, #16a34a)` }}
              >
                <img src={meet} alt="Join" className="w-6 h-2.5 object-contain brightness-0 invert" />
                Join class
              </button>
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-3 text-gray-400 text-xs">
            <FiClock size={12} style={{ color }} />
            <span className="font-medium" style={{ color }}>
              {moment(item.startTime || item.startDate).format("hh:mm a")}
            </span>
            <span className="text-gray-300">—</span>
            <span className="font-medium text-gray-500">
              {item.endTime || item.endDate ? moment(item.endTime || item.endDate).format("hh:mm a") : "—"}
            </span>
          </div>
        )}
      </div>
    );
  };

  const CustomCalendar = ({ setSelectedDateFromChild, classesArray }) => {
    const [calDate, setCalDate] = useState(dayjs());
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const today = dayjs().format("YYYY-MM-DD");

    const renderDays = () => {
      const startOfMonth = calDate.startOf("month");
      const endOfMonth = calDate.endOf("month");
      const startDayOfWeek = startOfMonth.day();
      const days = [];

      for (let i = 0; i < startDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} />);
      }

      let currentDay = startOfMonth;
      while (currentDay.isBefore(endOfMonth, "day") || currentDay.isSame(endOfMonth, "day")) {
        const formattedDate = currentDay.format("YYYY-MM-DD");
        const eventsForDay = classesArray ? classesArray.filter((event) => {
          const classDate = event.startTime || event.startDate;
          return classDate && moment(classDate).format("YYYY-MM-DD") === formattedDate;
        }) : [];
        const isToday = formattedDate === today;
        const isSelected = formattedDate === selectedDate;
        const dayRef = currentDay;

        days.push(
          <div
            key={formattedDate}
            onClick={() => {
              setCalDate(dayRef);
              setSelectedDateFromChild(formattedDate);
            }}
            className="flex flex-col items-center justify-center cursor-pointer group"
          >
            <div
              className={`
                relative flex flex-col items-center justify-center w-9 h-9 rounded-full text-xs font-semibold
                transition-all duration-200 select-none
                ${isSelected
                  ? "text-white shadow-lg scale-110"
                  : isToday
                    ? "border-2 text-[#0B1053]"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
              style={
                isSelected
                  ? { background: "linear-gradient(135deg, #6A00FF, #8B3DFF)" }
                  : isToday
                    ? { borderColor: "#6A00FF", color: "#6A00FF" }
                    : {}
              }
            >
              {currentDay.format("D")}
              {eventsForDay.length > 0 && (
                <span
                  className={`absolute -bottom-0.5 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-violet-500"}`}
                />
              )}
            </div>
          </div>
        );
        currentDay = currentDay.add(1, "day");
      }
      return days;
    };

    return (
      <div className="text-black w-full">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setCalDate(calDate.subtract(1, "month"))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
          >
            <MdKeyboardArrowLeft size={20} />
          </button>
          <h2 className="text-sm font-bold text-gray-800 tracking-wide">
            {calDate.format("MMMM YYYY")}
          </h2>
          <button
            onClick={() => setCalDate(calDate.add(1, "month"))}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-800"
          >
            <MdKeyboardArrowRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((d) => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {renderDays()}
        </div>
      </div>
    );
  };

  const selectedDayLabel = dayjs(selectedDate).format("dddd, D MMMM");
  const isToday = selectedDate === dayjs().format("YYYY-MM-DD");

  if (!parentLogedIn || !selectedChild) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <p className="text-gray-500 font-medium">Please select a child to view scheduled classes.</p>
      </div>
    );
  }

  if (classesIsPending) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <p className="text-gray-400 text-xs mt-3 font-medium">Loading classes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 gap-4">
        {!hideHeader && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CalendarDays className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-800 tracking-tight">
                  Scheduled Classes
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Upcoming learning sessions for {selectedChild.name}
                </p>
              </div>
            </div>
          </div>
        )}

        <div
          className={`flex flex-col lg:flex-row gap-0 bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 ${isSidebarOpen ? "-z-50" : "z-auto"}`}
        >
          <div className="flex-none lg:w-72 p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
            <div className="flex items-center gap-3 mb-5 text-[10px] text-gray-400 font-medium">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
                Has class
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full border-2 border-violet-500" />
                Today
              </div>
            </div>
            <CustomCalendar setSelectedDateFromChild={setSelectedDate} classesArray={allClasses} />
          </div>

          <div className="flex-1 flex flex-col p-3 sm:p-6 gap-4 min-h-[300px]">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-base font-bold text-gray-800">
                  {isToday ? "Today" : selectedDayLabel}
                </p>
                {isToday && (
                  <p className="text-xs text-gray-400">{selectedDayLabel}</p>
                )}
              </div>
              {filteredClasses.length > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-violet-50 text-violet-600 px-2.5 py-1 rounded-full border border-violet-100">
                  {filteredClasses.length} {filteredClasses.length === 1 ? "class" : "classes"}
                </span>
              )}
            </div>

            <div
              className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2"
              style={{
                maxHeight: "280px",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0,0,0,0.2) transparent",
              }}
            >
              {filteredClasses.length > 0 ? (
                filteredClasses.map((item) => <EventComponent item={item} key={item.id || item._id} />)
              ) : (
                <div className="flex flex-col flex-1 items-center justify-center py-10 gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <FiClock size={24} className="text-gray-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-500">No classes scheduled</p>
                    <p className="text-xs text-gray-400 mt-1">Enjoy your free day!</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduledClasses;

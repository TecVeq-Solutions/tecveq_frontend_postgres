import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import IMAGES from "../../../../../../assets/images";

import { FiClock } from "react-icons/fi";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { Calendar, SlidersHorizontal } from "lucide-react";
import moment from "moment";
import { useStudent } from "../../../../../../context/StudentContext";
import { getAllClasses } from "../../../../../../api/ForAllAPIs";
import { toast } from "react-toastify";
import useClickOutside from "../../../../../../hooks/useClickOutlise";

const FilterClassesModal = ({ addModalOpen, setaddModalOpen }) => {
  const { allClasses } = useStudent();
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterActive, setFilterActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const ref = useRef(null);
  useClickOutside(ref, () => setaddModalOpen(false));

  const filterClasses = () => {
    if (!allClasses) return;

    let arr = [];
    if (filterActive && filterStartDate && filterEndDate) {
      const start = moment(filterStartDate).startOf("day");
      const end = moment(filterEndDate).endOf("day");
      arr = allClasses.filter((item) => {
        const itemDate = moment(item.startTime);
        return itemDate.isBetween(start, end, null, "[]");
      });
    } else if (selectedDate) {
      const selected = moment(new Date(selectedDate)).startOf("day");
      arr = allClasses.filter((item) => {
        return moment(item.startTime).isSame(selected, "day");
      });
    }
    setFilteredClasses(arr);
  };

  useEffect(() => {
    if (!filterActive) {
      filterClasses();
    }
  }, [allClasses, selectedDate, filterActive]);

  const handleApplyFilters = async () => {
    if (!filterStartDate || !filterEndDate) {
      toast.warning("Please select both start and end dates");
      return;
    }

    setLoading(true);
    try {
      const response = await getAllClasses({
        startDate: filterStartDate,
        endDate: filterEndDate
      });

      if (response) {
        setFilteredClasses(response);
        setFilterActive(true);
      }
    } catch (error) {
      console.error("Error filtering classes:", error);
      toast.error("Failed to apply filters.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilterActive(false);
    setFilterStartDate("");
    setFilterEndDate("");
    filterClasses();
  };

  /* ── Event Card ── */
  const EventCard = ({ item }) => {
    const [isStarted, setIsStarted] = useState(false);

    useEffect(() => {
      let nowTime = new Date();
      let eventTime = new Date(item.startTime);
      let eventEndTime = new Date(item.endTime);

      if (
        eventTime.getMonth() == nowTime.getMonth() &&
        eventTime.getDate() == nowTime.getDate()
      ) {
        if (eventTime.getTime() < nowTime.getTime() && nowTime.getTime() < eventEndTime.getTime()) {
          setIsStarted(true);
        }
      }
    }, [item]);

    return (
      <div className="flex flex-col gap-2 px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all w-full">
        <div className="flex items-start gap-3 w-full">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={IMAGES.MathIcon}
              alt=""
              className="w-8 h-8 object-cover rounded-lg"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2 min-w-0">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-tight">
                  {item.subject?.name || item.subjectID?.name || "Subject"}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-tight">
                  {item.classroom?.name || "Class"}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {item.title || "No Title"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-gray-50">
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <Calendar size={11} className="text-indigo-400" />
                {moment(item.startTime).format("DD MMM YYYY")}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400">
                <FiClock size={11} className="text-indigo-400" />
                {moment(item.startTime).format("h:mm a")} –{" "}
                {moment(item.endTime).format("h:mm a")}
              </span>
            </div>
          </div>
        </div>

        {/* Live indicator and Join button */}
        {isStarted && (
          <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-50 w-full">
            <p className="text-emerald-500 font-semibold text-[11px] animate-pulse">
              Class has started...
            </p>
            <a href={item.meetLink} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center justify-center px-4 py-1.5 text-center cursor-pointer bg-[#6A00FF] rounded-full shadow-md hover:scale-105 hover:bg-[#5800D6] transition-all duration-200">
                <img src={IMAGES.meet} alt="" className="w-4 h-4 mr-1.5 invert" />
                <p className="text-white text-[10px] font-bold tracking-widest uppercase">Join</p>
              </div>
            </a>
          </div>
        )}
      </div>
    );
  };

  /* ── Calendar ── */
  const CustomCalendar = ({
    setSelectedDateFromChild,
    selectedDateFromChild,
    classesArray,
  }) => {
    const [currentMonth, setCurrentMonth] = useState(dayjs());

    const renderDays = () => {
      const startOfMonth = currentMonth.startOf("month");
      let currentDay = startOfMonth.startOf("week");
      const days = [];
      for (let i = 0; i < 42; i++) {
        days.push(currentDay);
        currentDay = currentDay.add(1, "day");
      }

      return days.map((day) => {
        const formattedDate = day.format("YYYY-MM-DD");
        const isCurrentMonth = day.month() === currentMonth.month();
        const isToday = day.isSame(new Date(), "day");

        const isSelected =
          !filterActive && dayjs(selectedDateFromChild).format("YYYY-MM-DD") === formattedDate;
        const isRangeEdge =
          filterActive &&
          (formattedDate === filterStartDate ||
            formattedDate === filterEndDate);

        const isInRange =
          filterActive &&
          filterStartDate &&
          filterEndDate &&
          day.isAfter(dayjs(filterStartDate)) &&
          day.isBefore(dayjs(filterEndDate));

        const hasEvents = classesArray?.some((event) =>
          dayjs(event.startTime).isSame(day, "day")
        );

        return (
          <div
            key={formattedDate}
            onClick={() => {
              if (!filterStartDate || (filterStartDate && filterEndDate)) {
                setFilterStartDate(formattedDate);
                setFilterEndDate("");
                setFilterActive(true);
              } else if (filterStartDate && !filterEndDate) {
                if (day.isBefore(dayjs(filterStartDate))) {
                  setFilterStartDate(formattedDate);
                } else {
                  setFilterEndDate(formattedDate);
                }
                setFilterActive(true);
              }
              setSelectedDateFromChild(day.toDate().toDateString());
              setCurrentMonth(day);
            }}
            className={`relative flex flex-col items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full cursor-pointer text-xs transition-all mx-auto
              ${isToday && !isSelected && !isRangeEdge ? "ring-2 ring-[#0B1053]/20 font-semibold" : ""}
              ${isSelected || isRangeEdge ? "bg-[#0B1053] text-white" : ""}
              ${isInRange ? "bg-indigo-50 text-[#0B1053]" : ""}
              ${!isCurrentMonth ? "text-gray-300" : isSelected || isRangeEdge ? "text-white" : "text-gray-700"}
              ${!isSelected && !isRangeEdge ? "hover:bg-gray-100" : ""}
            `}
          >
            <span>{day.format("D")}</span>
            {hasEvents && (
              <span
                className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected || isRangeEdge ? "bg-white" : "bg-[#0B1053]"}`}
              />
            )}
          </div>
        );
      });
    };

    return (
      <div>
        {/* Month Nav */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button
            onClick={() => setCurrentMonth((m) => m.subtract(1, "month"))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <MdKeyboardArrowLeft size={18} />
          </button>
          <p className="text-sm font-semibold text-gray-800">
            {currentMonth.format("MMMM YYYY")}
          </p>
          <button
            onClick={() => setCurrentMonth((m) => m.add(1, "month"))}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <MdKeyboardArrowRight size={18} />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <p
              key={d}
              className="text-center text-[10px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider py-1"
            >
              {d}
            </p>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-y-1">{renderDays()}</div>
      </div>
    );
  };

  return (
    <div
      ref={ref}
      className="absolute z-50 flex flex-col bg-white pb-6  rounded-2xl shadow-xl border border-gray-100 w-80 sm:w-96 right-0  overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300"
      style={{ maxHeight: "88vh" }}
    >
      {/* Header — always visible, never scrolls */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <SlidersHorizontal size={15} className="text-[#0B1053]" />
          </div>
          <span className="text-base font-semibold text-gray-800">
            Filter Classes
          </span>
        </div>
        <button
          onClick={() => setaddModalOpen(false)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <IoClose size={18} />
        </button>
      </div>

      {/* ── Scrollable body (calendar + filters + buttons + list)   overflow-y-auto ── */}
      <div className="flex flex-col gap-4 p-5 flex-1 custom-scrollbar">

        {/* Calendar */}
        <CustomCalendar
          classesArray={allClasses}
          selectedDateFromChild={selectedDate}
          setSelectedDateFromChild={setSelectedDate}
        />

        {/* Date Range Filter */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Date Range
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#0B1053] focus:ring-2 focus:ring-indigo-50 transition-all font-medium"
            />
            <span className="hidden sm:inline text-gray-400 text-sm font-medium shrink-0">→</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#0B1053] focus:ring-2 focus:ring-indigo-50 transition-all font-medium"
            />
          </div>
          {filterActive && (
            <button
              onClick={handleClearFilters}
              className="self-end text-[11px] text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2 mt-1"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1 border-b border-gray-50 pb-4">
          <button
            onClick={() => {
              handleClearFilters();
              setaddModalOpen(false);
            }}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyFilters}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0
              ${loading ? "bg-[#8b53ff] cursor-not-allowed shadow-none" : "bg-[#6A00FF] hover:bg-[#5800D6] shadow-purple-200"}`}
          >
            {loading ? "Applying..." : "Apply Filter"}
          </button>
        </div>

        {/* ── Classes List ── */}
        <div className="flex flex-col gap-3">
          {/* heading + badge — always visible */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">
              {filterActive ? "Filtered" : "Classes"}
            </p>
            {!loading && filteredClasses.length > 0 && (
              <span className="text-[10px] font-semibold bg-indigo-50 text-[#0B1053] px-2 py-0.5 rounded-full">
                {filteredClasses.length}{" "}
                {filteredClasses.length === 1 ? "class" : "classes"}
              </span>
            )}
          </div>

          {/* ── Scrollable classes container ── */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <p className="text-sm font-medium text-gray-500 animate-pulse">Finding classes...</p>
            </div>
          ) : filteredClasses.length > 0 ? (
            <div
              className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar"
              style={{ maxHeight: "15rem" }}
            >
              {filteredClasses.map((item, i) => (
                <EventCard item={item} key={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-5 gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Calendar size={22} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                No classes on this date
              </p>
              <p className="text-xs text-gray-300">Try selecting a different day or date range</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterClassesModal;

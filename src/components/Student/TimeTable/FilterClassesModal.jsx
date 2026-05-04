import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { FiClock } from "react-icons/fi";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { Calendar, SlidersHorizontal } from "lucide-react";
import moment from "moment";
import useClickOutside from "../../../hooks/useClickOutlise";

const FilterClassesModal = ({ setAddModalOpen, classData, isPending }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toDateString());
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterActive, setFilterActive] = useState(false);

  const filterClasses = () => {
    if (!classData) return setFilteredClasses([]);

    let arr;
    if (filterActive && filterStartDate && filterEndDate) {
      const start = dayjs(filterStartDate).startOf("day");
      const end = dayjs(filterEndDate).endOf("day");

      arr = classData.filter((item) => {
        const itemDate = dayjs(item.startTime);
        return (
          (itemDate.isSame(start) || itemDate.isAfter(start)) &&
          (itemDate.isSame(end) || itemDate.isBefore(end))
        );
      });
    } else {
      arr = classData.filter((item) =>
        dayjs(item.startTime).isSame(dayjs(selectedDate), "day")
      );
    }
    setFilteredClasses(arr);
  };

  useEffect(() => {
    filterClasses();
  }, [selectedDate, classData, filterActive]);

  const handleApplyFilters = () => {
    if (filterStartDate && filterEndDate) {
      setFilterActive(true);
    }
  };

  const handleClearFilters = () => {
    setFilterActive(false);
    setFilterStartDate("");
    setFilterEndDate("");
  };

  const ref = useRef(null);
  useClickOutside(ref, () => setAddModalOpen(false));

  /* ── Event Card ── */
  const EventCard = ({ item }) => (
    <div className="flex items-center gap-3 px-2 sm:px-4 py-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 overflow-hidden text-indigo-600 font-bold text-xs">
        {item.subject?.name?.charAt(0) || "S"}
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
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-50">
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
  );

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
          !filterActive && selectedDateFromChild === formattedDate;
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
              setSelectedDateFromChild(formattedDate);
              setCurrentMonth(day);
            }}
            className={`relative flex flex-col items-center justify-center w-9 h-9 rounded-full cursor-pointer text-xs transition-all mx-auto
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
                className={`absolute bottom-0.5 w-1 h-1 rounded-full ${isSelected || isRangeEdge ? "bg-white" : "bg-[#0B1053]"
                  }`}
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
              className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1"
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
      className="flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm overflow-hidden"
      style={{ maxHeight: "90vh" }}
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
          onClick={() => setAddModalOpen(false)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <IoClose size={18} />
        </button>
      </div>

      {/* ── Scrollable body (calendar + filters + buttons + list) ── */}
      <div className="flex flex-col gap-4 p-5 overflow-y-auto flex-1 custom-scrollbar">

        {/* Calendar */}
        <CustomCalendar
          classesArray={classData}
          selectedDateFromChild={selectedDate}
          setSelectedDateFromChild={setSelectedDate}
          filterActive={filterActive}
          filterStartDate={filterStartDate}
          filterEndDate={filterEndDate}
          setFilterStartDate={setFilterStartDate}
          setFilterEndDate={setFilterEndDate}
        />

        {/* Date Range Filter */}
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Date Range
          </p>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#0B1053] focus:ring-2 focus:ring-indigo-50 transition-all"
            />
            <span className="text-gray-400 text-sm font-medium shrink-0">→</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none focus:border-[#0B1053] focus:ring-2 focus:ring-indigo-50 transition-all"
            />
          </div>
          {filterActive && (
            <button
              onClick={handleClearFilters}
              className="self-end text-[11px] text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
            >
              Clear filter
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              handleClearFilters();
              setAddModalOpen(false);
            }}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleApplyFilters}
            className="flex-1 py-2.5 rounded-xl bg-[#6A00FF] hover:bg-[#5800D6] text-white text-sm font-semibold shadow-md shadow-purple-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            Apply Filter
          </button>
        </div>

        {/* ── Classes List ── */}
        <div className="flex flex-col gap-3">
          {/* heading + badge — always visible */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">
              {filterActive ? "Filtered" : "Classes"}
            </p>
            {filteredClasses.length > 0 && (
              <span className="text-[10px] font-semibold bg-indigo-50 text-[#0B1053] px-2 py-0.5 rounded-full">
                {filteredClasses.length}{" "}
                {filteredClasses.length === 1 ? "class" : "classes"}
              </span>
            )}
          </div>

          {/* ── Scrollable classes container ── */}
          {filteredClasses.length > 0 ? (
            <div
              className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar"
              style={{ maxHeight: "13.5rem" }}
            >
              {filteredClasses.map((item, i) => (
                <EventCard item={item} key={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Calendar size={22} className="text-gray-300" />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                No classes on this date
              </p>
              <p className="text-xs text-gray-300">Try selecting a different day</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterClassesModal;

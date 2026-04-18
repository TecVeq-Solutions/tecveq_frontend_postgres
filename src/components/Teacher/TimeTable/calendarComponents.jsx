import moment from "moment";
import IMAGES from "../../../assets/images";
import ViewEventDetailsModal from "./viewEventDetailsModal";
import { calculateDurationHours } from "../../../utils/timeUtils";
import { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import FilterButton from "./FilterButton";

export const CustomEvent = ({ event, setevents, refetch }) => {
  const [detailsModalOpen, setdetailsModalOpen] = useState(false);

  // Calculate event duration in hours for height scaling
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const durationHours = calculateDurationHours(startTime, endTime);
  const eventHeight = Math.max(100, durationHours * 100); // Minimum 100px, scale by 100px per hour

  console.log("current event is : ", event);

  const formatDate = (date) => {
    const latestDate = moment(new Date(date));
    if (latestDate.get("hours") == 0 && latestDate.get("minutes") == 1) {
      latestDate.set("minutes", 0);
    }

    return moment(latestDate).format("hh:mm a");
  };

  return (
    <div className="flex flex-1 w-full overflow-visible ">
      <ViewEventDetailsModal
        event={event}
        setevents={setevents}
        open={detailsModalOpen}
        refetch={refetch}
        setopen={setdetailsModalOpen}
      />
      <div
        className={`cursor-pointer rounded-lg w-full transition-all duration-200 hover:shadow-md hover:scale-[1.02] mb-1 ${event.teacher
          ? "bg-gradient-to-br from-[#c5c9fc] to-[#c5c9fc] text-[#0B1053] border border-[#0B1053] shadow-sm"
          : "bg-gradient-to-br from-[#c5c9fc] to-[#c5c9fc] text-[#0B1053] border border-[#0B1053] shadow-sm"
          }`}
        style={{ height: `${eventHeight - 4}px`, minHeight: `${eventHeight - 4}px` }}
        onClick={() => {
          return event.teacher?.name ? setdetailsModalOpen(true) : null;
        }}
      >
        <div className="flex flex-col h-full justify-start p-3 space-y-2">
          {/* Teacher name (not required)
          <div className="text-[11px] leading-tight">
            <span className="font-bold text-slate-800" style={{ textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>Teacher:</span>
            <div className="font-semibold text-slate-900 truncate mt-0.5" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}>
              {event.teacher ? event.teacher.teacherID.name : ""}
            </div>
          </div>
          */}
          <div className="text-[11px] leading-tight">
            <span className="font-bold text-slate-800" style={{ textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>Title:</span>
            <div className="font-semibold text-slate-900 truncate mt-0.5" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}>
              {event.title ? event.title : ""}
            </div>
          </div>
          <div className="text-[11px] leading-tight">
            <span className="font-bold text-slate-800" style={{ textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>Subject:</span>
            <div className="font-semibold text-slate-900 truncate mt-0.5" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}>
              {event.subject?.name ? event.subject.name : ""}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SideTime = (props) => {

  const times = props.slotMetrics.groups;

  return (
    <>
      <div className="flex flex-col w-[110px]">
        {times.map((time, index) => {
          const startTime = moment.utc(time[0]).tz("Asia/Karachi");
          // Calculate end time based on slot duration or use next slot start
          const endTime = index < times.length - 1
            ? moment.utc(times[index + 1][0]).tz("Asia/Karachi")
            : startTime.clone().add(1, "hour"); // Default to 1 hour for last slot

          return (
            <div
              key={`${time}2`}
              className="flex w-[110px] justify-center items-center border-b border-gray-200 py-2"
              style={{ height: '100px', minHeight: '100px' }}
            >
              <div className="text-center">
                <p className="text-[10px] text-grey font-medium">
                  {startTime.format("h:mm a")}
                </p>
                <p className="text-[8px] text-grey opacity-60">-</p>
                <p className="text-[10px] text-grey font-medium">
                  {endTime.format("h:mm a")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export const SideTimeHeader = (props) => {
  const times = props;
  return (
    <>
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-sm text-black/70 ">GTM +5</p>
      </div>
    </>
  );
};

export const Header = (props) => {
  const day = moment(props.date).format("dddd");
  const currentDate = moment(Date.now()).date();
  const currentMonth = moment(Date.now()).month();
  // console.log("current date is : ", currentDate);
  // console.log("current month is : ", currentMonth);

  const date = moment(props.date).date();
  const month = moment(props.date).month();

  return (
    <div
      className={`flex flex-col items-center justify-between flex-1 w-full font-normal h-fit ${currentDate === date && currentMonth === month
        ? "text-[#0B1053]"
        : "text-grey"
        } `}
    >
      <p className="text-lg text-center">{date}</p>
      <p className="text-sm text-start">{day}</p>
    </div>
  );
};

export const CustomToolbar = ({
  toolbar,
  setAddModalOpen,
  events,
  setevents,
  activeFilteredField,
  setactiveFilteredField,
  addScheduleModalOpen,
  setAddScheduleModalOpen,
  addModalOpen,
  loading,
}) => {
  //   const { currentUser } = useContext(AuthContext);

  const [fields, setfields] = useState([]);

  const goToBack = () => {
    toolbar.onNavigate("PREV");
  };
  const goToNext = () => {
    toolbar.onNavigate("NEXT");
  };
  const goToCurrent = () => {
    toolbar.onNavigate("TODAY");
  };

  //   const handleGetFields = () => {
  //     getFields({ id: currentUser?.id })
  //       .then((res) => {
  //         setfields(
  //           res.map((r) => {
  //             return {
  //               name: r.fieldName,
  //               value: r.id,
  //             };
  //           })
  //         );
  //       })
  //       .catch((err) => {});
  //   };

  useEffect(() => {
    // handleGetFields();
  }, []);

  return (
    <>
      <div className="flex flex-col lg:flex-row flex-wrap w-full items-center justify-start sm:justify-between gap-6 lg:gap-3 my-4">
        <div className="w-fit flex flex-1 justify-normal sm:justify-center">
          <div className="flex items-center justify-normal sm:justify-center w-full gap-2 lg:gap-1">
            {/* <button
              className="px-3 py-1 rounded-md bg-custom-light-1"
              onClick={goToCurrent}
            >
              Today
            </button> */}
            <button
              className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2 bg-white border border-grey/50 rounded-2xl"
              onClick={goToBack}
            >
              <MdKeyboardArrowLeft />
            </button>
            <p className="mx-2 text-lg sm:text-2xl lg:text-[14px] 2xl:text-[16px] font-semibold text-[#6A00FF]">
              {moment(Date.now()).format("MMMM DD YYYY")}
              <span className="ml-2 text-xs font-normal text-grey/70">Today</span>
            </p>
            <button
              className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2 bg-white border rounded-2xl border-grey/50"
              onClick={goToNext}
            >
              <MdKeyboardArrowRight />
            </button>
          </div>
        </div>
        <div className="flex flex-1 items-start gap-2 w-fit justify-normal sm:justify-center">
          <div className="flex flex-col justify-center items-center">
            <div className="flex text-xs justify-between py-2 px-9 w-fit lg:w-fit border-2 border-[#00000020] rounded-xl ">
              My Time Table
              {/* <FaChevronDown size={20} color="black" /> */}
            </div>
            <div className="py-1 text-xs text-black/70 w-[75%] hidden sm:block ">
              <p>See all your scheduled classes below!</p>
            </div>
          </div>


        </div>
        <div className="w-fit">

          <div className="flex flex-2 flex-row flex-wrap items-center justify-start sm:justify-center gap-2 sm:gap-6 lg:gap-2 mb-6 lg:mb-0">

            <div>
              <FilterButton
                className={"px-2 sm:px-4 py-1"}
                icon={true}
                text={"Filter Classes"}
                clickHandler={() => {
                  setAddModalOpen(!addModalOpen);
                }}
              />

            </div>
            <div>
              <FilterButton
                className={"px-2 sm:px-4 py-1"}
                text={"Schedule Classes"}
                clickHandler={() => {
                  setAddScheduleModalOpen(!addScheduleModalOpen);
                }}
              />

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

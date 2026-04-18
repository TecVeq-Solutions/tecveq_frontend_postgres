import IMAGES from "../../../assets/images";
import ViewEventDetailsModal from "./viewEventDetailsModal";
import moment from 'moment-timezone';
import { calculateDurationHours } from "../../../utils/timeUtils";
import { FaSearch } from "react-icons/fa";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { useAdmin } from "../../../context/AdminContext";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import FilterButton from "./FilterButton";
export const CustomEvent = ({ event, setevents, refetch, isRefetching }) => {
  const [detailsModalOpen, setdetailsModalOpen] = useState(false);

  // Calculate event duration in hours for height scaling
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  const durationHours = calculateDurationHours(startTime, endTime);
  const eventHeight = Math.max(100, durationHours * 100); // Minimum 100px, scale by 100px per hour

  return (
    <div className="relative flex flex-1 w-full">
      <ViewEventDetailsModal
        refetch={refetch}
        isRefetching={isRefetching}
        event={event}
        setevents={setevents}
        open={detailsModalOpen}
        setopen={setdetailsModalOpen}
      />

      <div
        className="cursor-pointer rounded-lg w-full transition-all duration-200 hover:shadow-md  text-[#0B1053] border-2 border-[#0B1053] mb-1 overflow-hidden"
        style={{ height: `${eventHeight - 4}px`, minHeight: `${eventHeight - 4}px` }}
        onClick={() => {
          console.log("Admin event clicked:", event);
          setdetailsModalOpen(true);
        }}
      >
        <div className="flex flex-col h-[20px] justify-start items-start p-1 space-y-1">
          <div className="text-[10px] leading-tight">
            <span className="font-normal text-slate-800" style={{ textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>T.Name:</span>
            <div className="font-normal text-slate-900 truncate" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}>
              {event?.teacher?.name ?? ""}
            </div>
          </div>
          <div className="text-[10px] leading-tight">
            <span className="font-bold text-slate-800" style={{ textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>Title:</span>
            <div className="font-semibold text-slate-900" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}>
              {event.title ? event.title : ""}
            </div>
          </div>
          <div className="text-[10px] leading-tight overflow-hidden">
            <span className="font-normal text-slate-800" style={{ textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>Subject:</span>
            <div className="font-normal text-slate-900 truncate" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.6)' }}>
              {event?.subject?.name ?? ""}
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};



export const SideTime = (props) => {
  const times = props.slotMetrics.groups;

  return (
    <div className="flex flex-col w-[110px]">
      {times.map((time, index) => {
        const startTime = moment.utc(time[0]).tz("Asia/Karachi");
        // Calculate end time based on slot duration or use next slot start
        const endTime = index < times.length - 1
          ? moment.utc(times[index + 1][0]).tz("Asia/Karachi")
          : startTime.clone().add(1, "hour"); // Default to 1 hour for last slot

        return (
          <div
            key={`${time}`}
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

  const date = moment(props.date).date();
  const month = moment(props.date).month();

  return (
    <div
      className={`flex flex-col items-center justify-between  font-normal ${currentDate === date && currentMonth === month
        ? "text-[#6A00FF]"
        : "text-grey"
        } `}
    >
      <p className="text-lg text-center">{date}</p>
      <p className="text-xs text-start">{day}</p>
    </div>
  );
};

export const CustomToolbar = (props) => {

  const {
    onTeacherSelect,
    setAddModalOpen,
    addModalOpen,
    addScheduleModalOpen,
    setAddScheduleModalOpen
  } = props;
  //   const { currentUser } = useContext(AuthContext);

  const [fields, setfields] = useState([]);
  const [teacherID, setTeacherID] = useState("")




  const goToBack = () => {
    props.onNavigate("PREV");
  };
  const goToNext = () => {
    props.onNavigate("NEXT");
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
  const { adminUsersData } = useAdmin();

  const handleTeacherChange = (e) => {
    const id = e.target.value;
    setTeacherID(id);
    onTeacherSelect(id); // Send to parent component
  };


  return (
    <>
      <div className="flex flex-col lg:flex-row flex-wrap w-full items-center justify-start sm:justify-between gap-6 lg:gap-3 my-4">
        <div className=" flex flex-1 justify-normal sm:justify-center">
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
              {moment.utc(Date.now()).format("DD MMMM, YYYY")}
              <span className="ml-2 text-lg lg:text-[10px] 2xl:text-[12px] font-normal text-grey/70">Today</span>
            </p>

            <button
              className="w-6 h-6 p-1 sm:w-8 sm:h-8 sm:p-2 bg-white border rounded-2xl border-grey/50"
              onClick={goToNext}
            >
              <MdKeyboardArrowRight />
            </button>
          </div>
        </div>
        <div className="flex flex-1 items-start gap-2 justify-normal sm:justify-center">
          {/* <div className="flex justify-between text-sm py-2 cursor-pointer px-2 w-36 border-[1.5px] border-[#00000020] rounded-xl ">
            Teacher <FaChevronDown size={16} color="black" />
          </div> */}
          <div className="">
            <div className="flex items-center gap-1 justify-between cursor-pointer py-2 text-sm px-3 w-48 border-[1.5px] border-[#00000020] rounded-xl ">
              <select className="outline-none w-full h-full cursor-pointer"
                onChange={handleTeacherChange}
              >
                <option value={""}>
                  Search Teacher
                </option>

                {adminUsersData?.allTeachers?.map((item) => (
                  <option key={JSON.stringify(item)} className="p-2" value={item.id}>{item?.name}</option>
                ))}
              </select>
            </div>
            {/* <div className=" text-lg md:text-auto py-1 mt-3 text-xs text-black/70 flex-wrap w-[75%]">
              <p>Selcet the time table you want to view</p>
            </div> */}
          </div>

        </div>
        <div className="flex flex-2 flex-row flex-wrap items-center justify-start sm:justify-center gap-2 sm:gap-6 lg:gap-2 mb-6 lg:mb-0">
          <FilterButton
            className={"px-2 sm:px-4 py-2 text-sm sm:text-base"}
            icon={true}
            text={"Filter Classes"}
            clickHandler={() => {
              setAddModalOpen(!addModalOpen);
            }}
          />
          <FilterButton
            className={"px-2 sm:px-4 py-2 text-sm sm:text-base"}
            text={"Schedule Classes"}
            clickHandler={() => {
              setAddScheduleModalOpen(!addScheduleModalOpen);
            }}
          />
        </div>
      </div>
    </>
  );
};

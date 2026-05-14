import moment from "moment";
import {
  Header,
  SideTime,
  CustomEvent,
  CustomToolbar,
  SideTimeHeader,
} from "./calendarComponents";
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useTeacher } from "../../../utils/TeacherProvider";
import FilterClassesModal from "./FilterClassesModal";
import SchedualClasses from "./SchedualClasses";
import { useQuery } from "@tanstack/react-query";
import { getAllClasses } from "../../../api/ForAllAPIs";

// import { useTeacher as useTeacherData } from "../../../utils/TeacherProvider";


const localizer = momentLocalizer(moment);

const MyCalendar = ({ data, isPending, refetch, isRefetching }) => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addScheduleModalOpen, setAddScheduleModalOpen] = useState(false);

  const { teacherID, updateTeacherID } = useTeacher();


  // Current date range state
  const dayRangeHeaderFormat = ({ start, end }, culture, local) =>
    local.format(start, "MMMM DD", culture) +
    " – " +
    local.format(
      end,
      local.eq(start, end, "month") ? "DD YYYY" : "MMMM DD YYYY",
      culture
    );
  const [currentWeek, setCurrentWeek] = useState({
    start: moment().startOf("day").toDate(),
    end: moment().endOf("day").toDate(),
  });

  const handleNavigate = (newDate) => {
    const startOfWeek = moment(newDate).startOf("day").toDate();
    const endOfWeek = moment(newDate).endOf("day").toDate();

    setCurrentWeek({
      start: startOfWeek,
      end: endOfWeek,
    });
  };

  useEffect(() => {
    if (!isPending && data) {
      setEvents((prevEvents) => {
        const newEvents = data.map((item) => ({
          ...item,
          start: new Date(item.startTime),
          end: new Date(item.endTime),
        }));

        // Only update if events have changed to avoid re-renders
        return JSON.stringify(prevEvents) === JSON.stringify(newEvents)
          ? prevEvents
          : newEvents;
      });
    }
  }, [isPending, data]);


  // Custom event renderer
  const renderCustomEvent = (e) => (
    <CustomEvent
      setEvents={setEvents}
      event={e.event}
      refetch={refetch}
      isRefetching={isRefetching}
    />
  );

  const handleTeacherID = (id) => {
    if (teacherID !== id) {
      updateTeacherID(id);
    }
  };


  // Custom toolbar renderer
  // const renderCustomToolbar = (toolbar) => (
  //   <CustomToolbar loading={loading} toolbar={toolbar} onTeacherSelect={handleTeacherID} />
  // );


  const [addEventModalOpen, setaddEventModalOpen] = useState(false);







  return (
    <div className="flex">


      <div className="">
        {
          addModalOpen && (
            <>

              <div className={`absolute top-0 right-0 flex-1 z-10 flex py-4 bg-white rounded-md shadow-sm shadow-grey/25`}>
                <FilterClassesModal
                  setaddModalOpen={setaddEventModalOpen}
                  classData={data}
                  addModalOpen={addModalOpen}
                  setAddModalOpen={setAddModalOpen}
                />
              </div>
            </>
          )
        }
      </div>

      <div>
        {addScheduleModalOpen && (
          <div
            className={`fixed inset-0 z-50 flex justify-center items-start p-4 sm:p-6 overflow-y-auto bg-black/30`}
            onClick={() => setAddScheduleModalOpen(false)} // click outside closes modal
          >
            <div
              className="bg-white rounded-md shadow-lg max-w-md w-full mt-16 overflow-y-auto max-h-[80vh]"
              onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            >
              <SchedualClasses
                refetch={refetch}
                addScheduleModalOpen={addScheduleModalOpen}
                setAddScheduleModalOpen={setAddScheduleModalOpen}
              />
            </div>
          </div>
        )}
      </div>

      {!isPending && (
        // overflow-y-auto scrollbar-hide
        <div className="w-full h-[700px] sm:h-[800px] lg:h-[calc(100vh-200px)] min-h-[500px] overflow-x-auto overflow-y-hidden border border-grey/20 rounded-lg relative">
          {isRefetching && (
            <div className="absolute top-0 left-0 right-0 z-50 flex justify-center">
              <div className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded-b-lg shadow-md animate-pulse font-bold">
                Updating Timetable...
              </div>
            </div>
          )}
          <Calendar
            style={{}}
            formats={{ dayRangeHeaderFormat }}
            min={new Date(0, 0, 0, 0, 0, 0)}
            max={new Date(0, 0, 0, 23, 59, 59)}
            onNavigate={handleNavigate}
            defaultView="week"
            views={{ week: true }}
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            className="w-full min-w-[900px] sm:min-w-full h-full"
            step={60}
            timeslots={1}
            components={{
              toolbar: (props) => <CustomToolbar
                {...props}
                onTeacherSelect={handleTeacherID}
                addModalOpen={addModalOpen}
                setAddModalOpen={setAddModalOpen}
                addScheduleModalOpen={addScheduleModalOpen}
                setAddScheduleModalOpen={setAddScheduleModalOpen}
              />,
              event: renderCustomEvent,
              timeGutterHeader: SideTimeHeader,
              timeGutterWrapper: SideTime,
              header: Header,
            }}
            dayLayoutAlgorithm="no-overlap"
          />
        </div>
      )}
    </div>
  );
};

export default MyCalendar;

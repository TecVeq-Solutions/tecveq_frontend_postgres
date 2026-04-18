import { useEffect, useState } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useTeacher as useTeacherData } from "../../../utils/TeacherProvider";

import {
  Header,
  SideTime,
  CustomEvent,
  CustomToolbar,
  SideTimeHeader,
} from "./calendarComponents";
import SchedualClasses from "./SchedualClasses";
import { useQuery } from "@tanstack/react-query";
import { getAllClasses } from "../../../api/ForAllAPIs";
import FilterClassesModal from "./FilterClassesModal";

const localizer = momentLocalizer(moment);

const MyCalendar = ({ data, isPending, refetch }) => {
  console.log(data, "events data is:");

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addScheduleModalOpen, setAddScheduleModalOpen] = useState(false);

  const [activeFilteredField, setActiveFilteredField] = useState(null);

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
    if (!isPending) {

      let allclassfilter = data?.map((item) => {
        let newdate = new Date(item?.startTime);
        // newdate.setHours(newdate.getHours() - 5); // Subtract 5 hours
        let end = new Date(item.endTime);
        // end.setHours(end.getHours() - 5);
        let returnobj = { ...item, end: end, start: newdate }
        return returnobj
      })

      console.log("all class filter is : ", allclassfilter);
      setEvents(allclassfilter);
    }
  }, [currentWeek, isPending, data]);


  const { teacherID, updateTeacherID } = useTeacherData();


  const { data: teacherData, isPending: isPendingTeacher, refetch: refetchTeacher, isRefetching } = useQuery({
    queryKey: ["timetable", teacherID], // Use teacherID in query key to avoid unnecessary refetches
    queryFn: () => getAllClasses(teacherID), // Fetch classes based on teacherID
    enabled: teacherID !== undefined, // Only fetch if teacherID is neither undefined nor null
  });

  const [addEventModalOpen, setaddEventModalOpen] = useState(false);




  return (
    <div className="flex">

      <div className="">
        {
          addModalOpen && (
            <>

              <div className={`absolute top-0 right-0 flex-1 z-10 flex py-4 bg-white rounded-md shadow-sm shadow-grey/25`}
              >
                <FilterClassesModal
                  setaddModalOpen={setaddEventModalOpen}
                  addModalOpen={addModalOpen}
                  classData={data}
                  setAddModalOpen={setAddModalOpen}
                />
              </div>
            </>
          )
        }
      </div>

      <div >
        {
          addScheduleModalOpen && (
            <>
              <div
                className={`absolute top-0 right-0 flex-1 z-10 flex py-4 bg-white rounded-md shadow-sm shadow-grey/25`}
              >
                <SchedualClasses
                  data={teacherData}
                  isPending={isPendingTeacher}
                  refetch={refetchTeacher}
                  addScheduleModalOpen={addScheduleModalOpen}
                  setAddScheduleModalOpen={setAddScheduleModalOpen}

                />
              </div>
            </>
          )
        }
      </div>
      <div className="w-full h-[700px] sm:h-[800px] lg:h-[calc(100vh-200px)] min-h-[500px] overflow-x-auto overflow-y-hidden border border-grey/20 rounded-lg">
        <Calendar
          style={{}}
          formats={{ dayRangeHeaderFormat }}
          min={new Date(0, 0, 0, 0, 0, 0)}
          max={new Date(0, 0, 0, 23, 59, 59)}
          view="week"
          views={{ week: true }}
          onView={() => { }}
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onNavigate={handleNavigate}
          className="w-full"
          dayLayoutAlgorithm="no-overlap"
        step={60}
        timeslots={1}
        components={{
          toolbar: (toolbar) => (
            <CustomToolbar
              loading={loading}
              activeFilteredField={activeFilteredField}
              setActiveFilteredField={setActiveFilteredField}
              setEvents={setEvents}
              addModalOpen={addModalOpen}
              setAddModalOpen={setAddModalOpen}
              addScheduleModalOpen={addScheduleModalOpen}
              setAddScheduleModalOpen={setAddScheduleModalOpen}
              toolbar={toolbar}
            />
          ),
          event: (eventProps) => (
            <CustomEvent setEvents={setEvents} event={eventProps.event} refetch={refetch} />
          ),
          timeGutterHeader: SideTimeHeader,
          timeGutterWrapper: SideTime,
          header: Header,
        }}
      />
      </div>
    </div>
  );
};

export default MyCalendar;

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import FilterClassesModal from "./components/FilterClassesModal";
import { useEffect, useMemo, useState } from "react";
import {
  Header,
  SideTime,
  CustomEvent,
  CustomToolbar,
  SideTimeHeader,
} from "./components/calendarComponents";
import { useQuery } from "@tanstack/react-query";
import { getAllClasses } from "../../../../../api/ForAllAPIs";
import { useUser } from "../../../../../context/UserContext";

const localizer = momentLocalizer(moment);

const MyCalendar = ({ data, isPending, refetch, isRefetching }) => {
  const { userData } = useUser()


  //console.log(userData, "userData");

  const [loading, setloading] = useState(false);
  const [addModalOpen, setaddModalOpen] = useState(false);
  const [activeFilteredField, setactiveFilteredField] = useState(null);

  const dayRangeHeaderFormat = ({ start, end }, culture, local) =>
    local.format(start, "MMMM DD", culture) +
    " – " +
    local.format(
      end,
      local.eq(start, end, "month") ? "DD YYYY" : "MMMM DD YYYY",
      culture
    );

  const [events, setEvents] = useState([]);

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

      let allclassfilter = data?.map((item) => {
        // let newdate = moment.utc(item.startTime);
        let newdate = new Date(item?.startTime);
        //console.log(moment.utc(item.startTime).toString());
        //console.log("ne date is : ", newdate);
        // let end = moment.utc(item.endTime);
        let end = new Date(item.endTime);
        let returnobj = { ...item, end: end, start: newdate }
        return returnobj
      }); // Remove subject filtering cuz backend already filters by classroom membership






      //console.log("all class filter is : ", allclassfilter);
      setEvents(allclassfilter);
    }
  }, [currentWeek, isPending, data]);






  return (
    <>
      {addModalOpen &&
        <FilterClassesModal
          addModalOpen={addModalOpen}
          setaddModalOpen={setaddModalOpen}
        />}
      {/* overflow-y-auto overflow-x-auto */}
      <div className="student-calendar w-full h-[800px] overflow-x-auto overflow-y-auto">
        <Calendar
          style={{}}
          formats={{
            dayRangeHeaderFormat,
          }}
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
          components={useMemo(() => ({
            toolbar: (toolbar) => (
              <CustomToolbar
                loading={isPending}
                activeFilteredField={activeFilteredField}
                setactiveFilteredField={setactiveFilteredField}
                events={data}
                setevents={setEvents}
                addModalOpen={addModalOpen}
                setaddModalOpen={setaddModalOpen}
                toolbar={toolbar}
              />
            ),
            event: (e) => {
              return <CustomEvent setevents={setEvents} event={e.event} />;
            },
            timeGutterHeader: SideTimeHeader,
            timeGutterWrapper: SideTime,
            header: Header,
          }), [isPending, activeFilteredField, data, addModalOpen])}
          dayLayoutAlgorithm={"no-overlap"}
        />
      </div>
    </>
  );
};


export default MyCalendar;

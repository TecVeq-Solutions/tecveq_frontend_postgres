import React from "react";
import Loader from "../../../utils/Loader";
import Card from "../../../components/Parent/Reports/Card";
import Navbar from "../../../components/Parent/Dashboard/Navbar";
import AttendanceTable from "../../../components/Parent/Reports/AttendanceTable";
import QuizAssignmentsTable from "../../../components/Parent/Reports/QuizAssignmentsTable";

import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useParent } from "../../../context/ParentContext";
import { getChildReport } from "../../../api/Parent/ParentApi";

const SubjectReport = () => {
  const location = useLocation();
  const { selectedChild } = useParent();

  // Dynamic Query Key based on location state
  const reportQuery = useQuery({
    queryKey: [
      "report",
      selectedChild?.id,
      location?.state?.classroom?.id,
      location?.state?.subject?.id,
      location?.state?.teacher?.id,
    ],
    queryFn: async () => {
      //console.log("selected child is : ", selectedChild);
      const results = await getChildReport(
        selectedChild.id,
        location?.state?.classroom?.id,
        location?.state?.subject?.id,
        location?.state?.teacher?.id
      );
      //console.log("report result is : ", results);
      return results;
    },
    // Enable query only when location.state exists
    enabled: !!location.state,
    staleTime: 30000, // Cache for 30 seconds
  });

  //console.log("query data is : ", reportQuery.data);

  // Process attendance data for dynamic stats
  const processedAttendance = React.useMemo(() => {
    const rawData = reportQuery?.data?.attendance || [];
    const seenDates = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    rawData.forEach(item => {
      const itemDate = new Date(item.startTime || item.date);
      itemDate.setHours(0, 0, 0, 0);
      const status = item?.isPresent ? (item?.late ? "Late" : "Present") : "Absent";
      
      // Filter out future absent records
      if (itemDate > today && status === 'Absent') return;

      const dateKey = itemDate.toDateString();
      const existing = seenDates.get(dateKey);
      const isPlaceholder = (time) => {
        if (!time) return true;
        const d = new Date(time);
        return d.getHours() === 5 && d.getMinutes() === 0;
      };
      const currentIsPlaceholder = isPlaceholder(item.startTime);
      if (!existing || (isPlaceholder(existing.startTime) && !currentIsPlaceholder)) {
        seenDates.set(dateKey, item);
      }
    });
    return Array.from(seenDates.values());
  }, [reportQuery?.data?.attendance]);

  const attendanceStats = React.useMemo(() => {
    const total = processedAttendance.length;
    const present = processedAttendance.filter(item => item.isPresent).length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, percentage };
  }, [processedAttendance]);

  const stats = [
    {
      type: "Assignments",
      percentage: parseInt(reportQuery?.data?.averageAssignmentMarks?.percentage) || 0,
      grade: reportQuery?.data?.averageAssignmentMarks?.grade ? `Grade ${reportQuery?.data?.averageAssignmentMarks?.grade}` : "—",
    },
    {
      type: "Quizzes",
      percentage: parseInt(reportQuery?.data?.averageQuizMarks?.percentage) || 0,
      grade: reportQuery?.data?.averageQuizMarks?.grade ? `Grade ${reportQuery?.data?.averageQuizMarks?.grade}` : "—",
    },
    {
      type: "Attendance",
      percentage: attendanceStats.percentage,
      grade: "",
    },
  ];

  return reportQuery.isPending ? (
    <div className="flex">
      <Loader />
    </div>
  ) : (
    <>
      <div className="flex flex-1 bg-[#F9F9F9] font-poppins">
        <div className="flex flex-1">
          <div className="flex-grow w-full px-2 lg:px-5 sm:px-10 lg:ml-80">
            <div className="lg:pt-16 ">
              <Navbar heading={"Subject Reports"} />
              <div className="mt-7">
                <div className="flex flex-col gap-2">
                  <p className="md:text-[20px]">Overview</p>
                  <div className="flex flex-col items-center flex-1 gap-2 sm:flex-row">
                    {stats.map((data, index) => (
                      <Card
                        key={index}
                        percentage={data.percentage}
                        data={data.type}
                        grade={data.grade}
                        type={"Percentage"}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <div className="flex flex-col gap-2">
                  <p className="md:text-[20px]">Assignments</p>
                  <div className="flex flex-row items-center gap-2">
                    <QuizAssignmentsTable data={reportQuery?.data?.assignments} />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <div className="flex flex-col gap-2">
                  <p className="md:text-[20px]">Quizzes</p>
                  <div className="flex flex-row items-center gap-2">
                    <QuizAssignmentsTable data={reportQuery?.data?.quizes} />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <div className="flex flex-col gap-2">
                  <p className="md:text-[20px]">
                    Attendance <span className="text-xs">{attendanceStats.present}/{attendanceStats.total} days present</span>{" "}
                  </p>
                  <div className="flex flex-row items-center gap-2">
                    <AttendanceTable data={reportQuery?.data?.attendance} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubjectReport;

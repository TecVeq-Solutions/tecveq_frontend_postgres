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
      percentage: parseInt(reportQuery?.data?.avgAttendancePer) || 0,
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
                    Attendance <span className="text-xs">10/12 days present</span>{" "}
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

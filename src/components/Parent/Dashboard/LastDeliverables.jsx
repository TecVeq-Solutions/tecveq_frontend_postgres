import { Circle } from "rc-progress";
import React, { useEffect, useState } from "react";
import { useParent } from "../../../context/ParentContext";
import { useQuery } from "@tanstack/react-query";
import {
  getAllSubjects,
  getChildLastDeliveredAssignmentReport,
} from "../../../api/Parent/ParentApi";
import { useSidebar } from "../../../context/SidebarContext";

const LastDeliverables = () => {
  const [enableQuery, setEnableQuery] = useState(false);

  const { allSubjects, setAllSubjects, selectedChild } = useParent();
  const { isSidebarOpen } = useSidebar();

  const subjectQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const results = await getAllSubjects(selectedChild?.id);
      setAllSubjects(results);
      return results;
    },
    staleTime: 300000,
    enabled: enableQuery,
  });

  useEffect(() => {
    if (allSubjects.length == 0) {
      setEnableQuery(true);
    }
  }, []);

  const lastDeliveredAssignmentreportQuery = useQuery({
    queryKey: ["report", selectedChild?.id],
    queryFn: async () => {
      const results = await getChildLastDeliveredAssignmentReport(selectedChild?.id);
      return results;
    },
    enabled: !!selectedChild?.id,
    retry: false,
    staleTime: 60000,
  });

  const lastAssignment = lastDeliveredAssignmentreportQuery?.data?.lastAssignment || {};
  const percentage = parseFloat(lastAssignment.percentage) || 0;
  const grade = lastAssignment.grade ? `${lastAssignment.grade}` : "N/A";
  const title = lastAssignment.title ? `${lastAssignment.title}` : "N/A";

  const stats = { type: "Assignments", title, percentage, grade };

  const gradeColor = (g) => {
    if (g === "A" || g === "A+") return { bg: "#e8fdf0", text: "#16a34a", ring: "#16a34a" };
    if (g === "B" || g === "B+") return { bg: "#eff6ff", text: "#2563eb", ring: "#2563eb" };
    if (g === "C" || g === "C+") return { bg: "#fefce8", text: "#ca8a04", ring: "#ca8a04" };
    if (g === "D")               return { bg: "#fff7ed", text: "#ea580c", ring: "#ea580c" };
    if (g === "F")               return { bg: "#fef2f2", text: "#dc2626", ring: "#dc2626" };
    return { bg: "#eef2ff", text: "#0B1053", ring: "#007EEA" };
  };

  const gc = gradeColor(grade);

  const DeliverableComponent = () => (
    <div className="flex flex-col items-center justify-center flex-1 gap-2 py-2">
      {/* Circle smaller on mobile */}
      <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32">
        <Circle
          percent={stats.percentage}
          strokeColor={{ "0%": "#007EEA", "100%": "#0B1053" }}
          strokeWidth={10}
          trailColor="#eef2ff"
          trailWidth={10}
        />
        <div className={`absolute inset-0 flex flex-col items-center justify-center ${isSidebarOpen ? "-z-50" : "z-auto"}`}>
          <span className="text-[9px] text-[#64748b] font-medium">Score</span>
          <span className="text-base sm:text-lg font-bold text-[#0B1053] leading-tight">
            {stats.percentage}%
          </span>
        </div>
      </div>
      <p className="text-[10px] font-semibold text-[#64748b] tracking-wide uppercase">Percentage</p>
    </div>
  );

  const CustomGradeComponent = () => (
    <div className="flex flex-col items-center justify-center flex-1 gap-2 py-2">
      <div
        className="flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 transition-all duration-300"
        style={{ background: gc.bg, borderColor: gc.ring, boxShadow: `0 0 0 6px ${gc.bg}` }}
      >
        <span className="text-3xl sm:text-4xl font-black" style={{ color: gc.text }}>
          {stats.grade}
        </span>
        <span className="text-[9px] font-semibold uppercase tracking-widest mt-0.5" style={{ color: gc.text }}>
          Grade
        </span>
      </div>
      <p className="text-[10px] font-semibold text-[#64748b] tracking-wide uppercase">Average Grade</p>
    </div>
  );

  return (
    <div className={`flex w-full ${isSidebarOpen ? "-z-50" : "z-auto"}`}>
      <div className="flex flex-col flex-1 gap-3">

        {/* Section Header */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full"
            style={{ background: "linear-gradient(180deg, #007EEA, #0B1053)" }} />
          <p className="text-lg font-semibold text-[#0B1053] tracking-tight">Last Deliverable</p>
        </div>

        {/* Card */}
        <div
          className="flex flex-col gap-3 sm:gap-4 px-3 sm:px-5 py-4 sm:py-5 bg-white rounded-2xl"
          style={{ boxShadow: "0 4px 24px rgba(11,16,83,0.08), 0 1px 4px rgba(0,126,234,0.06)" }}
        >
          {/* Assignment Tag */}
          <div className="flex items-center gap-2 pb-3 border-b border-[#f1f4ff]">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #007EEA, #0B1053)" }}
            >
              {stats.type}
            </span>
            {/* truncate on mobile so it doesn't overflow */}
            <p className="text-xs sm:text-sm font-semibold text-[#1a1a2e] truncate min-w-0">
              {stats.title}
            </p>
          </div>

          {/* Stats Row — horizontal on all sizes, shrink gracefully */}
          <div className="flex flex-row flex-1 gap-2 sm:gap-4 items-center justify-center py-1 sm:py-0">
            <div className="flex-1 flex flex-col items-center">
              <CustomGradeComponent />
            </div>
            {/* Vertical divider */}
            <div className="w-px self-stretch bg-[#f1f4ff]" />
            <div className="flex-1 flex flex-col items-center">
              <DeliverableComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastDeliverables;
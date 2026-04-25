import { Circle } from "rc-progress";
import React, { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { FaAngleDown } from "react-icons/fa6";
import { useParent } from "../../../context/ParentContext";
import { useGetAllSubjectAttendence } from "../../../api/Parent/OverallAttendenceApi";

const Attendance = () => {
  const { selectedChild } = useParent();
  const { studentAllSubjectsAttendence } = useGetAllSubjectAttendence(selectedChild?.id);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (studentAllSubjectsAttendence) {
      setIsLoading(false);
    }
  }, [studentAllSubjectsAttendence]);

  const chartData = [
    { label: "Present", value: 1 },
    { label: "Absent",  value: 1 },
    { label: "Leave",   value: 1 },
  ];

  const hasData =
    studentAllSubjectsAttendence &&
    studentAllSubjectsAttendence.length > 0 &&
    studentAllSubjectsAttendence.some((data) => data.value > 0);

  const doughnutData = {
    labels: hasData
      ? studentAllSubjectsAttendence.map((d) => d.label)
      : chartData.map((d) => d.label),
    datasets: [
      {
        label: "Count",
        data: hasData
          ? studentAllSubjectsAttendence.map((d) => d.value)
          : chartData.map((d) => d.value),
        backgroundColor: ["#11AF03", "#C53F3F", "#EAECF0"],
        borderColor:     ["#ffffff",  "#ffffff",  "#ffffff"],
        borderWidth: 3,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}` },
        backgroundColor: "#0B1053",
        titleColor: "#fff",
        bodyColor: "#c7cafd",
        padding: 10,
        cornerRadius: 8,
      },
    },
  };

  const legendItems = hasData
    ? studentAllSubjectsAttendence.map((d, i) => ({
        label: d.label,
        value: d.value,
        color: ["#11AF03", "#C53F3F", "#EAECF0"][i] || "#ccc",
      }))
    : chartData.map((d, i) => ({
        label: d.label,
        value: d.value,
        color: ["#11AF03", "#C53F3F", "#EAECF0"][i],
      }));

  const total = hasData
    ? studentAllSubjectsAttendence.reduce((a, b) => a + (b.value || 0), 0)
    : null;

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 gap-3">

        {/* Section Header */}
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded-full"
            style={{ background: "linear-gradient(180deg, #007EEA, #0B1053)" }} />
          <p className="text-lg font-semibold text-[#0B1053] tracking-tight">Attendance</p>
        </div>

        {/* Card */}
        <div
          className="flex flex-col gap-3 sm:gap-4 px-3 sm:px-5 py-4 sm:py-5 bg-white rounded-2xl"
          style={{ boxShadow: "0 4px 24px rgba(11,16,83,0.08), 0 1px 4px rgba(0,126,234,0.06)" }}
        >
          {/* Filter Row */}
          <div className="flex items-center justify-between pb-3 border-b border-[#f1f4ff]">
            <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">Overview</p>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#0B1053] hover:border-[#007EEA] hover:bg-[#f0f7ff] transition-all duration-200">
              Overall <FaAngleDown className="text-[#007EEA]" />
            </button>
          </div>

          {/* Chart + Legend — row on all sizes, tighter on mobile */}
          <div className="flex flex-row items-center gap-3 sm:gap-6 py-1 sm:py-2">

            {/* Doughnut — smaller on mobile */}
            <div className="relative flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44">
              {isLoading ? (
                <div className="w-full h-full rounded-full bg-[#eef2ff] animate-pulse flex items-center justify-center">
                  <span className="text-[10px] text-[#64748b]">Loading…</span>
                </div>
              ) : (
                <>
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] text-[#64748b] font-medium">Total</span>
                    <span className="text-xl sm:text-2xl font-black text-[#0B1053]">
                      {total ?? "—"}
                    </span>
                    <span className="text-[9px] text-[#64748b]">Classes</span>
                  </div>
                </>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2 sm:gap-3 flex-1 min-w-0">
              {legendItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="text-xs sm:text-sm font-medium text-[#1a1a2e] truncate">
                      {item.label}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#0B1053] ml-1 flex-shrink-0">
                      {item.value}
                    </span>
                  </div>
                </div>
              ))}

              {/* Mini progress bars */}
              {hasData && (
                <div className="mt-1 flex flex-col gap-1.5 sm:gap-2">
                  {legendItems.map((item, i) => {
                    const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                    return (
                      <div key={i} className="w-full h-1.5 rounded-full bg-[#eef2ff] overflow-hidden">
                        <div
                          style={{
                            width: `${pct}%`,
                            backgroundColor: item.color,
                            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                          }}
                          className="h-full rounded-full"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
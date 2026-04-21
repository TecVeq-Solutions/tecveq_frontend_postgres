import React, { useState, useEffect } from "react";
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
        { label: "Absent", value: 1 },
        { label: "Leave", value: 1 },
    ];

    const hasData =
        studentAllSubjectsAttendence &&
        studentAllSubjectsAttendence.length > 0 &&
        studentAllSubjectsAttendence.some((data) => data.value > 0);

    const doughnutData = {
        labels: hasData
            ? studentAllSubjectsAttendence.map((data) => data.label)
            : chartData.map((data) => data.label),
        datasets: [
            {
                label: "Count",
                data: hasData
                    ? studentAllSubjectsAttendence.map((data) => data.value)
                    : chartData.map((data) => data.value),
                backgroundColor: ["#11AF03", "#C53F3F", "#EAECF0"],
                borderColor: ["#ffffff", "#ffffff", "#ffffff"],
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
                callbacks: {
                    label: (ctx) => ` ${ctx.label}: ${ctx.raw}`,
                },
                backgroundColor: "#0B1053",
                titleColor: "#fff",
                bodyColor: "#c7cafd",
                padding: 10,
                cornerRadius: 8,
            },
        },
    };

    // Legend items
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

    return (
        <div className="flex flex-1">
            <div className="flex flex-col flex-1 gap-3">

                {/* Section Header */}
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(180deg, #007EEA, #0B1053)" }} />
                    <p className="text-lg font-semibold text-[#0B1053] tracking-tight">Attendance</p>
                </div>

                {/* Card */}
                <div
                    className="flex flex-col gap-4 px-5 py-5 bg-white rounded-2xl"
                    style={{ boxShadow: "0 4px 24px rgba(11,16,83,0.08), 0 1px 4px rgba(0,126,234,0.06)" }}
                >
                    {/* Filter Row */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#f1f4ff]">
                        <p className="text-xs font-semibold text-[#64748b] uppercase tracking-widest">Overview</p>
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#e2e8f0] text-xs font-semibold text-[#0B1053] hover:border-[#007EEA] hover:bg-[#f0f7ff] transition-all duration-200">
                            Overall <FaAngleDown className="text-[#007EEA]" />
                        </button>
                    </div>

                    {/* Chart + Legend */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                        {/* Doughnut */}
                        <div className="relative flex-shrink-0 w-44 h-44">
                            {isLoading ? (
                                <div className="w-full h-full rounded-full bg-[#eef2ff] animate-pulse flex items-center justify-center">
                                    <span className="text-xs text-[#64748b]">Loading…</span>
                                </div>
                            ) : (
                                <>
                                    <Doughnut data={doughnutData} options={doughnutOptions} />
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-[10px] text-[#64748b] font-medium">Total</span>
                                        <span className="text-2xl font-black text-[#0B1053]">
                                            {hasData
                                                ? studentAllSubjectsAttendence.reduce((a, b) => a + (b.value || 0), 0)
                                                : "—"}
                                        </span>
                                        <span className="text-[10px] text-[#64748b]">Classes</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-col gap-3 flex-1 w-full">
                            {legendItems.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <div className="flex flex-1 items-center justify-between">
                                        <span className="text-sm font-medium text-[#1a1a2e]">{item.label}</span>
                                        <span className="text-sm font-bold text-[#0B1053]">{item.value}</span>
                                    </div>
                                </div>
                            ))}

                            {/* Mini progress bars per type */}
                            {hasData && (
                                <div className="mt-2 flex flex-col gap-2">
                                    {legendItems.map((item, i) => {
                                        const total = legendItems.reduce((a, b) => a + b.value, 0);
                                        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                                        return (
                                            <div key={i}>
                                                <div className="w-full h-1.5 rounded-full bg-[#eef2ff] overflow-hidden">
                                                    <div
                                                        style={{
                                                            width: `${pct}%`,
                                                            backgroundColor: item.color,
                                                            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                                                        }}
                                                        className="h-full rounded-full"
                                                    />
                                                </div>
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
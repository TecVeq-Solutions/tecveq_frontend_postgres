import React, { useState } from "react";
import TeacherMessageDialog from "./TeacherMessageDialog";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../../context/UserContext";
import { useStudent } from "../../../context/StudentContext";
import { getAllSubjects } from "../../../api/Student/Subjects";
import Loader from "../../../utils/Loader";

const AttendanceBar = ({ percent }) => {
  const value = parseFloat(percent) || 0;
  const isHigh = value >= 75;
  const isMid = value >= 50 && value < 75;

  const color = isHigh
    ? { bar: "#22c55e", glow: "rgba(34,197,94,0.25)", text: "#16a34a", bg: "rgba(34,197,94,0.1)" }
    : isMid
      ? { bar: "#f59e0b", glow: "rgba(245,158,11,0.25)", text: "#d97706", bg: "rgba(245,158,11,0.1)" }
      : { bar: "#ef4444", glow: "rgba(239,68,68,0.25)", text: "#dc2626", bg: "rgba(239,68,68,0.1)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: color.text,
            background: color.bg,
            padding: "2px 8px",
            borderRadius: "20px",
            letterSpacing: "0.03em",
          }}
        >
          {value}%
        </span>
      </div>
      <div
        style={{
          width: "100%",
          height: "6px",
          background: "rgba(0,0,0,0.06)",
          borderRadius: "99px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: color.bar,
            borderRadius: "99px",
            boxShadow: `0 0 8px ${color.glow}`,
            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </div>
    </div>
  );
};

const TeacherButton = ({ name, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "11.5px",
      fontWeight: 600,
      color: "#2563eb",
      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      border: "1px solid rgba(37,99,235,0.15)",
      borderRadius: "20px",
      padding: "5px 12px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      fontFamily: "inherit",
      letterSpacing: "0.01em",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)";
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(37,99,235,0.15)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)";
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
    {name}
  </button>
);

const SubjectAvatar = ({ name, index }) => {
  const colors = [
    { bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { bg: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { bg: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { bg: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" },
  ];
  const color = colors[index % colors.length];
  const initials = (name || "S").substring(0, 2).toUpperCase();

  return (
    <div
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "10px",
        background: color.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        letterSpacing: "0.05em",
      }}
    >
      {initials}
    </div>
  );
};

const SubjectsEnrolled = () => {
  const [popup, setPopup] = useState(false);
  const [clickedItem, setClickedItem] = useState(null);

  const { userData } = useUser();
  const { setAllSubjects, studentLogedIn } = useStudent();

  const toggleClickTeacher = (item) => {
    setPopup(!popup);
    setClickedItem(item);
  };

  const handleFeedback = () => {
    toggleClickTeacher();
  };

  const subjectQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const results = await getAllSubjects(userData.id);
      setAllSubjects(results);
      return results;
    },
    refetchInterval: 10000,
    enabled: studentLogedIn,
  });

  const filteredSubjects = subjectQuery?.data?.subjects || subjectQuery?.data || [];

  return (
    <div style={{ display: "flex", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "16px", minWidth: 0 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="gap-[5px] sm:gap-[10px]" style={{ display: "flex", alignItems: "center", }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0B1053 0%, #2563eb 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(11,16,83,0.3)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <p className=" text-lg sm:text-xl font-semibold tracking-tight text-gray-800" >
                Subjects Enrolled
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", fontWeight: 400, lineHeight: 1 }}>
                Your academic subjects
              </p>
            </div>
          </div>
          {filteredSubjects.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "linear-gradient(135deg, #0B1053 0%, #2563eb 100%)",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 14px",
                borderRadius: "20px",
                boxShadow: "0 4px 12px rgba(11,16,83,0.25)",
                letterSpacing: "0.01em",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
              </svg>
              {filteredSubjects.length} Subject{filteredSubjects.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: "20px",
            border: "1px solid rgba(0,0,0,0.07)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            boxShadow: "0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          {/* Unified Scroll Container for Mobile & Desktop */}
          <div
            className="overflow-auto pr-1"
            style={{
              maxHeight: "340px",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,0,0,0.2) transparent",
            }}
          >
            <div style={{ minWidth: "500px", width: "100%" }}>
              {/* Table Header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr 1fr 1fr",
                  padding: "14px 20px",
                  background: "linear-gradient(135deg, #0B1053 0%, #1e3a8a 50%, #2563eb 100%)",
                  gap: "8px",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  overflow: "hidden",
                }}
              >
                {/* Decorative dots */}
                <div style={{
                  position: "absolute", top: "-20px", right: "-20px",
                  width: "80px", height: "80px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.05)",
                }} />
                <div style={{
                  position: "absolute", bottom: "-30px", right: "80px",
                  width: "60px", height: "60px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.04)",
                }} />
                {[
                  { label: "#", align: "left" },
                  { label: "Subject", align: "center" },
                  { label: "Instructor", align: "center" },
                  { label: "Attendance", align: "center" },
                ].map(({ label, align }) => (
                  <div
                    key={label}
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.55)",
                      textAlign: align,
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Body */}
            {subjectQuery.isPending ? (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "48px 0" }}>
                <Loader />
              </div>
            ) : filteredSubjects.length > 0 ? (
              filteredSubjects.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "44px 1fr 1fr 1fr",
                    padding: "14px 20px",
                    borderTop: "1px solid rgba(0,0,0,0.045)",
                    alignItems: "center",
                    gap: "8px",
                    transition: "background 0.15s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,0.025)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {/* Sr No with Avatar */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <SubjectAvatar name={item?.subject?.name || item?.name} index={index} />
                  </div>

                  {/* Subject Name */}
                  <div style={{ textAlign: "center" }}>
                    <span
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "#1e293b",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {item?.subject?.name || item?.name}
                    </span>
                    <div style={{ fontSize: "10px", color: "#94a3b8", marginTop: "2px", fontWeight: 500 }}>
                      #{String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* Instructor */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <TeacherButton
                      name={item.teacher}
                      onClick={() => toggleClickTeacher(item)}
                    />
                  </div>

                  {/* Attendance */}
                  <div style={{ display: "flex", justifyContent: "center", paddingLeft: "4px", paddingRight: "4px" }}>
                    <div style={{ width: "100%" }}>
                      <AttendanceBar percent={item.avgAttendancePer} />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "52px 0", gap: "12px" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 600, color: "#475569" }}>
                    No subjects yet
                  </p>
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                    Admin has not enrolled subjects yet.
                  </p>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* Footer Stats Bar */}
          {filteredSubjects.length > 0 && (
            <div
              style={{
                borderTop: "1px solid rgba(0,0,0,0.06)",
                padding: "10px 20px",
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
                Showing all {filteredSubjects.length} enrolled subjects
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {[
                  { label: "Good", color: "#22c55e", bg: "rgba(34,197,94,0.1)" },
                  { label: "Average", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
                  { label: "Low", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
                ].map(({ label, color, bg }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
                    <span style={{ fontSize: "10px", color: "#94a3b8", fontWeight: 500 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {popup && (
          <TeacherMessageDialog handleFeedback={handleFeedback} item={clickedItem} />
        )}
      </div>
    </div>
  );
};

export default SubjectsEnrolled;
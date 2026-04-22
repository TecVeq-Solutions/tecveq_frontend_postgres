import React, { useState } from "react";
import { useTeacher } from "../../../context/TeacherContext";
import Loader from "../../../utils/Loader";

// ─── Mock data for preview ───────────────────────────────────────────────────
const MOCK_CLASSROOMS = [
  { subject: "Maths", name: "Class 10-A", classes: Array(12), students: Array(34) },
  { subject: "Chemistry", name: "Class 11-B", classes: Array(8), students: Array(28) },
  { subject: "Maths", name: "Class 9-C", classes: Array(15), students: Array(40) },
  { subject: "Chemistry", name: "Class 12-A", classes: Array(6), students: Array(22) },
];

// ─── Icon Components ──────────────────────────────────────────────────────────
const MathIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="url(#mathGrad)" />
    <text x="20" y="27" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white" fontFamily="serif">∑</text>
    <defs>
      <linearGradient id="mathGrad" x1="0" y1="0" x2="40" y2="40">
        <stop stopColor="#6366f1" /><stop offset="1" stopColor="#8b5cf6" />
      </linearGradient>
    </defs>
  </svg>
);

const ChemIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="10" fill="url(#chemGrad)" />
    <text x="20" y="27" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white" fontFamily="serif">⚗</text>
    <defs>
      <linearGradient id="chemGrad" x1="0" y1="0" x2="40" y2="40">
        <stop stopColor="#06b6d4" /><stop offset="1" stopColor="#0891b2" />
      </linearGradient>
    </defs>
  </svg>
);

// ─── Subject meta (dynamic colors must stay in style prop) ───────────────────
const subjectMeta = {
  Maths: { accent: "#6366f1", soft: "#eef2ff", tag: "#c7d2fe", Icon: MathIcon },
  Chemistry: { accent: "#06b6d4", soft: "#ecfeff", tag: "#a5f3fc", Icon: ChemIcon },
};
const defaultMeta = { accent: "#8b5cf6", soft: "#f5f3ff", tag: "#ddd6fe", Icon: MathIcon };

// ─── Row Component ────────────────────────────────────────────────────────────
const SubjectRow = ({ data, index }) => {
  const [hovered, setHovered] = useState(false);
  const meta = subjectMeta[data.subject] || defaultMeta;
  const { Icon } = meta;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center px-5 py-3.5 rounded-2xl overflow-hidden cursor-default transition-all duration-200 animate-row"
      style={{
        background: hovered ? "#fafafe" : "#ffffff",
        border: `1.5px solid ${hovered ? meta.accent + "55" : "#f0f0f5"}`,
        boxShadow: hovered ? `0 8px 28px ${meta.accent}18, 0 2px 8px #0001` : "0 1px 4px #0000000a",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Accent left bar — dynamic width & color */}
      <div
        className="absolute left-0 top-[15%] bottom-[15%] rounded-r-sm transition-all duration-200"
        style={{ width: hovered ? 3 : 0, background: meta.accent }}
      />

      {/* Icon + Subject */}
      <div className="flex items-center gap-3 w-[30%] min-w-0">
        <div
          className="w-[42px] h-[42px] rounded-xl shrink-0 flex items-center justify-center transition-transform duration-200"
          style={{
            background: meta.soft,
            border: `1.5px solid ${meta.tag}`,
            transform: hovered ? "scale(1.07) rotate(-2deg)" : "scale(1)",
          }}
        >
          <Icon />
        </div>
        <div className="min-w-0">
          <p className="m-0 font-bold text-[13.5px] text-indigo-950 tracking-tight truncate">
            {data.subject}
          </p>
          <span
            className="inline-block mt-[3px] px-2 py-px rounded-full text-[10.5px] font-semibold tracking-wide"
            style={{ background: meta.soft, color: meta.accent, border: `1px solid ${meta.tag}` }}
          >
            {data.classes.length} lectures
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-1 items-center">
        {[data.name, data.classes.length, data.students.length].map((val, i) => (
          <div key={i} className="flex-1 text-center">
            <p
              className={`m-0 text-[13.5px] tracking-tight ${i === 0 ? "font-semibold text-gray-700" : "font-bold"}`}
              style={{ color: i !== 0 ? meta.accent : undefined }}
            >
              {val}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon }) => (
  <div className="flex flex-1 items-center gap-2  sm:gap-3 min-w-[100px] bg-white rounded-2xl px-[10px] sm:px-[18px] py-[14px] border border-[#f0f0f5] shadow-sm">
    <div
      className="w-[38px] h-[38px] rounded-xl flex items-center justify-center text-lg shrink-0"
      style={{ background: color + "15" }}
    >
      {icon}
    </div>
    <div>
      <p className="m-0 text-xl font-extrabold tracking-tighter leading-none" style={{ color }}>
        {value}
      </p>
      <p className="m-0 text-[11px] text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
  </div>
);

import { Users } from "lucide-react";

// ─── Main Component ───────────────────────────────────────────────────────────
const MyClasses = () => {
  const { allClassrooms, allClasses, teacherData, classroomIsPending } = useTeacher();
  const allStudents = teacherData?.allStudents || [];

  const totalStudentsCount = allStudents.length;
  const totalLecturesCount = allClasses.length;

  if (classroomIsPending) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div
      //  min-h-screen 
      className="flex flex-1 sm:p-2 bg-[#f8f8fc]"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes headerIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-header-in      { animation: headerIn   0.4s ease both; }
        .animate-fade-slide-d05 { animation: fadeSlideIn 0.4s ease 0.05s both; }
        .animate-fade-slide-d1  { animation: fadeSlideIn 0.4s ease 0.1s  both; }
        .animate-row            { animation: fadeSlideIn 0.35s ease both; }
        
        /* Custom Scrollbar Styles */
        .mc-scroll::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .mc-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .mc-scroll::-webkit-scrollbar-thumb {
          background: #c7d2fe;
          border-radius: 10px;
        }
        .mc-scroll::-webkit-scrollbar-thumb:hover {
          background: #818cf8;
        }
      `}</style>

      <div className="flex flex-col flex-1 gap-6 w-full">
        {/* ── Header ── */}
        <div className="flex items-center justify-between animate-header-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 rounded-2xl shadow-sm border border-indigo-100/50">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="m-0 text-[26px] font-extrabold text-indigo-950 tracking-tighter leading-none">
                My Classes
              </h1>
              <p className="m-0 mt-1 text-[13px] text-gray-400 font-medium">
                {allClassrooms?.length || 0} active classrooms
              </p>
            </div>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="flex gap-2 sm:gap-3 flex-wrap animate-fade-slide-d05">
          <StatCard label="Total Classes" value={allClassrooms?.length || 0} color="#6366f1" icon="🏫" />
          <StatCard label="Total Lectures" value={totalLecturesCount} color="#06b6d4" icon="📖" />
          <StatCard label="Total Students" value={totalStudentsCount} color="#f59e0b" icon="👥" />
        </div>

        {/* ── Table Container ── */}
        <div className="flex flex-col overflow-hidden animate-fade-slide-d1 bg-white rounded-3xl border border-gray-100 shadow-sm w-full">

          {/* Horizontal scroll wrapper for mobile */}
          <div className="overflow-x-auto w-full mc-scroll">

            {/* Inner content with minimum width to force horizontal scroll on small screens */}
            <div className="min-w-[750px] p-4 flex flex-col gap-3">

              {/* Column Headers */}
              <div className="flex items-center px-5 py-3 bg-[#f8f9ff] rounded-2xl border border-indigo-50/50">
                <div className="w-[30%] pl-[52px]">
                  <p className="m-0 text-[11px] font-extrabold text-indigo-400 uppercase tracking-widest">
                    Subject
                  </p>
                </div>
                <div className="flex flex-1">
                  {["Class", "Lectures Taken", "Students"].map((h, i) => (
                    <div key={i} className="flex-1 text-center">
                      <p className="m-0 text-[11px] font-extrabold text-indigo-400 uppercase tracking-widest">
                        {h}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows with Vertical Scroll for Desktop */}
              <div
                className="flex flex-col gap-2 overflow-y-auto mc-scroll pr-1.5"
                style={{ maxHeight: "420px" }}
              >
                {allClassrooms.map((item, index) => {
                  const classroomLectures = allClasses?.filter(c => (c.classroom?.id || c.classroom?._id) === (item.id || item._id)) || [];
                  const classroomStudents = allStudents?.filter(s => (s.classroom?.id || s.classroom?._id) === (item.id || item._id)) || [];

                  const displayData = {
                    ...item,
                    subject: item.subject?.name || item.subjectID?.name || item.subjectName || item.subject || "Subject",
                    classes: classroomLectures,
                    students: classroomStudents
                  };

                  return <SubjectRow key={item.id || index} data={displayData} index={index} />;
                })}

                {allClassrooms.length === 0 && (
                  <div className="text-center py-20 px-5 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-gray-300">
                    <div className="text-[44px] mb-3 opacity-60">📭</div>
                    <p className="m-0 text-[15px] font-bold text-gray-400">No classes found</p>
                    <p className="m-0 mt-1.5 text-xs text-gray-400/80">Check back later or add new classrooms.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyClasses;
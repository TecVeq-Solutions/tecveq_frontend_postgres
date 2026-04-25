import React, { useState, useEffect } from "react";
import { useSidebar } from "../../../context/SidebarContext";
import { useGetLevels } from "../../../api/Admin/LevelsApi";
import { useGetClassroomsByLevel } from "../../../api/Admin/classroomApi";
import { useGetSubjectsOfLevel } from "../../../api/Admin/SubjectsApi";
import {
  useBulkAssignSubjects,
  useUpdateStudentSubject,
} from "../../../api/Admin/bulkAssign";
import Loader from "../../../utils/Loader";

// ─── Icons (Clean & Sharp) ───────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

// ─── Styles ───────────────────────────────────────────────────
const SELECT_CLS = [
  "w-full appearance-none",
  "bg-white border border-[#E2E8F0]",
  "rounded-xl px-4 py-3 pr-10",
  "text-sm font-medium text-[#1E293B]",
  "cursor-pointer outline-none transition-all duration-200",
  "hover:border-[#CBD5E1]",
  "focus:border-[#3B82F6] focus:ring-4 focus:ring-[#3B82F6]/10",
  "disabled:bg-[#F8FAFC] disabled:cursor-not-allowed",
].join(" ");

const UnifiedSubjectAssign = () => {
  const { isSidebarOpen } = useSidebar();
  const { levels, levelsLoading } = useGetLevels();
  const { bulkAssignSubjects, isLoading: isAssigningBulk } = useBulkAssignSubjects();
  const { updateStudentSubject } = useUpdateStudentSubject();

  const [activeTab, setActiveTab] = useState("bulk");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("");
  const [bulkSelectedSubjects, setBulkSelectedSubjects] = useState([]);
  const [individualAssignments, setIndividualAssignments] = useState({});
  const [isSavingAll, setIsSavingAll] = useState(false);

  const { classrooms, classroomsLoading } = useGetClassroomsByLevel(selectedLevel);
  const { subjects: levelSubjects, subjectsLoading } = useGetSubjectsOfLevel(selectedLevel);

  const currentClassroomData = classrooms?.find((c) => c.id === selectedClassroom);
  const activeStudents = currentClassroomData?.students || [];

  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  useEffect(() => {
    if (!selectedLevel) {
      setSelectedClassroom("");
      setBulkSelectedSubjects([]);
      setIndividualAssignments({});
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (activeStudents.length > 0) {
      const map = {};
      activeStudents.forEach((s) => {
        map[s.id] = s.subjects?.map((x) => (typeof x === "string" ? x : x.id)) || [];
      });
      setIndividualAssignments(map);
    } else {
      setIndividualAssignments({});
    }
  }, [selectedClassroom, classroomsLoading]);

  const handleBulkSubjectToggle = (id) =>
    setBulkSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const handleSelectAll = () => {
    const allIds = levelSubjects?.map((s) => s.id) || [];
    const allSelected = allIds.every((id) => bulkSelectedSubjects.includes(id));
    setBulkSelectedSubjects(allSelected ? [] : allIds);
  };

  const handleBulkSubmit = () => {
    if (!selectedLevel || bulkSelectedSubjects.length === 0) return;
    bulkAssignSubjects({
      levelId: selectedLevel,
      classroomId: selectedClassroom || undefined,
      subjectIds: bulkSelectedSubjects,
    });
    if (selectedClassroom) {
      const map = {};
      activeStudents.forEach((s) => (map[s.id] = [...bulkSelectedSubjects]));
      setIndividualAssignments(map);
    }
    setBulkSelectedSubjects([]);
  };

  const handleIndividualToggle = (studentId, subjectId) =>
    setIndividualAssignments((prev) => {
      const list = prev[studentId] || [];
      return {
        ...prev,
        [studentId]: list.includes(subjectId)
          ? list.filter((s) => s !== subjectId)
          : [...list, subjectId],
      };
    });

  const handleSaveAllIndividual = async () => {
    const studentIds = Object.keys(individualAssignments);
    if (!studentIds.length) return;
    setIsSavingAll(true);
    try {
      await Promise.all(
        studentIds.map((studentId) =>
          updateStudentSubject({ studentId, subjectIds: individualAssignments[studentId] })
        )
      );
    } finally {
      setIsSavingAll(false);
    }
  };

  const allSelected =
    levelSubjects?.length > 0 &&
    levelSubjects.every((s) => bulkSelectedSubjects.includes(s.id));

  return (
    <div className="lg:ml-80 min-h-screen w-full bg-[#F8FAFC] pb-20 px-4 sm:px-10 py-10 transition-all duration-300">

      {/* ── Header Section ───────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="h-[2px] w-8 bg-blue-600 rounded-full"></span>
            <p className="text-[12px] font-bold tracking-[0.15em] uppercase text-blue-600">
              Academic Control
            </p>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Subject Assignment
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Streamlined academic distribution for levels and classrooms.
          </p>
        </div>
      </div>

      {/* ── Top Filters ──────────────────────────────────────────────────── */}
      <div className="bg-white/70 backdrop-blur-xl border border-white shadow-xl shadow-blue-900/5 rounded-[32px] sm:p-8 p-4 mb-4 sm:mb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <ChevronIcon />
          </div>
          <h3 className="font-bold text-slate-800 tracking-tight">Quick Filters</h3>
        </div>

        {levelsLoading ? (
          <div className="py-4"><Loader /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-600 ml-1">Select Level</label>
              <div className="relative group">
                <select
                  value={selectedLevel}
                  onChange={(e) => { setSelectedLevel(e.target.value); setSelectedClassroom(""); }}
                  className={SELECT_CLS}
                >
                  <option value="">Select an academic level...</option>
                  {levels?.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors">
                  <ChevronIcon />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-slate-600 ml-1">Classroom</label>
              <div className="relative group">
                <select
                  value={selectedClassroom}
                  disabled={!selectedLevel}
                  onChange={(e) => setSelectedClassroom(e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="">Choose a classroom...</option>
                  {classrooms?.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <ChevronIcon />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      {selectedLevel && selectedClassroom ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Tab Navigation */}
          <div className="flex p-1.5 bg-slate-200/50 backdrop-blur-md rounded-[22px] w-full max-w-md mb-4 sm:mb-8">
            {[
              { key: "bulk", label: "Bulk Assign", Icon: BookIcon },
              { key: "single", label: "Individual", Icon: UsersIcon },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[18px] text-sm font-bold transition-all duration-300 ${activeTab === key
                  ? "bg-white text-blue-600 shadow-lg shadow-blue-900/5 ring-1 ring-black/5"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                  }`}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>

          {/* Bulk Tab Content */}
          {activeTab === "bulk" && (
            <div className="bg-white border border-slate-200 rounded-[32px] p-4 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Curriculum Assignment</h2>
                  <p className="text-sm text-slate-500 font-medium">Applying to all students in {currentClassroomData?.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSelectAll}
                    className="px-5 py-2 text-xs font-bold text-slate-600 border border-slate-200 rounded-full hover:bg-slate-50 transition-all"
                  >
                    {allSelected ? "Uncheck All" : "Check All"}
                  </button>
                </div>
              </div>

              {subjectsLoading ? (
                <Loader />
              ) : levelSubjects?.length === 0 ? (
                <EmptyState icon={<BookIcon />} message="No subjects found for this level" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {levelSubjects?.map((sub) => {
                    const isChecked = bulkSelectedSubjects.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        className={`group relative flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${isChecked
                          ? "bg-blue-50 border-blue-500 shadow-md shadow-blue-500/10"
                          : "bg-slate-50 border-transparent hover:border-slate-200"
                          }`}
                      >
                        <input type="checkbox" className="hidden"
                          checked={isChecked} onChange={() => handleBulkSubjectToggle(sub.id)} />
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${isChecked ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300"
                          }`}>
                          {isChecked && <CheckIcon />}
                        </div>
                        <span className={`text-sm font-bold ${isChecked ? "text-blue-700" : "text-slate-700"}`}>
                          {sub.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="sm:mt-10 mt-4 pt-4 sm:pt-8 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {bulkSelectedSubjects.length} SELECTED
                </p>
                <button
                  onClick={handleBulkSubmit}
                  disabled={bulkSelectedSubjects.length === 0 || isAssigningBulk}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-3 sm:px-8 py-2 sm:py-4 rounded-2xl shadow-xl shadow-blue-600/20 flex items-center gap-1 sm:gap-3 transition-all active:scale-95"
                >
                  {isAssigningBulk ? <SpinnerIcon /> : <CheckIcon />}
                  {isAssigningBulk ? "Processing..." : "Deploy Subjects"}
                </button>
              </div>
            </div>
          )}

          {/* Individual Tab Content */}
          {activeTab === "single" && (
            <div className="space-y-4">
              {activeStudents.map((student) => (
                <div key={student.id} className="group bg-white border border-slate-200 p-6 rounded-[24px] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center gap-4 min-w-[240px]">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-[2px]">
                        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-blue-600 font-black text-lg">
                          {getInitials(student.name)}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg leading-tight">{student.name}</h4>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[11px] font-black uppercase tracking-tighter">
                          ID: {student.rollNo || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 flex-1">
                      {levelSubjects?.map((sub) => {
                        const checked = individualAssignments[student.id]?.includes(sub.id);
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleIndividualToggle(student.id, sub.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all duration-200 ${checked
                              ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20"
                              : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                              }`}
                          >
                            {sub.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <div className="sticky bottom-8 mt-10 p-6 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[28px] shadow-2xl flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-black uppercase">Batch Update</p>
                  <p className="text-slate-900 font-bold">{activeStudents.length} Students Ready</p>
                </div>
                <button
                  onClick={handleSaveAllIndividual}
                  disabled={isSavingAll}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-emerald-600/20 flex items-center gap-3 transition-all active:scale-95"
                >
                  {isSavingAll ? <SpinnerIcon /> : <CheckIcon />}
                  Save All Assignments
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Empty State ─────────────────────────────────────────────────── */
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[40px] py-24 flex flex-col items-center justify-center text-center px-6">
          <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center text-blue-500 mb-6">
            <BookIcon />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Awaiting Configuration</h3>
          <p className="text-slate-500 max-w-sm font-medium">
            Please select a level and classroom from the filters above to begin managing subject assignments.
          </p>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
    <div className="text-slate-300 mb-4 scale-150">{icon}</div>
    <p className="text-slate-500 font-bold">{message}</p>
  </div>
);

export default UnifiedSubjectAssign;
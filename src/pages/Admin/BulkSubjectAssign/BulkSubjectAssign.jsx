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

// ─── Icons ────────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UsersIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

// ─── Reusable class strings ───────────────────────────────────────────────────

// Custom select — matches the CSS design exactly
const SELECT_CLS = [
  "w-full appearance-none",
  "bg-[#F8FAFC] border-[1.5px] border-[#E2E8F0]",
  "rounded-[14px] px-4 py-[11px] pr-10",
  "font-sans text-sm text-[#0F172A]",
  "cursor-pointer outline-none",
  "transition-all duration-150",
  "focus:border-[#2563EB] focus:bg-white focus:shadow-[0_0_0_3px_rgba(37,99,235,0.10)]",
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-[#F8FAFC]",
].join(" ");

// ─── Component ────────────────────────────────────────────────────────────────
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

  // ── Effects ──────────────────────────────────────────────────────────────────
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

  // ── Handlers ─────────────────────────────────────────────────────────────────
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

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="lg:ml-72 min-h-full pb-10 px-3 sm:px-8 w-full py-8 sm:py-10">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="pl-12 md:pl-0 text-[11px] font-semibold tracking-[0.12em] uppercase text-[#2563EB] mb-2">
          Administration
        </p>
        <h1 className="text-[28px] sm:text-[30px] font-extrabold text-[#0F172A] tracking-tight leading-[1.15] mb-1.5">
          Subject Assignment
        </h1>
        <p className="text-[14.5px] text-[#64748B]">
          Assign subjects to entire classrooms or manage individual students
        </p>
      </div>

      {/* ── Filter Card ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-[#E2E8F0] rounded-[28px] p-6 w-full sm:p-7
                        shadow-[0_1px_3px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] mb-6">

        <p className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#64748B] mb-5">
          Filter Context
        </p>

        {levelsLoading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Level */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#334155] tracking-[0.02em]">
                Academic Level
              </label>
              <div className="relative">
                <select
                  value={selectedLevel}
                  onChange={(e) => { setSelectedLevel(e.target.value); setSelectedClassroom(""); }}
                  className={SELECT_CLS}
                >
                  <option value="">Select a level…</option>
                  {levels?.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <ChevronIcon />
                </span>
              </div>
            </div>

            {/* Classroom */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#334155] tracking-[0.02em]">
                Classroom
              </label>
              <div className="relative">
                <select
                  value={selectedClassroom}
                  disabled={!selectedLevel}
                  onChange={(e) => setSelectedClassroom(e.target.value)}
                  className={SELECT_CLS}
                >
                  <option value="">Select a classroom…</option>
                  {classrooms?.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                  <ChevronIcon />
                </span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* ── Tabs + Content ─────────────────────────────────────────────────── */}
      {selectedLevel && selectedClassroom ? (
        <div>

          {/* Tab Bar */}
          <div className="flex gap-1 bg-white border border-[#E2E8F0] rounded-[20px] p-1
                            shadow-[0_1px_3px_rgba(15,23,42,0.06)] w-fit mb-5">
            {[
              { key: "bulk", label: "Bulk Assignment", Icon: BookIcon },
              { key: "single", label: "Individual", Icon: UsersIcon },
            ].map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={[
                  "flex items-center gap-[7px] px-5 py-[9px] rounded-[14px]",
                  "text-[13.5px] font-semibold transition-all duration-150 whitespace-nowrap",
                  activeTab === key
                    ? "bg-[#2563EB] text-white shadow-[0_2px_8px_rgba(37,99,235,0.28)]"
                    : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#334155]",
                ].join(" ")}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>

          {/* ── BULK TAB ─────────────────────────────────────────────────── */}
          {activeTab === "bulk" && (
            <div className="bg-white border border-[#E2E8F0] rounded-[28px] p-6 sm:p-8
                              shadow-[0_1px_3px_rgba(15,23,42,0.06)]">

              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-[18px] font-bold text-[#0F172A] tracking-tight">
                  Bulk Assign Subjects
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-[5px] text-xs font-semibold
                                     bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]
                                     px-3 py-1 rounded-full">
                    <UsersIcon /> {activeStudents.length} students
                  </span>
                  {levelSubjects?.length > 0 && (
                    <button
                      onClick={handleSelectAll}
                      className="text-xs font-semibold text-[#64748B] border border-[#E2E8F0]
                                   rounded-[10px] px-3 py-1.5 bg-transparent
                                   hover:bg-[#F8FAFC] hover:text-[#334155] transition-all duration-150"
                    >
                      {allSelected ? "Deselect All" : "Select All"}
                    </button>
                  )}
                </div>
              </div>

              {/* Subjects grid */}
              {subjectsLoading ? (
                <Loader />
              ) : levelSubjects?.length === 0 ? (
                <EmptyState icon={<BookIcon />} message="No subjects available for this level" />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {levelSubjects?.map((sub) => {
                    const isChecked = bulkSelectedSubjects.includes(sub.id);
                    return (
                      <label
                        key={sub.id}
                        className={[
                          "flex items-center gap-2 border-[1.5px] rounded-[10px]",
                          "px-3 py-2.5 cursor-pointer select-none transition-all duration-150",
                          isChecked
                            ? "border-[#2563EB] bg-[#EFF6FF]"
                            : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#93C5FD] hover:bg-[#EFF6FF]",
                        ].join(" ")}
                      >
                        <input type="checkbox" className="hidden"
                          checked={isChecked}
                          onChange={() => handleBulkSubjectToggle(sub.id)} />
                        <span className={[
                          "w-[18px] h-[18px] flex-shrink-0 rounded-[5px] flex items-center justify-center",
                          "border-[1.5px] transition-all duration-150",
                          isChecked
                            ? "bg-[#2563EB] border-[#2563EB] text-white"
                            : "border-[#CBD5E1] bg-white text-transparent",
                        ].join(" ")}>
                          <CheckIcon />
                        </span>
                        <span className={`text-[13px] font-medium truncate ${isChecked ? "text-[#1D4ED8]" : "text-[#334155]"}`}>
                          {sub.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Footer */}
              <div className="h-px bg-[#E2E8F0] my-6" />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="text-[13px] text-[#64748B] font-medium">
                  {bulkSelectedSubjects.length} subject{bulkSelectedSubjects.length !== 1 ? "s" : ""} selected
                </span>
                <button
                  onClick={handleBulkSubmit}
                  disabled={bulkSelectedSubjects.length === 0 || isAssigningBulk}
                  className="flex items-center gap-2 bg-[#059669] text-white
                               text-[13.5px] font-semibold px-6 py-3 rounded-[14px]
                               shadow-[0_2px_8px_rgba(5,150,105,0.22)]
                               hover:bg-[#047857] hover:shadow-[0_4px_14px_rgba(5,150,105,0.32)] hover:-translate-y-px
                               disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none
                               transition-all duration-150"
                >
                  {isAssigningBulk
                    ? <><SpinnerIcon /> Applying…</>
                    : <><CheckIcon /> Apply to Classroom</>}
                </button>
              </div>

            </div>
          )}

          {/* ── INDIVIDUAL TAB ───────────────────────────────────────────── */}
          {activeTab === "single" && (
            <div className="flex flex-col gap-3">

              {activeStudents.length === 0 ? (
                <div className="bg-white border border-[#E2E8F0] rounded-[28px] p-6
                                  shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
                  <EmptyState icon={<UsersIcon />} message="No students found in this classroom" />
                </div>
              ) : (
                <>
                  {activeStudents.map((student) => (
                    <div
                      key={student.id}
                      className="bg-white border border-[#E2E8F0] rounded-[20px] px-5 py-4
                                   shadow-[0_1px_3px_rgba(15,23,42,0.06)]
                                   hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)]
                                   flex flex-col sm:flex-row sm:items-center gap-4
                                   transition-shadow duration-150"
                    >
                      {/* Avatar + Info */}
                      <div className="flex items-center gap-3 sm:w-44 sm:flex-shrink-0">
                        <div className="w-[38px] h-[38px] rounded-full flex-shrink-0
                                          bg-gradient-to-br from-[#2563EB] to-[#6366F1]
                                          flex items-center justify-center
                                          text-white text-[13px] font-bold">
                          {getInitials(student.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-bold text-[#0F172A] truncate leading-snug">
                            {student.name}
                          </p>
                          <p className="text-[12px] text-[#2563EB] font-medium">
                            Roll #{student.rollNo || "—"}
                          </p>
                        </div>
                      </div>

                      {/* Subject pills */}
                      <div className="flex flex-wrap gap-[7px] flex-1 items-center">
                        {subjectsLoading ? (
                          <Loader />
                        ) : (
                          levelSubjects?.map((sub) => {
                            const checked = individualAssignments[student.id]?.includes(sub.id);
                            return (
                              <label
                                key={sub.id}
                                className={[
                                  "inline-flex items-center gap-[5px] px-3 py-1 rounded-full",
                                  "border-[1.5px] text-[12.5px] font-medium cursor-pointer select-none",
                                  "transition-all duration-150",
                                  checked
                                    ? "bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]"
                                    : "bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B] hover:border-[#93C5FD] hover:text-[#2563EB] hover:bg-[#EFF6FF]",
                                ].join(" ")}
                              >
                                <input type="checkbox" className="hidden"
                                  checked={checked || false}
                                  onChange={() => handleIndividualToggle(student.id, sub.id)} />
                                <span className={[
                                  "w-[7px] h-[7px] rounded-full flex-shrink-0",
                                  checked ? "bg-[#2563EB]" : "bg-[#CBD5E1]",
                                ].join(" ")} />
                                {sub.name}
                              </label>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Single Save All Button */}
                  <div className="flex items-center justify-between flex-wrap gap-3
                                    mt-2 pt-4 border-t border-[#E2E8F0]">
                    <span className="text-[13px] text-[#64748B] font-medium">
                      {activeStudents.length} student{activeStudents.length !== 1 ? "s" : ""} in classroom
                    </span>
                    <button
                      onClick={handleSaveAllIndividual}
                      disabled={isSavingAll}
                      className="flex items-center gap-2 bg-[#059669] text-white
                                   text-[13.5px] font-semibold px-6 py-3 rounded-[14px]
                                   shadow-[0_2px_8px_rgba(5,150,105,0.22)]
                                   hover:bg-[#047857] hover:shadow-[0_4px_14px_rgba(5,150,105,0.32)] hover:-translate-y-px
                                   disabled:opacity-55 disabled:cursor-not-allowed disabled:transform-none
                                   transition-all duration-150"
                    >
                      {isSavingAll
                        ? <><SpinnerIcon /> Saving All…</>
                        : <><CheckIcon /> Save All Changes</>}
                    </button>
                  </div>
                </>
              )}

            </div>
          )}

        </div>
      ) : (

        /* ── Empty / prompt state ─────────────────────────────────────────── */
        <div className="bg-white border border-[#E2E8F0] rounded-[28px] p-6
                          shadow-[0_1px_3px_rgba(15,23,42,0.06)] text-center">
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-[#94A3B8]">
            <div className="w-16 h-16 rounded-2xl border-[1.5px] border-dashed border-[#E2E8F0]
                              bg-[#F8FAFC] flex items-center justify-center">
              <BookIcon />
            </div>
            <p className="text-[15px] font-semibold text-[#334155]">
              Select a level and classroom to get started
            </p>
            <p className="text-[13px] text-[#94A3B8]">
              Use the filters above to load subjects and students
            </p>
          </div>
        </div>

      )}

    </div>
  );
};

// ─── Empty State Helper ───────────────────────────────────────────────────────
const EmptyState = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-14 gap-[10px] text-[#94A3B8]">
    <div className="w-12 h-12 rounded-full border-[1.5px] border-dashed border-[#E2E8F0]
                    bg-[#F8FAFC] flex items-center justify-center">
      {icon}
    </div>
    <p className="text-sm">{message}</p>
  </div>
);

export default UnifiedSubjectAssign;

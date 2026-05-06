import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  IoClose,
  IoSchool,
  IoPencil,
  IoCheckmarkCircle,
  IoBook,
  IoText,
  IoGrid,
  IoStar,
  IoPeople,
  IoSearchOutline,
  IoSparklesOutline,
  IoChevronDown,
  IoPersonAddOutline,
  IoLayersOutline
} from 'react-icons/io5';
import { useMutation } from '@tanstack/react-query';
import { useBlur } from '../../../context/BlurContext';
import { useAdmin } from '../../../context/AdminContext';
import { createClassroom } from '../../../api/Admin/classroomApi';
import { toast } from 'react-toastify';
import { useGetAllStudentsWithLevel } from '../../../api/Admin/AdminApi';
import { useGetAllSubjectsWithLevel } from '../../../api/Admin/SubjectsApi';

// ─── Modern Skeleton Loader ──────────────────────────────────────────────────
const SkeletonRow = ({ count = 4 }) => (
  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="h-12 animate-pulse rounded-2xl border border-violet-100/60 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50"
        style={{ animationDelay: `${i * 100}ms` }}
      />
    ))}
  </div>
);

// ─── Premium Select Dropdown ─────────────────────────────────────────────────
const Selectable = ({ label, options = [], setSelectedOption, selectedOption, icon }) => (
  <div className="group relative">
    <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-violet-400 transition-colors group-focus-within:text-violet-600">
      {icon}
    </div>

    <select
      value={selectedOption ? JSON.stringify(selectedOption) : ''}
      onChange={(e) => {
        if (!e.target.value) return setSelectedOption(null);
        setSelectedOption(JSON.parse(e.target.value));
      }}
      className="h-13 w-full appearance-none rounded-[22px] border border-violet-100 bg-white/90 py-3.5 pl-11 pr-11 text-sm font-black text-slate-700 shadow-sm shadow-violet-100/60 outline-none transition-all duration-300 hover:border-violet-200 hover:bg-white focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
    >
      <option value="">Select {label}...</option>
      {options.map((item) => (
        <option key={item.id} value={JSON.stringify(item)}>
          {item.name}
        </option>
      ))}
    </select>

    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-300 transition-colors group-focus-within:text-violet-500">
      <IoChevronDown className="h-4 w-4" />
    </div>
  </div>
);

// ─── Enhanced Avatar ─────────────────────────────────────────────────────────
const Avatar = ({ name = '', src, size = 'h-8 w-8' }) => {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return src ? (
    <img
      src={src}
      alt={name}
      className={`${size} rounded-2xl object-cover shadow-sm ring-2 ring-white`}
    />
  ) : (
    <div className={`${size} flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-[10px] font-black text-white shadow-md shadow-violet-500/25 ring-2 ring-white`}>
      {initials || 'U'}
    </div>
  );
};

// ─── Multi-Select Field ──────────────────────────────────────────────────────
const MultiSelectField = ({ options = [], placeholder, onSelect, isLoading }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [search, setSearch] = useState('');
  const allSelected = selectedOptions.length === options.length && options.length > 0;

  const filtered = options.filter((o) => o.name?.toLowerCase().includes(search.toLowerCase()));

  const toggle = useCallback(
    (option) => {
      setSelectedOptions((prev) => {
        const next = prev.some((i) => i.id === option.id)
          ? prev.filter((i) => i.id !== option.id)
          : [...prev, option];
        onSelect(next);
        return next;
      });
    },
    [onSelect]
  );

  const toggleAll = () => {
    const next = allSelected ? [] : options;
    setSelectedOptions(next);
    onSelect(next);
  };

  if (isLoading) return <SkeletonRow count={8} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <IoSearchOutline className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${placeholder}...`}
            className="h-11 w-full rounded-2xl border border-violet-100 bg-white/90 pl-11 pr-4 text-sm font-semibold text-slate-700 shadow-sm shadow-violet-100/50 outline-none transition-all placeholder:text-slate-300 focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
          />
        </div>

        <button
          type="button"
          onClick={toggleAll}
          className={`h-11 shrink-0 rounded-2xl border px-3 text-[10px] font-black uppercase tracking-[0.08em] shadow-sm transition-all active:scale-95 sm:px-4 ${allSelected
            ? 'border-violet-500 bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-violet-500/25'
            : 'border-violet-100 bg-white/90 text-violet-600 shadow-violet-100/60 hover:border-violet-200 hover:bg-violet-50'
            }`}
        >
          {allSelected ? 'Deselect' : 'Select All'}
        </button>
      </div>

      {selectedOptions.length > 0 && (
        <div className="rounded-[24px] border border-violet-100 bg-gradient-to-r from-violet-50/80 via-white to-fuchsia-50/70 p-3 shadow-inner shadow-violet-50">
          <div className="mb-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
            Selected {placeholder}
          </div>
          <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1 custom-scrollbar">
            {selectedOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => toggle(opt)}
                className="group flex cursor-pointer items-center gap-2 rounded-full border border-violet-100 bg-white py-1 pl-1 pr-2.5 text-xs font-black text-violet-700 shadow-sm shadow-violet-100/60 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
              >
                <Avatar name={opt.name} src={opt.profilePic} size="h-6 w-6" />
                <span className="max-w-[120px] truncate">{opt.name}</span>
                <IoClose className="h-3.5 w-3.5 text-slate-300 group-hover:text-red-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1 custom-scrollbar sm:grid-cols-3">
        {filtered.map((option) => {
          const isChecked = selectedOptions.some((i) => i.id === option.id);

          return (
            <button
              type="button"
              key={option.id}
              onClick={() => toggle(option)}
              className={`flex min-w-0 items-center gap-2 rounded-[20px] border p-2 text-left transition-all duration-300 active:scale-[0.98] sm:gap-3 sm:p-3 ${isChecked
                ? 'border-violet-300 bg-white shadow-md shadow-violet-100 ring-4 ring-violet-50'
                : 'border-violet-50 bg-white/75 shadow-sm shadow-violet-50 hover:border-violet-100 hover:bg-white'
                }`}
            >
              <div className={`grid h-5 w-5 shrink-0 place-items-center rounded-lg border transition-all ${isChecked ? 'border-violet-500 bg-violet-500' : 'border-slate-200 bg-white'}`}>
                {isChecked && <IoCheckmarkCircle className="h-4 w-4 text-white" />}
              </div>
              <Avatar name={option.name} src={option.profilePic} size="h-8 w-8" />
              <span className={`truncate text-[11px] font-black sm:text-xs ${isChecked ? 'text-violet-700' : 'text-slate-600'}`}>
                {option.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Section Label ───────────────────────────────────────────────────────────
const SectionLabel = ({ icon, text, badge }) => (
  <div className="mb-3 mt-2 flex items-center justify-between gap-3">
    <label className="flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 sm:text-[11px]">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
        {icon}
      </span>
      <span className="truncate">{text}</span>
    </label>

    {badge != null && badge > 0 && (
      <span className="shrink-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-white shadow-sm shadow-violet-500/25">
        {badge} Selected
      </span>
    )}
  </div>
);

// ─── Main Modal Component ─────────────────────────────────────────────────────
const ClassModal = ({ open, setopen, isEditTrue, refetch, editData }) => {
  const ref = useRef(null);
  const scrollRef = useRef(null);
  const [headTeacher, setHeadTeacher] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState({});
  const [classroomName, setClassroomName] = useState('');
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [teacherArr, setTeachersArr] = useState([]);

  const { adminUsersData, allLevels } = useAdmin();
  const { toggleBlur } = useBlur();

  const { studentWithLevel = [], isLoading: studentsLoading } = useGetAllStudentsWithLevel(selectedLevel?.id);
  const { subjectWithLevel = [], isLoading: subjectsLoading } = useGetAllSubjectsWithLevel(selectedLevel?.id);

  const handleClose = useCallback(() => {
    setopen(false);
    toggleBlur();
  }, [setopen, toggleBlur]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handleClose();
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, handleClose]);

  useEffect(() => {
    setSelectedTeachers([]);
    setSelectedStudents([]);
    setSelectedSubjects({});
    setTeachersArr([]);
    setHeadTeacher(null);
  }, [selectedLevel]);

  const handleSubjectCheckboxChange = useCallback(
    (teacherId, subject, isChecked) => {
      const scrollTop = scrollRef.current?.scrollTop ?? 0;

      setSelectedSubjects((prev) => {
        const curr = prev[teacherId] || [];
        const updatedSubjects = isChecked ? [...curr, subject] : curr.filter((s) => s.id !== subject.id);
        const newSubjectsState = { ...prev, [teacherId]: updatedSubjects };

        setTeachersArr(() =>
          Object.entries(newSubjectsState).flatMap(([tid, subjects]) =>
            subjects.map((subj) => ({
              teacher: tid,
              subject: subj.id,
              type: headTeacher?.id === tid ? 'head' : 'teacher'
            }))
          )
        );
        return newSubjectsState;
      });

      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollTop;
      });
    },
    [headTeacher]
  );

  const createClassroomMutation = useMutation({
    mutationKey: ['addclassroom'],
    mutationFn: (data) => createClassroom(data),
    onSuccess: async () => {
      await refetch();
      handleClose();
      toast.success('Classroom created successfully! 🎉');
    },
    onError: () => toast.error('Failed to create classroom. Please try again.')
  });

  const handleCreateClass = () => {
    const nameOk = /^[a-zA-Z0-9\s]+$/.test(classroomName.trim());
    if (!classroomName.trim()) return toast.error('Enter a classroom name.');
    if (!nameOk) return toast.error('No special characters allowed.');
    if (!selectedLevel) return toast.error('Select a level.');
    if (selectedTeachers.length === 0) return toast.error('Select teachers.');
    if (selectedStudents.length === 0) return toast.error('Select students.');

    createClassroomMutation.mutate({
      name: classroomName.trim(),
      levelID: selectedLevel.id,
      students: selectedStudents.map((s) => s.id),
      teachers: teacherArr,
      headTeacher: headTeacher?.id || ''
    });
  };

  if (!open) return null;
  const isPending = createClassroomMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-[#0f0a28]/50 backdrop-blur-xl transition-opacity" onClick={handleClose} />

      <div
        ref={ref}
        className="relative flex h-[100dvh] w-full max-w-3xl flex-col overflow-hidden border border-white/70 bg-white shadow-2xl shadow-violet-950/20 sm:h-auto sm:max-h-[94vh] sm:rounded-[42px]"
      >
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-32 h-72 w-72 rounded-full bg-fuchsia-300/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-sky-200/20 blur-3xl" />

        <div className="relative h-2 w-full bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-700" />

        {/* Header Section */}
        <div className="relative border-b border-violet-100/70 bg-gradient-to-br from-white via-violet-50/90 to-fuchsia-50/70 px-3 pb-4 pt-5 shadow-sm shadow-violet-100/70 sm:px-8 sm:pb-5 sm:pt-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[20px] bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white shadow-xl shadow-violet-500/30 ring-4 ring-white/70 sm:h-16 sm:w-16 sm:rounded-[24px]">
                {isEditTrue ? <IoPencil className="h-6 w-6 sm:h-7 sm:w-7" /> : <IoSchool className="h-6 w-6 sm:h-7 sm:w-7" />}
              </div>

              <div className="min-w-0">
                <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-white/80 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-violet-700 shadow-sm shadow-violet-100/70 sm:text-[9px]">
                  <IoSparklesOutline size={13} />
                  Classroom Setup
                </div>
                <h2 className="truncate text-[22px] font-black leading-none tracking-[-0.05em] text-slate-950 sm:text-[30px]">
                  {isEditTrue ? 'Edit Classroom' : 'Create New Class'}
                </h2>
                <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-xs">
                  Configure level, faculty, subjects and students
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-violet-100 bg-white/85 text-slate-400 shadow-sm shadow-violet-100/60 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500 active:scale-90"
            >
              <IoClose className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          ref={scrollRef}
          className="relative flex flex-1 flex-col space-y-6 overflow-y-auto px-3 py-5 custom-scrollbar sm:px-8 sm:py-7"
          style={{ overflowAnchor: 'none' }}
        >
          {/* Input: Classroom Name */}
          <div className="rounded-[28px] border border-violet-100 bg-white/80 p-3 shadow-sm shadow-violet-100/60 sm:p-5">
            <SectionLabel icon={<IoText className="h-3.5 w-3.5" />} text="Classroom Identification" />
            <div className="group relative">
              <IoText className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400 transition-colors group-focus-within:text-violet-600" />
              <input
                value={classroomName}
                onChange={(e) => setClassroomName(e.target.value)}
                placeholder="e.g. Grade 10 Excellence"
                className="h-13 w-full rounded-[22px] border border-violet-100 bg-violet-50/40 py-3.5 pl-11 pr-4 text-sm font-black text-slate-700 shadow-inner shadow-violet-50 outline-none transition-all placeholder:text-slate-300 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>
          </div>

          {/* Input: Level */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-violet-100 bg-white/80 p-3 shadow-sm shadow-violet-100/60 sm:p-5">
              <SectionLabel icon={<IoGrid className="h-3.5 w-3.5" />} text="Academic Level" />
              <Selectable
                icon={<IoGrid className="h-4 w-4" />}
                label="Level"
                options={allLevels}
                setSelectedOption={setSelectedLevel}
                selectedOption={selectedLevel}
              />
            </div>

            {selectedLevel && (
              <div className="rounded-[28px] border border-amber-100 bg-gradient-to-br from-white via-amber-50/60 to-violet-50/40 p-3 shadow-sm shadow-amber-100/50 sm:p-5">
                <SectionLabel icon={<IoStar className="h-3.5 w-3.5 text-amber-500" />} text="Lead Teacher Optional" />
                <Selectable
                  icon={<IoStar className="h-4 w-4 text-amber-500" />}
                  label="Head Teacher"
                  options={adminUsersData.allTeachers}
                  setSelectedOption={setHeadTeacher}
                  selectedOption={headTeacher}
                />
              </div>
            )}
          </div>

          {selectedLevel && (
            <div className="space-y-6">
              {/* Teachers Selection */}
              <div className="rounded-[32px] border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-fuchsia-50/50 p-3 shadow-sm shadow-violet-100/70 sm:p-5">
                <SectionLabel icon={<IoPeople className="h-3.5 w-3.5" />} text="Faculty Members" badge={selectedTeachers.length} />
                <MultiSelectField placeholder="teachers" onSelect={setSelectedTeachers} options={adminUsersData.allTeachers} />
              </div>

              {/* Subject Mapping */}
              {selectedTeachers.length > 0 && (
                <div className="space-y-4">
                  <SectionLabel icon={<IoBook className="h-3.5 w-3.5" />} text="Subject Specialization" />
                  <div className="space-y-4">
                    {selectedTeachers.map((teacher) => (
                      <div
                        key={teacher.id}
                        className="rounded-[32px] border border-violet-100 bg-white/90 p-3 shadow-sm shadow-violet-100/60 transition-all hover:border-violet-200 hover:shadow-md hover:shadow-violet-100 sm:p-5"
                      >
                        <div className="mb-4 flex items-center gap-2 sm:gap-3">
                          <Avatar name={teacher.name} src={teacher.profilePic} size="h-10 w-10" />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-black text-slate-800">{teacher.name}</div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Assign subjects</div>
                          </div>
                          {headTeacher?.id === teacher.id && (
                            <span className="shrink-0 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.08em] text-amber-700">
                              Head
                            </span>
                          )}
                        </div>

                        {subjectsLoading ? (
                          <SkeletonRow count={3} />
                        ) : (
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {subjectWithLevel.map((subject) => {
                              const checked = selectedSubjects[teacher.id]?.some((s) => s.id === subject.id);

                              return (
                                <label
                                  key={subject.id}
                                  className={`flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-2.5 transition-all active:scale-95 ${checked
                                    ? 'border-violet-300 bg-violet-50 text-violet-700 shadow-sm shadow-violet-100'
                                    : 'border-violet-50 bg-slate-50/70 text-slate-500 hover:border-violet-100 hover:bg-white'
                                    }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="hidden"
                                    checked={checked}
                                    onChange={(e) => handleSubjectCheckboxChange(teacher.id, subject, e.target.checked)}
                                  />
                                  <IoBook className={`h-3.5 w-3.5 shrink-0 ${checked ? 'text-violet-600' : 'text-slate-300'}`} />
                                  <span className="truncate text-[11px] font-black">{subject.name}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Student Enrollment */}
              <div className="rounded-[32px] border border-violet-100 bg-gradient-to-br from-violet-50/70 via-white to-sky-50/50 p-3 shadow-sm shadow-violet-100/70 sm:p-5">
                <SectionLabel icon={<IoPersonAddOutline className="h-3.5 w-3.5" />} text="Student Enrollment" badge={selectedStudents.length} />
                <MultiSelectField placeholder="students" onSelect={setSelectedStudents} options={studentWithLevel} isLoading={studentsLoading} />
              </div>
            </div>
          )}

          {!selectedLevel && (
            <div className="rounded-[32px] border border-dashed border-violet-200 bg-gradient-to-br from-violet-50/80 via-white to-fuchsia-50/60 px-5 py-8 text-center shadow-inner shadow-violet-50">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-[24px] bg-white text-violet-600 shadow-lg shadow-violet-100 ring-1 ring-violet-100">
                <IoLayersOutline size={28} />
              </div>
              <h3 className="text-lg font-black tracking-[-0.03em] text-slate-900">Select a level to continue</h3>
              <p className="mx-auto mt-1 max-w-sm text-sm font-semibold leading-relaxed text-slate-400">
                Teachers, subjects and students will appear after choosing an academic level.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative border-t border-violet-100 bg-white/95 px-3 py-4 shadow-[0_-12px_35px_-24px_rgba(76,29,149,0.5)] sm:px-8 sm:py-6">
          <button
            type="button"
            onClick={handleCreateClass}
            disabled={isPending}
            className="group relative h-14 w-full overflow-hidden rounded-[24px] shadow-xl shadow-violet-500/25 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:grayscale"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-700 transition-opacity group-hover:opacity-95" />
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/20 blur-xl" />
            <div className="relative flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.1em] text-white sm:text-base">
              {isPending ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>{isEditTrue ? 'Updating Space...' : 'Creating Classroom...'}</span>
                </>
              ) : (
                <>
                  <IoCheckmarkCircle className="h-6 w-6" />
                  <span>{isEditTrue ? 'Confirm Updates' : 'Finalize Classroom'}</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd6fe; border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #c4b5fd; }
      `}</style>
    </div>
  );
};

export default ClassModal;

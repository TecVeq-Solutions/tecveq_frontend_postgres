import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IoClose, IoSchool, IoPencil, IoCheckmarkCircle, IoBook, IoText, IoGrid, IoStar, IoPeople, IoSearchOutline } from "react-icons/io5";
import { useMutation } from '@tanstack/react-query';
import { useBlur } from "../../../context/BlurContext";
import { useAdmin } from "../../../context/AdminContext";
import { createClassroom } from '../../../api/Admin/classroomApi';
import { toast } from 'react-toastify';
import { useGetAllStudentsWithLevel } from '../../../api/Admin/AdminApi';
import { useGetAllSubjectsWithLevel } from '../../../api/Admin/SubjectsApi';

// ─── Modern Skeleton Loader ──────────────────────────────────────────────────
const SkeletonRow = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="h-12 rounded-2xl bg-gray-100 animate-pulse border border-gray-50"
        style={{ animationDelay: `${i * 100}ms` }}
      />
    ))}
  </div>
);

// ─── Premium Select Dropdown ─────────────────────────────────────────────────
const Selectable = ({ label, options = [], setSelectedOption, selectedOption, icon }) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6A00FF] transition-colors">
      {icon}
    </div>
    <select
      value={selectedOption ? JSON.stringify(selectedOption) : ""}
      onChange={(e) => {
        if (!e.target.value) return setSelectedOption(null);
        setSelectedOption(JSON.parse(e.target.value));
      }}
      className="w-full pl-11 pr-10 py-3 text-sm font-medium text-gray-700 bg-gray-50/50 border border-gray-200/80 rounded-2xl
                 appearance-none cursor-pointer transition-all duration-300
                 hover:bg-white hover:border-[#6A00FF] focus:outline-none focus:ring-4 focus:ring-[#6A00FF]/10 focus:bg-white focus:border-[#6A00FF]"
    >
      <option value="">Select {label}...</option>
      {options.map((item) => (
        <option key={item.id} value={JSON.stringify(item)}>
          {item.name}
        </option>
      ))}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

// ─── Enhanced Avatar ─────────────────────────────────────────────────────────
const Avatar = ({ name = "", src, size = "w-8 h-8" }) => {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return src
    ? <img src={src} alt={name} className={`${size} rounded-full object-cover ring-2 ring-white shadow-sm`} />
    : (
      <div className={`${size} rounded-full bg-gradient-to-br from-[#6A00FF] to-[#8E33FF] flex items-center justify-center text-[10px] font-bold text-white shadow-md ring-2 ring-white`}>
        {initials}
      </div>
    );
};

// ─── Multi-Select Field (Attractive Chips & Grid) ────────────────────────────
const MultiSelectField = ({ options = [], placeholder, onSelect, isLoading }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [search, setSearch] = useState('');
  const allSelected = selectedOptions.length === options.length && options.length > 0;

  const filtered = options.filter(o => o.name?.toLowerCase().includes(search.toLowerCase()));

  const toggle = useCallback((option) => {
    setSelectedOptions(prev => {
      const next = prev.some(i => i.id === option.id) ? prev.filter(i => i.id !== option.id) : [...prev, option];
      onSelect(next);
      return next;
    });
  }, [onSelect]);

  const toggleAll = () => {
    const next = allSelected ? [] : options;
    setSelectedOptions(next);
    onSelect(next);
  };

  if (isLoading) return <SkeletonRow count={8} />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${placeholder}...`}
            className="w-full pl-11 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#6A00FF]/5 focus:border-[#6A00FF] transition-all"
          />
        </div>
        <button
          type="button"
          onClick={toggleAll}
          className={`px-4 py-2.5 text-xs font-bold rounded-2xl border-2 transition-all active:scale-95 whitespace-nowrap ${allSelected ? 'bg-[#6A00FF] border-[#6A00FF] text-white shadow-lg shadow-[#6A00FF]/20' : 'border-gray-200 text-gray-500 hover:border-[#6A00FF] hover:text-[#6A00FF]'
            }`}
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-[#6A00FF]/5 rounded-2xl border border-[#6A00FF]/10">
          {selectedOptions.map(opt => (
            <div
              key={opt.id}
              onClick={() => toggle(opt)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-white border border-[#6A00FF]/20 text-xs font-semibold text-[#6A00FF] cursor-pointer hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all duration-200 group animate-in zoom-in-95"
            >
              <Avatar name={opt.name} src={opt.profilePic} size="w-6 h-6" />
              {opt.name}
              <IoClose className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-500" />
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
        {filtered.map(option => {
          const isChecked = selectedOptions.some(i => i.id === option.id);
          return (
            <div
              key={option.id}
              onClick={() => toggle(option)}
              className={`flex items-center gap-1 sm:gap-3 p-1 sm:p-3 rounded-2xl cursor-pointer transition-all border-2 duration-300
                ${isChecked
                  ? 'bg-white border-[#6A00FF] shadow-md shadow-[#6A00FF]/10 scale-[1.02]'
                  : 'bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                }`}
            >
              <div className={`w-5 h-5 rounded-lg flex items-center justify-center border-2 transition-all ${isChecked ? 'bg-[#6A00FF] border-[#6A00FF]' : 'border-gray-200 bg-white'}`}>
                {isChecked && <IoCheckmarkCircle className="w-4 h-4 text-white" />}
              </div>
              <Avatar name={option.name} src={option.profilePic} size="w-7 h-7" />
              <span className={`truncate text-xs font-bold ${isChecked ? 'text-[#6A00FF]' : 'text-gray-600'}`}>{option.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ icon, text, badge }) => (
  <div className="flex items-center justify-between mb-3 mt-2">
    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
      <span className="p-1.5 rounded-lg bg-gray-100 text-[#6A00FF]">{icon}</span>
      {text}
    </label>
    {badge != null && badge > 0 && (
      <span className="text-[10px] px-2.5 py-1 rounded-full bg-[#6A00FF] text-white font-bold shadow-sm">
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
  const [classroomName, setClassroomName] = useState("");
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
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) handleClose(); };
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

  const handleSubjectCheckboxChange = useCallback((teacherId, subject, isChecked) => {
    const scrollTop = scrollRef.current?.scrollTop ?? 0;

    setSelectedSubjects(prev => {
      const curr = prev[teacherId] || [];
      const updatedSubjects = isChecked ? [...curr, subject] : curr.filter(s => s.id !== subject.id);
      const newSubjectsState = { ...prev, [teacherId]: updatedSubjects };

      setTeachersArr(() =>
        Object.entries(newSubjectsState).flatMap(([tid, subjects]) =>
          subjects.map(subj => ({
            teacher: tid,
            subject: subj.id,
            type: headTeacher?.id === tid ? "head" : "teacher",
          }))
        )
      );
      return newSubjectsState;
    });

    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollTop;
    });
  }, [headTeacher]);

  const createClassroomMutation = useMutation({
    mutationKey: ["addclassroom"],
    mutationFn: (data) => createClassroom(data),
    onSuccess: async () => {
      await refetch();
      handleClose();
      toast.success("Classroom created successfully! 🎉");
    },
    onError: () => toast.error("Failed to create classroom. Please try again."),
  });

  const handleCreateClass = () => {
    const { subscriptionData, allClassrooms } = useAdmin();
    const { subscription } = subscriptionData || {};

    if (!isEditTrue && subscription?.classLimit > 0) {
      const currentClassrooms = allClassrooms?.length || 0;
      if (currentClassrooms >= subscription.classLimit) {
        return toast.error(`Limit reached! Your current package allows only ${subscription.classLimit} classrooms. Please upgrade your plan.`);
      }
    }

    const nameOk = /^[a-zA-Z0-9\s]+$/.test(classroomName.trim());
    if (!classroomName.trim()) return toast.error("Enter a classroom name.");
    if (!nameOk) return toast.error("No special characters allowed.");
    if (!selectedLevel) return toast.error("Select a level.");
    if (selectedTeachers.length === 0) return toast.error("Select teachers.");
    if (selectedStudents.length === 0) return toast.error("Select students.");

    createClassroomMutation.mutate({
      name: classroomName.trim(),
      levelID: selectedLevel.id,
      students: selectedStudents.map(s => s.id),
      teachers: teacherArr,
      headTeacher: headTeacher?.id || "",
    });
  };

  if (!open) return null;
  const isPending = createClassroomMutation.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 sm:p-6">
      {/* Backdrop with strong blur */}
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-md transition-opacity" onClick={handleClose} />

      {/* Main Modal Container */}
      <div
        ref={ref}
        className="relative w-full max-w-2xl  sm:max-h-[92vh] flex flex-col sm:rounded-[2.5rem] bg-white shadow-[0_30px_100px_-15px_rgba(106,0,255,0.25)] overflow-hidden border border-white/20"
      >
        {/* Animated Gradient Border Top */}
        <div className="h-2 w-full bg-gradient-to-r from-[#6A00FF] via-[#AD00FF] to-[#6A00FF] bg-[length:200%_auto] animate-gradient" />

        {/* Header Section */}
        <div className="flex items-center justify-between px-3 sm:px-10 pt-8 pb-4">
          <div className="flex items-center gap-2 sm:gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6A00FF] to-[#8E33FF] flex items-center justify-center shadow-lg shadow-[#6A00FF]/30 ring-4 ring-[#6A00FF]/10">
              {isEditTrue ? <IoPencil className="w-6 h-6 text-white" /> : <IoSchool className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                {isEditTrue ? "Edit Classroom" : "Create New Class"}
              </h2>
              <p className="text-sm font-medium text-gray-400">Configure your academic space</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
          >
            <IoClose className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div
          ref={scrollRef}
          className="flex flex-col overflow-y-auto px-3 sm:px-10 py-6 space-y-8 custom-scrollbar"
          style={{ overflowAnchor: 'none' }}
        >
          {/* Input: Classroom Name */}
          <div className="space-y-1">
            <SectionLabel icon={<IoText className="w-3.5 h-3.5" />} text="Classroom Identification" />
            <div className="relative group">
              <IoText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6A00FF] transition-colors" />
              <input
                value={classroomName}
                onChange={e => setClassroomName(e.target.value)}
                placeholder="e.g. Grade 10 - Excellence"
                className="w-full pl-11 pr-4 py-3.5 text-sm font-semibold bg-gray-50/50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-[#6A00FF] focus:bg-white focus:ring-4 focus:ring-[#6A00FF]/5 transition-all"
              />
            </div>
          </div>

          {/* Input: Level */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <SectionLabel icon={<IoGrid className="w-3.5 h-3.5" />} text="Academic Level" />
              <Selectable
                icon={<IoGrid className="w-4 h-4" />}
                label="Level"
                options={allLevels}
                setSelectedOption={setSelectedLevel}
                selectedOption={selectedLevel}
              />
            </div>

            {selectedLevel && (
              <div className="space-y-1 animate-in slide-in-from-right-4 duration-300">
                <SectionLabel icon={<IoStar className="w-3.5 h-3.5 text-amber-500" />} text="Lead (Optional)" />
                <Selectable
                  icon={<IoStar className="w-4 h-4 text-amber-500" />}
                  label="Head Teacher"
                  options={adminUsersData.allTeachers}
                  setSelectedOption={setHeadTeacher}
                  selectedOption={headTeacher}
                />
              </div>
            )}
          </div>

          {selectedLevel && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
              {/* Teachers Selection */}
              <div className="p-2 sm:p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100">
                <SectionLabel icon={<IoPeople className="w-3.5 h-3.5" />} text="Faculty Members" badge={selectedTeachers.length} />
                <MultiSelectField placeholder="teachers" onSelect={setSelectedTeachers} options={adminUsersData.allTeachers} />
              </div>

              {/* Subject Mapping */}
              {selectedTeachers.length > 0 && (
                <div className="space-y-4">
                  <SectionLabel icon={<IoBook className="w-3.5 h-3.5" />} text="Subject Specialization" />
                  <div className="space-y-4">
                    {selectedTeachers.map(teacher => (
                      <div key={teacher.id} className="p-2 sm:p-5 rounded-[2rem] bg-white border-2 border-gray-50 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center gap-1 sm:gap-3 mb-4">
                          <Avatar name={teacher.name} src={teacher.profilePic} />
                          <span className="text-sm font-black text-gray-700">{teacher.name}</span>
                          {headTeacher?.id === teacher.id && (
                            <span className="text-[9px] px-2.5 py-1 rounded-lg bg-amber-100 text-amber-600 font-black tracking-tighter uppercase ring-1 ring-amber-200">Head Master</span>
                          )}
                        </div>
                        {subjectsLoading ? <SkeletonRow count={3} /> : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {subjectWithLevel.map(subject => {
                              const checked = selectedSubjects[teacher.id]?.some(s => s.id === subject.id);
                              return (
                                <label key={subject.id} className={`flex items-center gap-1sm:gap-3 px-4 py-2.5 rounded-xl cursor-pointer border-2 transition-all active:scale-95 ${checked ? 'bg-[#6A00FF]/5 border-[#6A00FF]/20 text-[#6A00FF]' : 'bg-gray-50 border-transparent text-gray-500'}`}>
                                  <input type="checkbox" className="hidden" checked={checked} onChange={e => handleSubjectCheckboxChange(teacher.id, subject, e.target.checked)} />
                                  <IoBook className={`w-3.5 h-3.5 ${checked ? 'text-[#6A00FF]' : 'text-gray-300'}`} />
                                  <span className="text-[11px] font-bold truncate">{subject.name}</span>
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
              <div className="p-2 sm:p-6 rounded-[2rem] bg-gray-50/50 border border-gray-100">
                <SectionLabel icon={<IoSchool className="w-3.5 h-3.5" />} text="Student Enrollment" badge={selectedStudents.length} />
                <MultiSelectField placeholder="students" onSelect={setSelectedStudents} options={studentWithLevel} isLoading={studentsLoading} />
              </div>
            </div>
          )}
        </div>

        {/* Footer with Premium Button */}
        <div className="px-3 sm:px-10 py-8 bg-white border-t border-gray-50">
          <button
            onClick={handleCreateClass}
            disabled={isPending}
            className="group relative w-full py-4 rounded-[1.5rem] overflow-hidden transition-all active:scale-[0.98] disabled:opacity-70 disabled:grayscale disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#6A00FF] to-[#AD00FF] group-hover:opacity-90 transition-opacity" />
            <div className="relative flex items-center justify-center gap-3 text-white font-black text-base tracking-wide shadow-[0_10px_25px_-5px_rgba(106,0,255,0.4)]">
              {isPending ? (
                <>
                  <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span>{isEditTrue ? "UPDATING SPACE..." : "RESERVING CLASSROOM..."}</span>
                </>
              ) : (
                <>
                  <IoCheckmarkCircle className="w-6 h-6" />
                  <span>{isEditTrue ? "CONFIRM UPDATES" : "FINALIZE CLASSROOM"}</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #D1D5DB; }
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient { animation: gradient 3s ease infinite; }
      `}</style>
    </div>
  );
};

export default ClassModal;
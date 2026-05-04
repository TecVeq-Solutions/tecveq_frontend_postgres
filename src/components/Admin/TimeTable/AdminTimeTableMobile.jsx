import React, { useState, useEffect, useMemo, useRef } from 'react';
import moment from 'moment-timezone';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoChevronBack,
    IoChevronForward,
    IoSearch,
    IoTimeOutline,
    IoPersonOutline,
    IoBookOutline,
    IoFilterOutline,
    IoAddOutline,
    IoCalendarOutline,
    IoRocketOutline,
    IoSparklesOutline,
    IoCloseOutline,
    IoEllipsisHorizontal
} from 'react-icons/io5';
import { useAdmin } from '../../../context/AdminContext';
import { useTeacher } from '../../../utils/TeacherProvider';
import ViewEventDetailsModal from './viewEventDetailsModal';
import FilterClassesModal from './FilterClassesModal';
import SchedualClasses from './SchedualClasses';
import { useQuery } from '@tanstack/react-query';
import { getAllClasses } from '../../../api/ForAllAPIs';
import { formatTimeInPKT } from "../../../utils/timeUtils";

/* ─── Unique color palette per subject index ─── */
const CLASS_PALETTES = [
    {
        grad: 'from-rose-500 to-pink-600',
        soft: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        shadow: 'shadow-rose-500/20'
    },
    {
        grad: 'from-violet-500 to-purple-600',
        soft: 'bg-violet-50',
        text: 'text-violet-700',
        border: 'border-violet-200',
        shadow: 'shadow-violet-500/20'
    },
    {
        grad: 'from-sky-500 to-blue-600',
        soft: 'bg-sky-50',
        text: 'text-sky-700',
        border: 'border-sky-200',
        shadow: 'shadow-sky-500/20'
    },
    {
        grad: 'from-amber-500 to-orange-500',
        soft: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        shadow: 'shadow-amber-500/20'
    },
    {
        grad: 'from-emerald-500 to-teal-600',
        soft: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        shadow: 'shadow-emerald-500/20'
    },
    {
        grad: 'from-fuchsia-500 to-pink-600',
        soft: 'bg-fuchsia-50',
        text: 'text-fuchsia-700',
        border: 'border-fuchsia-200',
        shadow: 'shadow-fuchsia-500/20'
    },
];

const getPalette = (idx) => CLASS_PALETTES[idx % CLASS_PALETTES.length];

/* ─── Skeleton Card ─── */
const SkeletonCard = () => (
    <div className="flex gap-3 mb-1">
        <div className="w-16 shrink-0 flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="w-10 h-9 rounded-lg bg-slate-50 animate-pulse" />
        </div>
        <div className="flex-1 rounded-[24px] bg-white border border-slate-100 overflow-hidden shadow-sm shadow-slate-100/50">
            <div className="h-[3px] bg-slate-50" />
            <div className="p-3.5 flex flex-col gap-2.5">
                <div className="w-14 h-4 rounded-lg bg-slate-50 animate-pulse" />
                <div className="w-4/5 h-3.5 rounded-md bg-slate-50 animate-pulse" />
                <div className="w-1/2 h-3 rounded-md bg-slate-50 animate-pulse" />
            </div>
        </div>
    </div>
);

const AdminTimeTableMobile = ({ data, isPending, refetch, isRefetching }) => {
    const [selectedDate, setSelectedDate] = useState(moment());
    const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week'));
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [direction, setDirection] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addScheduleModalOpen, setAddScheduleModalOpen] = useState(false);

    const { adminUsersData } = useAdmin();
    const { teacherID, updateTeacherID } = useTeacher();
    const scrollRef = useRef(null);


    const filteredEvents = useMemo(() => {
        if (!data) return [];
        return data.filter(event =>
            moment(event.startTime).isSame(selectedDate, 'day')
        ).sort((a, b) => moment(a.startTime).diff(moment(b.startTime)));
    }, [data, selectedDate]);

    const weekDays = useMemo(() => {
        const days = [];
        const start = currentWeekStart.clone();
        for (let i = 0; i < 7; i++) {
            days.push(start.clone().add(i, 'days'));
        }
        return days;
    }, [currentWeekStart]);

    const handleNextWeek = () => {
        setDirection(1);
        setCurrentWeekStart(prev => prev.clone().add(1, 'week'));
    };

    const handlePrevWeek = () => {
        setDirection(-1);
        setCurrentWeekStart(prev => prev.clone().subtract(1, 'week'));
    };

    const handleTeacherChange = (id) => {
        updateTeacherID(id);
    };

    const handleEventClick = (event) => { setSelectedEvent(event); setDetailsModalOpen(true); };

    useEffect(() => {
        if (!selectedDate.isBetween(currentWeekStart.clone().subtract(1, 'day'), currentWeekStart.clone().add(7, 'days'))) {
            setSelectedDate(currentWeekStart.clone());
        }
    }, [currentWeekStart]);

    return (
        <div className="flex flex-col w-full min-h-screen pb-10 bg-gradient-to-br from-[#f8f7ff] via-[#f0f4ff] to-[#faf5ff] font-['DM_Sans','Helvetica_Neue',sans-serif] selection:bg-indigo-100">
            {/* ══════════════════════════════
                HEADER
            ══════════════════════════════ */}
            <header className="sticky top-16 sm:top-20 z-10 px-2 sm:px-5 pt-8 pb-4 bg-[#f8f7ff]/90 backdrop-blur-3xl border-b border-violet-500/10">
                {/* Top Row */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1 sm:gap-1.5 px-1 sm:px-3 py-1.5 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm shadow-violet-100">
                        <IoSparklesOutline size={12} />
                        Admin Mobview
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileTap={{ scale: 0.88 }}
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 shadow-sm hover:bg-slate-50 transition-colors"
                        >
                            <IoSearch size={18} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAddScheduleModalOpen(true)}
                            className="flex items-center gap-1.5 h-9 px-2 sm:px-4 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[11px] font-extrabold shadow-lg shadow-violet-500/30 whitespace-nowrap"
                        >
                            <IoAddOutline size={16} />
                            Schedule Classes
                        </motion.button>
                    </div>
                </div>

                {/* Nav Row */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handlePrevWeek}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-slate-400 hover:bg-slate-100 transition-colors"
                        >
                            <IoChevronBack size={20} />
                        </motion.button>
                        <div className="text-center min-w-[100px] sm:min-w-[130px]">
                            <h2 className="text-[15px] font-black text-slate-900 tracking-tight leading-none">
                                {selectedDate.format('D MMM, YYYY')}
                            </h2>
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.12em] mt-1">
                                Week of {currentWeekStart.format('D MMM')}
                            </p>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleNextWeek}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 bg-white hover:bg-slate-100 transition-colors"
                        >
                            <IoChevronForward size={20} />
                        </motion.button>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setAddModalOpen(true)}
                        className="flex items-center gap-1.5 h-8 px-2 sm:px-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-bold shadow-sm shadow-slate-100/50 whitespace-nowrap hover:bg-slate-50 transition-colors"
                    >
                        <IoFilterOutline size={15} />
                        Filter Classes
                    </motion.button>
                </div>

                {/* Teacher Filter */}
                <AnimatePresence>
                    {(isSearchOpen || teacherID) && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden mb-4"
                        >
                            <div className="relative">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10 text-violet-500">
                                    <IoPersonOutline size={16} />
                                </div>
                                <select
                                    value={teacherID || ""}
                                    onChange={(e) => handleTeacherChange(e.target.value)}
                                    className="w-full bg-white text-slate-800 text-sm font-bold rounded-2xl py-3.5 pl-11 pr-10 appearance-none outline-none border border-violet-100 shadow-inner"
                                >
                                    <option value="">All Teachers</option>
                                    {adminUsersData?.allTeachers?.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-300">
                                    <IoChevronForward size={14} className="rotate-90" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ─── DATE PICKER ─── */}
                <div className="relative overflow-hidden -mx-1 px-1">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentWeekStart.format('YYYY-WW')}
                            custom={direction}
                            variants={{
                                enter: (d) => ({ x: d > 0 ? '50%' : '-50%', opacity: 0 }),
                                center: { x: 0, opacity: 1 },
                                exit: (d) => ({ x: d < 0 ? '50%' : '-50%', opacity: 0 })
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="flex gap-1.5 px-0  py-1 sm:px-1"
                        >
                            {weekDays.map((date, idx) => {
                                const isSelected = date.isSame(selectedDate, 'day');
                                const isToday = date.isSame(moment(), 'day');

                                return (
                                    <motion.button
                                        key={idx}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedDate(date)}
                                        className={`flex-1 flex flex-col items-center justify-center h-16 sm:h-20 rounded-[10px] sm:rounded-[20px] transition-all duration-300 relative overflow-hidden outline-none ${isSelected
                                            ? 'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white shadow-xl shadow-violet-500/40 -translate-y-1 scale-105'
                                            : isToday
                                                ? 'bg-violet-500/5 border border-violet-500/20 text-slate-500'
                                                : 'bg-white border border-slate-100 text-slate-500 shadow-sm'
                                            }`}
                                    >
                                        {/* Shimmer on selected */}
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-radial-gradient from-white/20 to-transparent pointer-events-none" />
                                        )}

                                        <span className={`text-[12px] font-black uppercase tracking-[0.14em] mb-1.5 leading-none ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
                                            {date.format('ddd')}
                                        </span>

                                        <span className="text-[20px] font-black tracking-tighter leading-none">
                                            {date.format('D')}
                                        </span>

                                        {/* Dot indicator */}
                                        {(isSelected || isToday) && (
                                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-white/100' : 'bg-violet-500'}`} />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </header>

            {/* ══════════════════════════════
                MAIN CONTENT
            ══════════════════════════════ */}
            <main className="px-2 sm:px-5 mt-6 flex-1">
                {/* Section label */}
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-500 mb-1">
                            Timeline
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                            {selectedDate.isSame(moment(), 'day') ? "Today's Classes" : selectedDate.format("dddd, D MMM")}
                        </h3>
                    </div>
                    {filteredEvents.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/5 border border-violet-500/10 shadow-sm shadow-violet-500/5">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                            <span className="text-[10px] font-black text-violet-700 uppercase tracking-wider">
                                {filteredEvents.length} {filteredEvents.length === 1 ? 'class' : 'classes'}
                            </span>
                        </div>
                    )}
                </div>

                {/* ─── Loading ─── */}
                {isPending ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>

                ) : filteredEvents.length > 0 ? (
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={selectedDate.format('YYYY-MM-DD')}
                            custom={direction}
                            variants={{
                                enter: (d) => ({ x: d > 0 ? 50 : -50, opacity: 0 }),
                                center: { x: 0, opacity: 1 },
                                exit: (d) => ({ x: d < 0 ? 50 : -50, opacity: 0 })
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            className="pb-12"
                        >
                            {filteredEvents.map((event, idx) => {
                                const palette = getPalette(idx);
                                const isLast = idx === filteredEvents.length - 1;
                                return (
                                    <React.Fragment key={event.id}>
                                        <motion.div
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleEventClick(event)}
                                            className="flex gap-2 sm:gap-3 cursor-pointer mb-1"
                                        >
                                            {/* Left: time strip */}
                                            <div className="flex flex-col  justify-center items-center shrink-0 w-10 sm:w-16">
                                                {/* Icon */}
                                                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${palette.grad} shadow-lg ${palette.shadow}`}>
                                                    <IoTimeOutline size={18} className="text-white" />
                                                </div>

                                                {/* Time display */}
                                                <div className="text-center mt-2">
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="text-[11px] font-black text-slate-800 leading-none">
                                                            {formatTimeInPKT(event.startTime, "h:mm")}
                                                        </span>
                                                        <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">
                                                            {formatTimeInPKT(event.startTime, "A")}
                                                        </span>
                                                    </div>
                                                    <div className="text-slate-300 text-[10px] my-1 leading-none">—</div>
                                                    <div className="flex flex-col items-center gap-0.5">
                                                        <span className="text-[11px] font-black text-slate-800 leading-none">
                                                            {formatTimeInPKT(event.endTime, "h:mm")}
                                                        </span>
                                                        <span className="text-[8px] font-bold text-indigo-400 uppercase leading-none">
                                                            {formatTimeInPKT(event.endTime, "A")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: card */}
                                            <div className={`flex-1 min-w-0 rounded-3xl bg-white border border-slate-100 shadow-sm shadow-slate-200/50 mb-1 transition-transform duration-150 overflow-hidden`}>
                                                {/* Top accent bar */}
                                                <div className={`h-[3px] w-full bg-gradient-to-r ${palette.grad}`} />

                                                <div className="p-2 sm:p-4">
                                                    {/* Badges */}
                                                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${palette.soft} ${palette.text} border ${palette.border}`}>
                                                            {event.subject?.name || "Subject"}
                                                        </span>
                                                        {event.meetingUrl && (
                                                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                Live
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Title */}
                                                    <div className="text-[15px] font-black text-slate-900 mb-3 tracking-tight leading-snug truncate">
                                                        {event.title || "Untitled Session"}
                                                    </div>

                                                    {/* Meta row */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {/* Teacher */}
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
                                                                    <IoPersonOutline size={12} className="text-slate-400" />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[70px]">
                                                                    {event.teacher?.name || "N/A"}
                                                                </span>
                                                            </div>
                                                            {/* Classroom */}
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
                                                                    <IoCalendarOutline size={12} className="text-slate-400" />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-500 truncate max-w-[70px]">
                                                                    {event.classroom?.name || "Global"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* End time pill */}
                                                        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-slate-50 text-slate-400 sm:block hidden border border-slate-100 whitespace-nowrap">
                                                            → {formatTimeInPKT(event.endTime, "hh:mm A")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Timeline connector */}
                                        {!isLast && (
                                            <div className="flex gap-3 h-4 mb-1">
                                                <div className="w-16 flex justify-center">
                                                    <div className="w-px h-full bg-gradient-to-b from-slate-200 to-transparent" />
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>

                ) : (
                    /* ─── Empty State ─── */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.35 }}
                        className="flex flex-col items-center justify-center pt-16 pb-24 px-6 text-center"
                    >
                        <div className="relative mb-7">
                            <div className="w-[120px] h-[120px] rounded-[36px] bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center shadow-xl shadow-violet-500/5">
                                <IoCalendarOutline size={52} className="text-violet-500 opacity-60" />
                            </div>
                            <div className="absolute -top-2.5 -right-2.5 w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-lg shadow-black/5 animate-bounce-slow">
                                <IoRocketOutline size={18} className="text-violet-500" />
                            </div>
                            <div className="absolute -bottom-2 -left-2.5 w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-md shadow-black/5">
                                <IoSparklesOutline size={14} className="text-purple-400" />
                            </div>
                        </div>

                        <h5 className="text-[22px] font-black text-slate-900 tracking-tight mb-2">
                            Free Day!
                        </h5>
                        <p className="text-slate-400 text-[13px] leading-relaxed max-w-[200px] font-medium mx-auto">
                            No classes scheduled for this day. A perfect time to plan something great.
                        </p>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAddScheduleModalOpen(true)}
                            className="mt-8 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-[13px] font-black tracking-wide shadow-xl shadow-violet-500/30"
                        >
                            + Schedule a Session
                        </motion.button>
                    </motion.div>
                )}
            </main>

            {/* ══════════════════════════════
                FLOATING ACTION BUTTON
            ══════════════════════════════ */}
            <div className="fixed bottom-10 right-6 z-40 pointer-events-none">
                <motion.button
                    whileHover={{ scale: 1.08, rotate: 4 }}
                    whileTap={{ scale: 0.9, rotate: -2 }}
                    onClick={() => setAddScheduleModalOpen(true)}
                    className="pointer-events-auto flex items-center gap-2.5 h-[52px] pl-3 pr-5 rounded-[22px] bg-gradient-to-br from-violet-500 to-purple-600 text-white text-[13px] font-black tracking-wide shadow-2xl shadow-violet-500/50 border-t border-white/20"
                >
                    <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                        <IoAddOutline size={20} />
                    </div>
                    Add Session
                </motion.button>
            </div>

            {/* ══════════════════════════════
                MODALS
            ══════════════════════════════ */}
            <AnimatePresence>
                {detailsModalOpen && (
                    <ViewEventDetailsModal
                        isOpen={detailsModalOpen}
                        onClose={() => setDetailsModalOpen(false)}
                        event={selectedEvent}
                    />
                )}
            </AnimatePresence>

            {addModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 sm:p-4 bg-[#0f0a28]/45 backdrop-blur-xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-white w-full max-w-sm rounded-[36px] overflow-hidden shadow-2xl shadow-black/20"
                    >
                        <FilterClassesModal
                            setAddModalOpen={setAddModalOpen}
                            classData={data}
                            isPending={isPending}
                        />
                    </motion.div>
                </div>
            )}

            <AnimatePresence>
                {addScheduleModalOpen && (
                    <div className="fixed inset-0 z-[60] flex justify-center items-end pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-auto"
                            onClick={() => setAddScheduleModalOpen(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="bg-white w-full max-w-lg h-[100vh] sm:h-[90vh]  rounded-t-[0px] sm:rounded-t-[40px] shadow-2xl shadow-black/20 overflow-hidden relative flex flex-col pointer-events-auto"
                        >
                            <div className="pt-4 pb-1 shrink-0 flex justify-center">
                                <div className="w-10 h-1 rounded-full bg-slate-200" />
                            </div>
                            <div className="mx-5 mb-1 h-px shrink-0 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                            <div className="flex-1 overflow-hidden">
                                <SchedualClasses
                                    refetch={refetch}
                                    addScheduleModalOpen={addScheduleModalOpen}
                                    setAddScheduleModalOpen={setAddScheduleModalOpen}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminTimeTableMobile;
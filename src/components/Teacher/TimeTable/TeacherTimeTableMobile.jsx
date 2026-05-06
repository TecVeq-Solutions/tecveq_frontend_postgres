import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment-timezone';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoChevronBack,
    IoChevronForward,
    IoPersonOutline,
    IoFilterOutline,
    IoAddOutline,
    IoCalendarOutline,
    IoRocketOutline,
    IoSparklesOutline
} from 'react-icons/io5';
import ViewEventDetailsModal from './viewEventDetailsModal';
import FilterClassesModal from './FilterClassesModal';
import SchedualClasses from './SchedualClasses';
import { formatTimeInPKT } from '../../../utils/timeUtils';

/* ─── Admin timetable same palette/style ─── */
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
    }
];

const getPalette = (idx) => CLASS_PALETTES[idx % CLASS_PALETTES.length];

const IconButton = ({ children, onClick, className = '', label }) => (
    <motion.button
        type="button"
        aria-label={label}
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
        className={`grid place-items-center rounded-2xl bg-white/85 text-slate-500 shadow-sm shadow-violet-100/70 ring-1 ring-violet-100/80 backdrop-blur-xl transition-all duration-200 hover:bg-white hover:text-violet-600 hover:shadow-md ${className}`}
    >
        {children}
    </motion.button>
);

const SkeletonCard = () => (
    <div className="relative flex gap-3 overflow-hidden rounded-[30px] border border-white/70 bg-white/70 p-3 shadow-sm shadow-violet-100/60 backdrop-blur-xl">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-100 via-purple-100 to-indigo-100" />
        <div className="flex w-14 shrink-0 flex-col items-center gap-2">
            <div className="h-11 w-11 animate-pulse rounded-2xl bg-violet-50" />
            <div className="h-9 w-10 animate-pulse rounded-xl bg-slate-50" />
        </div>
        <div className="flex flex-1 flex-col gap-3 py-1">
            <div className="h-4 w-20 animate-pulse rounded-full bg-violet-50" />
            <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-50" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-slate-50" />
        </div>
    </div>
);

const TeacherTimeTableMobile = ({ data, isPending, refetch, isRefetching }) => {
    const [selectedDate, setSelectedDate] = useState(moment());
    const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week'));
    const [direction, setDirection] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addScheduleModalOpen, setAddScheduleModalOpen] = useState(false);

    const filteredEvents = useMemo(() => {
        if (!data) return [];
        return data
            .filter((event) => moment(event.startTime).isSame(selectedDate, 'day'))
            .sort((a, b) => moment(a.startTime).diff(moment(b.startTime)));
    }, [data, selectedDate]);

    const weekDays = useMemo(() => {
        const start = currentWeekStart.clone();
        return Array.from({ length: 7 }, (_, i) => start.clone().add(i, 'days'));
    }, [currentWeekStart]);

    const selectedDateLabel = selectedDate.isSame(moment(), 'day')
        ? "Today's Classes"
        : selectedDate.format('dddd, D MMM');

    const handleNextWeek = () => {
        setDirection(1);
        setCurrentWeekStart((prev) => prev.clone().add(1, 'week'));
    };

    const handlePrevWeek = () => {
        setDirection(-1);
        setCurrentWeekStart((prev) => prev.clone().subtract(1, 'week'));
    };

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setDetailsModalOpen(true);
    };

    useEffect(() => {
        const isInsideWeek = selectedDate.isBetween(
            currentWeekStart.clone().subtract(1, 'day'),
            currentWeekStart.clone().add(7, 'days')
        );

        if (!isInsideWeek) {
            setSelectedDate(currentWeekStart.clone());
        }
    }, [currentWeekStart, selectedDate]);

    return (
        <div className="relative flex min-h-screen w-full min-w-[320px] flex-col overflow-x-hidden bg-gradient-to-br from-[#f6f2ff] via-[#eef4ff] to-[#fff3fb] pb-10 font-['DM_Sans','Helvetica_Neue',sans-serif] selection:bg-violet-100">
            <div className="pointer-events-none fixed -left-28 top-20 h-72 w-72 rounded-full bg-violet-400/25 blur-3xl" />
            <div className="pointer-events-none fixed -right-32 top-52 h-80 w-80 rounded-full bg-fuchsia-300/25 blur-3xl" />
            <div className="pointer-events-none fixed bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl" />

            <header className="sticky  top-2 sm:top-16 z-20 border-b border-white/70 bg-[#ede9fe]/90 px-2 pt-4 pb-3 shadow-sm shadow-violet-100/60 backdrop-blur-3xl min-[375px]:px-1 sm:top-20 sm:px-5">
                <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-700 p-1 shadow-2xl shadow-violet-200/35 ring-1 ring-violet-100/50 backdrop-blur-2xl min-[375px]:rounded-[34px] min-[375px]:p-3 sm:p-2">
                    <div className="pointer-events-none absolute -right-16 -top-20 h-40 w-40 rounded-full bg-violet-400/20 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 -left-16 h-40 w-40 rounded-full bg-purple-400/20 blur-3xl" />
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

                    <div className="relative mb-3 rounded-[24px] border border-violet-100/80 bg-gradient-to-br from-white/95 via-violet-50/95 to-fuchsia-50/85 p-2.5 shadow-lg shadow-violet-100/60 min-[375px]:mb-4 min-[375px]:rounded-[28px] min-[375px]:p-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-white/85 px-2.5 py-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-violet-700 shadow-sm shadow-violet-100/80 min-[375px]:px-3 min-[375px]:text-[9px]">
                                    <IoSparklesOutline size={13} />
                                    Teacher Mobview
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[16px] bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white shadow-xl shadow-violet-500/30 ring-1 ring-white/40 min-[375px]:h-11 min-[375px]:w-11 min-[375px]:rounded-[18px]">
                                        <IoCalendarOutline size={21} />
                                    </div>
                                    <div className="min-w-0">
                                        <h1 className="truncate text-[19px] font-black leading-none tracking-[-0.05em] text-slate-950 min-[375px]:text-[22px] sm:text-[27px]">
                                            My Time Table
                                        </h1>
                                        <p className="mt-1 truncate text-[8.5px] font-black uppercase tracking-[0.12em] text-slate-400 min-[375px]:text-[10px] min-[375px]:tracking-[0.16em]">
                                            {currentWeekStart.format('D MMM')} - {currentWeekStart.clone().add(6, 'days').format('D MMM, YYYY')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="shrink-0 rounded-2xl border border-violet-100 bg-white/80 px-2.5 py-2 text-center shadow-sm shadow-violet-100/70 min-[375px]:px-3">
                                <div className="text-[17px] font-black leading-none tracking-[-0.04em] text-violet-700">
                                    {filteredEvents.length}
                                </div>
                                <div className="mt-1 text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">
                                    Classes
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-1.5 min-[375px]:mt-4 min-[375px]:gap-2">
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setAddModalOpen(true)}
                                className="flex h-10 items-center justify-center gap-1 rounded-2xl border border-violet-200 bg-white/90 px-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-violet-700 shadow-sm shadow-violet-100/80 transition-all duration-200 hover:bg-violet-50 min-[375px]:h-11 min-[375px]:gap-1.5 min-[375px]:px-2 min-[375px]:text-[10px]"
                            >
                                <IoFilterOutline size={16} />
                                Filter
                            </motion.button>

                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.94 }}
                                onClick={() => setAddScheduleModalOpen(true)}
                                className="flex h-10 items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-700 px-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-white shadow-xl shadow-violet-500/30 ring-1 ring-white/30 transition-all duration-200 hover:shadow-violet-500/45 min-[375px]:h-11 min-[375px]:gap-1.5 min-[375px]:px-2 min-[375px]:text-[10px]"
                            >
                                <IoAddOutline size={17} />
                                Schedule
                            </motion.button>
                        </div>
                    </div>

                    <div className="relative mb-3 overflow-hidden rounded-[24px] border border-violet-100/80 bg-white/80 p-1.5 shadow-inner shadow-violet-50 min-[375px]:mb-4 min-[375px]:rounded-[28px] min-[375px]:p-2">
                        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-violet-200 to-transparent" />
                        <div className="flex items-center justify-between gap-3">
                            <IconButton
                                label="Previous week"
                                onClick={handlePrevWeek}
                                className="h-10 w-10 shrink-0 rounded-[16px] min-[375px]:h-11 min-[375px]:w-11 min-[375px]:rounded-[18px]"
                            >
                                <IoChevronBack size={21} />
                            </IconButton>

                            <div className="min-w-0 flex-1 text-center">
                                <div className="mx-auto mb-1 inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-violet-600 ring-1 ring-violet-100">
                                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                                    Selected Day
                                </div>
                                <h2 className="truncate text-[15px] font-black tracking-[-0.04em] text-slate-950 min-[375px]:text-[17px]">
                                    {selectedDate.format('D MMM, YYYY')}
                                </h2>
                                <p className="mt-0.5 text-[9px] font-bold text-slate-400">
                                    {selectedDate.format('dddd')} schedule overview
                                </p>
                            </div>

                            <IconButton
                                label="Next week"
                                onClick={handleNextWeek}
                                className="h-10 w-10 shrink-0 rounded-[16px] min-[375px]:h-11 min-[375px]:w-11 min-[375px]:rounded-[18px]"
                            >
                                <IoChevronForward size={21} />
                            </IconButton>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[24px] border border-violet-100/70 bg-gradient-to-r from-indigo-50/80 via-white/90 to-fuchsia-50/80 p-1 shadow-sm shadow-violet-100/60 min-[375px]:rounded-[28px] min-[375px]:p-1.5">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={currentWeekStart.format('YYYY-WW')}
                                custom={direction}
                                variants={{
                                    enter: (d) => ({ x: d > 0 ? '45%' : '-45%', opacity: 0 }),
                                    center: { x: 0, opacity: 1 },
                                    exit: (d) => ({ x: d < 0 ? '45%' : '-45%', opacity: 0 })
                                }}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'spring', damping: 25, stiffness: 230 }}
                                className="flex gap-1 min-[375px]:gap-1.5"
                            >
                                {weekDays.map((date, idx) => {
                                    const isSelected = date.isSame(selectedDate, 'day');
                                    const isToday = date.isSame(moment(), 'day');

                                    return (
                                        <motion.button
                                            type="button"
                                            key={idx}
                                            whileTap={{ scale: 0.94 }}
                                            onClick={() => setSelectedDate(date)}
                                            className={`relative flex h-[64px] min-w-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-[17px] outline-none transition-all duration-300 min-[375px]:h-[74px] min-[375px]:rounded-[21px] ${isSelected
                                                ? 'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white shadow-xl shadow-violet-500/35 ring-1 ring-white/40'
                                                : isToday
                                                    ? 'border border-violet-200 bg-white text-violet-700 shadow-sm shadow-violet-100/80'
                                                    : 'border border-white/80 bg-white/70 text-slate-500 shadow-sm shadow-violet-50/70 hover:bg-white'
                                                }`}
                                        >
                                            {isSelected && (
                                                <>
                                                    <div className="absolute -right-5 -top-5 h-14 w-14 rounded-full bg-white/20 blur-sm" />
                                                    <div className="absolute -bottom-6 left-1/2 h-12 w-12 -translate-x-1/2 rounded-full bg-white/10" />
                                                </>
                                            )}
                                            <span className={`text-[8.5px] font-black uppercase tracking-[0.10em] min-[375px]:text-[10px] min-[375px]:tracking-[0.16em] ${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
                                                {date.format('ddd')}
                                            </span>
                                            <span className="mt-1 text-[17px] font-black leading-none tracking-[-0.05em] min-[375px]:text-[20px]">
                                                {date.format('D')}
                                            </span>
                                            <span className={`mt-1.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : isToday ? 'bg-violet-500' : 'bg-transparent'}`} />
                                        </motion.button>
                                    );
                                })}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            <main className="relative z-10 mt-3 flex-1 px-2 sm:px-3">
                <div className="mb-3 flex items-center justify-between gap-1.5 px-0.5 min-[375px]:gap-2 min-[375px]:px-1.5">
                    <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-violet-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                            Timeline
                        </div>
                        <h3 className="truncate text-[16px] font-black leading-none tracking-[-0.04em] text-slate-950 min-[375px]:text-[18px] sm:text-[21px]">
                            {selectedDateLabel}
                        </h3>
                    </div>

                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.94 }}
                        onClick={() => setAddModalOpen(true)}
                        className="flex shrink-0 items-center gap-1 rounded-2xl border border-violet-200 bg-white/90 px-2.5 py-2 text-[9.5px] font-black text-violet-700 shadow-sm shadow-violet-100/70 transition-all duration-200 hover:bg-violet-50 hover:shadow-md min-[375px]:gap-1.5 min-[375px]:px-3.5 min-[375px]:py-2.5 min-[375px]:text-[11px]"
                    >
                        <IoFilterOutline size={15} />
                        Filter Classes
                    </motion.button>
                </div>

                {isPending ? (
                    <div className="flex flex-col gap-2.5 px-0.5 min-[375px]:gap-3 min-[375px]:px-1.5">
                        {[1, 2, 3].map((i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={selectedDate.format('YYYY-MM-DD')}
                            custom={direction}
                            variants={{
                                enter: (d) => ({ x: d > 0 ? 42 : -42, opacity: 0 }),
                                center: { x: 0, opacity: 1 },
                                exit: (d) => ({ x: d < 0 ? 42 : -42, opacity: 0 })
                            }}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="pb-12"
                        >
                            <div className="mb-2 mt-8 flex items-center justify-between rounded-[14px] border border-violet-200 bg-gradient-to-r from-violet-50/90 via-white/90 to-fuchsia-50/80 px-2.5 py-2.5 shadow-sm shadow-violet-100/70 sm:rounded-[18px] sm:px-4">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700 ring-1 ring-violet-200/80 min-[375px]:h-[42px] min-[375px]:w-[42px]">
                                        <span className="text-[8px] font-black uppercase leading-none tracking-[0.12em]">
                                            {selectedDate.format('ddd')}
                                        </span>
                                        <span className="text-[18px] font-black leading-none tracking-[-0.04em]">
                                            {selectedDate.format('DD')}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="truncate text-[12px] font-black leading-tight text-violet-900 min-[375px]:text-[13px] sm:text-[15px]">
                                            {selectedDate.format('dddd')}
                                        </h4>
                                        <p className="mt-0.5 text-[9px] font-bold text-violet-500 min-[375px]:text-[10px]">
                                            {selectedDate.format('MMMM DD, YYYY')}
                                        </p>
                                    </div>
                                </div>

                                <span className="shrink-0 rounded-full border border-violet-200 bg-violet-100 px-2.5 py-1.5 text-[9px] font-black text-violet-700 shadow-sm shadow-violet-100 min-[375px]:px-3 min-[375px]:text-[10px]">
                                    {filteredEvents.length} {filteredEvents.length === 1 ? 'class' : 'classes'}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {filteredEvents.map((event, idx) => {
                                    const palette = getPalette(idx);

                                    return (
                                        <motion.div
                                            key={event.id || `${event.startTime}-${idx}`}
                                            whileTap={{ scale: 0.992 }}
                                            onClick={() => handleEventClick(event)}
                                            className="group relative flex min-h-[86px] cursor-pointer overflow-hidden rounded-[14px] border border-slate-200/90 bg-white shadow-sm shadow-slate-100 transition-all duration-200 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/70 sm:min-h-[96px] sm:rounded-[18px]"
                                        >
                                            <div className={`w-1.5 shrink-0 bg-gradient-to-b ${palette.grad}`} />

                                            <div className={`${palette.soft} flex w-[56px] shrink-0 flex-col items-center justify-center border-r border-slate-100 px-1 text-center min-[375px]:w-[74px] sm:w-[82px]`}>
                                                <span className={`text-[12px] font-black leading-none ${palette.text}`}>
                                                    {formatTimeInPKT(event.startTime, 'hh:mm')}
                                                </span>
                                                <span className={`mt-0.5 text-[8px] font-black uppercase leading-none ${palette.text} opacity-80`}>
                                                    {formatTimeInPKT(event.startTime, 'A')}
                                                </span>
                                                <IoChevronForward size={13} className="my-1 rotate-90 text-slate-300" />
                                                <span className="text-[12px] font-black leading-none text-slate-600">
                                                    {formatTimeInPKT(event.endTime, 'hh:mm')}
                                                </span>
                                                <span className="mt-0.5 text-[8px] font-black uppercase leading-none text-slate-400">
                                                    {formatTimeInPKT(event.endTime, 'A')}
                                                </span>
                                            </div>

                                            <div className="flex min-w-0 flex-1 items-center justify-between gap-1 px-2.5 py-3 min-[375px]:gap-3 min-[375px]:px-3 sm:gap-2 sm:px-4">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="truncate text-[13px] font-black tracking-[-0.02em] text-slate-950 min-[375px]:text-[14px] sm:text-[16px]">
                                                        {event.title || 'Untitled Session'}
                                                    </h4>

                                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                                        <span className={`inline-flex max-w-[112px] items-center gap-1 truncate rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] min-[375px]:max-w-[150px] ${palette.soft} ${palette.text} ${palette.border}`}>
                                                            {event.subject?.name || 'Subject'}
                                                        </span>
                                                        {event.meetingUrl && (
                                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-emerald-600">
                                                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                                                                Live Class
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 sm:hidden">
                                                        <IoCalendarOutline size={12} />
                                                        <span className="truncate">{event.classroom?.name || 'Global'}</span>
                                                    </div>
                                                </div>

                                                <div className="hidden h-16 w-px shrink-0 bg-slate-200 sm:block" />

                                                <div className="flex w-[56px] shrink-0 flex-col items-center justify-center text-center min-[375px]:w-[74px] sm:w-[86px]">
                                                    <div className={`mb-1 grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br ${palette.grad} text-[11px] font-black uppercase text-white shadow-lg ${palette.shadow}`}>
                                                        {(event.teacher?.name || 'U').charAt(0)}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-slate-400">
                                                        <IoPersonOutline size={10} />
                                                        <p className="max-w-[54px] truncate text-[10px] font-black leading-tight text-slate-700 min-[375px]:max-w-[76px] min-[375px]:text-[11px]">
                                                            {event.teacher?.name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <p className="mt-0.5 text-[9px] font-bold text-slate-400">
                                                        Teacher
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className="mx-auto flex max-w-sm flex-col items-center justify-center rounded-[40px] border border-white/80 bg-white/70 px-6 pt-14 pb-12 text-center shadow-xl shadow-violet-100/70 backdrop-blur-xl"
                    >
                        <div className="relative mb-7">
                            <div className="grid h-[128px] w-[128px] place-items-center rounded-[42px] bg-gradient-to-br from-violet-100 via-purple-100 to-indigo-100 shadow-xl shadow-violet-500/10 ring-1 ring-white/80">
                                <IoCalendarOutline size={54} className="text-violet-500/70" />
                            </div>
                            <div className="absolute -right-3 -top-3 grid h-11 w-11 animate-bounce place-items-center rounded-2xl border border-white bg-white shadow-lg shadow-violet-100">
                                <IoRocketOutline size={19} className="text-violet-500" />
                            </div>
                            <div className="absolute -bottom-3 -left-3 grid h-10 w-10 place-items-center rounded-2xl border border-white bg-white shadow-lg shadow-purple-100">
                                <IoSparklesOutline size={16} className="text-purple-500" />
                            </div>
                        </div>

                        <h5 className="mb-2 text-[24px] font-black tracking-[-0.05em] text-slate-950">
                            Free Day!
                        </h5>
                        <p className="mx-auto max-w-[230px] text-[13px] font-semibold leading-relaxed text-slate-400">
                            No classes scheduled for this day. A perfect time to plan something great.
                        </p>

                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setAddScheduleModalOpen(true)}
                            className="mt-8 rounded-[22px] bg-gradient-to-r from-violet-500 to-purple-600 px-7 py-3.5 text-[13px] font-black tracking-wide text-white shadow-xl shadow-violet-500/30"
                        >
                            + Schedule a Session
                        </motion.button>
                    </motion.div>
                )}
            </main>

            <div className="pointer-events-none fixed bottom-6 right-3 z-40 min-[375px]:bottom-8 min-[375px]:right-5">
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.06, rotate: 2 }}
                    whileTap={{ scale: 0.91, rotate: -2 }}
                    onClick={() => setAddScheduleModalOpen(true)}
                    className="pointer-events-auto flex h-[52px] items-center gap-2 rounded-[22px] border border-white/25 bg-gradient-to-br from-violet-500 to-purple-600 pl-3 pr-5 text-[13px] font-black tracking-wide text-white shadow-2xl shadow-violet-500/45 backdrop-blur-xl min-[375px]:h-[56px] min-[375px]:gap-2.5 min-[375px]:rounded-[24px]"
                >
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/20">
                        <IoAddOutline size={21} />
                    </span>
                    Add Session
                </motion.button>
            </div>

            <AnimatePresence>
                {detailsModalOpen && (
                    <ViewEventDetailsModal
                        isOpen={detailsModalOpen}
                        onClose={() => setDetailsModalOpen(false)}
                        event={selectedEvent}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {addModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0f0a28]/45 p-0 backdrop-blur-xl sm:p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="max-h-[100vh] sm:max-h-[92vh] w-full max-w-sm overflow-hidden rounded:sm sm:rounded-[38px] bg-white shadow-2xl shadow-black/20 ring-1 ring-white/60"
                        >
                            <FilterClassesModal
                                setAddModalOpen={setAddModalOpen}
                                classData={data}
                                isPending={isPending}
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {addScheduleModalOpen && (
                    <div className="pointer-events-none fixed inset-0 z-[60] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pointer-events-auto fixed inset-0 bg-slate-950/45 backdrop-blur-md"
                            onClick={() => setAddScheduleModalOpen(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            className="pointer-events-auto relative flex h-[100vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[0px] bg-white shadow-2xl shadow-black/25 sm:h-[90vh] sm:rounded-t-[42px]"
                        >
                            <div className="shrink-0 pt-4 pb-2">
                                <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" />
                            </div>
                            <div className="mx-6 h-px shrink-0 bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
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

export default TeacherTimeTableMobile;

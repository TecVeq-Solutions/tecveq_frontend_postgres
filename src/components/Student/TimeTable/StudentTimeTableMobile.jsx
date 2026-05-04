import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment-timezone';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoChevronBack,
    IoChevronForward,
    IoTimeOutline,
    IoPersonOutline,
    IoFilterOutline,
    IoCalendarOutline,
    IoRocketOutline,
    IoSparklesOutline
} from 'react-icons/io5';
import ViewEventDetailsModal from './ViewEventDetailsModal';
import FilterClassesModal from './FilterClassesModal';
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
    <div className="flex gap-3 mb-4">
        <div className="w-16 shrink-0 flex flex-col items-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="w-10 h-9 rounded-lg bg-slate-50 animate-pulse" />
        </div>
        <div className="flex-1 rounded-[24px] bg-white border border-slate-100 overflow-hidden shadow-sm">
            <div className="h-[3px] bg-slate-50" />
            <div className="p-4 flex flex-col gap-2.5">
                <div className="w-14 h-4 rounded-lg bg-slate-50 animate-pulse" />
                <div className="w-4/5 h-3.5 rounded-md bg-slate-50 animate-pulse" />
                <div className="w-1/2 h-3 rounded-md bg-slate-50 animate-pulse" />
            </div>
        </div>
    </div>
);

const StudentTimeTableMobile = ({ data, isPending, refetch, isRefetching }) => {
    const [selectedDate, setSelectedDate] = useState(moment());
    const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf('week'));
    const [direction, setDirection] = useState(0);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [filterModalOpen, setFilterModalOpen] = useState(false);

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

    const handleEventClick = (event) => {
        setSelectedEvent(event);
        setDetailsModalOpen(true);
    };

    useEffect(() => {
        if (!selectedDate.isBetween(currentWeekStart.clone().subtract(1, 'day'), currentWeekStart.clone().add(7, 'days'))) {
            setSelectedDate(currentWeekStart.clone());
        }
    }, [currentWeekStart]);

    return (
        <div className="flex flex-col w-full min-h-screen pt-4 pb-10 bg-gradient-to-br from-[#f8f7ff] via-[#f0f4ff] to-[#faf5ff] font-['DM_Sans','Helvetica_Neue',sans-serif]">
            {/* HEADER */}
            <header className="sticky top-0 z-10 px-3 sm:px-5 pb-4 bg-[#f8f7ff]/80 backdrop-blur-xl border-b border-indigo-500/5">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex flex-col">
                        <h1 className="text-[20px] font-black text-slate-900 tracking-tight leading-none">
                            My Time Table
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-[0.1em]">
                            View your weekly schedule
                        </p>
                    </div>
                </div>

                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-1">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handlePrevWeek}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 bg-white shadow-sm border border-slate-100"
                        >
                            <IoChevronBack size={20} />
                        </motion.button>
                        <div className="text-center min-w-[120px]">
                            <h2 className="text-[15px] font-black text-slate-900 tracking-tight leading-none">
                                {selectedDate.format('D MMM, YYYY')}
                            </h2>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.12em] mt-1">
                                Week of {currentWeekStart.format('D MMM')}
                            </p>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleNextWeek}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 bg-white shadow-sm border border-slate-100"
                        >
                            <IoChevronForward size={20} />
                        </motion.button>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFilterModalOpen(true)}
                        className="flex items-center gap-1.5 h-8 px-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-[11px] font-bold shadow-sm"
                    >
                        <IoFilterOutline size={15} />
                        Filter
                    </motion.button>
                </div>

                {/* Date Picker */}
                <div className="relative overflow-hidden">
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
                            className="flex gap-1.5 py-1"
                        >
                            {weekDays.map((date, idx) => {
                                const isSelected = date.isSame(selectedDate, 'day');
                                const isToday = date.isSame(moment(), 'day');

                                return (
                                    <motion.button
                                        key={idx}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedDate(date)}
                                        className={`flex-1 flex flex-col items-center justify-center h-16 rounded-[14px] transition-all duration-300 relative overflow-hidden outline-none ${isSelected
                                            ? 'bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-700 text-white shadow-lg shadow-indigo-500/30 scale-105 z-10'
                                            : isToday
                                                ? 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                                                : 'bg-white border border-slate-100 text-slate-500 shadow-sm'
                                            }`}
                                    >
                                        <span className={`text-[10px] font-black uppercase tracking-[0.1em] mb-1 leading-none ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
                                            {date.format('ddd')}
                                        </span>
                                        <span className="text-[18px] font-black tracking-tighter leading-none">
                                            {date.format('D')}
                                        </span>
                                        {(isSelected || isToday) && (
                                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="px-3 sm:px-5 mt-6 flex-1">
                <div className="flex items-end justify-between mb-5">
                    <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-1">
                            Timeline
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                            {selectedDate.isSame(moment(), 'day') ? "Today's Classes" : selectedDate.format("dddd, D MMM")}
                        </h3>
                    </div>
                    {filteredEvents.length > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider">
                                {filteredEvents.length} {filteredEvents.length === 1 ? 'Class' : 'Classes'}
                            </span>
                        </div>
                    )}
                </div>

                {isPending ? (
                    <div className="flex flex-col gap-3">
                        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedDate.format('YYYY-MM-DD')}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="pb-20"
                        >
                            {filteredEvents.map((event, idx) => {
                                const palette = getPalette(idx);
                                const isLast = idx === filteredEvents.length - 1;
                                return (
                                    <React.Fragment key={event.id}>
                                        <motion.div
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleEventClick(event)}
                                            className="flex gap-1 sm:gap-3 cursor-pointer mb-2"
                                        >
                                            {/* Time Column */}
                                            <div className="flex flex-col items-center shrink-0 w-12">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${palette.grad} shadow-md ${palette.shadow}`}>
                                                    <IoTimeOutline size={18} className="text-white" />
                                                </div>
                                                <div className="mt-2 flex flex-col items-center">
                                                    <span className="text-[11px] font-black text-slate-800 leading-none">
                                                        {formatTimeInPKT(event.startTime, "h:mm")}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 mb-1">
                                                        {formatTimeInPKT(event.startTime, "A")}
                                                    </span>
                                                    
                                                    <span className="text-[7px] font-bold text-slate-300 uppercase tracking-widest mb-1">
                                                        TO
                                                    </span>
                                                    
                                                    <span className="text-[11px] font-black text-slate-800 leading-none">
                                                        {formatTimeInPKT(event.endTime, "h:mm")}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                                                        {formatTimeInPKT(event.endTime, "A")}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Event Card */}
                                            <div className="flex-1 rounded-[22px] bg-white border border-slate-100 shadow-sm overflow-hidden mb-1">
                                                <div className={`h-[3px] w-full bg-gradient-to-r ${palette.grad}`} />
                                                <div className="p-4">
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

                                                    <div className="text-[15px] font-black text-slate-900 mb-3 tracking-tight leading-snug">
                                                        {event.title || "Untitled Session"}
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
                                                                    <IoPersonOutline size={12} className="text-slate-400" />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-500">
                                                                    {event.teacher?.name || "N/A"}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center">
                                                                    <IoCalendarOutline size={12} className="text-slate-400" />
                                                                </div>
                                                                <span className="text-[10px] font-bold text-slate-500">
                                                                    {event.classroom?.name || "N/A"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                        {!isLast && (
                                            <div className="flex gap-3 h-4 mb-2">
                                                <div className="w-12 flex justify-center">
                                                    <div className="w-px h-full bg-slate-200" />
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center pt-20 pb-20 px-6 text-center">
                        <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-[30px] bg-indigo-50 flex items-center justify-center">
                                <IoCalendarOutline size={40} className="text-indigo-500/40" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 rounded-xl bg-white shadow-lg flex items-center justify-center">
                                <IoRocketOutline size={16} className="text-indigo-500" />
                            </div>
                        </div>
                        <h5 className="text-[20px] font-black text-slate-900 mb-2">No Classes Today</h5>
                        <p className="text-slate-400 text-[13px] max-w-[200px] font-medium mx-auto">
                            It looks like you have a free day! Enjoy your time.
                        </p>
                    </div>
                )}
            </main>

            {/* Modals */}
            <AnimatePresence>
                {detailsModalOpen && (
                    <ViewEventDetailsModal
                        isOpen={detailsModalOpen}
                        onClose={() => setDetailsModalOpen(false)}
                        event={selectedEvent}
                    />
                )}
            </AnimatePresence>

            {filterModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <FilterClassesModal
                        setAddModalOpen={setFilterModalOpen}
                        classData={data}
                        isPending={isPending}
                    />
                </div>
            )}
        </div>
    );
};

export default StudentTimeTableMobile;

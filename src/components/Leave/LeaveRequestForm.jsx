import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';

// Ionicons 5
import {
    IoSparklesSharp,
    IoCalendarSharp,
    IoCalendarClearSharp,
    IoDocumentTextSharp,
    IoTimeSharp,
    IoPaperPlaneSharp,
    IoCloseCircleSharp,
    IoCheckmarkCircleSharp,
    IoMedkitSharp,
    IoPersonSharp,
    IoHomeSharp,
    IoPrismSharp,
    IoEllipsisHorizontalCircleSharp,
    IoArrowForwardSharp,
    IoRefreshSharp,
    IoChevronDownOutline,
} from 'react-icons/io5';

// Material Design icons
import {
    MdEventNote,
    MdOutlineBeachAccess,
} from 'react-icons/md';

const safeFormatDate = (dateVal) => {
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

const leaveTypes = [
    { label: 'Sick Leave', Icon: IoMedkitSharp, activeColor: 'text-rose-400' },
    { label: 'Personal Leave', Icon: IoPersonSharp, activeColor: 'text-violet-300' },
    { label: 'Family Emergency', Icon: IoHomeSharp, activeColor: 'text-amber-300' },
    { label: 'Religious Leave', Icon: IoPrismSharp, activeColor: 'text-emerald-300' },
    { label: 'Other', Icon: IoEllipsisHorizontalCircleSharp, activeColor: 'text-sky-300' },
];

const LeaveRequestForm = ({ onSuccess, onCancel, initialData = null }) => {
    const [formData, setFormData] = useState(
        initialData
            ? {
                leaveType: initialData.leaveType || 'Sick Leave',
                startDate: safeFormatDate(initialData.startDate),
                endDate: safeFormatDate(initialData.endDate),
                reason: initialData.reason || ''
            }
            : {
                leaveType: 'Sick Leave',
                startDate: '',
                endDate: '',
                reason: ''
            }
    );
    const [loading, setLoading] = useState(false);
    const [totalDays, setTotalDays] = useState(0);
    const [focused, setFocused] = useState(null);

    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end >= start) {
                const days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
                setTotalDays(days);
            } else {
                setTotalDays(0);
            }
        } else {
            setTotalDays(0);
        }
    }, [formData.startDate, formData.endDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            toast.error('End date cannot be before start date');
            return;
        }
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            if (initialData) {
                await axios.put(`${BACKEND_URL}/leave/update/${initialData.id}`, formData, config);
                toast.success('Leave request updated successfully');
            } else {
                await axios.post(`${BACKEND_URL}/leave/apply`, formData, config);
                toast.success('Leave request submitted successfully');
            }
            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit leave request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full font-sans">
            {/* Ambient blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#0B1053] opacity-[0.06] blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#0B1053] opacity-[0.04] blur-3xl" />
            </div>

            <form
                onSubmit={handleSubmit}
                className="relative bg-white/98 backdrop-blur-xl rounded-3xl border border-slate-100 shadow-2xl shadow-[#0B1053]/10 overflow-hidden"
            >
                {/* Top accent bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-[#0B1053] via-indigo-500 to-[#0B1053]/70" />

                <div className="p-3 sm:p-6 sm:p-8 space-y-7">

                    {/* ── Header ── */}
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-[#0B1053]/[0.08] text-[#0B1053] border-[#0B1053]/20">
                                <IoSparklesSharp className="text-sm" />
                                Leave Management
                            </span>
                            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-2">
                                <MdEventNote className="text-[#0B1053] text-3xl sm:text-4xl shrink-0" />
                                {initialData ? 'Update Request' : 'Request Leave'}
                            </h2>
                            <p className="mt-1.5 text-sm text-slate-400 font-medium pl-1">
                                Fill in the details below to submit your leave.
                            </p>
                        </div>

                        {/* Days Counter */}
                        <div className="hidden sm:flex shrink-0 flex-col items-center justify-center rounded-2xl bg-[#0B1053] text-white px-5 py-3 shadow-lg shadow-[#0B1053]/30 min-w-[76px]">
                            <IoTimeSharp className="text-white/60 text-base mb-0.5" />
                            <span className="text-3xl font-black leading-none">{totalDays}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-0.5">
                                {totalDays === 1 ? 'Day' : 'Days'}
                            </span>
                        </div>
                    </div>

                    {/* ── Leave Type Selection ── */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                            <MdOutlineBeachAccess className="text-base text-slate-400" />
                            Leave Type
                        </label>

                        {/* Desktop: Grid of Pills */}
                        <div className="hidden sm:grid grid-cols-3 gap-2">
                            {leaveTypes.map(({ label, Icon, activeColor }) => {
                                const active = formData.leaveType === label;
                                return (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, leaveType: label })}
                                        className={`
                                            flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border text-sm font-semibold 
                                            transition-all duration-200 cursor-pointer text-left
                                            ${active
                                                ? 'bg-[#0B1053] text-white border-transparent shadow-lg shadow-[#0B1053]/25'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-[#0B1053]/25 hover:bg-[#0B1053]/5 hover:text-[#0B1053]'
                                            }
                                        `}
                                    >
                                        <Icon className={`text-xl shrink-0 ${active ? activeColor : 'text-slate-400'}`} />
                                        <span className="leading-tight">{label}</span>
                                        {active && (
                                            <IoCheckmarkCircleSharp className="ml-auto text-white/70 text-base shrink-0" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Mobile: Dropdown Selection */}
                        <div className="sm:hidden relative">
                            <div className={`
                                flex items-center gap-3 px-4 py-4 rounded-2xl border bg-slate-50 transition-all duration-200
                                ${focused === 'leaveType' ? 'ring-2 ring-[#0B1053]/40 bg-white border-transparent shadow-md' : 'border-slate-200 hover:bg-white'}
                            `}>
                                {(() => {
                                    const selected = leaveTypes.find(t => t.label === formData.leaveType);
                                    const Icon = selected?.Icon || IoEllipsisHorizontalCircleSharp;
                                    return <Icon className={`text-xl transition-colors duration-200 ${focused === 'leaveType' ? 'text-[#0B1053]' : 'text-slate-400'}`} />;
                                })()}
                                <select
                                    value={formData.leaveType}
                                    onFocus={() => setFocused('leaveType')}
                                    onBlur={() => setFocused(null)}
                                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                                    className="flex-1 bg-transparent outline-none text-slate-700 text-sm font-bold appearance-none cursor-pointer"
                                >
                                    {leaveTypes.map(({ label }) => (
                                        <option key={label} value={label}>{label}</option>
                                    ))}
                                </select>
                                <IoChevronDownOutline className={`text-xl transition-colors duration-200 ${focused === 'leaveType' ? 'text-[#0B1053]' : 'text-slate-400'} pointer-events-none`} />
                            </div>
                        </div>
                    </div>

                    {/* ── Date Pickers ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { label: 'From Date', field: 'startDate', Icon: IoCalendarSharp },
                            { label: 'To Date', field: 'endDate', Icon: IoCalendarClearSharp },
                        ].map(({ label, field, Icon }) => (
                            <div key={field}>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                    {label}
                                </label>
                                <div className={`
                                    relative flex items-center gap-3 px-4 py-3.5 rounded-2xl border bg-slate-50
                                    transition-all duration-200
                                    ${focused === field
                                        ? 'border-transparent ring-2 ring-[#0B1053]/40 bg-white shadow-md'
                                        : 'border-slate-200 hover:border-[#0B1053]/25 hover:bg-white'}
                                `}>
                                    <Icon className={`shrink-0 text-xl transition-colors duration-200 ${focused === field ? 'text-[#0B1053]' : 'text-slate-400'}`} />
                                    <input
                                        type="date"
                                        required
                                        value={formData[field]}
                                        onFocus={() => setFocused(field)}
                                        onBlur={() => setFocused(null)}
                                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                        className="flex-1 bg-transparent outline-none text-slate-700 text-sm font-semibold placeholder:text-slate-400 cursor-pointer [appearance:none] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Duration badge */}
                    {totalDays > 0 && (
                        <div className="-mt-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl border bg-[#0B1053]/[0.06] border-[#0B1053]/20 text-[#0B1053] transition-all duration-300">
                            <IoTimeSharp className="text-lg shrink-0" />
                            <p className="text-sm font-bold">
                                Your leave spans{' '}
                                <span className="font-black">{totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
                                {formData.startDate && formData.endDate && (
                                    <span className="font-medium opacity-60">
                                        {' '}
                                        <IoArrowForwardSharp className="inline text-xs mx-0.5" />
                                        {' '}
                                        {new Date(formData.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to {new Date(formData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    {/* ── Reason ── */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
                            <IoDocumentTextSharp className="text-base text-slate-400" />
                            Reason / Description
                        </label>
                        <div className={`
                            relative rounded-2xl border bg-slate-50 transition-all duration-200
                            ${focused === 'reason'
                                ? 'border-transparent ring-2 ring-[#0B1053]/40 bg-white shadow-md'
                                : 'border-slate-200 hover:border-[#0B1053]/25 hover:bg-white'}
                        `}>
                            <IoDocumentTextSharp className={`absolute left-4 top-4 text-xl transition-colors duration-200 ${focused === 'reason' ? 'text-[#0B1053]' : 'text-slate-400'}`} />
                            <textarea
                                required
                                rows="4"
                                placeholder="Briefly explain the reason for your leave..."
                                value={formData.reason}
                                onFocus={() => setFocused('reason')}
                                onBlur={() => setFocused(null)}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full bg-transparent pl-11 pr-4 py-4 outline-none text-sm text-slate-700 placeholder:text-slate-400 resize-none leading-relaxed font-medium"
                            />
                            {formData.reason && (
                                <div className="absolute bottom-3 right-4 text-xs text-slate-400 font-medium flex items-center gap-1">
                                    <IoCheckmarkCircleSharp className="text-emerald-400 text-sm" />
                                    {formData.reason.length} chars
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex-1 overflow-hidden rounded-2xl bg-[#0B1053] text-white py-4 font-black text-sm shadow-lg shadow-[#0B1053]/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#0B1053]/40 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                        >
                            <span className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12 pointer-events-none" />
                            <span className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <IoRefreshSharp className="text-lg animate-spin" />
                                        {initialData ? 'Updating...' : 'Submitting...'}
                                    </>
                                ) : (
                                    <>
                                        <IoPaperPlaneSharp className="text-base" />
                                        {initialData ? 'Update Leave Request' : 'Submit Leave Request'}
                                    </>
                                )}
                            </span>
                        </button>

                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="sm:w-auto px-6 rounded-2xl bg-slate-100 text-slate-600 py-4 font-black text-sm border border-slate-200 transition-all duration-200 hover:bg-[#0B1053]/[0.08] hover:text-[#0B1053] hover:border-[#0B1053]/20 hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    <IoCloseCircleSharp className="text-lg" />
                                    Cancel
                                </span>
                            </button>
                        )}
                    </div>

                </div>
            </form>
        </div>
    );
};

export default LeaveRequestForm;
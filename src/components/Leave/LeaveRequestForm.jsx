import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';
import {
    IoCalendarOutline,
    IoDocumentTextOutline,
    IoSparklesOutline,
    IoTimeOutline,
    IoChevronDownOutline,
    IoSendOutline,
    IoCloseOutline
} from 'react-icons/io5';

const safeFormatDate = (dateVal) => {
    try {
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '';
        return d.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

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

    const leaveTypes = [
        'Sick Leave',
        'Personal Leave',
        'Family Emergency',
        'Religious Leave',
        'Other'
    ];

    useEffect(() => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (end >= start) {
                const diffTime = Math.abs(end - start);
                const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` }
            };

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

    const inputClass =
        "w-full px-1 sm:px-4 py-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm outline-none transition-all duration-300  text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 hover:border-indigo-200";

    const labelClass =
        "block text-xs font-black text-slate-600 mb-2 uppercase tracking-[0.16em]";

    return (
        <div className="relative overflow-hidden sm:rounded-[2rem] sm:bg-gradient-to-br sm:from-indigo-50 sm:via-white sm:to-cyan-50 p-1 sm:shadow-2xl sm:shadow-indigo-900/10">
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-indigo-300/30 blur-3xl"></div>
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl"></div>

            <form
                onSubmit={handleSubmit}
                className="relative sm:-[1.75rem] sm:bg-white/80 sm:backdrop-blur-xl sm:border sm:border-white/80 p-0 sm:p-6 md:p-8 space-y-7"
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black mb-3">
                            <IoSparklesOutline className="text-base" />
                            Leave Management
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            Apply for Leave
                        </h2>
                        <p className="text-sm font-semibold text-slate-500 mt-1">
                            Fill in your leave details below.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-[#080f4f] to-indigo-700 text-white px-4 py-2 shadow-xl shadow-indigo-900/20">
                        <div className="hidden  flex items-center gap-2 text-white/80 text-xs font-black uppercase tracking-widest">
                            <IoTimeOutline />
                            Total Days
                        </div>
                        <div className="text-3xl font-black mt-1">
                            {totalDays}
                            <span className="text-sm ml-1 text-white/80">
                                {totalDays === 1 ? 'Day' : 'Days'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="group">
                        <label className={labelClass}>Leave Type</label>
                        <div className="relative">
                            <select
                                required
                                value={formData.leaveType}
                                onChange={(e) =>
                                    setFormData({ ...formData, leaveType: e.target.value })
                                }
                                className={`${inputClass} appearance-none pr-12 cursor-pointer`}
                            >
                                {leaveTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                            <IoChevronDownOutline className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-500 transition" />
                        </div>
                    </div>

                    <div className="group">
                        <label className={labelClass}>Leave Duration</label>
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-indigo-900/10">
                            <div className="rounded-2xl bg-white px-4 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-black text-slate-800">
                                        {totalDays} {totalDays === 1 ? 'Day' : 'Days'}
                                    </p>
                                    <p className="text-xs font-bold text-slate-400">
                                        Calculated automatically
                                    </p>
                                </div>
                                <div className="h-11 w-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <IoCalendarOutline className="text-xl" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="group">
                        <label className={labelClass}>From Date</label>
                        <div className="relative">
                            <IoCalendarOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-500 transition" />
                            <input
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, startDate: e.target.value })
                                }
                                className={`${inputClass} pl-12`}
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className={labelClass}>To Date</label>
                        <div className="relative">
                            <IoCalendarOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-indigo-500 transition" />
                            <input
                                type="date"
                                required
                                value={formData.endDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, endDate: e.target.value })
                                }
                                className={`${inputClass} pl-12`}
                            />
                        </div>
                    </div>
                </div>

                <div className="group">
                    <label className={labelClass}>Reason / Description</label>
                    <div className="relative">
                        <IoDocumentTextOutline className=" hidden sm:block sm:absolute left-4 top-4  text-slate-400 sm:text-xl text-lg group-focus-within:text-indigo-500 transition" />
                        <textarea
                            required
                            rows="5"
                            placeholder="Write a short reason for your leave request..."
                            value={formData.reason}
                            onChange={(e) =>
                                setFormData({ ...formData, reason: e.target.value })
                            }
                            className={`${inputClass} pl-3 sm:pl-12 resize-none leading-relaxed`}
                        ></textarea>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-[#080f4f] via-indigo-700 to-cyan-600 text-white py-4 font-black text-sm shadow-2xl shadow-indigo-900/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-indigo-900/30 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                        <span className="absolute inset-0 bg-white/20 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 skew-x-12"></span>
                        <span className="relative flex items-center justify-center gap-2">
                            <IoSendOutline className="text-lg" />
                            {loading ? (initialData ? 'Updating...' : 'Submitting...') : (initialData ? 'Update Leave Request' : 'Submit Leave Request')}
                        </span>
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="sm:w-auto px-7 rounded-2xl bg-white text-slate-600 py-4 font-black text-sm border border-slate-200 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:text-slate-900 hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <IoCloseOutline className="text-lg" />
                                Cancel
                            </span>
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default LeaveRequestForm;
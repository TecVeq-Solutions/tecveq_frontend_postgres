import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    IoAddOutline,
    IoCalendarOutline,
    IoTrashOutline,
    IoTimeOutline,
    IoDocumentTextOutline,
    IoCloseOutline,
    IoAlertCircleOutline,
    IoSparklesOutline,
    IoLayersOutline,
    IoCheckmarkCircleOutline,
    IoHourglassOutline,
    IoPencilOutline,
    IoChevronBackOutline,
    IoChevronForwardOutline
} from 'react-icons/io5';
import { BACKEND_URL } from '../../../constants/api';
import LeaveRequestForm from '../../../components/Leave/LeaveRequestForm';
import LeaveStatusBadge from '../../../components/Leave/LeaveStatusBadge';
import Loader from '../../../utils/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Teacher/Navbar';

const TeacherMyLeaves = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(2);

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` }
            };
            const res = await axios.get(`${BACKEND_URL}/leave/my-history`, config);
            setLeaves(res.data);
        } catch (error) {
            toast.error('Failed to fetch leave history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this pending leave?')) return;

        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` }
            };
            await axios.put(`${BACKEND_URL}/leave/cancel/${id}`, {}, config);
            toast.success('Leave cancelled successfully');
            fetchLeaves();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to cancel leave');
        }
    };

    if (loading && leaves.length === 0) return <Loader />;

    const totalRequests = leaves.length;
    const pendingRequests = leaves.filter((leave) => leave.status === 'pending').length;
    const approvedRequests = leaves.filter((leave) => leave.status === 'approved').length;

    const totalPages = Math.ceil(leaves.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;

    const paginatedLeaves = leaves.slice(
        startIndex,
        startIndex + rowsPerPage
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-cyan-50/50">
            <div className="lg:ml-80">
                <Navbar heading="My Leaves" />
                <div className="p-3 sm:p-4 md:p-8 space-y-8">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#080f4f] via-indigo-800 to-cyan-700  p-4 sm:p-6 md:p-8 shadow-2xl shadow-indigo-900/20">
                    <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"></div>
                    <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl"></div>

                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-black mb-4 backdrop-blur-sm">
                                <IoSparklesOutline className="text-base" />
                                Leave Management Dashboard
                            </div>

                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                                My Leave Requests
                            </h1>

                            <p className="text-indigo-100 font-semibold mt-2 max-w-2xl">
                                Apply for leaves, monitor approval status, and manage pending requests from one clean dashboard.
                            </p>
                        </div>

                        {!showForm && !editingLeave && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="group relative overflow-hidden flex items-center justify-center gap-2 bg-white text-[#080f4f] px-6 py-4 rounded-2xl font-black text-sm shadow-2xl shadow-black/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-white/20 active:scale-95"
                            >
                                <span className="absolute inset-0 bg-indigo-50 translate-x-[-120%] group-hover:translate-x-0 transition-transform duration-500"></span>
                                <span className="relative flex items-center gap-2">
                                    <IoAddOutline size={22} />
                                    New Request
                                </span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 hidden">
                    <div className="rounded-[1.75rem] bg-white/85 backdrop-blur-xl p-5 border border-white shadow-xl shadow-slate-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.18em]">
                                    Total Requests
                                </p>
                                <h3 className="text-3xl font-black text-slate-900 mt-2">
                                    {totalRequests}
                                </h3>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <IoLayersOutline size={26} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] bg-white/85 backdrop-blur-xl p-5 border border-white shadow-xl shadow-slate-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.18em]">
                                    Pending
                                </p>
                                <h3 className="text-3xl font-black text-amber-600 mt-2">
                                    {pendingRequests}
                                </h3>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                                <IoHourglassOutline size={26} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] bg-white/85 backdrop-blur-xl p-5 border border-white shadow-xl shadow-slate-200/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.18em]">
                                    Approved
                                </p>
                                <h3 className="text-3xl font-black text-emerald-600 mt-2">
                                    {approvedRequests}
                                </h3>
                            </div>
                            <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <IoCheckmarkCircleOutline size={26} />
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -24, scale: 0.98 }}
                            transition={{ duration: 0.25 }}
                            className="relative overflow-hidden rounded-[2rem] bg-white/90 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-indigo-900/10 border border-white"
                        >
                            <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl"></div>

                            <div className="relative flex items-center justify-between mb-7">
                                <div>
                                    <p className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em] mb-1">
                                        Request Form
                                    </p>
                                    <h2 className="text-2xl font-black text-slate-900">
                                        Apply for Leave
                                    </h2>
                                </div>

                                <button
                                    onClick={() => setShowForm(false)}
                                    className="h-11 w-11 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                                >
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>

                            <div className="relative">
                                <LeaveRequestForm
                                    onSuccess={() => {
                                        setShowForm(false);
                                        fetchLeaves();
                                        setCurrentPage(1);
                                    }}
                                    onCancel={() => setShowForm(false)}
                                />
                            </div>
                        </motion.div>
                    )}

                    {editingLeave && (
                        <motion.div
                            key={editingLeave.id}
                            initial={{ opacity: 0, y: -24, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -24, scale: 0.98 }}
                            transition={{ duration: 0.25 }}
                            className="relative overflow-hidden rounded-[2rem] bg-white/90 backdrop-blur-xl p-6 md:p-8 shadow-2xl shadow-amber-900/10 border border-white"
                        >
                            <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-amber-200/30 blur-3xl"></div>

                            <div className="relative flex items-center justify-between mb-7">
                                <div>
                                    <p className="text-xs font-black text-amber-600 uppercase tracking-[0.2em] mb-1">
                                        Edit Request
                                    </p>
                                    <h2 className="text-2xl font-black text-slate-900">
                                        Edit Leave Request
                                    </h2>
                                    <p className="text-sm text-slate-400 font-medium mt-1">
                                        Update the details of your pending leave request.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setEditingLeave(null)}
                                    className="h-11 w-11 flex items-center justify-center rounded-2xl bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition"
                                >
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>

                            <div className="relative">
                                <LeaveRequestForm
                                    initialData={editingLeave}
                                    onSuccess={() => {
                                        setEditingLeave(null);
                                        fetchLeaves();
                                        setCurrentPage(1);
                                    }}
                                    onCancel={() => setEditingLeave(null)}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-6">
                    {leaves.length > 0 ? (
                        <div className="overflow-hidden rounded-[2rem] bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-200/60 border border-white">
                            <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-white to-slate-50">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">
                                        Leave History
                                    </h2>
                                    <p className="text-sm font-semibold text-slate-400">
                                        Review all submitted leave requests
                                    </p>
                                </div>

                                <div className="hidden md:flex h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 items-center justify-center">
                                    <IoDocumentTextOutline size={22} />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead>
                                        <tr className="bg-slate-50/80 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <th className="px-4 sm:px-6 py-5">Type</th>
                                            <th className="px-4 sm:px-6 py-5">Dates</th>
                                            <th className="px-4 sm:px-6 py-5">Days</th>
                                            <th className="px-4 sm:px-6 py-5">Status</th>
                                            <th className="px-4 sm:px-6 py-5">Reviewer</th>
                                            <th className="px-4 sm:px-6 py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedLeaves.map((leave) => (
                                            <tr
                                                key={leave.id}
                                                className="group transition-all duration-300 hover:bg-indigo-50/40"
                                            >
                                                <td className="px-4 sm:px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-105 transition">
                                                            <IoDocumentTextOutline size={22} />
                                                        </div>

                                                        <div>
                                                            <p className="text-sm font-black text-slate-800">
                                                                {leave.leaveType}
                                                            </p>
                                                            <p className="text-xs font-semibold text-slate-400 truncate max-w-[240px]">
                                                                {leave.reason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 sm:px-6 py-5">
                                                    <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600">
                                                        <IoCalendarOutline className="text-indigo-500" />
                                                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                                    </div>
                                                </td>

                                                <td className="px-4 sm:px-6 py-5">
                                                    <span className="inline-flex items-center justify-center min-w-12 rounded-2xl bg-cyan-50 px-3 py-2 text-sm font-black text-cyan-700">
                                                        {leave.totalDays}
                                                    </span>
                                                </td>

                                                <td className="px-4 sm:px-6 py-5">
                                                    <LeaveStatusBadge status={leave.status} />
                                                </td>

                                                <td className="px-4  sm:px-6 py-5">
                                                    {leave.status === 'approved' || leave.status === 'rejected' ? (
                                                        <div className="text-sm font-bold text-slate-600">
                                                            {leave.approver?.name || 'Admin'}
                                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                                                                {leave.approverRole}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-300">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="px-4  sm:px-6 py-5 text-right">
                                                    {leave.status === 'pending' ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setShowForm(false);
                                                                    setEditingLeave(leave);
                                                                }}
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-indigo-500 bg-indigo-50 hover:bg-indigo-100 transition-all duration-300 active:scale-95"
                                                                title="Edit Request"
                                                            >
                                                                <IoPencilOutline size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleCancel(leave.id)}
                                                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                                                                title="Cancel Request"
                                                            >
                                                                <IoTrashOutline size={20} />
                                                            </button>
                                                        </div>
                                                    ) : leave.status === 'rejected' && leave.rejectionReason ? (
                                                        <div className="group/tooltip relative inline-block">
                                                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 cursor-help">
                                                                <IoAlertCircleOutline size={21} />
                                                            </div>

                                                            <div className="absolute bottom-full right-0 mb-3 w-56 rounded-2xl bg-slate-950 p-3 text-left text-xs font-semibold text-white opacity-0 shadow-2xl transition pointer-events-none group-hover/tooltip:opacity-100 z-20">
                                                                <span className="block text-rose-300 font-black mb-1">
                                                                    Rejection Reason
                                                                </span>
                                                                {leave.rejectionReason}
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination + Selector Footer */}
                            {leaves.length > 0 && (
                                <div className="mt-4 sm:mt-6 mb-4 flex lg:flex-row items-center justify-between sm:gap-4 gap-2 rounded-[15px] sm:rounded-3xl border border-[#E8E3FF] bg-white/80 backdrop-blur-md px-1 sm:px-6 py-4 shadow-[0_8px_30px_rgba(106,0,255,0.08)]">
                                    {/* Rows selector */}
                                    <div className="flex flex-row items-center gap-1 sm:gap-3 w-full lg:w-auto justify-center lg:justify-start">
                                        <span className="text-sm font-semibold text-[#0B1053]/70">
                                            Rows per page
                                        </span>

                                        <div className="relative">
                                            <select
                                                value={rowsPerPage}
                                                onChange={(e) => {
                                                    setRowsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                                className="appearance-none min-w-[50px] sm:min-w-[92px] cursor-pointer rounded-2xl border border-[#DCD4FF] bg-gradient-to-br from-white to-[#F6F3FF] px-2 sm:pl-4 sm:pr-10 py-2.5 text-sm font-bold text-[#6A00FF] outline-none shadow-[0_4px_14px_rgba(106,0,255,0.10)] hover:border-[#6A00FF]/50 focus:border-[#6A00FF] transition-all duration-200"
                                            >
                                                {[2, 4, 6, 10].map((item) => (
                                                    <option key={item} value={item}>
                                                        {item}
                                                    </option>
                                                ))}
                                            </select>

                                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                <svg
                                                    className="w-4 h-4 text-[#6A00FF]"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 9l-7 7-7-7"
                                                    />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Showing info */}
                                    <div className="hidden sm:flex flex-col items-center text-center">
                                        <p className="text-sm font-semibold text-[#0B1053]">
                                            Showing{" "}
                                            <span className="text-[#6A00FF]">
                                                {startIndex + 1}
                                            </span>{" "}
                                            to{" "}
                                            <span className="text-[#6A00FF]">
                                                {Math.min(startIndex + rowsPerPage, leaves.length)}
                                            </span>{" "}
                                            of{" "}
                                            <span className="text-[#6A00FF]">
                                                {leaves.length}
                                            </span>{" "}
                                            Requests
                                        </p>

                                        <p className="text-xs text-[#0B1053]/45 mt-0.5">
                                            Page {currentPage} of {totalPages}
                                        </p>
                                    </div>

                                    {/* Pagination buttons */}
                                    <div className="flex items-center gap-2 w-full lg:w-auto justify-center lg:justify-end">
                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="group flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 sm:py-2.5 py-1.5 rounded-2xl text-sm font-bold border border-[#DCD4FF] bg-white text-[#0B1053] shadow-[0_3px_12px_rgba(106,0,255,0.08)] hover:bg-[#F6F3FF] hover:text-[#6A00FF] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#0B1053] active:scale-95 transition-all duration-200"
                                        >
                                            <IoChevronBackOutline className="sm:hidden inline" size={18} />
                                            <span className="hidden sm:inline">Previous</span>
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter((page) => {
                                                    return (
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        Math.abs(page - currentPage) <= 1
                                                    );
                                                })
                                                .map((page, index, arr) => (
                                                    <React.Fragment key={page}>
                                                        {index > 0 && page - arr[index - 1] > 1 && (
                                                            <span className="px-1 text-gray-400 text-sm">
                                                                ...
                                                            </span>
                                                        )}

                                                        <button
                                                            onClick={() => setCurrentPage(page)}
                                                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 ${currentPage === page
                                                                ? "bg-gradient-to-br from-[#7B1FFF] to-[#5500CC] text-white shadow-[0_5px_16px_rgba(106,0,255,0.35)]"
                                                                : "bg-[#F6F3FF] text-[#6A00FF] hover:bg-[#ECE6FF]"
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    </React.Fragment>
                                                ))}
                                        </div>

                                        <button
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="group flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 sm:py-2.5 py-1.5 rounded-2xl text-sm font-bold border border-[#DCD4FF] bg-white text-[#0B1053] shadow-[0_3px_12px_rgba(106,0,255,0.08)] hover:bg-[#F6F3FF] hover:text-[#6A00FF] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#0B1053] active:scale-95 transition-all duration-200"
                                        >
                                            <span className="hidden sm:inline">Next</span>
                                            <IoChevronForwardOutline className="sm:hidden inline" size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="relative overflow-hidden rounded-[2rem] bg-white/90 backdrop-blur-xl p-12 md:p-16 text-center shadow-2xl shadow-slate-200/60 border border-white">
                            <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-100/70 blur-3xl"></div>

                            <div className="relative">
                                <div className="h-24 w-24 bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-indigo-400 shadow-inner">
                                    <IoTimeOutline size={44} />
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 mb-2">
                                    No leave requests found
                                </h3>

                                <p className="text-slate-400 max-w-sm mx-auto font-semibold mb-7">
                                    You have not submitted any leave request yet. Create your first request whenever you need time off.
                                </p>

                                {!showForm && (
                                    <button
                                        onClick={() => setShowForm(true)}
                                        className="inline-flex items-center justify-center gap-2 bg-[#080f4f] text-white px-6 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-indigo-900/15 hover:-translate-y-0.5 active:scale-95 transition"
                                    >
                                        <IoAddOutline size={20} />
                                        Create Leave Request
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherMyLeaves;
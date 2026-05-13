import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    IoCheckmarkCircleOutline,
    IoSearchOutline,
    IoFilterOutline,
    IoPersonOutline,
    IoSchoolOutline,
    IoDocumentTextOutline,
    IoAttachOutline,
    IoCalendarOutline,
    IoMailOutline,
    IoTimeOutline,
    IoArrowBackOutline,
    IoChatbubbleEllipsesOutline,
    IoBriefcaseOutline,
    IoChevronBackOutline,
    IoChevronForwardOutline
} from 'react-icons/io5';
import { BACKEND_URL } from '../../../constants/api';
import LeaveStatusBadge from '../../../components/Leave/LeaveStatusBadge';
import ApproveRejectModal from '../../../components/Leave/ApproveRejectModal';
import Loader from '../../../utils/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from "../../../components/Admin/Navbar";
import { useBlur } from "../../../context/BlurContext";
import { useSidebar } from "../../../context/SidebarContext";

const AdminTeacherLeaves = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [activeRequest, setActiveRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { isBlurred } = useBlur();
    const { isSidebarOpen } = useSidebar();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(2);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };
            const res = await axios.get(`${BACKEND_URL}/leave/teacher-requests`, config);
            setRequests(res.data);
        } catch (error) {
            toast.error('Failed to fetch teacher leave requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchRequests(); }, []);

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.teacher?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;

    const paginatedRequests = filteredRequests.slice(
        startIndex,
        startIndex + rowsPerPage
    );

    if (loading && requests.length === 0) return <Loader />;

    const statusConfig = {
        pending: {
            border: 'border-l-amber-400',
            dot: 'bg-amber-400',
            glow: 'shadow-amber-100',
            badge: 'bg-amber-50 text-amber-600 ring-amber-200',
            label: 'Pending',
        },
        approved: {
            border: 'border-l-emerald-400',
            dot: 'bg-emerald-400',
            glow: 'shadow-emerald-100',
            badge: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
            label: 'Approved',
        },
        rejected: {
            border: 'border-l-rose-400',
            dot: 'bg-rose-400',
            glow: 'shadow-rose-100',
            badge: 'bg-rose-50 text-rose-600 ring-rose-200',
            label: 'Rejected',
        },
    };

    const avatarGradients = [
        'from-violet-500 to-fuchsia-500',
        'from-blue-500 to-cyan-500',
        'from-emerald-500 to-teal-500',
        'from-orange-500 to-rose-500',
        'from-indigo-500 to-violet-500',
        'from-pink-500 to-rose-500',
    ];

    const getInitials = (name) =>
        name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

                .tsl-root {
                    font-family: 'DM Sans', sans-serif;
                }
                .tsl-root h1, .tsl-root h2, .tsl-title {
                    font-family: 'Syne', sans-serif;
                }

                .noise-bg::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
                    border-radius: inherit;
                    pointer-events: none;
                }

                .card-hover {
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .card-hover:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 20px 60px -15px rgba(99, 102, 241, 0.18);
                }

                .glow-ring {
                    box-shadow: 0 0 0 1px rgba(99,102,241,0.15), 0 4px 24px -4px rgba(99,102,241,0.12);
                }

                .pill-tab {
                    transition: all 0.2s ease;
                }
                .pill-tab.active {
                    background: #4f46e5;
                    color: white;
                    box-shadow: 0 4px 14px -2px rgba(79, 70, 229, 0.45);
                }

                .search-bar:focus-within {
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
                }

                .row-item {
                    transition: all 0.2s ease;
                    position: relative;
                }
                .row-item::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(90deg, rgba(99,102,241,0.04) 0%, transparent 100%);
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    pointer-events: none;
                }
                .row-item:hover::after {
                    opacity: 1;
                }
                .row-item:hover {
                    background: rgba(249, 249, 255, 0.95);
                }

                .stat-card {
                    background: rgba(255,255,255,0.08);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255,255,255,0.12);
                    transition: all 0.2s ease;
                }
                .stat-card:hover {
                    background: rgba(255,255,255,0.14);
                    border-color: rgba(255,255,255,0.2);
                }

                .process-btn {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                    box-shadow: 0 8px 24px -4px rgba(79, 70, 229, 0.5);
                    transition: all 0.25s ease;
                }
                .process-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 12px 32px -4px rgba(79, 70, 229, 0.6);
                }
                .process-btn:active {
                    transform: scale(0.97);
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-8px) rotate(3deg); }
                }
                .float-orb { animation: float 6s ease-in-out infinite; }
                .float-orb-2 { animation: float 8s ease-in-out infinite reverse; }

                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(0.8); }
                }
                .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
            `}</style>

            <div className="tsl-root min-h-screen lg:ml-80 bg-[#f5f5fc] p-3 sm:p-6 lg:p-8">
                <div className="flex min-h-20 md:px-14 lg:pt-3 lg:px-0 mb-2 sm:mb-6">
                    <Navbar heading={"Teacher Leaves"} />
                </div>
                <div className={`max-w-5xl mx-auto space-y-3 sm:space-y-6 ${isBlurred ? "blur" : ""} ${isSidebarOpen ? "-z-10" : "z-auto"} lg:z-auto`}>

                    {/* ── Header ── */}
                    <div
                        className="relative overflow-hidden rounded-[2rem] p-4 sm:p-8 noise-bg"
                        style={{ background: 'linear-gradient(135deg, #1a1163 0%, #2d1b8a 40%, #1e3a6e 100%)' }}
                    >
                        {/* Orbs */}
                        <div
                            className="float-orb absolute -right-12 -top-12 h-52 w-52 rounded-full opacity-30"
                            style={{ background: 'radial-gradient(circle, #a78bfa, transparent 70%)' }}
                        />
                        <div
                            className="float-orb-2 absolute -bottom-16 left-8 h-44 w-44 rounded-full opacity-20"
                            style={{ background: 'radial-gradient(circle, #67e8f9, transparent 70%)' }}
                        />
                        <div className="absolute top-8 right-1/3 h-2 w-2 rounded-full bg-cyan-300 opacity-60 pulse-dot" />
                        <div
                            className="absolute bottom-10 right-1/4 h-1.5 w-1.5 rounded-full bg-violet-300 opacity-50 pulse-dot"
                            style={{ animationDelay: '1s' }}
                        />

                        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                            <div>
                                <div
                                    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-200 mb-4"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 pulse-dot" />
                                    Teacher Leave Inbox
                                </div>

                                <h1 className="text-3xl sm:text-4xl font-semibold text-white">
                                    Teacher Leaves
                                </h1>

                                <p className="mt-2 text-sm text-indigo-200 font-light">
                                    Review and process leave applications from teaching staff
                                </p>
                            </div>

                            <div className=" hidden sm:flex gap-3 ">
                                {[
                                    { label: 'Total', value: requests.length },
                                    { label: 'Showing', value: filteredRequests.length },
                                ].map(({ label, value }) => (
                                    <div key={label} className="stat-card rounded-2xl px-3 sm:px-5 py-4 text-center min-w-[70px] sm:min-w-[90px] ">
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-200 mb-1">
                                            {label}
                                        </p>
                                        <p
                                            className="text-3xl font-semibold text-white"
                                            style={{ fontFamily: 'Syne, sans-serif' }}
                                        >
                                            {value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">

                        {/* ══ DETAIL VIEW ══ */}
                        {activeRequest ? (
                            <motion.div
                                key="detail"
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                                className="rounded-[2rem] bg-white overflow-hidden glow-ring"
                            >
                                {/* Detail top bar */}
                                <div
                                    className="relative overflow-hidden p-3 sm:p-7 noise-bg"
                                    style={{ background: 'linear-gradient(135deg, #1a1163 0%, #2d1b8a 100%)' }}
                                >
                                    <div
                                        className="float-orb absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-25"
                                        style={{ background: 'radial-gradient(circle, #a78bfa, transparent)' }}
                                    />

                                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-5 sm:justify-between">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setActiveRequest(null)}
                                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all hover:text-white active:scale-95"
                                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
                                            >
                                                <IoArrowBackOutline size={20} />
                                            </button>

                                            {/* Avatar with initials */}
                                            <div
                                                className=" hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl text-white text-lg font-bold shadow-xl"
                                                style={{ fontFamily: 'Syne, sans-serif', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                                            >
                                                {getInitials(activeRequest.teacher?.name)}
                                            </div>

                                            <div>
                                                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-200 mb-0.5">
                                                    Leave Request
                                                </p>
                                                <h2 className="tsl-title text-xl font-semibold text-white">
                                                    {activeRequest.teacher?.name}
                                                </h2>
                                                <span
                                                    className="inline-block mt-1 rounded-full px-3 py-0.5 text-[10px] font-semibold text-cyan-100"
                                                    style={{ background: 'rgba(255,255,255,0.1)' }}
                                                >
                                                    {activeRequest.leaveType}
                                                </span>
                                            </div>
                                        </div>

                                        <LeaveStatusBadge status={activeRequest.status} />
                                    </div>
                                </div>

                                {/* Detail body */}
                                <div className="p-3  sm:p-5 ">

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                                        {[
                                            { icon: <IoPersonOutline size={15} />, label: 'Teacher', value: activeRequest.teacher?.name, color: 'text-violet-500', bg: 'bg-violet-50', ring: 'ring-violet-100' },
                                            { icon: <IoBriefcaseOutline size={15} />, label: 'Qualification', value: activeRequest.teacher?.qualification || 'Teacher', color: 'text-blue-500', bg: 'bg-blue-50', ring: 'ring-blue-100' },
                                            { icon: <IoDocumentTextOutline size={15} />, label: 'Leave Type', value: activeRequest.leaveType, color: 'text-indigo-500', bg: 'bg-indigo-50', ring: 'ring-indigo-100' },
                                            { icon: <IoCalendarOutline size={15} />, label: 'From', value: new Date(activeRequest.startDate).toLocaleDateString(), color: 'text-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-100' },
                                            { icon: <IoCalendarOutline size={15} />, label: 'To', value: new Date(activeRequest.endDate).toLocaleDateString(), color: 'text-cyan-500', bg: 'bg-cyan-50', ring: 'ring-cyan-100' },
                                            { icon: <IoTimeOutline size={15} />, label: 'Duration', value: `${activeRequest.totalDays} Days`, color: 'text-amber-500', bg: 'bg-amber-50', ring: 'ring-amber-100' },
                                        ].map(({ icon, label, value, color, bg, ring }) => (
                                            <div key={label} className={`rounded-2xl ${bg} ring-1 ${ring} p-4`}>
                                                <p className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] ${color} mb-2`}>
                                                    {icon} {label}
                                                </p>
                                                <p className="text-sm font-bold text-slate-800">
                                                    {value || 'N/A'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reason */}
                                    <div
                                        className="mb-6 rounded-2xl p-2 sm:p-5"
                                        style={{ background: 'linear-gradient(135deg, #f0f0ff 0%, #faf5ff 100%)', border: '1px solid #e0e0ff' }}
                                    >
                                        <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400 sm:mb-3 mb-1">
                                            <IoDocumentTextOutline size={13} /> Reason for Leave
                                        </p>
                                        <p className="text-sm text-slate-600 leading-relaxed font-light italic bg-white rounded-xl p-4 ring-1 ring-indigo-50">
                                            "{activeRequest.reason}"
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-5 border-t border-slate-100">
                                        <div>
                                            {activeRequest.attachmentUrl ? (
                                                <a
                                                    href={activeRequest.attachmentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-100"
                                                    style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}
                                                >
                                                    <IoAttachOutline size={14} /> View Attachment
                                                </a>
                                            ) : (
                                                <span className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 bg-slate-50 ring-1 ring-slate-100">
                                                    <IoAttachOutline size={14} /> No Attachment
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => setActiveRequest(null)}
                                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-95"
                                            >
                                                ← Back
                                            </button>

                                            {activeRequest.status === 'pending' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedRequest(activeRequest);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="process-btn rounded-xl px-7 py-2.5 text-xs font-bold text-white tracking-wide"
                                                >
                                                    Process Request →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        ) : (
                            /* ══ LIST VIEW ══ */
                            <motion.div
                                key="list"
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 12 }}
                                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                                className="space-y-5"
                            >
                                {/* ── Filter Bar ── */}
                                <div className="rounded-[2rem] bg-white p-4 sm:p-5 glow-ring">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* Search */}
                                        <div
                                            className="relative md:col-span-2 search-bar rounded-2xl transition-all"
                                            style={{ background: '#f7f7fc', border: '1.5px solid #e8e8f5' }}
                                        >
                                            <IoSearchOutline
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"
                                                size={18}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Search teacher name..."
                                                value={searchTerm}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-transparent outline-none text-sm font-medium text-slate-700 placeholder:text-slate-300"
                                            />
                                        </div>

                                        {/* Status filter as pill tabs */}
                                        <div
                                            className="flex items-center gap-1.5 rounded-2xl p-1.5"
                                            style={{ background: '#f7f7fc', border: '1.5px solid #e8e8f5' }}
                                        >
                                            {[
                                                { val: 'pending', label: 'Pending' },
                                                { val: 'approved', label: 'Done' },
                                                { val: 'All', label: 'All' },
                                            ].map(({ val, label }) => (
                                                <button
                                                    key={val}
                                                    onClick={() => {
                                                        setStatusFilter(val);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`pill-tab flex-1 rounded-xl py-2.5 text-xs font-bold transition-all ${statusFilter === val ? 'active' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* ── Request List ── */}
                                {filteredRequests.length > 0 ? (
                                    <div className="rounded-[2rem] bg-white overflow-hidden glow-ring">

                                        {/* List header */}
                                        <div
                                            className="flex items-center justify-between px-3 sm:px-6 py-4 border-b border-slate-50"
                                            style={{ background: 'linear-gradient(90deg, #fafafe, #f7f7fc)' }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                                    <IoMailOutline size={15} className="text-indigo-400" />
                                                </div>
                                                <span className="tsl-title text-sm font-bold text-slate-600 tracking-wide">
                                                    Leave Requests
                                                </span>
                                            </div>

                                            <span
                                                className="rounded-full px-3 py-1 text-[10px] font-bold text-indigo-500"
                                                style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}
                                            >
                                                {filteredRequests.length} total
                                            </span>
                                        </div>

                                        {/* Rows */}
                                        <div className="divide-y divide-slate-50">
                                            {paginatedRequests.map((req, idx) => {
                                                const sc = statusConfig[req.status] || statusConfig.pending;
                                                const grad = avatarGradients[(startIndex + idx) % avatarGradients.length];

                                                return (
                                                    <motion.button
                                                        key={req.id}
                                                        type="button"
                                                        onClick={() => setActiveRequest(req)}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.04, duration: 0.22 }}
                                                        className={`row-item group w-full border-l-4 ${sc.border} text-left`}
                                                    >
                                                        <div className="flex items-center gap-5 px-3 sm:px-6 py-5">

                                                            {/* Avatar */}
                                                            <div
                                                                className={`hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${grad} text-white text-sm font-bold shadow-lg transition-transform group-hover:scale-105`}
                                                                style={{ fontFamily: 'Syne, sans-serif', boxShadow: '0 8px 20px -6px rgba(99,102,241,0.3)' }}
                                                            >
                                                                {getInitials(req.teacher?.name)}
                                                            </div>

                                                            {/* Body */}
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                                                                    <span className="text-smd sm:text-lg font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                                                                        {req.teacher?.name}
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold uppercase tracking-wider ring-1 ${sc.badge}`}>
                                                                            <span className={`h-1.5 w-1.5 rounded-full ${sc.dot}`} />
                                                                            {sc.label}
                                                                        </span>
                                                                        <div className="sm:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all text-md font-bold">
                                                                            →
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <p className="mb-1.5 text-[13px] font-semibold uppercase tracking-[0.15em] text-indigo-400">
                                                                    {req.leaveType}
                                                                </p>

                                                                <p className="line-clamp-1 text-sm text-slate-400 font-light">
                                                                    {req.reason}
                                                                </p>

                                                                <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
                                                                    {[
                                                                        { icon: <IoBriefcaseOutline size={14} />, text: req.teacher?.qualification || 'Teacher' },
                                                                        { icon: <IoCalendarOutline size={14} />, text: `${new Date(req.startDate).toLocaleDateString()} – ${new Date(req.endDate).toLocaleDateString()}` },
                                                                        { icon: <IoTimeOutline size={14} />, text: `${req.totalDays}d` },
                                                                    ].map(({ icon, text }, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-400 bg-slate-50 rounded-full px-2.5 py-1 ring-1 ring-slate-100"
                                                                        >
                                                                            {icon} {text}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Arrow */}
                                                            <div className="shrink-0 hidden sm:flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 group-hover:text-indigo-500 group-hover:bg-indigo-50 transition-all text-md font-bold">
                                                                →
                                                            </div>
                                                        </div>
                                                    </motion.button>
                                                );
                                            })}
                                        </div>

                                        {/* Pagination + Selector */}
                                        <div className="relative overflow-hidden border-t border-indigo-50 bg-white rounded-b-[2rem]">
                                            <div
                                                className="absolute -left-14 -top-14 h-36 w-36 rounded-full blur-3xl opacity-60"
                                                style={{ background: 'radial-gradient(circle, #c7d2fe, transparent 70%)' }}
                                            />
                                            <div
                                                className="absolute -right-14 -bottom-14 h-36 w-36 rounded-full blur-3xl opacity-60"
                                                style={{ background: 'radial-gradient(circle, #ddd6fe, transparent 70%)' }}
                                            />

                                            <div className="relative flex lg:flex-row items-center justify-between sm:gap-4 gap-2 px-2 sm:px-6 py-5">

                                                {/* Rows selector */}
                                                <div className="flex flex-row items-center gap-1 sm:gap-3 w-full lg:w-auto">
                                                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                                        Rows per page
                                                    </span>

                                                    <div className="relative group">
                                                        <select
                                                            value={rowsPerPage}
                                                            onChange={(e) => {
                                                                setRowsPerPage(Number(e.target.value));
                                                                setCurrentPage(1);
                                                            }}
                                                            className="appearance-none min-w-[40px] sm:min-w-[96px] cursor-pointer rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-2 sm:px-4 py-3 pr-6 sm:pr-10 text-sm font-extrabold text-indigo-600 outline-none shadow-[0_8px_20px_-12px_rgba(79,70,229,0.65)] transition-all duration-300 hover:border-indigo-300 hover:shadow-[0_10px_24px_-12px_rgba(79,70,229,0.8)] focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                                        >
                                                            <option value={2}>2</option>
                                                            <option value={4}>4</option>
                                                            <option value={6}>6</option>
                                                            <option value={10}>10</option>
                                                        </select>

                                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                            <svg
                                                                className="h-4 w-4 text-indigo-500 transition-transform duration-300 group-hover:rotate-180"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 20 20"
                                                                fill="currentColor"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Showing text */}
                                                <div className="hidden sm:flex flex-col items-center text-center">
                                                    <div className=" hidden sm:inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-indigo-50 px-4 py-2 ring-1 ring-indigo-100">
                                                        <span className="text-xs font-bold text-slate-400">
                                                            Showing
                                                        </span>

                                                        <span className="text-xs font-extrabold text-indigo-600">
                                                            {startIndex + 1}
                                                        </span>

                                                        <span className="text-xs text-slate-300">to</span>

                                                        <span className="text-xs font-extrabold text-indigo-600">
                                                            {Math.min(startIndex + rowsPerPage, filteredRequests.length)}
                                                        </span>

                                                        <span className="text-xs text-slate-300">of</span>

                                                        <span className="text-xs font-extrabold text-indigo-600">
                                                            {filteredRequests.length}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-[11px] font-semibold text-slate-300">
                                                        Page {currentPage} of {totalPages}
                                                    </p>
                                                </div>

                                                {/* Buttons */}
                                                <div className="flex items-center justify-center gap-2 w-full lg:w-auto">
                                                    <button
                                                        disabled={currentPage === 1}
                                                        onClick={() => setCurrentPage((prev) => prev - 1)}
                                                        className="group inline-flex items-center gap-1 sm:gap-2 rounded-2xl border border-indigo-100 bg-white px-2 sm:px-4 py-2 sm:py-3 text-xs font-extrabold text-slate-500 shadow-sm transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-500 active:scale-95"
                                                    >
                                                        <IoChevronBackOutline className="sm:hidden inline" size={18} />
                                                        <span className="hidden sm:inline">Prev</span>
                                                    </button>

                                                    <div className="flex items-center gap-1.5">
                                                        {Array.from({ length: totalPages }).map((_, pageIndex) => {
                                                            const pageNumber = pageIndex + 1;

                                                            return (
                                                                <button
                                                                    key={pageNumber}
                                                                    onClick={() => setCurrentPage(pageNumber)}
                                                                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-2xl text-xs font-extrabold transition-all duration-300 active:scale-95 ${currentPage === pageNumber
                                                                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-[0_10px_22px_-8px_rgba(79,70,229,0.75)]'
                                                                        : 'bg-indigo-50 text-indigo-500 ring-1 ring-indigo-100 hover:bg-indigo-100'
                                                                        }`}
                                                                >
                                                                    {pageNumber}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    <button
                                                        disabled={currentPage === totalPages}
                                                        onClick={() => setCurrentPage((prev) => prev + 1)}
                                                        className="group inline-flex items-center gap-1 sm:gap-2 rounded-2xl border border-indigo-100 bg-white px-2 sm:px-4 py-2 sm:py-3 text-xs font-extrabold text-slate-500 shadow-sm transition-all duration-300 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-500 active:scale-95"
                                                    >
                                                        <span className="hidden sm:inline">Next</span>
                                                        <IoChevronForwardOutline className="sm:hidden inline" size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="rounded-[2rem] bg-white p-12 sm:p-20 text-center glow-ring"
                                    >
                                        <div
                                            className="h-20 w-20 mx-auto mb-6 rounded-[1.5rem] flex items-center justify-center"
                                            style={{ background: 'linear-gradient(135deg, #eef2ff, #f0fdf4)', border: '1px solid #e0e7ff' }}
                                        >
                                            <IoCheckmarkCircleOutline size={38} className="text-indigo-300" />
                                        </div>

                                        <h3 className="tsl-title text-xl font-extrabold text-slate-800 mb-2">
                                            All caught up!
                                        </h3>

                                        <p className="text-slate-400 text-sm font-light max-w-xs mx-auto leading-relaxed">
                                            No teacher leave requests match your current filters.
                                        </p>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {selectedRequest && (
                        <ApproveRejectModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            leaveRequest={selectedRequest}
                            onSuccess={() => {
                                fetchRequests();
                                setActiveRequest(null);
                            }}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminTeacherLeaves;
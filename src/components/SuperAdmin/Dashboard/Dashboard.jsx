import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import Loader from '../../../utils/Loader';
import { BACKEND_URL } from '../../../constants/api';
import axios from 'axios';
import moment from 'moment';
import SuperAdminNavbar from '../SuperAdminNavbar';
import { useQuery } from '@tanstack/react-query';
import { getAllAdmins, getAllStudents, getAllTeachers } from '../../../api/Admin/AdminApi';
import { getPlatformFees } from '../../../api/Admin/FeesApi';
import {
    IoPeopleOutline,
    IoSchoolOutline,
    IoCashOutline,
    IoBarChartOutline,
    IoCheckmarkCircleOutline,
    IoCloseCircleOutline,
    IoTimeOutline,
    IoChatboxEllipsesOutline,
    IoSearchOutline,
    IoTrendingUpOutline,
    IoShieldCheckmarkOutline,
    IoCalendarOutline,
    IoRefreshOutline,
    IoBusinessOutline,
    IoSparklesOutline,
} from 'react-icons/io5';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const cardMotion = {
    hidden: { opacity: 0, y: 18 },
    show: (idx = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: idx * 0.045, duration: 0.42, ease: 'easeOut' },
    }),
};

const formatCurrency = (value = 0) => `Rs. ${Number(value || 0).toLocaleString()}`;

const Dashboard = () => {
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [months, setMonths] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: admins = [], isLoading: adminsLoading, refetch: refetchAdmins } = useQuery({
        queryKey: ['allAdmins'],
        queryFn: async () => getAllAdmins(),
    });

    const { data: statsData = {}, isLoading: statsLoading } = useQuery({
        queryKey: ['superAdminStats'],
        queryFn: async () => {
            const res = await axios.get(`${BACKEND_URL}/superadmin/stats`);
            return res.data;
        }
    });

    const { data: platformFees = [], isLoading: feesLoading, refetch: refetchFees } = useQuery({
        queryKey: ['platformFees'],
        queryFn: async () => getPlatformFees(),
    });

    const isLoading = adminsLoading || statsLoading || feesLoading;


    const handleExtendSubscription = async (e) => {
        e.preventDefault();
        if (!selectedAdmin) return;

        const parsedMonths = Number.parseInt(months, 10);
        if (!parsedMonths || parsedMonths < 1) {
            toast.error('Please enter a valid number of months');
            return;
        }

        setProcessing(true);
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token || ''}`,
                },
            };

            await axios.post(
                `${BACKEND_URL}/subscription/extend`,
                {
                    userId: selectedAdmin.id,
                    months: parsedMonths,
                },
                config
            );

            toast.success(`Subscription extended for ${selectedAdmin.name}`);
            setIsModalOpen(false);
            setSelectedAdmin(null);
            refetchAdmins();
            refetchFees();
        } catch (error) {
            console.error('Error extending subscription:', error);
            toast.error(error?.response?.data?.message || 'Failed to extend subscription');
        } finally {
            setProcessing(false);
        }
    };

    const openModal = (admin) => {
        setSelectedAdmin(admin);
        setMonths(1);
        setIsModalOpen(true);
    };

    const getSubscriptionStatus = (sub) => {
        if (!sub || !sub.expiresAt) {
            return {
                label: 'Inactive',
                className: 'bg-rose-50 text-rose-700 ring-rose-100',
                dot: 'bg-rose-500',
            };
        }

        const expiry = new Date(sub.expiresAt);
        const now = new Date();

        if (expiry > now) {
            return {
                label: 'Active',
                className: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
                dot: 'bg-emerald-500 animate-pulse',
            };
        }

        return {
            label: 'Expired',
            className: 'bg-amber-50 text-amber-700 ring-amber-100',
            dot: 'bg-amber-500',
        };
    };

    const renderStatusBadge = (sub) => {
        const status = getSubscriptionStatus(sub);
        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ${status.className}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                {status.label}
            </span>
        );
    };

    const activeAdmins = statsData.activeAdmins || 0;
    const blockedAdmins = statsData.blockedAdmins || 0;
    const monthlyRevenue = statsData.totalRevenue || 0;
    const pendingPaymentsAmount = statsData.pendingPayments || 0; 


    const monthlyData = useMemo(() => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const now = new Date();

        return Array.from({ length: 12 }, (_, index) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (11 - index), 1);
            const month = d.getMonth() + 1;
            const year = d.getFullYear();
            const total = (platformFees || [])
                .filter((fee) => fee.status === 'paid' && Number(fee.month) === month && Number(fee.year) === year)
                .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

            return {
                name: monthNames[d.getMonth()],
                revenue: total,
            };
        });
    }, [platformFees]);

    const totalTeachers = statsData.totalTeachers || 0;
    const totalStudents = statsData.totalStudents || 0;
    const efficiency = admins.length > 0 ? (((admins.length - blockedAdmins) / admins.length) * 100).toFixed(1) : '100.0';


    const newRegistrations = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        return admins.filter((admin) => admin.createdAt && new Date(admin.createdAt) > thirtyDaysAgo).length;
    }, [admins]);

    const filteredAdmins = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return admins;

        return admins.filter((admin) =>
            [admin.name, admin.email]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(term))
        );
    }, [admins, searchTerm]);

    const systemLogs = useMemo(() => {
        const adminLogs = (admins || []).slice(0, 4).map((admin) => ({
            time: admin.createdAt ? moment(admin.createdAt).fromNow() : 'Recently',
            event: `New organization registered: ${admin.name}`,
            status: 'success',
        }));

        const feeLogs = (platformFees || []).slice(0, 4).map((fee) => ({
            time: fee.createdAt ? moment(fee.createdAt).fromNow() : 'Recently',
            event: `Platform fee ${fee.status || 'generated'} for ${fee.admin?.name || 'School'}`,
            status: fee.status === 'paid' ? 'success' : 'info',
        }));

        return [...adminLogs, ...feeLogs].slice(0, 6);
    }, [admins, platformFees]);

    const stats = [
        {
            title: 'Total Admins',
            value: admins.length,
            helper: 'Registered organizations',
            icon: IoPeopleOutline,
            accent: 'from-blue-500 to-cyan-400',
            chip: 'bg-blue-50 text-blue-700 ring-blue-100',
        },
        {
            title: 'Active Admins',
            value: activeAdmins,
            helper: 'Currently subscribed',
            icon: IoCheckmarkCircleOutline,
            accent: 'from-emerald-500 to-teal-400',
            chip: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
        },
        {
            title: 'Blocked Admins',
            value: blockedAdmins,
            helper: 'Restricted accounts',
            icon: IoCloseCircleOutline,
            accent: 'from-rose-500 to-pink-400',
            chip: 'bg-rose-50 text-rose-700 ring-rose-100',
        },

        {
            title: 'Monthly Revenue',
            value: formatCurrency(monthlyRevenue),
            helper: 'Paid platform fees',
            icon: IoCashOutline,
            accent: 'from-indigo-500 to-blue-400',
            chip: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
        },
        {
            title: 'Pending Payments',
            value: formatCurrency(pendingPaymentsAmount),
            helper: 'Unpaid invoices',
            icon: IoTimeOutline,
            accent: 'from-amber-500 to-yellow-400',
            chip: 'bg-amber-50 text-amber-700 ring-amber-100',
        },

        {
            title: 'New Registrations',
            value: newRegistrations,
            helper: 'Last 30 days',
            icon: IoTrendingUpOutline,
            accent: 'from-pink-500 to-rose-400',
            chip: 'bg-pink-50 text-pink-700 ring-pink-100',
        },
    ];

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f7fb] font-poppins text-slate-900">
            <SuperAdminNavbar heading="System Overview" />

            <main className="max-w-screen-2xl p-4 sm:p-6 md:p-8">
                <motion.section
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className=" hidden relative overflow-hidden rounded-[2rem] bg-[#080f4f] p-6 shadow-2xl shadow-indigo-950/20 sm:p-8 lg:p-10"
                >
                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-400/30 blur-3xl" />
                    <div className="absolute -bottom-28 left-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
                    <div className=" absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent)]" />

                    <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-indigo-100 backdrop-blur">
                                <IoSparklesOutline className="text-cyan-200" /> Super Admin Command Center
                            </span>
                            <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                                Professional Platform Dashboard
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                                Monitor organizations, subscriptions, revenue, user growth, and operational health from one polished control center.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:min-w-[360px]">
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                <p className="text-xs font-semibold text-indigo-200">Active Orgs</p>
                                <p className="mt-1 text-2xl font-black text-white">{activeAdmins}/{admins.length}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                                <p className="text-xs font-semibold text-indigo-200">Revenue</p>
                                <p className="mt-1 text-2xl font-black text-white">{formatCurrency(monthlyRevenue)}</p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <section className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.title}
                            custom={idx}
                            variants={cardMotion}
                            initial="hidden"
                            animate="show"
                            className="group relative overflow-hidden rounded-3xl border border-white bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
                        >
                            <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${stat.accent}`} />
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{stat.title}</p>
                                    <h3 className="mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{stat.value}</h3>
                                    <p className="mt-2 text-xs font-medium text-slate-400">{stat.helper}</p>
                                </div>
                                <div className={`rounded-2xl p-3 ring-1 ${stat.chip} transition-transform duration-300 group-hover:scale-110`}>
                                    <stat.icon size={22} />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </section>

                <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.45 }}
                        className="rounded-3xl border border-white bg-white p-6 shadow-sm ring-1 ring-slate-100 xl:col-span-2"
                    >
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700 ring-1 ring-indigo-100">
                                        <IoTrendingUpOutline size={18} />
                                    </div>
                                    <h2 className="text-lg font-black text-slate-950">Revenue Growth</h2>
                                </div>
                                <p className="mt-2 text-sm text-slate-400">Platform monthly income over the last 12 months</p>
                            </div>
                            <span className="inline-flex items-center gap-2 self-start rounded-full bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-100 sm:self-auto">
                                <IoCalendarOutline /> Last 12 Months
                            </span>
                        </div>

                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.32} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                                        tickFormatter={(val) => `Rs.${Number(val) / 1000}k`}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#c7d2fe', strokeWidth: 1 }}
                                        formatter={(value) => [formatCurrency(value), 'Revenue']}
                                        contentStyle={{
                                            borderRadius: '18px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 18px 50px rgba(15,23,42,0.12)',
                                            padding: '12px 16px',
                                            fontSize: '13px',
                                            fontWeight: 800,
                                        }}
                                        itemStyle={{ color: '#4f46e5' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#4f46e5"
                                        strokeWidth={4}
                                        fill="url(#revenueGradient)"
                                        dot={{ r: 3, strokeWidth: 2, fill: '#fff', stroke: '#4f46e5' }}
                                        activeDot={{ r: 7, fill: '#4f46e5', stroke: '#fff', strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.24, duration: 0.45 }}
                        className="relative overflow-hidden rounded-3xl bg-[#080f4f] p-6 text-white shadow-2xl shadow-indigo-950/20"
                    >
                        <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
                        <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-indigo-400/20 blur-3xl" />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 backdrop-blur">
                                    <IoShieldCheckmarkOutline size={24} />
                                </div>
                                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-black text-emerald-300 ring-1 ring-emerald-300/20">
                                    Healthy
                                </span>
                            </div>

                            <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-indigo-200">Platform Efficiency</p>
                            <p className="mt-2 text-6xl font-black tracking-tight">
                                {efficiency}<span className="text-2xl text-indigo-300">%</span>
                            </p>
                            <p className="mt-3 text-sm leading-6 text-indigo-100">Operational score based on active and unblocked organizations.</p>

                            <div className="mt-8 space-y-5">
                                {[
                                    { label: 'Server Uptime', value: '99.9%', width: '99.9%', bar: 'bg-emerald-400' },
                                    { label: 'Active Organizations', value: `${activeAdmins}/${admins.length}`, width: `${admins.length ? (activeAdmins / admins.length) * 100 : 0}%`, bar: 'bg-cyan-300' },
                                    { label: 'Account Health', value: `${efficiency}%`, width: `${efficiency}%`, bar: 'bg-violet-300' },
                                ].map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-2 flex items-center justify-between text-xs">
                                            <span className="font-semibold text-indigo-100">{item.label}</span>
                                            <span className="font-black text-white">{item.value}</span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                            <div className={`h-full rounded-full ${item.bar}`} style={{ width: item.width }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsLogsModalOpen(true)}
                                className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-sm font-black text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98]"
                            >
                                View System Logs <span>→</span>
                            </button>
                        </div>
                    </motion.div>
                </section>

                <motion.section
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.45 }}
                    className="mt-8 overflow-hidden rounded-3xl border border-white bg-white shadow-sm ring-1 ring-slate-100"
                >
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700 ring-1 ring-indigo-100">
                                    <IoBusinessOutline size={18} />
                                </div>
                                <h2 className="text-lg font-black text-slate-950">Registered Organizations</h2>
                            </div>
                            <p className="mt-2 text-sm text-slate-400">{admins.length} total organizations on platform</p>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative">
                                <IoSearchOutline className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search organization..."
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50 sm:w-72"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    refetchAdmins();
                                    refetchFees();
                                }}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#080f4f] px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-900/15 transition hover:bg-indigo-800 active:scale-[0.98]"
                            >
                                <IoRefreshOutline /> Refresh
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-slate-50/80">
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">#</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Organization</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Email</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Expiry</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAdmins.length > 0 ? (
                                    filteredAdmins.map((admin, index) => (
                                        <tr key={admin.id} className="group transition hover:bg-indigo-50/40">
                                            <td className="px-6 py-4">
                                                <span className="text-xs font-black text-slate-300">{String(index + 1).padStart(2, '0')}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-cyan-100 text-sm font-black text-indigo-800 ring-1 ring-indigo-100 transition-transform group-hover:scale-105">
                                                        {admin.name?.charAt(0)?.toUpperCase() || 'O'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-black text-slate-800">{admin.name || 'Unnamed Organization'}</p>
                                                        <p className="mt-0.5 text-xs font-medium text-slate-400">Organization account</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-semibold text-slate-500">{admin.email || '—'}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">{renderStatusBadge(admin.subscription)}</td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-slate-500">
                                                    {admin.subscription?.expiresAt
                                                        ? new Date(admin.subscription.expiresAt).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })
                                                        : '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => openModal(admin)}
                                                    className="rounded-xl bg-[#080f4f] px-5 py-2.5 text-xs font-black text-white shadow-sm shadow-indigo-900/10 transition hover:-translate-y-0.5 hover:bg-indigo-800 hover:shadow-lg active:scale-95"
                                                >
                                                    Extend
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center">
                                            <div className="mx-auto flex max-w-sm flex-col items-center">
                                                <div className="rounded-3xl bg-slate-50 p-5 text-slate-400 ring-1 ring-slate-100">
                                                    <IoSearchOutline size={30} />
                                                </div>
                                                <h3 className="mt-4 text-base font-black text-slate-800">No organizations found</h3>
                                                <p className="mt-1 text-sm text-slate-400">Try a different name or email address.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.section>
            </main>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 8 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-100"
                        >
                            <div className="bg-[#080f4f] p-6 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-black ring-1 ring-white/15">
                                        {selectedAdmin?.name?.charAt(0)?.toUpperCase() || 'O'}
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black">Extend Subscription</h2>
                                        <p className="mt-0.5 text-xs font-medium text-indigo-200">{selectedAdmin?.name}</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleExtendSubscription} className="space-y-5 p-6">
                                <div>
                                    <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">Number of Months</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={months}
                                        onChange={(e) => setMonths(e.target.value)}
                                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                                        placeholder="e.g. 12"
                                    />
                                </div>

                                <div className="flex gap-3 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-black text-slate-600 transition hover:bg-slate-200 active:scale-[0.98]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 rounded-2xl bg-[#080f4f] py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-900/15 transition hover:bg-indigo-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {processing ? 'Processing...' : 'Confirm'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isLogsModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.96, opacity: 0, y: 8 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                            className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-100"
                        >
                            <div className="mb-6 flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-black text-slate-950">System Activity Logs</h2>
                                    <p className="mt-1 text-sm text-slate-400">Recent platform activity and generated events</p>
                                </div>
                                <button
                                    onClick={() => setIsLogsModalOpen(false)}
                                    className="rounded-2xl bg-slate-100 p-2.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                                >
                                    <IoCloseCircleOutline size={20} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {systemLogs.length > 0 ? (
                                    systemLogs.map((log, index) => (
                                        <motion.div
                                            key={`${log.event}-${index}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/50"
                                        >
                                            <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-black text-slate-800">{log.event}</p>
                                                <p className="mt-1 text-xs font-semibold text-slate-400">{log.time}</p>
                                            </div>
                                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                {log.status}
                                            </span>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="rounded-2xl bg-slate-50 p-8 text-center ring-1 ring-slate-100">
                                        <IoChatboxEllipsesOutline className="mx-auto text-slate-300" size={32} />
                                        <p className="mt-3 text-sm font-bold text-slate-500">No recent system logs available.</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsLogsModalOpen(false)}
                                className="mt-6 w-full rounded-2xl bg-[#080f4f] py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-900/15 transition hover:bg-indigo-800 active:scale-[0.98]"
                            >
                                Close
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dashboard;

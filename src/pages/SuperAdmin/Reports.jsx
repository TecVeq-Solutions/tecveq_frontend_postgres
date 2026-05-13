import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';
import SuperAdminNavbar from '../../components/SuperAdmin/SuperAdminNavbar';
import Loader from '../../utils/Loader';
import {
    IoStatsChartOutline,
    IoPieChartOutline,
    IoBarChartOutline,
    IoBusinessOutline,
    IoPeopleOutline,
    IoSchoolOutline,
    IoCashOutline,
    IoWarningOutline,
    IoCloseCircleOutline,
    IoTimeOutline,
    IoDownloadOutline,
    IoSearchOutline,
    IoChevronBackOutline,
    IoChevronForwardOutline,
    IoChevronDownOutline
} from 'react-icons/io5';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const Reports = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [accountStatusFilter, setAccountStatusFilter] = useState('All');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
    const [packageFilter, setPackageFilter] = useState('All');

    // Pagination states only for INSTITUTE-WISE REPORT TABLE
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data, isLoading } = useQuery({
        queryKey: ['superadmin-reports'],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const res = await axios.get(`${BACKEND_URL}/superadmin/reports`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            return res.data;
        }
    });

    const { overallStats, instituteReports, revenueReports, growthReports, packageReports, riskReports } = data || {};

    const reportCards = [
        { title: 'Total Revenue', value: `Rs. ${overallStats?.totalRevenue || 0}`, icon: <IoCashOutline />, color: 'bg-emerald-50 text-emerald-700', trend: 'Total paid subscriptions' },
        { title: 'Active Institutes', value: overallStats?.activeInstitutes || 0, icon: <IoBusinessOutline />, color: 'bg-indigo-50 text-indigo-700', trend: `${overallStats?.totalInstitutes} Total Registered` },
        { title: 'Total Students', value: overallStats?.totalStudents || 0, icon: <IoPeopleOutline />, color: 'bg-violet-50 text-violet-700', trend: 'Across all institutes' },
        { title: 'Total Teachers', value: overallStats?.totalTeachers || 0, icon: <IoSchoolOutline />, color: 'bg-amber-50 text-amber-700', trend: 'Across all institutes' },
        { title: 'Total Parents', value: overallStats?.totalParents || 0, icon: <IoPeopleOutline />, color: 'bg-blue-50 text-blue-700', trend: 'Across all institutes' },
        { title: 'Total Classes', value: overallStats?.totalClasses || 0, icon: <IoSchoolOutline />, color: 'bg-teal-50 text-teal-700', trend: 'Active classrooms' },
        { title: 'Blocked Institutes', value: overallStats?.blockedInstitutes || 0, icon: <IoCloseCircleOutline />, color: 'bg-red-50 text-red-700', trend: 'Action required' },
        { title: 'Pending Payments', value: overallStats?.pendingPayments || 0, icon: <IoTimeOutline />, color: 'bg-orange-50 text-orange-700', trend: `${overallStats?.overduePayments} Overdue` },
    ];

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    // Filtering logic
    const filteredInstitutes = instituteReports?.filter(inst => {
        const matchesSearch = inst.instituteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inst.adminName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inst.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAccount = accountStatusFilter === 'All' || inst.accountStatus?.toLowerCase() === accountStatusFilter.toLowerCase();
        const matchesPayment = paymentStatusFilter === 'All' || inst.paymentStatus?.toLowerCase() === paymentStatusFilter.toLowerCase();
        const matchesPackage = packageFilter === 'All' || inst.packageName?.toLowerCase() === packageFilter.toLowerCase();

        return matchesSearch && matchesAccount && matchesPayment && matchesPackage;
    }) || [];

    // Pagination logic only for INSTITUTE-WISE REPORT TABLE
    const totalItems = filteredInstitutes.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

    const paginatedInstitutes = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        return filteredInstitutes.slice(startIndex, endIndex);
    }, [filteredInstitutes, currentPage, rowsPerPage]);

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endItem = Math.min(currentPage * rowsPerPage, totalItems);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, accountStatusFilter, paymentStatusFilter, packageFilter, rowsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    const exportToCSV = () => {
        if (!filteredInstitutes || filteredInstitutes.length === 0) return;

        const headers = ["Institute Name", "Admin Name", "Email", "Package", "Account Status", "Payment Status", "Students", "Teachers", "Parents", "Classes", "Revenue (Rs)", "Due Date"];
        const csvRows = [headers.join(',')];

        filteredInstitutes.forEach(inst => {
            const row = [
                `"${inst.instituteName}"`,
                `"${inst.adminName}"`,
                `"${inst.email}"`,
                `"${inst.packageName}"`,
                `"${inst.accountStatus}"`,
                `"${inst.paymentStatus}"`,
                inst.studentsCount,
                inst.teachersCount,
                inst.parentsCount,
                inst.classesCount,
                inst.totalPaidAmount,
                inst.dueDate ? new Date(inst.dueDate).toLocaleDateString() : "N/A"
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "institute_reports.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] font-poppins pb-20">
            <SuperAdminNavbar heading="System Analytics" />

            <main className="max-w-screen-2xl p-3 sm:p-6 md:p-8 mx-auto">
                {isLoading ? (
                    <div className="flex h-[70vh] items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <>
                        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">Performance Intelligence</h1>
                                <p className="text-sm font-medium text-slate-500">Comprehensive multi-institute analytics dashboard</p>
                            </div>
                            <button onClick={exportToCSV} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-200">
                                <IoDownloadOutline size={18} /> Export CSV
                            </button>
                        </div>

                        {/* 1. TOP SUMMARY CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-10">
                            {reportCards.map((card, idx) => (
                                <div key={idx} className="bg-white rounded-[1.5rem] p-6 shadow-sm ring-1 ring-slate-100 transition hover:shadow-xl hover:-translate-y-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">{card.title}</p>
                                            <h2 className="text-2xl font-black text-slate-900">{card.value}</h2>
                                        </div>
                                        <div className={`h-12 w-12 rounded-2xl ${card.color} flex items-center justify-center text-2xl shrink-0`}>
                                            {card.icon}
                                        </div>
                                    </div>
                                    <p className="text-[11px] font-bold text-slate-500 mt-4 bg-slate-50 inline-block px-3 py-1 rounded-lg">{card.trend}</p>
                                </div>
                            ))}
                        </div>

                        {/* CHARTS SECTION */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-10">
                            {/* Revenue Trend Chart */}
                            <div className="bg-white rounded-[2rem] p-4 sm:p-8 shadow-sm ring-1 ring-slate-100 flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <IoStatsChartOutline className="text-indigo-500" /> Monthly Revenue Trend
                                    </h3>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueReports?.monthlyRevenue || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                                            <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="amount" name="Revenue (Rs)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Growth Chart */}
                            <div className="bg-white rounded-[2rem] p-4 sm:p-6 sm:p-8 shadow-sm ring-1 ring-slate-100 flex flex-col">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-md sm:text-lg font-black text-slate-900 flex items-center gap-2">
                                        <IoBarChartOutline className="text-emerald-500" /> Platform Growth (Students)
                                    </h3>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={growthReports?.monthlyNewStudents || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
                                            <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Line type="monotone" dataKey="uv" name="New Students" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Payment Distribution Pie Chart */}
                            <div className="bg-white rounded-[2rem] p-4 sm:p-8 shadow-sm ring-1 ring-slate-100 flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <IoPieChartOutline className="text-amber-500" /> Payment Status
                                    </h3>
                                </div>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={revenueReports?.paymentStatusDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                                                {revenueReports?.paymentStatusDistribution?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Package Report */}
                            <div className="bg-white rounded-[2rem] p-4 sm:p-8 shadow-sm ring-1 ring-slate-100 flex flex-col">
                                <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <IoStatsChartOutline className="text-violet-500" /> Package Utilization
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left whitespace-nowrap">
                                        <thead>
                                            <tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                                <th className="pb-3 px-2">Package</th>
                                                <th className="pb-3 px-2">Institutes</th>
                                                <th className="pb-3 px-2">Revenue</th>
                                                <th className="pb-3 px-2">Students</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {packageReports?.map((pkg, idx) => (
                                                <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                                                    <td className="py-4 px-2 font-bold text-slate-800">{pkg.packageName}</td>
                                                    <td className="py-4 px-2 text-slate-600 font-medium">{pkg.institutesCount}</td>
                                                    <td className="py-4 px-2 text-slate-600 font-medium">Rs. {pkg.revenue}</td>
                                                    <td className="py-4 px-2">
                                                        <div className="text-xs font-medium text-slate-600 mb-1">{pkg.studentsUsed} / {pkg.studentsLimit || '∞'}</div>
                                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min((pkg.studentsUsed / (pkg.studentsLimit || 1)) * 100, 100)}%` }}></div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* FILTERS */}
                        <div className="bg-white rounded-[2rem] p-4 sm:p-6 mb-8 shadow-sm ring-1 ring-slate-100">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Filter Reports</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="relative">
                                    <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search institute or admin..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition"
                                    />
                                </div>
                                <select value={accountStatusFilter} onChange={e => setAccountStatusFilter(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition appearance-none">
                                    <option value="All">All Account Status</option>
                                    <option value="active">Active</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="pending">Pending</option>
                                </select>
                                <select value={paymentStatusFilter} onChange={e => setPaymentStatusFilter(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition appearance-none">
                                    <option value="All">All Payment Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="unpaid">Unpaid</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                                <select value={packageFilter} onChange={e => setPackageFilter(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100 transition appearance-none">
                                    <option value="All">All Packages</option>
                                    {packageReports?.map((pkg, idx) => <option key={idx} value={pkg.packageName}>{pkg.packageName}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* INSTITUTE-WISE REPORT TABLE */}
                        <div className="bg-white rounded-[2rem] shadow-sm ring-1 ring-slate-100 overflow-hidden mb-10">
                            <div className="p-4 sm:p-6 md:p-8 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="text-md sm:text-lg font-black text-slate-900">Institute Performance Report</h3>
                                <span className="bg-indigo-50 text-indigo-700 font-bold px-2 sm:px-3 py-1 rounded-lg text-xs">{filteredInstitutes?.length || 0} Results</span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left whitespace-nowrap">
                                    <thead className="bg-slate-50/50">
                                        <tr className="text-xs font-black text-slate-500 uppercase tracking-widest">
                                            <th className="py-4 px-6">Institute</th>
                                            <th className="py-4 px-4">Plan</th>
                                            <th className="py-4 px-4">Account</th>
                                            <th className="py-4 px-4">Payment</th>
                                            <th className="py-4 px-4 text-center">Users (S/T/P)</th>
                                            <th className="py-4 px-4 text-center">Classes</th>
                                            <th className="py-4 px-6 text-right">Revenue</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredInstitutes?.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-10 text-slate-500 font-medium">
                                                    No institutes match the filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedInstitutes?.map((inst, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 transition">
                                                    <td className="py-4 px-6">
                                                        <p className="font-bold text-slate-800">{inst.instituteName}</p>
                                                        <p className="text-xs font-medium text-slate-500">{inst.adminName} • {inst.email}</p>
                                                    </td>
                                                    <td className="py-4 px-4 text-sm font-bold text-slate-700">{inst.packageName}</td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${inst.accountStatus?.toLowerCase() === 'active' ? 'bg-emerald-50 text-emerald-700' :
                                                            inst.accountStatus?.toLowerCase() === 'blocked' ? 'bg-red-50 text-red-700' :
                                                                'bg-amber-50 text-amber-700'
                                                            }`}>
                                                            {inst.accountStatus?.toUpperCase() || 'UNKNOWN'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${inst.paymentStatus?.toLowerCase() === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                                                            inst.paymentStatus?.toLowerCase() === 'overdue' ? 'bg-red-50 text-red-700' :
                                                                'bg-amber-50 text-amber-700'
                                                            }`}>
                                                            {inst.paymentStatus?.toUpperCase() || 'UNKNOWN'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 text-center">
                                                        <div className="flex justify-center gap-2 text-xs font-bold">
                                                            <span className="bg-violet-50 text-violet-700 px-2 py-0.5 rounded">{inst.studentsCount}</span>
                                                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded">{inst.teachersCount}</span>
                                                            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{inst.parentsCount}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-center text-sm font-bold text-slate-700">{inst.classesCount}</td>
                                                    <td className="py-4 px-6 text-right">
                                                        <p className="font-bold text-slate-900">Rs. {inst.totalPaidAmount}</p>
                                                        {inst.dueDate && <p className="text-[10px] font-bold text-slate-400 mt-0.5">Due: {new Date(inst.dueDate).toLocaleDateString()}</p>}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination + Selector */}
                            {totalItems > 0 && (
                                <div className="flex  lg:flex-row items-center justify-between gap-2 sm:gap-4 px-2 sm:px-5 sm:px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-white via-indigo-50/50 to-slate-50">
                                    <div className="flex items-center gap-1 sm:gap-3">
                                        <span className="text-xs sm:text-sm font-bold text-slate-500">
                                            Rows per page
                                        </span>

                                        <div className="relative">
                                            <select
                                                value={rowsPerPage}
                                                onChange={(e) => {
                                                    setRowsPerPage(Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                                className="appearance-none rounded-2xl border border-indigo-100 bg-white   py-3 pl-3 sm:pl-4   pr-7 sm:pr-10 text-xs sm:text-sm font-black text-[#080f4f] shadow-sm outline-none transition hover:border-indigo-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                                            >
                                                {[2, 4, 6, 10].map((item) => (
                                                    <option key={item} value={item}>
                                                        {item}
                                                    </option>
                                                ))}
                                            </select>

                                            <IoChevronDownOutline
                                                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500"
                                                size={16}
                                            />
                                        </div>
                                    </div>

                                    <p className="hidden sm:block text-xs sm:text-sm font-bold text-slate-500 text-center">
                                        Showing{" "}
                                        <span className="font-black text-[#080f4f]">{startItem}</span>
                                        {" - "}
                                        <span className="font-black text-[#080f4f]">{endItem}</span>
                                        {" of "}
                                        <span className="font-black text-[#080f4f]">{totalItems}</span>
                                        {" "}Institutes
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="sm:h-10 sm:w-10 h-8 w-8 flex items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm transition hover:bg-[#080f4f] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-indigo-600"
                                        >
                                            <IoChevronBackOutline size={18} />
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
                                                            <span className="px-1 text-slate-400 text-sm font-bold">
                                                                ...
                                                            </span>
                                                        )}

                                                        <button
                                                            onClick={() => goToPage(page)}
                                                            className={`sm:h-10 sm:w-10 h-8 w-8 rounded-2xl text-xs sm:text-sm font-black transition-all ${currentPage === page
                                                                ? "bg-[#080f4f] text-white shadow-lg shadow-indigo-900/20 scale-105"
                                                                : "bg-white border border-indigo-100 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 shadow-sm"
                                                                }`}
                                                        >
                                                            {page}
                                                        </button>
                                                    </React.Fragment>
                                                ))}
                                        </div>

                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="sm:h-10 sm:w-10 h-8 w-8 flex items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm transition hover:bg-[#080f4f] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-indigo-600"
                                        >
                                            <IoChevronForwardOutline size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RISK REPORT */}
                        {(riskReports?.blockedInstitutes?.length > 0 || riskReports?.overdueInstitutes?.length > 0) && (
                            <div className="bg-red-50 rounded-[2rem] p-6 sm:p-8 shadow-sm ring-1 ring-red-100">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                        <IoWarningOutline size={24} />
                                    </div>
                                    <h3 className="text-lg font-black text-red-900">Payment & Access Risk</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {riskReports?.blockedInstitutes?.length > 0 && (
                                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Blocked Institutes</h4>
                                            <ul className="space-y-3">
                                                {riskReports.blockedInstitutes.map((inst, i) => (
                                                    <li key={i} className="flex justify-between items-center text-sm font-bold">
                                                        <span className="text-slate-800">{inst.instituteName}</span>
                                                        <span className="text-red-500">BLOCKED</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    {riskReports?.overdueInstitutes?.length > 0 && (
                                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Overdue Payments</h4>
                                            <ul className="space-y-3">
                                                {riskReports.overdueInstitutes.map((inst, i) => (
                                                    <li key={i} className="flex justify-between items-center text-sm font-bold">
                                                        <span className="text-slate-800">{inst.instituteName}</span>
                                                        <span className="text-red-500">OVERDUE</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default Reports;
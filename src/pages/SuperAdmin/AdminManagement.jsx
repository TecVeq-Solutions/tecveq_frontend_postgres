import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';
import SuperAdminNavbar from '../../components/SuperAdmin/SuperAdminNavbar';
import Loader from '../../utils/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    IoAddOutline,
    IoSearchOutline,
    IoFilterOutline,
    IoCloseOutline,
    IoBusinessOutline,
    IoMailOutline,
    IoCallOutline,
    IoCalendarOutline,
    IoCheckmarkCircleOutline,
    IoCloseCircleOutline,
    IoAlertCircleOutline,
    IoTrashOutline,
    IoCreateOutline,
    IoKeyOutline,
    IoChevronBackOutline,
    IoChevronForwardOutline,
    IoChevronDownOutline,
    IoServerOutline,
    IoShieldCheckmarkOutline
} from 'react-icons/io5';
import { toast } from 'react-toastify';

const AdminManagement = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data: admins = [], isLoading, refetch } = useQuery({
        queryKey: ['superadmin-admins'],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const res = await axios.get(`${BACKEND_URL}/superadmin/admins`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            return res.data;
        }
    });

    const { data: packages = [] } = useQuery({
        queryKey: ['superadmin-packages-list'],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const res = await axios.get(`${BACKEND_URL}/superadmin/packages`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            return res.data;
        }
    });

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return { label: 'Active', bg: 'bg-emerald-50 text-emerald-700 ring-emerald-100', icon: <IoCheckmarkCircleOutline className="text-emerald-500" /> };
            case 'blocked':
                return { label: 'Blocked', bg: 'bg-rose-50 text-rose-700 ring-rose-100', icon: <IoCloseCircleOutline className="text-rose-500" /> };
            case 'pending':
                return { label: 'Pending', bg: 'bg-amber-50 text-amber-700 ring-amber-100', icon: <IoAlertCircleOutline className="text-amber-500" /> };
            case 'expired':
                return { label: 'Expired', bg: 'bg-slate-50 text-slate-700 ring-slate-100', icon: <IoAlertCircleOutline className="text-slate-500" /> };
            default:
                return { label: 'Unknown', bg: 'bg-slate-50 text-slate-700 ring-slate-100', icon: <IoAlertCircleOutline className="text-slate-500" /> };
        }
    };

    const handleOpenEditModal = (admin) => {
        setEditingAdmin(admin);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingAdmin) return;

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        if (data.email) data.email = data.email.trim();

        // If password is left blank, remove it so it doesn't overwrite existing
        if (!data.password || !data.password.trim()) {
            delete data.password;
        }

        try {
            setProcessing(true);
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };

            await axios.put(`${BACKEND_URL}/superadmin/admins/${editingAdmin.id}`, data, config);
            toast.success("Institute profile updated successfully");
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id, instituteName) => {
        if (!window.confirm(`Are you sure you want to delete ${instituteName || 'this institute'}? This will delete all associated data.`)) return;

        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            await axios.delete(`${BACKEND_URL}/superadmin/admins/${id}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            toast.success("Institute deleted successfully");
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete institute");
        }
    };

    const filteredAdmins = useMemo(() => {
        return admins.filter(admin => {
            const matchesSearch =
                admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admin.instituteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                admin.tenantCode?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === 'all' || admin.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [admins, searchTerm, filterStatus]);

    // Pagination logic
    const totalItems = filteredAdmins.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

    const paginatedAdmins = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        return filteredAdmins.slice(startIndex, endIndex);
    }, [filteredAdmins, currentPage, rowsPerPage]);

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endItem = Math.min(currentPage * rowsPerPage, totalItems);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, rowsPerPage]);

    return (
        <div className="min-h-screen bg-[#f5f7fb] font-poppins">
            <SuperAdminNavbar heading="Institute Directory" />

            <main className="mx-auto w-full max-w-screen-2xl p-3 sm:p-6 md:p-8">
                {isLoading ? (
                    <div className="flex h-[70vh] items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <>
                        {/* Header Actions */}
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                    Institute Directory
                                </h1>
                                <p className="text-sm font-medium text-slate-500">
                                    Manage registered institutes, assigned subscription tiers, and administrative credentials
                                </p>
                            </div>

                            <button
                                onClick={() => navigate('/superadmin/tenants?action=onboard')}
                                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#080f4f] px-5 py-3 text-sm font-black text-white shadow-lg shadow-indigo-900/15 transition hover:bg-indigo-800 active:scale-95 sm:w-auto sm:px-6"
                            >
                                <IoAddOutline size={20} /> Onboard New Institute
                            </button>
                        </div>

                        {/* Filters & Search */}
                        <div className="mb-6 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-4">
                            <div className="relative lg:col-span-2">
                                <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by institute name, admin, code or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
                                />
                            </div>

                            <div className="relative">
                                <IoFilterOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="pending">Pending</option>
                                    <option value="expired">Expired</option>
                                </select>

                                <IoChevronDownOutline
                                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                                    size={16}
                                />
                            </div>
                        </div>

                        {/* Admins Table */}
                        <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm ring-1 ring-slate-100">
                            <div className="overflow-x-auto">
                                <table className="min-w-[920px] lg:min-w-full">
                                    <thead>
                                        <tr className="bg-slate-50/80">
                                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Institute & Admin
                                            </th>
                                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Architecture & DB
                                            </th>
                                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Contact
                                            </th>
                                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Subscription Plan
                                            </th>
                                            <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedAdmins.length > 0 ? (
                                            paginatedAdmins.map((admin) => {
                                                const status = getStatusBadge(admin.status);

                                                return (
                                                    <tr key={admin.id} className="group transition hover:bg-indigo-50/30">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 font-black text-sm">
                                                                    {admin.instituteName?.[0] || 'I'}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="truncate text-sm font-black text-slate-800">
                                                                            {admin.instituteName || 'No Institute Name'}
                                                                        </p>
                                                                        {admin.tenantCode && (
                                                                            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-purple-700 ring-1 ring-purple-200">
                                                                                {admin.tenantCode}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs font-semibold text-slate-400">
                                                                        Admin: {admin.name}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                                                    <IoServerOutline className="text-emerald-500" />
                                                                    {admin.hasDedicatedDb ? 'Dedicated PostgreSQL' : 'Master Database'}
                                                                </span>
                                                                {admin.tenantSlug && (
                                                                    <span className="font-mono text-[11px] text-slate-400">
                                                                        db: lms_{admin.tenantSlug}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-1">
                                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                                                    <IoMailOutline className="text-slate-400" /> {admin.email}
                                                                </div>

                                                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                                    <IoCallOutline className="text-slate-400" /> {admin.phoneNumber || 'N/A'}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col gap-0.5">
                                                                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 ring-1 ring-indigo-100 inline-block w-fit">
                                                                    {admin.package?.name || 'Enterprise University Plan'}
                                                                </span>
                                                                {admin.package?.monthlyPrice && (
                                                                    <span className="text-[11px] text-slate-400 font-semibold pl-1">
                                                                        PKR {admin.package.monthlyPrice.toLocaleString()}/mo
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${status.bg}`}>
                                                                {status.icon}
                                                                {status.label}
                                                            </span>
                                                        </td>

                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    onClick={() => handleOpenEditModal(admin)}
                                                                    title="Edit Profile & Plan"
                                                                    className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-indigo-600 hover:text-white"
                                                                >
                                                                    <IoCreateOutline size={18} />
                                                                </button>

                                                                <button
                                                                    onClick={() => handleDelete(admin.id, admin.instituteName)}
                                                                    title="Delete Institute"
                                                                    className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-rose-500 hover:text-white"
                                                                >
                                                                    <IoTrashOutline size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="py-20 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="rounded-full bg-slate-50 p-6 text-slate-300">
                                                            <IoSearchOutline size={40} />
                                                        </div>

                                                        <h3 className="mt-4 text-lg font-black text-slate-800">
                                                            No Institutes Found
                                                        </h3>

                                                        <p className="text-sm text-slate-400">
                                                            We couldn't find any institutes matching your criteria.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalItems > 0 && (
                                <div className="flex lg:flex-row items-center justify-between gap-2 sm:gap-4 px-2 sm:px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-white via-indigo-50/50 to-slate-50">
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
                                                className="appearance-none rounded-2xl border border-indigo-100 bg-white py-2 pl-3 pr-8 text-xs sm:text-sm font-black text-[#080f4f] shadow-sm outline-none transition"
                                            >
                                                {[5, 10, 20].map((item) => (
                                                    <option key={item} value={item}>
                                                        {item}
                                                    </option>
                                                ))}
                                            </select>

                                            <IoChevronDownOutline
                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500"
                                                size={14}
                                            />
                                        </div>
                                    </div>

                                    <p className="hidden sm:block text-xs sm:text-sm font-bold text-slate-500 text-center">
                                        Showing <span className="font-black text-[#080f4f]">{startItem}</span> - <span className="font-black text-[#080f4f]">{endItem}</span> of <span className="font-black text-[#080f4f]">{totalItems}</span> Institutes
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm transition hover:bg-[#080f4f] hover:text-white disabled:opacity-40"
                                        >
                                            <IoChevronBackOutline size={18} />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => goToPage(page)}
                                                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-2xl text-xs sm:text-sm font-black transition-all ${currentPage === page
                                                        ? "bg-[#080f4f] text-white shadow-lg shadow-indigo-900/20"
                                                        : "bg-white border border-indigo-100 text-slate-600 hover:border-indigo-400"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm transition hover:bg-[#080f4f] hover:text-white disabled:opacity-40"
                                        >
                                            <IoChevronForwardOutline size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Edit Modal */}
            <AnimatePresence>
                {isModalOpen && editingAdmin && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-3 sm:p-6 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="my-auto w-full max-w-xl overflow-hidden rounded-[2rem] bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5 sm:px-8 sm:py-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">
                                        Edit Institute Profile
                                    </h3>
                                    <p className="text-xs font-medium text-slate-400">
                                        Update organization information and administrative credentials
                                    </p>
                                </div>

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl bg-slate-50 p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                                >
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                        Institute Name
                                    </label>
                                    <div className="relative">
                                        <IoBusinessOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            required
                                            name="instituteName"
                                            defaultValue={editingAdmin.instituteName}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none border border-slate-200 focus:border-indigo-400 focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                            Admin Name
                                        </label>
                                        <input
                                            required
                                            name="name"
                                            defaultValue={editingAdmin.name}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 text-sm font-semibold outline-none border border-slate-200 focus:border-indigo-400 focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                            Contact Phone
                                        </label>
                                        <input
                                            name="phoneNumber"
                                            defaultValue={editingAdmin.phoneNumber || ''}
                                            placeholder="+92 300 1234567"
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 text-sm font-semibold outline-none border border-slate-200 focus:border-indigo-400 focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                        Reset Password <span className="text-[10px] text-slate-400 font-normal lowercase">(leave empty to keep unchanged)</span>
                                    </label>
                                    <div className="relative">
                                        <IoKeyOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Enter new password to reset"
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none border border-slate-200 focus:border-indigo-400 focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                            Subscription Plan
                                        </label>
                                        <select
                                            name="packageId"
                                            defaultValue={editingAdmin.packageId || ''}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 text-sm font-semibold outline-none border border-slate-200 focus:border-indigo-400 focus:bg-white transition"
                                        >
                                            <option value="">Default / Enterprise Plan</option>
                                            {packages.map(pkg => (
                                                <option key={pkg.id} value={pkg.id}>
                                                    {pkg.name} (PKR {pkg.monthlyPrice?.toLocaleString()})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                                            Account Status
                                        </label>
                                        <select
                                            name="status"
                                            defaultValue={editingAdmin.status || 'active'}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-4 text-sm font-semibold outline-none border border-slate-200 focus:border-indigo-400 focus:bg-white transition"
                                        >
                                            <option value="active">Active</option>
                                            <option value="blocked">Blocked</option>
                                            <option value="pending">Pending</option>
                                            <option value="expired">Expired</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-black text-slate-600 transition hover:bg-slate-200"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 rounded-2xl bg-[#080f4f] py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-900/20 transition hover:bg-indigo-800 disabled:opacity-70"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminManagement;
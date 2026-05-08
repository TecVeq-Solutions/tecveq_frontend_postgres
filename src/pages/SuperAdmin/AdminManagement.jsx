import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';
import SuperAdminNavbar from '../../components/SuperAdmin/SuperAdminNavbar';
import Loader from '../../utils/Loader';
import { motion, AnimatePresence } from 'framer-motion';
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
    IoEyeOutline,
    IoKeyOutline
} from 'react-icons/io5';
import { toast } from 'react-toastify';

const AdminManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [processing, setProcessing] = useState(false);

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

    const handleOpenModal = (admin = null) => {
        setEditingAdmin(admin);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Normalize email (trim)
        if (data.email) data.email = data.email.trim();
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };

            if (editingAdmin) {
                await axios.put(`${BACKEND_URL}/superadmin/admins/${editingAdmin.id}`, data, config);
                toast.success("Admin updated successfully");
            } else {
                await axios.post(`${BACKEND_URL}/superadmin/admins`, data, config);
                toast.success("Admin created successfully");
            }
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this institute? This will remove all associated data.")) return;

        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            await axios.delete(`${BACKEND_URL}/superadmin/admins/${id}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            toast.success("Admin deleted successfully");
            refetch();
        } catch (error) {
            toast.error("Failed to delete admin");
        }
    };

    const filteredAdmins = admins.filter(admin => {
        const matchesSearch = admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.instituteName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || admin.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader /></div>;

    return (
        <div className="min-h-screen bg-[#f5f7fb] font-poppins">
            <SuperAdminNavbar heading="Admin Management" />

            <main className=" max-w-screen-2xl p-4 sm:p-6 md:p-8 ">
                {/* Header Actions */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Manage Institutes</h1>
                        <p className="text-sm font-medium text-slate-500">Create and manage admin accounts for schools and academies</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center gap-2 rounded-2xl bg-[#080f4f] px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-900/15 transition hover:bg-indigo-800 active:scale-95"
                    >
                        <IoAddOutline size={20} /> Create New Admin
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className="relative lg:col-span-2">
                        <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, institute or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
                        />
                    </div>
                    <div className="relative">
                        <IoFilterOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                            <option value="pending">Pending</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>
                </div>

                {/* Admins Table */}
                <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm ring-1 ring-slate-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-slate-50/80">
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Institute & Admin</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Contact</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Package</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Last Login</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAdmins.length > 0 ? (
                                    filteredAdmins.map((admin) => {
                                        const status = getStatusBadge(admin.status);
                                        return (
                                            <tr key={admin.id} className="group transition hover:bg-indigo-50/30">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 font-black">
                                                            {admin.instituteName?.[0] || 'I'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-black text-slate-800">{admin.instituteName || 'No Institute'}</p>
                                                            <p className="text-xs font-semibold text-slate-400">{admin.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                            <IoMailOutline className="text-slate-400" /> {admin.email}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                            <IoCallOutline className="text-slate-400" /> {admin.phoneNumber || 'N/A'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 ring-1 ring-indigo-100">
                                                        {admin.package?.name || 'No Plan'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${status.bg}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                                                        <IoCalendarOutline className="text-slate-400" />
                                                        {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => handleOpenModal(admin)}
                                                            title="Edit" className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-amber-500 hover:text-white"
                                                        >
                                                            <IoCreateOutline size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(admin.id)}
                                                            title="Delete" className="rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-rose-500 hover:text-white"
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
                                                <h3 className="mt-4 text-lg font-black text-slate-800">No Admins Found</h3>
                                                <p className="text-sm text-slate-400">We couldn't find any admins matching your criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
                        >
                            <div className="flex items-center justify-between border-b border-slate-50 px-8 py-6">
                                <h3 className="text-xl font-black text-slate-900">{editingAdmin ? 'Edit Institute' : 'Register New Institute'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="rounded-xl bg-slate-50 p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500">
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Institute Name</label>
                                        <div className="relative">
                                            <IoBusinessOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                name="instituteName"
                                                defaultValue={editingAdmin?.instituteName}
                                                placeholder="e.g. Blue Bell Academy"
                                                className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Admin Full Name</label>
                                        <div className="relative">
                                            <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                name="name"
                                                defaultValue={editingAdmin?.name}
                                                placeholder="e.g. John Doe"
                                                className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            name="email"
                                            defaultValue={editingAdmin?.email}
                                            placeholder="admin@institute.com"
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone Number</label>
                                        <input
                                            required
                                            name="phoneNumber"
                                            defaultValue={editingAdmin?.phoneNumber}
                                            placeholder="+92 300 1234567"
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        />
                                    </div>
                                    {!editingAdmin && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Password</label>
                                            <div className="relative">
                                                <IoKeyOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    required
                                                    type="password"
                                                    name="password"
                                                    placeholder="Minimum 8 characters"
                                                    className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subscription Plan</label>
                                        <select
                                            required
                                            name="packageId"
                                            defaultValue={editingAdmin?.packageId}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        >
                                            <option value="">Select a package</option>
                                            {packages.map(pkg => (
                                                <option key={pkg.id} value={pkg.id}>{pkg.name} - Rs.{pkg.monthlyPrice}/mo</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Account Status</label>
                                        <select
                                            name="status"
                                            defaultValue={editingAdmin?.status || 'active'}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        >
                                            <option value="active">Active</option>
                                            <option value="pending">Pending</option>
                                            <option value="blocked">Blocked</option>
                                            <option value="expired">Expired</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Expiry Date</label>
                                        <input
                                            type="date"
                                            name="expiryDate"
                                            defaultValue={editingAdmin?.subscriptionExpiresAt ? new Date(editingAdmin.subscriptionExpiresAt).toISOString().split('T')[0] : ''}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 rounded-2xl bg-slate-100 py-4 text-sm font-black text-slate-600 transition hover:bg-slate-200 active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 rounded-2xl bg-[#080f4f] py-4 text-sm font-black text-white shadow-xl shadow-indigo-900/20 transition hover:bg-indigo-800 active:scale-95 disabled:opacity-70"
                                    >
                                        {processing ? 'Processing...' : editingAdmin ? 'Update Institute' : 'Register Institute'}
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

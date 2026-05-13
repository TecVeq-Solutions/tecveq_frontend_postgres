import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';
import SuperAdminNavbar from '../../components/SuperAdmin/SuperAdminNavbar';
import Loader from '../../utils/Loader';
import {
    IoSearchOutline,
    IoShieldOutline,
    IoLockOpenOutline,
    IoAlertCircleOutline,
    IoBusinessOutline,
    IoCalendarOutline,
    IoCheckmarkCircleOutline,
    IoMailOutline,
    IoPersonOutline,
    IoWarningOutline
} from 'react-icons/io5';
import { toast } from 'react-toastify';

const BlockedAccounts = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: admins = [], isLoading, refetch } = useQuery({
        queryKey: ['superadmin-blocked-admins'],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const res = await axios.get(`${BACKEND_URL}/superadmin/admins`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            return res.data.filter(a => a.status === 'blocked');
        }
    });

    const handleUnblock = async (adminId) => {
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            await axios.put(`${BACKEND_URL}/superadmin/admins/${adminId}`, { status: 'active' }, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            toast.success("Account unblocked successfully");
            refetch();
        } catch (error) {
            toast.error("Failed to unblock account");
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f5f7fb]">
                <Loader />
            </div>
        );
    }

    const filteredAdmins = admins.filter(admin =>
        admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.instituteName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f5f7fb] font-poppins">
            <SuperAdminNavbar heading="Security & Access" />

            <main className="max-w-screen-2xl p-3 sm:p-6 md:p-8">
                {/* Header */}
                {/* <div className="mb-7 overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#080f4f] via-[#111a68] to-[#171f78] p-6 shadow-xl shadow-indigo-950/10 sm:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/15">
                                <IoShieldOutline size={28} />
                            </div>

                            <div>
                                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-rose-100 ring-1 ring-rose-300/20">
                                    <IoWarningOutline />
                                    Access Control
                                </div>

                                <h1 className="text-2xl font-black text-white sm:text-3xl">
                                    Blocked Accounts
                                </h1>

                                <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-300">
                                    Manage restricted administrators and restore institute access when required.
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white/10 px-5 py-4 text-white ring-1 ring-white/15">
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">
                                Total Blocked
                            </p>
                            <p className="mt-1 text-3xl font-black">{admins.length}</p>
                        </div>
                    </div>
                </div> */}

                {/* Search */}
                <div className="mb-6 flex flex-col gap-4 rounded-[1.7rem] bg-white border-blue p-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-black text-slate-900">
                            Restricted Institutes
                        </h2>
                        <p className="text-xs font-semibold text-slate-400">
                            Search and restore blocked admin accounts.
                        </p>
                    </div>

                    <div className="relative w-full sm:max-w-md">
                        <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by institute or admin name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-2xl border border-slate-100 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-50"
                        />
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredAdmins.length > 0 ? (
                        filteredAdmins.map((admin) => (
                            <div
                                key={admin.id}
                                className="group relative overflow-hidden rounded-[2rem] bg-white px-3 py-5 sm:p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-rose-950/10"
                            >
                                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-500 via-orange-400 to-amber-300" />
                                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-rose-50 blur-3xl transition group-hover:bg-orange-50" />

                                <div className="relative z-10">
                                    <div className="mb-6 flex items-center gap-4">
                                        <div className="flex h-15 w-15 h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
                                            <IoBusinessOutline size={26} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-lg font-black text-slate-900">
                                                {admin.instituteName}
                                            </h3>
                                            <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-bold uppercase tracking-wide text-slate-400">
                                                <IoPersonOutline />
                                                {admin.name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mb-6 rounded-[1.5rem] bg-slate-50 p-4">
                                        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold">
                                            <span className="text-slate-400">Status</span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-700">
                                                <IoAlertCircleOutline />
                                                Restricted
                                            </span>
                                        </div>

                                        <div className="mb-3 flex items-center justify-between gap-3 text-xs font-semibold">
                                            <span className="text-slate-400">Email</span>
                                            <span className="flex max-w-[170px] items-center gap-1 truncate text-right text-slate-800">
                                                <IoMailOutline className="shrink-0 text-slate-400" />
                                                {admin.email}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                                            <span className="text-slate-400">Last Login</span>
                                            <span className="flex items-center gap-1 text-slate-800">
                                                <IoCalendarOutline className="text-slate-400" />
                                                {admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString() : 'Never'}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleUnblock(admin.id)}
                                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-3.5 text-sm font-black text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-emerald-600 hover:text-white active:scale-95"
                                    >
                                        <IoLockOpenOutline size={18} />
                                        Restore Access
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full rounded-[2rem] border-2 border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
                            <div className="flex flex-col items-center px-4">
                                <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-emerald-50 text-emerald-500">
                                    <IoCheckmarkCircleOutline size={42} />
                                </div>

                                <h3 className="mt-5 text-xl font-black text-slate-900">
                                    No Blocked Accounts
                                </h3>

                                <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                                    All registered organizations currently have full platform access.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BlockedAccounts;
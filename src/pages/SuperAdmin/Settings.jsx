import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';
import SuperAdminNavbar from '../../components/SuperAdmin/SuperAdminNavbar';
import Loader from '../../utils/Loader';
import { IoGlobeOutline, IoShieldCheckmarkOutline, IoSaveOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';

const Settings = () => {
    const [processing, setProcessing] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [autoBlockUnpaidAdmins, setAutoBlockUnpaidAdmins] = useState(false);

    const { data: settings, isLoading, refetch } = useQuery({
        queryKey: ['superadmin-settings'],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const res = await axios.get(`${BACKEND_URL}/superadmin/settings`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            return res.data;
        }
    });

    React.useEffect(() => {
        if (settings) {
            setMaintenanceMode(settings.maintenanceMode);
            setAutoBlockUnpaidAdmins(settings.autoBlockUnpaidAdmins);
        }
    }, [settings]);

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.maintenanceMode = maintenanceMode;
        data.autoBlockUnpaidAdmins = autoBlockUnpaidAdmins;

        setProcessing(true);
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            await axios.put(`${BACKEND_URL}/superadmin/settings`, data, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            toast.success("Settings updated successfully");
            refetch();
        } catch {
            toast.error("Failed to update settings");
        } finally {
            setProcessing(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 font-poppins">
            <SuperAdminNavbar heading="System Configuration" />

            <main className="mx-auto max-w-screen-xl px-3 sm:px-4 py-6 lg:px-8">
                {isLoading ? (
                    <div className="flex h-[70vh] items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <form onSubmit={handleUpdateSettings} className="space-y-4">

                        {/* ── Branding Card ── */}
                        <div className="rounded-3xl bg-white p-3 sm:p-7 shadow-sm ring-1 ring-slate-100">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <IoGlobeOutline size={22} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-slate-900">General branding</h3>
                                    <p className="text-xs text-slate-400">Configure public-facing platform details</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        Platform name
                                    </label>
                                    <input
                                        name="websiteName"
                                        defaultValue={settings?.websiteName}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        Support email
                                    </label>
                                    <input
                                        name="supportEmail"
                                        defaultValue={settings?.supportEmail}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── Security Card ── */}
                        <div className="rounded-3xl bg-white p-3 sm:p-7 shadow-sm ring-1 ring-slate-100">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <IoShieldCheckmarkOutline size={22} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-slate-900">Automated security</h3>
                                    <p className="text-xs text-slate-400">Enable automated workflows for accounts and billing</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Toggle row */}
                                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Auto-block unpaid admins</p>
                                        <p className="text-xs text-slate-400">Automatically restrict access for admins with overdue payments</p>
                                    </div>
                                    <label className="relative ml-4 inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            name="autoBlockUnpaidAdmins"
                                            checked={autoBlockUnpaidAdmins}
                                            onChange={(e) => setAutoBlockUnpaidAdmins(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${autoBlockUnpaidAdmins ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                            <div className={`absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${autoBlockUnpaidAdmins ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                    </label>
                                </div>

                                {/* Toggle row — maintenance */}
                                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-800">Maintenance mode</p>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                                                ⚠ Locks platform
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400">Restrict all access except super admin during updates</p>
                                    </div>
                                    <label className="relative ml-4 inline-flex cursor-pointer items-center">
                                        <input
                                            type="checkbox"
                                            name="maintenanceMode"
                                            checked={maintenanceMode}
                                            onChange={(e) => setMaintenanceMode(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div className={`h-6 w-11 rounded-full transition-colors duration-200 ease-in-out ${maintenanceMode ? 'bg-red-500' : 'bg-slate-200'}`}>
                                            <div className={`absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </div>
                                    </label>
                                </div>

                                {/* Reminder days */}
                                <div className="border-t border-slate-100 pt-4">
                                    <div className="max-w-[240px] space-y-1.5">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                            Reminder days before expiry
                                        </label>
                                        <input
                                            type="number"
                                            name="reminderDays"
                                            defaultValue={settings?.reminderDays}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Save Button ── */}
                        <div className="flex justify-end pt-1">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 rounded-xl bg-indigo-950 px-7 py-3 text-sm font-semibold text-white transition hover:bg-indigo-800 active:scale-95 disabled:opacity-60"
                            >
                                <IoSaveOutline size={18} />
                                {processing ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    </form>
                )}
            </main>
        </div>
    );
};

export default Settings;
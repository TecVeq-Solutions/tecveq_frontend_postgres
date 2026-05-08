import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';
import SuperAdminNavbar from '../../components/SuperAdmin/SuperAdminNavbar';
import Loader from '../../utils/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoSearchOutline,
    IoCashOutline,
    IoTimeOutline,
    IoCheckmarkCircleOutline,
    IoCloseCircleOutline,
    IoReceiptOutline,
    IoFilterOutline,
    IoDownloadOutline,
    IoAddOutline,
    IoCloseOutline,
    IoCalendarOutline,
    IoWalletOutline,
    IoEyeOutline,
    IoAlertCircleOutline
} from 'react-icons/io5';
import { toast } from 'react-toastify';

const Payments = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const { data: payments = [], isLoading, refetch } = useQuery({
        queryKey: ['superadmin-payments'],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const res = await axios.get(`${BACKEND_URL}/superadmin/payments`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            return res.data;
        }
    });

    const { data: admins = [] } = useQuery({
        queryKey: ['superadmin-admins-list-pay'],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const res = await axios.get(`${BACKEND_URL}/superadmin/admins`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            return res.data;
        }
    });

    const getStatusBadge = (status) => {
        const s = status || 'Unpaid';
        switch (s) {
            case 'Paid':
                return { label: 'Paid', bg: 'bg-emerald-50 text-emerald-700 ring-emerald-100', icon: <IoCheckmarkCircleOutline className="text-emerald-500" /> };
            case 'Pending Verification':
                return { label: 'Verification', bg: 'bg-amber-50 text-amber-700 ring-amber-100', icon: <IoAlertCircleOutline className="text-amber-500" /> };
            case 'Rejected':
                return { label: 'Rejected', bg: 'bg-rose-50 text-rose-700 ring-rose-100', icon: <IoCloseCircleOutline className="text-rose-500" /> };
            case 'Pending':
            case 'Unpaid':
                return { label: s, bg: 'bg-slate-50 text-slate-700 ring-slate-100', icon: <IoTimeOutline className="text-slate-500" /> };
            case 'Overdue':
                return { label: 'Overdue', bg: 'bg-rose-50 text-rose-700 ring-rose-100', icon: <IoCloseCircleOutline className="text-rose-500" /> };
            case 'Extension':
                return { label: 'Extension', bg: 'bg-blue-50 text-blue-700 ring-blue-100', icon: <IoCalendarOutline className="text-blue-500" /> };
            default:
                return { label: s, bg: 'bg-slate-50 text-slate-700 ring-slate-100', icon: <IoTimeOutline className="text-slate-500" /> };
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        const selectedAdmin = admins.find(a => a.id === data.adminId);
        data.packageId = selectedAdmin?.packageId;
        data.status = data.status === 'paid' ? 'Paid' : 'Unpaid';

        setProcessing(true);
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            await axios.post(`${BACKEND_URL}/superadmin/payments`, data, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            toast.success("Payment recorded successfully");
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            toast.error("Failed to record payment");
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateStatus = async (id, status, reason = '') => {
        setProcessing(true);
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            await axios.put(`${BACKEND_URL}/superadmin/payments/${id}/status`, {
                status,
                rejectionReason: reason
            }, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            toast.success(`Payment marked as ${status}`);
            setIsVerifyModalOpen(false);
            refetch();
        } catch (error) {
            toast.error("Update failed");
        } finally {
            setProcessing(false);
        }
    };

    const filteredPayments = payments.filter(payment => {
        const adminName = payment.admin?.name || '';
        const instituteName = payment.admin?.instituteName || '';
        const matchesSearch = adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            instituteName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader /></div>;

    return (
        <div className="min-h-screen bg-[#f5f7fb] font-poppins">
            <SuperAdminNavbar heading="Payment Management" />

            <main className="max-w-screen-2xl p-4 sm:p-6 md:p-8 ">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Platform Revenue</h1>
                        <p className="text-sm font-medium text-slate-500">Track monthly subscription payments from all institutes</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-95">
                            <IoDownloadOutline size={20} /> Export Report
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-2xl bg-[#080f4f] px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-900/15 transition hover:bg-indigo-800 active:scale-95"
                        >
                            <IoAddOutline size={20} /> Record Payment
                        </button>
                    </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
                    <div className="relative lg:col-span-2">
                        <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by institute name..."
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
                            <option value="Paid">Paid</option>
                            <option value="Pending Verification">Pending Verification</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Unpaid">Unpaid/Pending</option>
                            <option value="Overdue">Overdue</option>
                            <option value="Extension">Extension</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm ring-1 ring-slate-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-slate-50/80">
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Institute</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Billing Period</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">Due Date</th>
                                    <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => {
                                        const status = getStatusBadge(payment.status);
                                        return (
                                            <tr key={payment.id} className="group transition hover:bg-indigo-50/30">
                                                <td className="px-6 py-4">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-black text-slate-800">{payment.admin?.instituteName || 'Unnamed'}</p>
                                                        <p className="text-xs font-semibold text-slate-400">{payment.admin?.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <IoCashOutline className="text-emerald-500" />
                                                        <span className="text-sm font-black text-slate-700">Rs.{payment.amount}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold text-slate-500 uppercase">
                                                        {new Date(0, payment.month - 1).toLocaleString('default', { month: 'short' })} {payment.year}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${status.bg}`}>
                                                        {status.icon}
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-semibold text-slate-500">
                                                        {new Date(payment.dueDate).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {payment.status === 'Pending Verification' ? (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedPayment(payment);
                                                                    setIsVerifyModalOpen(true);
                                                                }}
                                                                className="rounded-xl bg-amber-50 p-2 text-amber-600 transition hover:bg-amber-600 hover:text-white ring-1 ring-amber-100"
                                                            >
                                                                <IoEyeOutline size={18} />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                {payment.status !== 'Paid' && (
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(payment.id, 'Paid')}
                                                                        title="Mark as Paid"
                                                                        className="rounded-xl bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-600 hover:text-white ring-1 ring-emerald-100"
                                                                    >
                                                                        <IoCheckmarkCircleOutline size={18} />
                                                                    </button>
                                                                )}
                                                                <button className="rounded-xl bg-indigo-50 p-2 text-indigo-700 ring-1 ring-indigo-100 transition hover:bg-indigo-600 hover:text-white">
                                                                    <IoReceiptOutline size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-20 text-center">
                                            <p className="text-sm font-bold text-slate-400">No payment records found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Verification Modal */}
            <AnimatePresence>
                {isVerifyModalOpen && selectedPayment && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-4 pt-16 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between border-b border-slate-50 px-8 py-6 shrink-0">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Verify Payment Proof</h3>
                                    <p className="text-xs font-bold text-slate-400">Review receipt from {selectedPayment.admin?.instituteName}</p>
                                </div>
                                <button onClick={() => setIsVerifyModalOpen(false)} className="rounded-xl bg-slate-50 p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500">
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                                        <p className="text-sm font-black text-slate-800">Rs. {selectedPayment.amount}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Method</p>
                                        <p className="text-sm font-black text-slate-800">{selectedPayment.method}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction ID</p>
                                        <p className="text-sm font-black text-slate-800">{selectedPayment.transactionId}</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Month</p>
                                        <p className="text-sm font-black text-slate-800">{new Date(0, selectedPayment.month - 1).toLocaleString('default', { month: 'long' })} {selectedPayment.year}</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Receipt Screenshot</p>
                                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100">
                                        <img
                                            src={selectedPayment.receiptImage}
                                            alt="Payment Receipt"
                                            className="w-full h-auto max-h-96 object-contain"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Rejection Reason (Optional)</label>
                                    <textarea
                                        placeholder="Enter reason if rejecting..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full bg-slate-50 rounded-2xl py-3 px-6 text-sm font-semibold outline-none border border-transparent focus:border-rose-300 focus:bg-white transition h-20"
                                    />
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-50 flex gap-4 bg-slate-50/50 shrink-0">
                                <button
                                    onClick={() => handleUpdateStatus(selectedPayment.id, 'Rejected', rejectionReason)}
                                    disabled={processing}
                                    className="flex-1 rounded-2xl bg-white border border-rose-200 py-4 text-sm font-black text-rose-600 transition hover:bg-rose-50"
                                >
                                    Reject Payment
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(selectedPayment.id, 'Paid')}
                                    disabled={processing}
                                    className="flex-[2] rounded-2xl bg-[#080f4f] py-4 text-sm font-black text-white shadow-xl shadow-indigo-900/20 transition hover:bg-indigo-800"
                                >
                                    {processing ? 'Processing...' : 'Approve & Activate Admin'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Record Payment Modal (Existing) */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between border-b border-slate-50 px-8 py-6 shrink-0">
                                <h3 className="text-xl font-black text-slate-900">Record Institute Payment</h3>
                                <button onClick={() => setIsModalOpen(false)} className="rounded-xl bg-slate-50 p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500">
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleRecordPayment} className="p-8 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Select Institute</label>
                                        <select
                                            required
                                            name="adminId"
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        >
                                            <option value="">Select an admin...</option>
                                            {admins.map(admin => (
                                                <option key={admin.id} value={admin.id}>{admin.instituteName} ({admin.name})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Amount (Rs.)</label>
                                        <div className="relative">
                                            <IoWalletOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                type="number"
                                                name="amount"
                                                placeholder="5000"
                                                className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Due Date</label>
                                        <input
                                            required
                                            type="date"
                                            name="dueDate"
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Month</label>
                                        <select
                                            required
                                            name="month"
                                            defaultValue={new Date().getMonth() + 1}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Year</label>
                                        <input
                                            required
                                            type="number"
                                            name="year"
                                            defaultValue={new Date().getFullYear()}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        />
                                    </div>
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Status</label>
                                        <select
                                            name="status"
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        >
                                            <option value="paid">Mark as Paid Immediately</option>
                                            <option value="pending">Mark as Pending/Unpaid</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 rounded-2xl bg-slate-100 py-4 text-sm font-black text-slate-600 transition hover:bg-slate-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="flex-1 rounded-2xl bg-[#080f4f] py-4 text-sm font-black text-white shadow-xl shadow-indigo-900/20 transition hover:bg-indigo-800"
                                    >
                                        {processing ? 'Processing...' : 'Record Payment'}
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

export default Payments;

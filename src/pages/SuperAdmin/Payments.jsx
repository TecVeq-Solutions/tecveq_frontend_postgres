import React, { useEffect, useMemo, useState } from 'react';
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
    IoAlertCircleOutline,
    IoTrashOutline,
    IoCreateOutline,
    IoChevronBackOutline,
    IoChevronForwardOutline,
    IoChevronDownOutline
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
    const [editingPayment, setEditingPayment] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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
            case 'Partial':
                return { label: 'Partial', bg: 'bg-indigo-50 text-indigo-700 ring-indigo-100', icon: <IoTimeOutline className="text-indigo-500" /> };
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
            if (editingPayment) {
                await axios.put(`${BACKEND_URL}/superadmin/payments/${editingPayment.id}`, data, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                toast.success("Payment updated successfully");
            } else {
                await axios.post(`${BACKEND_URL}/superadmin/payments`, data, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                toast.success("Payment recorded successfully");
            }
            setIsModalOpen(false);
            setEditingPayment(null);
            refetch();
        } catch (error) {
            toast.error(editingPayment ? "Failed to update payment" : "Failed to record payment");
        } finally {
            setProcessing(false);
        }
    };

    const handleDeletePayment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this payment record?")) return;
        setProcessing(true);
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            await axios.delete(`${BACKEND_URL}/superadmin/payments/${id}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            toast.success("Payment deleted successfully");
            refetch();
        } catch (error) {
            toast.error("Failed to delete payment");
        } finally {
            setProcessing(false);
        }
    };

    const handleOpenEditModal = (payment) => {
        setEditingPayment(payment);
        setIsModalOpen(true);
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

    const filteredPayments = useMemo(() => {
        return payments.filter(payment => {
            const adminName = payment.admin?.name || '';
            const instituteName = payment.admin?.instituteName || '';
            const matchesSearch =
                adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                instituteName.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;

            return matchesSearch && matchesStatus;
        });
    }, [payments, searchTerm, filterStatus]);

    // Pagination logic
    const totalItems = filteredPayments.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

    const paginatedPayments = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        return filteredPayments.slice(startIndex, endIndex);
    }, [filteredPayments, currentPage, rowsPerPage]);

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

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="min-h-screen bg-[#f5f7fb] font-poppins">
            <SuperAdminNavbar heading="Payment Management" />

            <main className="max-w-screen-2xl p-3 sm:p-6 md:p-8">
                {isLoading ? (
                    <div className="flex h-[70vh] items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-2xl font-black text-slate-900">Platform Revenue</h1>
                                <p className="text-sm font-medium text-slate-500">
                                    Track monthly subscription payments from all institutes
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button className="flex items-center justify-center gap-1 sm:gap-2 rounded-2xl bg-white px-3 sm:px-6 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 active:scale-95">
                                    <IoDownloadOutline size={20} /> Export Report
                                </button>

                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="flex items-center justify-center gap-1 sm:gap-2 rounded-2xl bg-[#080f4f] px-3 sm:px-6 py-3 text-sm font-black text-white shadow-lg shadow-indigo-900/15 transition hover:bg-indigo-800 active:scale-95"
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
                                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Partial">Partial Payment</option>
                                    <option value="Pending Verification">Pending Verification</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Unpaid">Unpaid/Pending</option>
                                    <option value="Overdue">Overdue</option>
                                    <option value="Extension">Extension</option>
                                </select>

                                <IoChevronDownOutline
                                    className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400"
                                    size={16}
                                />
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-3xl border border-white bg-white shadow-sm ring-1 ring-slate-100">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="bg-slate-50/80">
                                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Institute
                                            </th>
                                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Amount
                                            </th>
                                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Billing Period
                                            </th>
                                            <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Status
                                            </th>
                                            <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Due Date
                                            </th>
                                            <th className="px-6 py-4 text-center text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedPayments.length > 0 ? (
                                            paginatedPayments.map((payment) => {
                                                const status = getStatusBadge(payment.status);

                                                return (
                                                    <tr key={payment.id} className="group transition hover:bg-indigo-50/30">
                                                        <td className="px-6 py-4">
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-black text-slate-800">
                                                                    {payment.admin?.instituteName || 'Unnamed'}
                                                                </p>
                                                                <p className="text-xs font-semibold text-slate-400">
                                                                    {payment.admin?.name}
                                                                </p>
                                                            </div>
                                                        </td>

                                                        <td className="px-6 py-4">
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-2">
                                                                    <IoCashOutline className="text-emerald-500" />
                                                                    <span className="text-sm font-black text-slate-700">
                                                                        Rs.{payment.amount}
                                                                    </span>
                                                                </div>

                                                                {payment.balance > 0 && (
                                                                    <span className="text-[10px] font-black text-rose-500 mt-1 uppercase tracking-tighter">
                                                                        Remaining: Rs.{payment.balance}
                                                                    </span>
                                                                )}
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

                                                                        <button
                                                                            onClick={() => handleOpenEditModal(payment)}
                                                                            title="Edit Payment"
                                                                            className="rounded-xl bg-amber-50 p-2 text-amber-600 ring-1 ring-amber-100 transition hover:bg-amber-600 hover:text-white"
                                                                        >
                                                                            <IoCreateOutline size={18} />
                                                                        </button>

                                                                        <button
                                                                            onClick={() => handleDeletePayment(payment.id)}
                                                                            title="Delete Payment"
                                                                            className="rounded-xl bg-rose-50 p-2 text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-600 hover:text-white"
                                                                        >
                                                                            <IoTrashOutline size={18} />
                                                                        </button>

                                                                        <button className="hidden rounded-xl bg-indigo-50 p-2 text-indigo-700 ring-1 ring-indigo-100 transition hover:bg-indigo-600 hover:text-white">
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
                                                    <p className="text-sm font-bold text-slate-400">
                                                        No payment records found.
                                                    </p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination + Selector */}
                            {totalItems > 0 && (
                                <div className="flex  lg:flex-row items-center justify-between gap-2 sm:gap-4 px-2 sm:px-5 sm:px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-white via-indigo-50/50 to-slate-50">
                                    {/* Rows selector */}
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
                                                className="appearance-none rounded-2xl border border-indigo-100 bg-white py-3 pl-3 sm:pl-4   pr-7 sm:pr-10 text-xs sm:text-sm font-black text-[#080f4f] shadow-sm outline-none transition hover:border-indigo-300 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
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

                                    {/* Showing info */}
                                    <p className="hidden sm:block text-xs sm:text-sm font-bold text-slate-500 text-center">
                                        Showing{" "}
                                        <span className="font-black text-[#080f4f]">{startItem}</span>
                                        {" - "}
                                        <span className="font-black text-[#080f4f]">{endItem}</span>
                                        {" of "}
                                        <span className="font-black text-[#080f4f]">{totalItems}</span>
                                        {" "}Payments
                                    </p>

                                    {/* Pagination buttons */}
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
                    </>
                )}
            </main>

            {/* Verification Modal */}
            <AnimatePresence>
                {isVerifyModalOpen && selectedPayment && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 px-4 pt-16 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between border-b border-slate-50  px-4 sm:px-8 py-6 shrink-0">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Verify Payment Proof</h3>
                                    <p className="text-xs font-bold text-slate-400">
                                        Review receipt from {selectedPayment.admin?.instituteName}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setIsVerifyModalOpen(false)}
                                    className="rounded-xl bg-slate-50 p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                                >
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>

                            <div className="p-3 sm:p-8 overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                                        <p className="text-sm font-black text-slate-800">Rs. {selectedPayment.amount}</p>
                                    </div>

                                    <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Method</p>
                                        <p className="text-sm font-black text-slate-800">{selectedPayment.method}</p>
                                    </div>

                                    <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction ID</p>
                                        <p className="text-sm font-black text-slate-800">{selectedPayment.transactionId}</p>
                                    </div>

                                    <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Billing Month</p>
                                        <p className="text-sm font-black text-slate-800">
                                            {new Date(0, selectedPayment.month - 1).toLocaleString('default', { month: 'long' })} {selectedPayment.year}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                                        Receipt Screenshot
                                    </p>

                                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100">
                                        <img
                                            src={selectedPayment.receiptImage}
                                            alt="Payment Receipt"
                                            className="w-full h-auto max-h-96 object-contain"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                        Rejection Reason (Optional)
                                    </label>

                                    <textarea
                                        placeholder="Enter reason if rejecting..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full bg-slate-50 rounded-2xl py-3 px-3 sm:px-6 text-sm font-semibold outline-none border border-transparent focus:border-rose-300 focus:bg-white transition h-20"
                                    />
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-50 flex gap-4 bg-slate-50/50 shrink-0">
                                <button
                                    onClick={() => handleUpdateStatus(selectedPayment.id, 'Rejected', rejectionReason)}
                                    disabled={processing}
                                    className="flex-1 rounded-2xl bg-white border border-rose-200 px-1 py-4 text-sm font-black text-rose-600 transition hover:bg-rose-50"
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

            {/* Record Payment Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="w-full max-w-xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between border-b border-slate-50 px-4 sm:px-8 py-6 shrink-0">
                                <h3 className="text-xl font-black text-slate-900">
                                    {editingPayment ? 'Edit Institute Payment' : 'Record Institute Payment'}
                                </h3>

                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingPayment(null);
                                    }}
                                    className="rounded-xl bg-slate-50 p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                                >
                                    <IoCloseOutline size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleRecordPayment} className="p-4  sm:p-8 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Select Institute
                                        </label>

                                        <select
                                            required
                                            name="adminId"
                                            defaultValue={editingPayment?.adminId}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        >
                                            <option value="">Select an admin...</option>
                                            {admins.map(admin => (
                                                <option key={admin.id} value={admin.id}>
                                                    {admin.instituteName} ({admin.name})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Paid Amount (Rs.)
                                        </label>

                                        <div className="relative">
                                            <IoWalletOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                type="number"
                                                name="amount"
                                                defaultValue={editingPayment?.amount}
                                                placeholder="5000"
                                                className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Total Payable (Rs.)
                                        </label>

                                        <div className="relative">
                                            <IoCashOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                required
                                                type="number"
                                                name="payableAmount"
                                                defaultValue={editingPayment?.payableAmount || editingPayment?.amount}
                                                placeholder="10000"
                                                className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Due Date
                                        </label>

                                        <input
                                            required
                                            type="date"
                                            name="dueDate"
                                            defaultValue={editingPayment?.dueDate ? new Date(editingPayment.dueDate).toISOString().split('T')[0] : ''}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Month
                                        </label>

                                        <select
                                            required
                                            name="month"
                                            defaultValue={editingPayment?.month || new Date().getMonth() + 1}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        >
                                            {Array.from({ length: 12 }, (_, i) => (
                                                <option key={i + 1} value={i + 1}>
                                                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Year
                                        </label>

                                        <input
                                            required
                                            type="number"
                                            name="year"
                                            defaultValue={editingPayment?.year || new Date().getFullYear()}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Status
                                        </label>

                                        <select
                                            name="status"
                                            defaultValue={editingPayment?.status?.toLowerCase() || 'pending'}
                                            className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition"
                                        >
                                            <option value="paid">Mark as Paid (Full)</option>
                                            <option value="partial">Mark as Partial Payment</option>
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
                                        {processing ? 'Processing...' : editingPayment ? 'Update Payment' : 'Record Payment'}
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
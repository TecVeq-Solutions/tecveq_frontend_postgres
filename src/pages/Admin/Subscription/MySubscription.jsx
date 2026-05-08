import React, { useState } from 'react';
import { useAdmin } from '../../../context/AdminContext';
import Navbar from '../../../components/Admin/Navbar';
import Loader from '../../../utils/Loader';
import {
    IoCardOutline,
    IoCalendarOutline,
    IoShieldCheckmarkOutline,
    IoPeopleOutline,
    IoSchoolOutline,
    IoLayersOutline,
    IoRocketOutline,
    IoChatbubbleEllipsesOutline,
    IoCheckmarkCircleOutline,
    IoInformationCircleOutline,
    IoCloudUploadOutline,
    IoTimeOutline,
    IoCheckmarkDoneOutline,
    IoCloseCircleOutline,
    IoCashOutline,
    IoReceiptOutline,
    IoSparklesOutline,
    IoTrendingUpOutline
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { submitPaymentProof } from '../../../api/Admin/PaymentsApi';
import moment from 'moment';

const MySubscription = () => {
    const {
        subscriptionData,
        subscriptionIsPending,
        subscriptionError,
        adminUsersData,
        allClassrooms,
        systemSettings,
        paymentHistory,
        paymentHistoryRefetch,
        subscriptionRefetch
    } = useAdmin();
    const navigate = useNavigate();

    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        amount: '',
        method: 'Bank Transfer',
        transactionId: '',
        date: moment().format('YYYY-MM-DD'),
        notes: '',
        receiptImage: ''
    });

    if (subscriptionIsPending) return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader />
                <p className="text-slate-400 text-sm font-semibold tracking-wide animate-pulse">Loading your subscription…</p>
            </div>
        </div>
    );

    if (subscriptionError) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-slate-50 p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mb-6">
                    <IoCloseCircleOutline size={40} className="text-rose-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Unable to load subscription</h2>
                <p className="text-slate-400 mt-2 mb-8 max-w-sm text-sm leading-relaxed">
                    There was an error connecting to the server. Please check your connection or try again.
                </p>
                <button
                    onClick={() => subscriptionRefetch()}
                    className="px-8 py-3 bg-[#0B1053] text-white rounded-xl font-semibold text-sm tracking-wide shadow-lg hover:bg-slate-800 active:scale-95 transition-all"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const { subscription, isExpired } = subscriptionData || {};
    const stats = {
        students: adminUsersData.allStudents.length,
        teachers: adminUsersData.allTeachers.length,
        classrooms: allClassrooms?.length || 0
    };

    const formatDate = (date) => {
        if (!date) return 'Not Available';
        const d = new Date(date);
        return isNaN(d.getTime()) ? 'Not Available' : d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
            setFormData(prev => ({ ...prev, receiptImage: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmitProof = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.transactionId || !formData.receiptImage) {
            toast.error("Please fill all required fields and upload receipt");
            return;
        }
        try {
            setUploading(true);
            const paymentDate = moment(formData.date);
            await submitPaymentProof({
                ...formData,
                month: paymentDate.month() + 1,
                year: paymentDate.year(),
                packageId: subscription?.packageId || ""
            });
            toast.success("Payment proof submitted and pending verification.");
            setPreview(null);
            setFormData({
                amount: '',
                method: 'Bank Transfer',
                transactionId: '',
                date: moment().format('YYYY-MM-DD'),
                notes: '',
                receiptImage: ''
            });
            paymentHistoryRefetch();
            subscriptionRefetch();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit payment proof");
        } finally {
            setUploading(false);
        }
    };

    const getStatusBadge = (status) => {
        const config = {
            'Paid': { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
            'Pending Verification': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-400' },
            'Rejected': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
            'Unpaid': { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
            'Overdue': { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
            'Extension': { bg: 'bg-sky-50', text: 'text-sky-700', dot: 'bg-sky-400' },
        };
        const c = config[status] || config['Unpaid'];
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                {status}
            </span>
        );
    };

    const UsageCard = ({ label, current, limit, icon: Icon, color }) => {
        const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
        const isNearLimit = percentage >= 80;
        return (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between mb-5">
                    <div className={`h-11 w-11 rounded-xl ${color.iconBg} flex items-center justify-center`}>
                        <Icon size={22} className={color.iconText} />
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-slate-800 leading-none">{current}</p>
                        <p className="text-xs text-slate-400 mt-1">
                            of <span className="font-semibold text-slate-500">{limit === 0 ? '∞' : limit}</span> {label}
                        </p>
                    </div>
                </div>
                <div className="space-y-2">
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${isNearLimit ? 'bg-rose-400' : color.bar}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-slate-400 font-medium">{label}</p>
                        <p className={`text-xs font-semibold ${isNearLimit ? 'text-rose-500' : 'text-slate-400'}`}>
                            {percentage.toFixed(0)}%
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const InputField = ({ label, children, required }) => (
        <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 ml-1">
                {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
            </label>
            {children}
        </div>
    );

    return (
        <div className="flex flex-col flex-1 px-3 sm:px-5 ml-0 lg:ml-80 min-h-full min-w-0 bg-slate-50/70 font-poppins">
            <div className="flex min-h-20 md:px-14 lg:pt-3 lg:px-0">
                <Navbar heading={"My Subscription"} />
            </div>

            <main className="mt-6 pb-12 space-y-6">

                {/* ── Hero Header ── */}
                <div className="relative bg-[#0B1053] rounded-3xl overflow-hidden shadow-xl shadow-indigo-900/20">
                    {/* subtle grid pattern */}
                    <div className="absolute inset-0 opacity-10"
                        style={{
                            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
                            backgroundSize: '28px 28px'
                        }}
                    />
                    <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2.5">
                                <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${isExpired ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                                    ● {isExpired ? 'Expired' : (subscription?.status || 'Active')}
                                </span>
                                <span className="text-indigo-300/60 text-xs">Monthly Plan</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                                {subscription?.packageName || 'Professional Plan'}
                            </h1>
                            <p className="text-indigo-200/50 text-sm">
                                {subscription?.startDate
                                    ? `Active since ${formatDate(subscription.startDate)}`
                                    : 'Start date not available'
                                }
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                            <div className="bg-white/8 border border-white/10 rounded-2xl p-5 text-center min-w-[160px] backdrop-blur-sm">
                                <p className="text-indigo-200/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Monthly Fee</p>
                                <p className="text-white text-2xl font-bold">Rs. {subscription?.monthlyFee?.toLocaleString() || 0}</p>
                            </div>
                            <div className="bg-white/8 border border-white/10 rounded-2xl p-5 text-center min-w-[160px] backdrop-blur-sm">
                                <p className="text-indigo-200/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Next Renewal</p>
                                <p className="text-white text-sm font-semibold mt-1">{formatDate(subscription?.expiresAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Usage ── */}
                <section>
                    <div className="flex items-center gap-2 mb-4 px-1">
                        <IoRocketOutline className="text-indigo-500" size={18} />
                        <h2 className="text-base font-bold text-slate-700">Platform Usage</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <UsageCard label="Students" current={stats.students} limit={subscription?.studentLimit || 0} icon={IoPeopleOutline} color={{ iconBg: 'bg-sky-50', iconText: 'text-sky-500', bar: 'bg-sky-400' }} />
                        <UsageCard label="Teachers" current={stats.teachers} limit={subscription?.teacherLimit || 0} icon={IoSchoolOutline} color={{ iconBg: 'bg-violet-50', iconText: 'text-violet-500', bar: 'bg-violet-400' }} />
                        <UsageCard label="Classrooms" current={stats.classrooms} limit={subscription?.classLimit || 0} icon={IoLayersOutline} color={{ iconBg: 'bg-teal-50', iconText: 'text-teal-500', bar: 'bg-teal-400' }} />
                    </div>
                </section>

                {/* ── Middle Row ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Left: Plan Details + Payment Instructions */}
                    <div className="space-y-6">

                        {/* Plan Details */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 mb-5">Plan Details</h3>
                            <div className="space-y-3">
                                {[
                                    { icon: IoCalendarOutline, label: 'Renewal Date', value: formatDate(subscription?.expiresAt), accent: 'text-amber-500 bg-amber-50' },
                                    { icon: IoCardOutline, label: 'Payment Status', value: isExpired ? 'Overdue' : 'Paid', accent: isExpired ? 'text-rose-500 bg-rose-50' : 'text-emerald-500 bg-emerald-50' },
                                    { icon: IoShieldCheckmarkOutline, label: 'Security', value: 'Enterprise Grade', accent: 'text-indigo-500 bg-indigo-50' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded-lg ${item.accent} flex items-center justify-center`}>
                                                <item.icon size={16} />
                                            </div>
                                            <span className="text-sm text-slate-500 font-medium">{item.label}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-700">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Instructions */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-100">
                            <div className="flex items-center gap-2 mb-5">
                                <IoInformationCircleOutline className="text-indigo-500" size={18} />
                                <h3 className="text-sm font-bold text-slate-700">Payment Instructions</h3>
                            </div>
                            {systemSettings ? (
                                <div className="space-y-4">
                                    <p className="text-xs text-slate-500 bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100 leading-relaxed">
                                        Send your monthly fee to the account below and upload your payment screenshot for verification.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { label: 'Bank Name', value: systemSettings.bankName || 'Not Set' },
                                            { label: 'Account Title', value: systemSettings.accountTitle || 'Not Set' },
                                            { label: 'Account #', value: systemSettings.accountNumber || 'Not Set' },
                                            { label: 'IBAN', value: systemSettings.iban || 'Not Set' },
                                            { label: 'JazzCash', value: systemSettings.jazzCashNumber || systemSettings.jazzCash || 'Not Set' },
                                            { label: 'EasyPaisa', value: systemSettings.easyPaisaNumber || systemSettings.easyPaisa || 'Not Set' },
                                            { label: 'Support Phone', value: systemSettings.supportPhone || 'Not Set' },
                                            { label: 'Support Email', value: systemSettings.supportEmail || 'Not Set' },
                                        ].map((d, idx) => (
                                            <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{d.label}</p>
                                                <p className="text-sm font-semibold text-slate-700 break-words">{d.value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-slate-400 text-sm">Payment details not configured. Contact Super Admin.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Submit Payment Proof */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-100 h-fit">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-sm font-bold text-slate-700">Submit Payment</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Upload your monthly payment proof</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                <IoCashOutline size={20} className="text-indigo-500" />
                            </div>
                        </div>

                        <form onSubmit={handleSubmitProof} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Amount Paid" required>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-300 transition"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </InputField>
                                <InputField label="Method">
                                    <select
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                                        value={formData.method}
                                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                    >
                                        <option>Bank Transfer</option>
                                        <option>JazzCash</option>
                                        <option>EasyPaisa</option>
                                        <option>Cash</option>
                                        <option>Other</option>
                                    </select>
                                </InputField>
                            </div>

                            <InputField label="Transaction ID" required>
                                <input
                                    type="text"
                                    placeholder="e.g. TXN-12345678"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 placeholder:text-slate-300 transition"
                                    value={formData.transactionId}
                                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                                />
                            </InputField>

                            <InputField label="Payment Date">
                                <input
                                    type="date"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </InputField>

                            {/* Receipt Upload */}
                            <InputField label="Receipt Screenshot" required>
                                <label className="block cursor-pointer">
                                    <div className={`relative h-36 rounded-xl border-2 border-dashed transition-all overflow-hidden
                                        ${preview ? 'border-indigo-400 bg-indigo-50/30' : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/20'}`}
                                    >
                                        {preview ? (
                                            <div className="relative h-full w-full group">
                                                <img src={preview} alt="Receipt" className="h-full w-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-white text-xs font-semibold">Change Receipt</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                                <IoCloudUploadOutline size={28} />
                                                <p className="text-xs font-semibold">Click to upload</p>
                                                <p className="text-[11px] text-slate-300">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                    </div>
                                </label>
                            </InputField>

                            <button
                                type="submit"
                                disabled={uploading}
                                className={`w-full py-3.5 bg-[#0B1053] text-white rounded-xl font-semibold text-sm hover:bg-slate-800 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-900/10 ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {uploading
                                    ? <><Loader small /> Submitting…</>
                                    : <><IoCheckmarkDoneOutline size={18} /> Submit Payment Proof</>
                                }
                            </button>
                        </form>
                    </div>
                </div>

                {/* ── Payment History ── */}
                <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="flex items-center gap-2 p-6 border-b border-slate-100">
                        <IoReceiptOutline className="text-indigo-500" size={18} />
                        <h2 className="text-base font-bold text-slate-700">Payment History</h2>
                        {paymentHistory?.length > 0 && (
                            <span className="ml-auto text-xs text-slate-400 font-medium">{paymentHistory.length} records</span>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    {['Billing Period', 'Amount', 'Method', 'Transaction ID', 'Status', 'Submitted', 'Receipt'].map(h => (
                                        <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paymentHistory && paymentHistory.length > 0 ? paymentHistory.map((payment, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-400 flex items-center justify-center shrink-0">
                                                    <IoTimeOutline size={15} />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                                                    {moment().month(payment.month - 1).format('MMM')} {payment.year}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm font-bold text-slate-700">Rs. {payment.amount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="text-sm text-slate-500">{payment.method}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="font-mono text-[11px] text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">{payment.transactionId}</span>
                                        </td>
                                        <td className="px-5 py-4">{getStatusBadge(payment.status)}</td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs text-slate-400">{formatDate(payment.createdAt)}</span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {payment.receiptImage && (
                                                <a
                                                    href={payment.receiptImage}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-500 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors"
                                                >
                                                    <IoCardOutline size={14} /> View
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-300">
                                                <IoReceiptOutline size={40} />
                                                <p className="text-sm font-semibold text-slate-400">No payment history yet</p>
                                                <p className="text-xs text-slate-300">Submitted payments will appear here</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* ── Upgrade Banner ── */}
                <div className="relative bg-gradient-to-r from-slate-800 to-[#0B1053] rounded-3xl p-8 overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                    <div className="absolute right-24 bottom-0 w-32 h-32 bg-indigo-400/5 rounded-full translate-y-1/2 pointer-events-none" />

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                        <div className="max-w-lg">
                            <div className="flex items-center gap-2 mb-3">
                                <IoSparklesOutline className="text-indigo-300" size={16} />
                                <span className="text-indigo-300/70 text-xs font-semibold uppercase tracking-widest">Scale Up</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to grow your institute?</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-5">
                                Reached your limits or need custom features like advanced biometrics or multi-campus reporting? Our support team is ready to help.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['Priority Support', 'Custom Branding', 'Advanced Analytics'].map((feat, i) => (
                                    <div key={i} className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                                        <IoCheckmarkCircleOutline className="text-emerald-400" size={13} />
                                        <span className="text-[11px] font-semibold text-white/70">{feat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/admin/platform-support')}
                            className="shrink-0 flex items-center gap-2 px-6 py-3.5 bg-white text-[#0B1053] rounded-xl font-bold text-sm hover:bg-slate-100 active:scale-95 transition-all shadow-xl"
                        >
                            <IoChatbubbleEllipsesOutline size={18} />
                            Contact Support
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default MySubscription;
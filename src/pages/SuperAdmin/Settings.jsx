import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';
import SuperAdminNavbar from '../../components/SuperAdmin/SuperAdminNavbar';
import Loader from '../../utils/Loader';
import { 
    IoGlobeOutline, 
    IoShieldCheckmarkOutline, 
    IoSaveOutline, 
    IoCardOutline, 
    IoAddOutline, 
    IoTrashOutline, 
    IoPencilOutline, 
    IoWalletOutline,
    IoCheckmarkCircle,
    IoCloseCircleOutline,
    IoCopyOutline
} from 'react-icons/io5';
import { toast } from 'react-toastify';

const PRESET_METHODS = [
    { name: 'Allied Bank Limited (ABL)', type: 'bank', color: 'blue' },
    { name: 'Habib Bank Limited (HBL)', type: 'bank', color: 'emerald' },
    { name: 'Meezan Bank', type: 'bank', color: 'purple' },
    { name: 'JazzCash', type: 'wallet', color: 'rose' },
    { name: 'EasyPaisa', type: 'wallet', color: 'teal' },
    { name: 'NayaPay', type: 'wallet', color: 'amber' },
    { name: 'SadaPay', type: 'wallet', color: 'cyan' },
    { name: 'Bank Alfalah', type: 'bank', color: 'red' },
    { name: 'United Bank Limited (UBL)', type: 'bank', color: 'indigo' },
    { name: 'MCB Bank', type: 'bank', color: 'orange' },
];

const Settings = () => {
    const [processing, setProcessing] = useState(false);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [autoBlockUnpaidAdmins, setAutoBlockUnpaidAdmins] = useState(false);
    const [paymentAccounts, setPaymentAccounts] = useState([]);
    
    // Modal State
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [editingAccountIndex, setEditingAccountIndex] = useState(null);
    const [accountForm, setAccountForm] = useState({
        bankName: 'Allied Bank Limited (ABL)',
        type: 'bank',
        accountTitle: '',
        accountNumber: '',
        iban: '',
        branchCode: '',
        instructions: '',
        isActive: true
    });

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

    useEffect(() => {
        if (settings) {
            setMaintenanceMode(Boolean(settings.maintenanceMode));
            setAutoBlockUnpaidAdmins(Boolean(settings.autoBlockUnpaidAdmins));
            if (Array.isArray(settings.paymentAccounts)) {
                setPaymentAccounts(settings.paymentAccounts);
            } else if (settings.bankName) {
                // Fallback to legacy single-account fields if paymentAccounts is empty
                setPaymentAccounts([
                    {
                        id: 'legacy-1',
                        bankName: settings.bankName || 'Allied Bank Limited (ABL)',
                        type: 'bank',
                        accountTitle: settings.accountTitle || '',
                        accountNumber: settings.accountNumber || '',
                        iban: settings.iban || '',
                        branchCode: '',
                        instructions: settings.paymentInstructions || '',
                        isActive: true
                    }
                ]);
            }
        }
    }, [settings]);

    const handleOpenAddModal = () => {
        setEditingAccountIndex(null);
        setAccountForm({
            id: `acc-${Date.now()}`,
            bankName: 'Allied Bank Limited (ABL)',
            type: 'bank',
            accountTitle: '',
            accountNumber: '',
            iban: '',
            branchCode: '',
            instructions: 'Transfer via 1Link or Mobile App. Keep receipt screenshot.',
            isActive: true
        });
        setIsAccountModalOpen(true);
    };

    const handleOpenEditModal = (idx) => {
        setEditingAccountIndex(idx);
        setAccountForm({ ...paymentAccounts[idx] });
        setIsAccountModalOpen(true);
    };

    const handleSaveAccountModal = (e) => {
        e.preventDefault();
        if (!accountForm.bankName.trim() || !accountForm.accountTitle.trim() || !accountForm.accountNumber.trim()) {
            toast.error("Please fill Bank Name, Account Title, and Account Number");
            return;
        }

        if (editingAccountIndex !== null) {
            const updated = [...paymentAccounts];
            updated[editingAccountIndex] = accountForm;
            setPaymentAccounts(updated);
            toast.success("Account updated in list");
        } else {
            setPaymentAccounts([...paymentAccounts, { ...accountForm, id: accountForm.id || `acc-${Date.now()}` }]);
            toast.success("Account added to list");
        }
        setIsAccountModalOpen(false);
    };

    const handleDeleteAccount = (idx) => {
        const item = paymentAccounts[idx];
        if (window.confirm(`Delete ${item.bankName} account from active receiving methods?`)) {
            const updated = paymentAccounts.filter((_, i) => i !== idx);
            setPaymentAccounts(updated);
            toast.info(`${item.bankName} removed`);
        }
    };

    const handleToggleAccountActive = (idx) => {
        const updated = [...paymentAccounts];
        updated[idx] = { ...updated[idx], isActive: !updated[idx].isActive };
        setPaymentAccounts(updated);
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.maintenanceMode = maintenanceMode;
        data.autoBlockUnpaidAdmins = autoBlockUnpaidAdmins;
        data.paymentAccounts = paymentAccounts;

        setProcessing(true);
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            await axios.put(`${BACKEND_URL}/superadmin/settings`, data, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            toast.success("All settings & payment accounts saved successfully!");
            refetch();
        } catch {
            toast.error("Failed to update settings");
        } finally {
            setProcessing(false);
        }
    };

    const getBankBadgeStyle = (bankName = '', type = 'bank') => {
        const name = bankName.toLowerCase();
        if (name.includes('jazz')) return 'bg-rose-50 text-rose-700 border-rose-200';
        if (name.includes('easy')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (name.includes('naya')) return 'bg-amber-50 text-amber-700 border-amber-200';
        if (name.includes('sada')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
        if (name.includes('hbl') || name.includes('habib')) return 'bg-teal-50 text-teal-700 border-teal-200';
        if (name.includes('allied') || name.includes('abl')) return 'bg-blue-50 text-blue-700 border-blue-200';
        if (name.includes('meezan')) return 'bg-purple-50 text-purple-700 border-purple-200';
        return type === 'wallet' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200';
    };

    return (
        <div className="min-h-screen bg-slate-50 font-poppins pb-16">
            <SuperAdminNavbar heading="System Configuration" />

            <main className="mx-auto max-w-screen-xl px-3 sm:px-4 py-6 lg:px-8">
                {isLoading ? (
                    <div className="flex h-[70vh] items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <form onSubmit={handleUpdateSettings} className="space-y-6">

                        {/* ── 1. Payment Receiving Accounts (Banks & Wallets) ── */}
                        <div className="rounded-3xl bg-white p-4 sm:p-7 shadow-sm ring-1 ring-slate-100">
                            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm">
                                        <IoCardOutline size={26} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">
                                            Payment Receiving Accounts (Banks & Wallets)
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Add your JazzCash, Allied Bank, HBL, EasyPaisa, NayaPay or custom accounts for SaaS subscription fees
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleOpenAddModal}
                                    className="inline-flex items-center gap-2 self-start sm:self-auto rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                                >
                                    <IoAddOutline size={18} />
                                    Add Account / Bank
                                </button>
                            </div>

                            {/* Accounts Grid */}
                            {paymentAccounts.length === 0 ? (
                                <div className="text-center py-10 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                                    <IoWalletOutline size={40} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-sm font-semibold text-slate-600">No payment receiving accounts configured</p>
                                    <p className="text-xs text-slate-400 mt-1 mb-4">Add your bank or mobile wallet details so institute admins can pay</p>
                                    <button
                                        type="button"
                                        onClick={handleOpenAddModal}
                                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white"
                                    >
                                        <IoAddOutline size={16} /> Add First Bank Account
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {paymentAccounts.map((acc, idx) => (
                                        <div
                                            key={acc.id || idx}
                                            className={`relative rounded-2xl border p-4 transition-all ${
                                                acc.isActive 
                                                    ? 'border-slate-200 bg-white shadow-sm hover:shadow-md' 
                                                    : 'border-slate-200/60 bg-slate-50/70 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getBankBadgeStyle(acc.bankName, acc.type)}`}>
                                                    {acc.type === 'wallet' ? <IoWalletOutline size={14} /> : <IoCardOutline size={14} />}
                                                    {acc.bankName}
                                                </span>

                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleAccountActive(idx)}
                                                        title={acc.isActive ? 'Active (Click to disable)' : 'Disabled (Click to activate)'}
                                                        className={`text-xs px-2 py-0.5 rounded-full font-semibold transition ${
                                                            acc.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                                        }`}
                                                    >
                                                        {acc.isActive ? 'Active' : 'Inactive'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditModal(idx)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                                                        title="Edit"
                                                    >
                                                        <IoPencilOutline size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteAccount(idx)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                                        title="Delete"
                                                    >
                                                        <IoTrashOutline size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5 text-xs">
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Title:</span>
                                                    <p className="font-semibold text-slate-800 break-words">{acc.accountTitle || '—'}</p>
                                                </div>

                                                <div>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                        {acc.type === 'wallet' ? 'Mobile / Wallet #:' : 'Account Number:'}
                                                    </span>
                                                    <p className="font-mono font-bold text-slate-900 tracking-wide text-sm">{acc.accountNumber || '—'}</p>
                                                </div>

                                                {acc.iban && (
                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">IBAN:</span>
                                                        <p className="font-mono text-xs text-slate-700 break-all">{acc.iban}</p>
                                                    </div>
                                                )}

                                                {acc.instructions && (
                                                    <div className="pt-1.5 border-t border-slate-100">
                                                        <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                                                            {acc.instructions}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* General Payment Instructions Notice */}
                            <div className="mt-6 border-t border-slate-100 pt-5">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 block">
                                    Global Payment Instructions & Guidance for Admins
                                </label>
                                <textarea
                                    name="paymentInstructions"
                                    defaultValue={settings?.paymentInstructions || "Please transfer the exact subscription fee amount to any of our available bank or mobile wallet accounts above and attach the screenshot/receipt."}
                                    rows={2}
                                    placeholder="Instructions displayed on the admin payment proof submission screen..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 resize-none"
                                />
                            </div>
                        </div>

                        {/* ── 2. Branding Card ── */}
                        <div className="rounded-3xl bg-white p-4 sm:p-7 shadow-sm ring-1 ring-slate-100">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <IoGlobeOutline size={22} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-slate-900">General Branding & Contact</h3>
                                    <p className="text-xs text-slate-400">Configure platform identity and official support channels</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        Platform name
                                    </label>
                                    <input
                                        name="websiteName"
                                        defaultValue={settings?.websiteName || 'TecVeq LMS'}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        Support email
                                    </label>
                                    <input
                                        name="supportEmail"
                                        defaultValue={settings?.supportEmail || 'support@tecveq.com'}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                        Support phone / WhatsApp
                                    </label>
                                    <input
                                        name="supportPhone"
                                        defaultValue={settings?.supportPhone || '+92 300 1234567'}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ── 3. Security Card ── */}
                        <div className="rounded-3xl bg-white p-4 sm:p-7 shadow-sm ring-1 ring-slate-100">
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                    <IoShieldCheckmarkOutline size={22} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-semibold text-slate-900">Automated Security & Billing Rules</h3>
                                    <p className="text-xs text-slate-400">Enable automated workflows for accounts and overdue subscription enforcement</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Toggle row */}
                                <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Auto-block unpaid admins</p>
                                        <p className="text-xs text-slate-400">Automatically restrict portal access for institute admins with overdue payments</p>
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
                                            defaultValue={settings?.reminderDays || 3}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Save Button Bar ── */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 rounded-xl bg-indigo-950 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/20 transition hover:bg-indigo-900 active:scale-95 disabled:opacity-60"
                            >
                                <IoSaveOutline size={18} />
                                {processing ? 'Saving changes...' : 'Save all configuration'}
                            </button>
                        </div>
                    </form>
                )}
            </main>

            {/* ── Add / Edit Account Modal ── */}
            {isAccountModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-100 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                    <IoCardOutline size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {editingAccountIndex !== null ? 'Edit Payment Account' : 'Add New Payment Account'}
                                    </h3>
                                    <p className="text-xs text-slate-400">Configure bank/wallet receiving details</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsAccountModalOpen(false)}
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <IoCloseCircleOutline size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveAccountModal} className="space-y-4 text-xs">
                            {/* Preset Buttons */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Quick Preset (Select Bank / Wallet)
                                </label>
                                <div className="flex flex-wrap gap-1.5">
                                    {PRESET_METHODS.map((preset) => (
                                        <button
                                            key={preset.name}
                                            type="button"
                                            onClick={() => {
                                                setAccountForm({
                                                    ...accountForm,
                                                    bankName: preset.name,
                                                    type: preset.type
                                                });
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                                accountForm.bankName === preset.name
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Type and Name */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        Account Type
                                    </label>
                                    <select
                                        value={accountForm.type}
                                        onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                                    >
                                        <option value="bank">Bank Account</option>
                                        <option value="wallet">Mobile Wallet</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        Bank / Wallet Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={accountForm.bankName}
                                        onChange={(e) => setAccountForm({ ...accountForm, bankName: e.target.value })}
                                        placeholder="e.g. Allied Bank, JazzCash"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Account Title */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Account Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={accountForm.accountTitle}
                                    onChange={(e) => setAccountForm({ ...accountForm, accountTitle: e.target.value })}
                                    placeholder="e.g. TecVeq Solutions (Pvt) Ltd or Super Admin Name"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Account Number / Mobile Number */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    {accountForm.type === 'wallet' ? 'Mobile / Wallet Number *' : 'Account Number *'}
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={accountForm.accountNumber}
                                    onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                                    placeholder={accountForm.type === 'wallet' ? '03001234567' : '0010023456789012'}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* IBAN & Branch Code */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        IBAN (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={accountForm.iban}
                                        onChange={(e) => setAccountForm({ ...accountForm, iban: e.target.value })}
                                        placeholder="PK36ABPA0010023456789012"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                        Branch Code (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={accountForm.branchCode}
                                        onChange={(e) => setAccountForm({ ...accountForm, branchCode: e.target.value })}
                                        placeholder="0010"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {/* Specific Instructions */}
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                    Account Transfer Instructions / Remarks
                                </label>
                                <input
                                    type="text"
                                    value={accountForm.instructions}
                                    onChange={(e) => setAccountForm({ ...accountForm, instructions: e.target.value })}
                                    placeholder="e.g. Include Institute Name or Admin Email in transaction remarks."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500"
                                />
                            </div>

                            {/* Active Switch */}
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100">
                                <div>
                                    <p className="font-semibold text-slate-800 text-xs">Account Status</p>
                                    <p className="text-[11px] text-slate-400">Enable this method for admin payment selection</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={accountForm.isActive}
                                        onChange={(e) => setAccountForm({ ...accountForm, isActive: e.target.checked })}
                                        className="sr-only"
                                    />
                                    <div className={`h-6 w-11 rounded-full transition-colors ${accountForm.isActive ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                                        <div className={`absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${accountForm.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAccountModalOpen(false)}
                                    className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                                >
                                    {editingAccountIndex !== null ? 'Update Account' : 'Add to Accounts'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
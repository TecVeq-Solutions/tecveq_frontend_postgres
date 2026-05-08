import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import SuperAdminNavbar from "../../components/SuperAdmin/SuperAdminNavbar";
import Loader from "../../utils/Loader";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoNotificationsOutline,
    IoAddOutline,
    IoTimeOutline,
    IoMegaphoneOutline,
    IoCardOutline,
    IoShieldOutline,
    IoCheckmarkCircleOutline,
    IoCloseOutline,
    IoPaperPlaneOutline,
    IoSparklesOutline,
    IoRadioOutline,
    IoPeopleOutline,
    IoAlertCircleOutline,
    IoMailUnreadOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";

const Notifications = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const { data: notifications = [], isLoading, refetch } = useQuery({
        queryKey: ["superadmin-notifications"],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem("tcauser"));
            const res = await axios.get(`${BACKEND_URL}/superadmin/notifications`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            return res.data;
        },
    });

    const { data: admins = [] } = useQuery({
        queryKey: ["superadmin-admins-list-notif"],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem("tcauser"));
            const res = await axios.get(`${BACKEND_URL}/superadmin/admins`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            return res.data;
        },
    });

    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case "payment reminder":
                return <IoCardOutline className="text-amber-500" />;
            case "account blocked":
                return <IoShieldOutline className="text-rose-500" />;
            case "system update":
                return <IoMegaphoneOutline className="text-indigo-500" />;
            default:
                return <IoNotificationsOutline className="text-cyan-500" />;
        }
    };

    const getTypeBadge = (type) => {
        switch (type?.toLowerCase()) {
            case "payment reminder":
                return "bg-amber-50 text-amber-700 ring-amber-100";
            case "account blocked":
                return "bg-rose-50 text-rose-700 ring-rose-100";
            case "system update":
                return "bg-indigo-50 text-indigo-700 ring-indigo-100";
            default:
                return "bg-cyan-50 text-cyan-700 ring-cyan-100";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        setProcessing(true);

        try {
            const user = JSON.parse(localStorage.getItem("tcauser"));

            await axios.post(`${BACKEND_URL}/superadmin/notifications`, data, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });

            toast.success("Notification broadcasted successfully");
            setIsModalOpen(false);
            refetch();
        } catch (error) {
            toast.error("Failed to send notification");
        } finally {
            setProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f5f7fb]">
                <Loader />
            </div>
        );
    }

    const totalNotifications = notifications.length;
    const broadcastCount = notifications.filter((n) => !n.receiverId).length;
    const targetedCount = notifications.filter((n) => n.receiverId).length;

    return (
        <div className="min-h-screen bg-[#f5f7fb] font-poppins text-slate-900">
            <SuperAdminNavbar heading="Broadcast System" />

            <main className="max-w-screen-2xl px-4 py-5 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-[#080f4f] p-6 text-white  ">
                    <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
                    <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
                    <div className="absolute right-12 top-12 hidden h-28 w-28 rounded-full border border-white/10 lg:block" />
                    <div className="absolute right-36 bottom-10 hidden h-14 w-14 rounded-full border border-white/10 lg:block" />

                    <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100">
                                <IoSparklesOutline className="text-cyan-300" />
                                Super Admin Broadcast Center
                            </div>

                            <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-4xl l">
                                System Notifications
                            </h1>

                            <p className=" hidden mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-300 sm:text-base">
                                Send payment reminders, security alerts, system updates and general
                                announcements to all institutes or selected administrators.
                            </p>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black text-[#080f4f] shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-50 active:scale-95 sm:w-auto"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#080f4f] text-white transition group-hover:rotate-90">
                                <IoAddOutline size={22} />
                            </span>
                            Create Notification
                        </button>
                    </div>
                </section>

                {/* Stats Cards */}
                {/* <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <StatsCard
                        title="Total Notifications"
                        value={totalNotifications}
                        icon={<IoNotificationsOutline size={26} />}
                        iconClass="bg-indigo-50 text-indigo-700"
                    />

                    <StatsCard
                        title="Broadcast Sent"
                        value={broadcastCount}
                        icon={<IoRadioOutline size={26} />}
                        iconClass="bg-emerald-50 text-emerald-600"
                    />

                    <StatsCard
                        title="Targeted Alerts"
                        value={targetedCount}
                        icon={<IoPeopleOutline size={26} />}
                        iconClass="bg-cyan-50 text-cyan-600"
                        className="sm:col-span-2 xl:col-span-1"
                    />
                </section> */}

                {/* Header */}
                <div className="main-container">
                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900">
                                Recent Notifications
                            </h2>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                                Track all broadcasts and admin-specific alerts from one clean timeline.
                            </p>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="space-y-4">
                        {notifications.length > 0 ? (
                            notifications.map((notif, idx) => (
                                <motion.div
                                    key={notif.id}
                                    initial={{ opacity: 0, y: 18 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.06 }}
                                    className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-indigo-950/10 sm:p-6"
                                >
                                    <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#080f4f] via-indigo-500 to-cyan-400" />
                                    <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-indigo-50 blur-3xl transition group-hover:bg-cyan-50" />

                                    <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-start">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.35rem] bg-slate-50 text-3xl ring-1 ring-slate-100 transition group-hover:scale-105">
                                            {getTypeIcon(notif.type)}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                                <div className="min-w-0">
                                                    <h3 className="text-lg font-black leading-tight text-slate-900 sm:text-xl">
                                                        {notif.title}
                                                    </h3>

                                                    <p className="mt-2 max-w-4xl text-sm font-medium leading-6 text-slate-500">
                                                        {notif.message}
                                                    </p>
                                                </div>

                                                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full  bg-slate-50 px-3 py-1.5 text-[10px] sm:text-[12px] font-medium uppercase  text-black ring-1 ring-slate-100">
                                                    <IoTimeOutline />
                                                    {new Date(notif.createdAt).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] ring-1 ${getTypeBadge(
                                                        notif.type
                                                    )}`}
                                                >
                                                    {getTypeIcon(notif.type)}
                                                    {notif.type}
                                                </span>

                                                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700 ring-1 ring-emerald-100">
                                                    <IoCheckmarkCircleOutline />
                                                    Delivered to {notif.receiverId ? "Specific Admin" : "All Admins"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
                                <div className="flex flex-col items-center px-4">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-indigo-50 text-indigo-500">
                                        <IoMailUnreadOutline size={42} />
                                    </div>

                                    <h3 className="mt-5 text-xl font-black text-slate-900">
                                        No Notifications Sent
                                    </h3>

                                    <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                                        Create your first broadcast to send payment reminders, updates, or
                                        important alerts to administrators.
                                    </p>

                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#080f4f] px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-950/15 transition hover:bg-indigo-800 active:scale-95"
                                    >
                                        <IoAddOutline size={20} />
                                        Create First Notification
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4  pt-14 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 20 }}
                            className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-black/30"
                        >
                            <div className="relative overflow-hidden bg-[#080f4f] px-6 py-6 text-white sm:px-8">
                                <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />

                                <div className="relative z-10 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="mb-1 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
                                            Broadcast Message
                                        </p>
                                        <h3 className="text-2xl font-black">Create Notification</h3>
                                    </div>

                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white hover:text-[#080f4f]"
                                    >
                                        <IoCloseOutline size={25} />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="max-h-[78vh] overflow-y-auto p-6 sm:p-8">
                                <div className="space-y-5">
                                    <FormSelect label="Receiver" name="receiverId">
                                        <option value="">All Administrators (Broadcast)</option>
                                        {admins.map((admin) => (
                                            <option key={admin.id} value={admin.id}>
                                                {admin.instituteName} ({admin.name})
                                            </option>
                                        ))}
                                    </FormSelect>

                                    <FormSelect label="Notification Type" name="type" required>
                                        <option value="General">General Announcement</option>
                                        <option value="System Update">System Update</option>
                                        <option value="Payment Reminder">Payment Reminder</option>
                                        <option value="Account Blocked">Security Alert</option>
                                    </FormSelect>

                                    <FormInput
                                        label="Title"
                                        name="title"
                                        placeholder="e.g. Server Maintenance Notice"
                                        required
                                    />

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                            Message Content
                                        </label>

                                        <textarea
                                            required
                                            name="message"
                                            rows="5"
                                            placeholder="Write your message here..."
                                            className="w-full resize-none rounded-2xl border border-transparent bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                                        />
                                    </div>

                                    <div className="rounded-[1.5rem] bg-indigo-50/70 p-4 ring-1 ring-indigo-100">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                                                <IoAlertCircleOutline size={20} />
                                            </div>
                                            <p className="text-xs font-semibold leading-5 text-indigo-700">
                                                This notification will be delivered according to the selected
                                                receiver. Choose broadcast to send it to all administrators.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
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
                                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#080f4f] py-4 text-sm font-black text-white shadow-xl shadow-indigo-950/20 transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
                                    >
                                        {processing ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                <IoPaperPlaneOutline size={18} />
                                                Send Notification
                                            </>
                                        )}
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

const StatsCard = ({ title, value, icon, iconClass, className = "" }) => {
    return (
        <div
            className={`rounded-[1.75rem] border border-white bg-white p-5 shadow-sm shadow-slate-200/70 ${className}`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        {title}
                    </p>
                    <h3 className="mt-2 text-3xl font-black text-slate-900">{value}</h3>
                </div>

                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconClass}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

const FormInput = ({ label, name, placeholder, required = false }) => {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {label}
            </label>

            <input
                required={required}
                name={name}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-transparent bg-slate-50 px-5 py-3.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
        </div>
    );
};

const FormSelect = ({ label, name, required = false, children }) => {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {label}
            </label>

            <select
                required={required}
                name={name}
                className="w-full rounded-2xl border border-transparent bg-slate-50 px-5 py-3.5 text-sm font-semibold text-slate-800 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            >
                {children}
            </select>
        </div>
    );
};

export default Notifications;
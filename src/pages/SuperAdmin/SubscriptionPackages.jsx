import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import SuperAdminNavbar from "../../components/SuperAdmin/SuperAdminNavbar";
import Loader from "../../utils/Loader";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoAddOutline,
    IoPricetagOutline,
    IoPeopleOutline,
    IoSchoolOutline,
    IoCheckmarkOutline,
    IoTrashOutline,
    IoStarOutline,
    IoCloseOutline,
    IoLayersOutline,
    IoRocketOutline,
    IoShieldCheckmarkOutline,
    IoTrendingUpOutline,
    IoSparklesOutline,
    IoCreateOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";

const SubscriptionPackages = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [features, setFeatures] = useState([]);
    const [featureInput, setFeatureInput] = useState("");

    const { data: packages = [], isLoading, refetch } = useQuery({
        queryKey: ["superadmin-packages"],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem("tcauser"));
            const res = await axios.get(`${BACKEND_URL}/superadmin/packages`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });
            return res.data;
        },
    });

    const handleOpenModal = (pkg = null) => {
        setEditingPackage(pkg);
        setFeatures(pkg?.features || []);
        setFeatureInput("");
        setIsModalOpen(true);
    };

    const handleAddFeature = (e) => {
        e.preventDefault();
        if (featureInput.trim()) {
            setFeatures([...features, featureInput.trim()]);
            setFeatureInput("");
        }
    };

    const handleRemoveFeature = (idx) => {
        setFeatures(features.filter((_, i) => i !== idx));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.features = features;

        setProcessing(true);

        try {
            const user = JSON.parse(localStorage.getItem("tcauser"));
            const config = {
                headers: { Authorization: `Bearer ${user?.token}` },
            };

            if (editingPackage) {
                await axios.put(
                    `${BACKEND_URL}/superadmin/packages/${editingPackage.id}`,
                    data,
                    config
                );
                toast.success("Package updated successfully");
            } else {
                await axios.post(`${BACKEND_URL}/superadmin/packages`, data, config);
                toast.success("Package created successfully");
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
        if (!window.confirm("Delete this package? This may affect existing subscriptions.")) return;

        try {
            const user = JSON.parse(localStorage.getItem("tcauser"));

            await axios.delete(`${BACKEND_URL}/superadmin/packages/${id}`, {
                headers: { Authorization: `Bearer ${user?.token}` },
            });

            toast.success("Package deleted");
            refetch();
        } catch (error) {
            toast.error("Failed to delete package");
        }
    };

    const totalPackages = packages.length;
    const activePackages = packages.filter((pkg) => pkg.status === "active").length;
    const highestPrice =
        packages.length > 0
            ? Math.max(...packages.map((pkg) => Number(pkg.monthlyPrice) || 0))
            : 0;

    return (
        <div className="min-h-screen bg-[#f5f7fb] font-poppins text-slate-900">
            <SuperAdminNavbar heading="Subscription Plans" />

            <main className=" max-w-screen-2xl px-4 py-4 sm:px-6">
                {isLoading ? (
                    <div className="flex h-[70vh] items-center justify-center">
                        <Loader />
                    </div>
                ) : (
                    <>
                        {/* Hero  mx-auto*/}
                        <section className="relative mb-4 overflow-hidden rounded-[2rem] bg-[#090f4f] p-4 sm:p-6 text-white ">
                            <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
                            <div className="absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
                            <div className="absolute right-10 top-10 hidden h-28 w-28 rounded-full border border-white/10 lg:block" />
                            <div className="absolute right-28 bottom-8 hidden h-16 w-16 rounded-full border border-white/10 lg:block" />

                            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-2 py-2 text-xs sm:px-4 sm:text-sm font-black uppercase tracking-[0.2em] text-cyan-100">
                                        <IoSparklesOutline className="text-cyan-300" />
                                        Super Admin Pricing Control
                                    </div>

                                    <h1 className="max-w-3xl text-2xl font-black leading-tight sm:text-4xl ">
                                        Manage Subscription Plans
                                    </h1>

                                    <p className=" hidden mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-300 sm:text-base">
                                        Create polished LMS packages, define institute limits, and manage
                                        monthly plans for every school from one professional dashboard.
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleOpenModal()}
                                    className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-black text-[#090f4f] shadow-xl shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-50 active:scale-95 sm:w-auto"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#090f4f] text-white transition group-hover:rotate-90">
                                        <IoAddOutline size={22} />
                                    </span>
                                    Create New Plan
                                </button>
                            </div>
                        </section>

                        {/* Stats */}
                        {/* <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-[1.75rem] border border-white bg-white p-5 shadow-sm shadow-slate-200/70">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                    Total Plans
                                </p>
                                <h3 className="mt-2 text-3xl font-black text-slate-900">
                                    {totalPackages}
                                </h3>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                                <IoPricetagOutline size={26} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-white bg-white p-5 shadow-sm shadow-slate-200/70">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                    Active Plans
                                </p>
                                <h3 className="mt-2 text-3xl font-black text-emerald-600">
                                    {activePackages}
                                </h3>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                                <IoShieldCheckmarkOutline size={26} />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-white bg-white p-5 shadow-sm shadow-slate-200/70 sm:col-span-2 xl:col-span-1">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                    Highest Plan
                                </p>
                                <h3 className="mt-2 text-3xl font-black text-slate-900">
                                    Rs.{highestPrice}
                                </h3>
                            </div>
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                                <IoTrendingUpOutline size={26} />
                            </div>
                        </div>
                    </div>
                </section> */}

                        {/* Section Header */}
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ml-2">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900">
                                    Available Packages
                                </h2>
                                <p className="mt-1 text-sm font-medium text-slate-500">
                                    Define monthly pricing, institute usage limits, and premium features.
                                </p>
                            </div>
                        </div>

                        {/* Packages */}
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {packages.length > 0 ? (
                                packages.map((pkg, idx) => {
                                    const isPopular = idx === 1 || pkg.status === "active";

                                    return (
                                        <motion.div
                                            key={pkg.id}
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.08 }}
                                            className="group relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white px-2 py-4  sm:p-6 shadow-sm shadow-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-950/10 "
                                        >
                                            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#090f4f] via-indigo-500 to-cyan-400" />

                                            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-100/70 blur-3xl transition group-hover:bg-cyan-100" />

                                            {pkg.status === "active" && (
                                                <div className="absolute right-5 top-5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 ring-1 ring-emerald-100">
                                                    Active
                                                </div>
                                            )}

                                            <div className="relative z-10">
                                                <div className="mb-6 flex items-center gap-2 sm:gap-4 pr-20">
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#090f4f] text-white shadow-lg shadow-indigo-950/20">
                                                        <IoRocketOutline size={25} />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <h3 className="truncate text-xl font-black capitalize text-slate-900">
                                                            {pkg.name}
                                                        </h3>
                                                        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-indigo-500">
                                                            Monthly Plan
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mb-7 rounded-[1.5rem] bg-slate-50 p-5">
                                                    <div className="flex items-end gap-1">
                                                        <span className="text-sm font-black text-slate-400">
                                                            Rs.
                                                        </span>
                                                        <span className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
                                                            {pkg.monthlyPrice}
                                                        </span>
                                                        <span className="pb-1 text-sm font-bold text-slate-400">
                                                            /mo
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mb-7 grid grid-cols-1 gap-3">
                                                    <LimitRow
                                                        icon={<IoPeopleOutline size={18} />}
                                                        label="Student Limit"
                                                        value={pkg.studentLimit === 0 ? "Unlimited" : pkg.studentLimit}
                                                    />

                                                    <LimitRow
                                                        icon={<IoSchoolOutline size={18} />}
                                                        label="Teacher Limit"
                                                        value={pkg.teacherLimit === 0 ? "Unlimited" : pkg.teacherLimit}
                                                    />

                                                    <LimitRow
                                                        icon={<IoLayersOutline size={18} />}
                                                        label="Class Limit"
                                                        value={pkg.classLimit === 0 ? "Unlimited" : pkg.classLimit}
                                                    />
                                                </div>

                                                <div className="mb-2 min-h-[96px] space-y-3">
                                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                                        Included Features
                                                    </p>

                                                    {pkg.features && Array.isArray(pkg.features) && pkg.features.length > 0 ? (
                                                        pkg.features.map((feature, fIdx) => (
                                                            <div key={fIdx} className="flex items-start gap-3">
                                                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                                                    <IoCheckmarkOutline size={15} />
                                                                </span>
                                                                <span className="text-sm font-semibold leading-5 text-slate-600">
                                                                    {feature}
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-400">
                                                            No custom features added yet.
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex gap-3 border-t border-slate-100 pt-5">
                                                    <button
                                                        onClick={() => handleOpenModal(pkg)}
                                                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#090f4f] py-3 text-sm font-black text-white shadow-lg shadow-indigo-950/15 transition hover:bg-indigo-800 active:scale-95"
                                                    >
                                                        <IoCreateOutline size={18} />
                                                        Edit Plan
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(pkg.id)}
                                                        className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 transition hover:bg-rose-500 hover:text-white active:scale-95"
                                                    >
                                                        <IoTrashOutline size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="col-span-full rounded-[2rem] border border-dashed border-slate-200 bg-white py-20 text-center shadow-sm">
                                    <div className="flex flex-col items-center px-4">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-indigo-50 text-indigo-500">
                                            <IoStarOutline size={42} />
                                        </div>

                                        <h3 className="mt-5 text-xl font-black text-slate-900">
                                            No Packages Defined
                                        </h3>

                                        <p className="mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                                            Start by creating your first subscription plan for institutes and
                                            manage student, teacher, and class limits professionally.
                                        </p>

                                        <button
                                            onClick={() => handleOpenModal()}
                                            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#090f4f] px-8 py-3.5 text-sm font-black text-white shadow-xl shadow-indigo-950/15 transition hover:bg-indigo-800 active:scale-95"
                                        >
                                            <IoAddOutline size={20} />
                                            Add First Plan
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: 20 }}
                            className="w-full max-w-3xl overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-black/30"
                        >
                            <div className="relative overflow-hidden bg-[#090f4f] px-6 py-6 text-white sm:px-8">
                                <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-3xl" />

                                <div className="relative z-10 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="mb-1 text-[11px] font-black uppercase tracking-[0.22em] text-cyan-200">
                                            {editingPackage ? "Update Package" : "New Subscription"}
                                        </p>
                                        <h3 className="text-2xl font-black">
                                            {editingPackage ? "Edit Plan" : "Create New Plan"}
                                        </h3>
                                    </div>

                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white hover:text-[#090f4f]"
                                    >
                                        <IoCloseOutline size={25} />
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="max-h-[78vh] overflow-y-auto p-6 sm:p-8">
                                <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2">
                                    <InputField
                                        label="Plan Name"
                                        name="name"
                                        defaultValue={editingPackage?.name}
                                        placeholder="e.g. Premium Plan"
                                        required
                                    />

                                    <InputField
                                        label="Monthly Price (Rs.)"
                                        type="number"
                                        name="monthlyPrice"
                                        defaultValue={editingPackage?.monthlyPrice}
                                        placeholder="5000"
                                        required
                                    />

                                    <InputField
                                        label="Student Limit"
                                        type="number"
                                        name="studentLimit"
                                        defaultValue={editingPackage?.studentLimit}
                                        placeholder="0 for unlimited"
                                        required
                                    />

                                    <InputField
                                        label="Teacher Limit"
                                        type="number"
                                        name="teacherLimit"
                                        defaultValue={editingPackage?.teacherLimit}
                                        placeholder="0 for unlimited"
                                        required
                                    />

                                    <InputField
                                        label="Class Limit"
                                        type="number"
                                        name="classLimit"
                                        defaultValue={editingPackage?.classLimit}
                                        placeholder="0 for unlimited"
                                        required
                                    />
                                </div>

                                <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-5">
                                    <label className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                                        <IoLayersOutline />
                                        Features & Perks
                                    </label>

                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <input
                                            value={featureInput}
                                            onChange={(e) => setFeatureInput(e.target.value)}
                                            placeholder="Add a feature, e.g. Priority Support"
                                            className="flex-1 rounded-2xl border border-transparent bg-white px-5 py-3.5 text-sm font-semibold outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
                                        />

                                        <button
                                            type="button"
                                            onClick={handleAddFeature}
                                            className="rounded-2xl bg-indigo-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-800 active:scale-95"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {features.length > 0 ? (
                                            features.map((f, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-indigo-700 ring-1 ring-indigo-100"
                                                >
                                                    {f}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFeature(i)}
                                                        className="text-slate-400 transition hover:text-rose-500"
                                                    >
                                                        <IoCloseOutline size={16} />
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm font-medium text-slate-400">
                                                No features added yet.
                                            </p>
                                        )}
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
                                        className="flex-1 rounded-2xl bg-[#090f4f] py-4 text-sm font-black text-white shadow-xl shadow-indigo-950/20 transition hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-70 active:scale-95"
                                    >
                                        {processing
                                            ? "Saving..."
                                            : editingPackage
                                                ? "Update Plan"
                                                : "Create Plan"}
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

const LimitRow = ({ icon, label, value }) => {
    return (
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 sm:px-4 py-3">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                    {icon}
                </div>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                    {label}
                </p>
            </div>

            <p className="text-sm font-black text-slate-800">{value}</p>
        </div>
    );
};

const InputField = ({
    label,
    name,
    type = "text",
    defaultValue,
    placeholder,
    required = false,
}) => {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                {label}
            </label>

            <input
                required={required}
                type={type}
                name={name}
                defaultValue={defaultValue}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-transparent bg-slate-50 px-5 py-3.5 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            />
        </div>
    );
};

export default SubscriptionPackages;
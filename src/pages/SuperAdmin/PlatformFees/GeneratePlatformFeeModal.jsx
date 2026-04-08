import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllUsers } from "../../../api/Admin/AdminApi";
import { generatePlatformFee } from "../../../api/Admin/FeesApi";
import Loader from "../../../utils/Loader";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";

const GeneratePlatformFeeModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        adminID: "",
        amount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        dueDate: ""
    });

    const { data: usersData, isLoading: usersLoading } = useQuery({
        queryKey: ["allAdmins"],
        queryFn: async () => {
            const resp = await getAllUsers();
            // apiRequest returns the data directly. If it's an array, filter it.
            return Array.isArray(resp) ? resp.filter(u => u.userType === 'admin') : [];
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const mutation = useMutation({
        mutationFn: (data) => generatePlatformFee(data),
        onSuccess: () => {
            toast.success("Platform fee generated.");
            onSuccess();
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to generate fee.");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.adminID || !formData.amount || !formData.dueDate) {
            return toast.error("Please fill all required fields.");
        }
        mutation.mutate(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1053]/40 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50">
                    <h2 className="text-2xl font-black text-[#0B1053] tracking-tight">Organization Billing</h2>
                    <button onClick={onClose} className="bg-gray-100 p-2 rounded-full text-gray-400 hover:text-gray-600 transition-all">
                        <IoClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Select Organization</label>
                        <select
                            className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#6A00FF] outline-none transition-all text-sm font-bold bg-gray-50 cursor-pointer"
                            value={formData.adminID}
                            onChange={(e) => setFormData({ ...formData, adminID: e.target.value })}
                            required
                        >
                            <option value="">Select an Admin / Organization</option>
                            {usersData?.map(admin => (
                                <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Fee Amount ($)</label>
                            <input
                                type="number"
                                className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#6A00FF] outline-none transition-all text-sm font-bold bg-gray-50"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Due Date</label>
                            <input
                                type="date"
                                className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#6A00FF] outline-none transition-all text-sm font-bold bg-gray-50"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Billing Month</label>
                            <select
                                className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#6A00FF] outline-none transition-all text-sm font-bold bg-gray-50"
                                value={formData.month}
                                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                            >
                                <option value="">No Specific Month</option>
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(0, i).toLocaleString('en', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Billing Year</label>
                            <input
                                type="number"
                                className="w-full px-6 py-4 border-2 border-gray-100 rounded-2xl focus:border-[#6A00FF] outline-none transition-all text-sm font-bold bg-gray-50"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className={`w-full py-5 rounded-3xl bg-[#0B1053] text-white font-black text-sm shadow-2xl shadow-[#0B1053]/30 hover:bg-[#1a237e] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center ${mutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {mutation.isPending ? "GENERATING BILL..." : "GENERATE PLATFORM INVOICE"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default GeneratePlatformFeeModal;

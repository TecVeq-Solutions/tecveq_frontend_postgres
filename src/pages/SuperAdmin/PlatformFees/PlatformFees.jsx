import React, { useState } from "react";
import SuperAdminNavbar from "../../../components/SuperAdmin/SuperAdminNavbar";
import { useBlur } from "../../../context/BlurContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../../../utils/Loader";
import { getPlatformFees, updatePlatformFeeStatus } from "../../../api/Admin/FeesApi";
import GeneratePlatformFeeModal from "./GeneratePlatformFeeModal";
import { toast } from "react-toastify";

const PlatformFees = () => {
    const { isBlurred, toggleBlur } = useBlur();
    const [isGenerateModal, setIsGenerateModal] = useState(false);
    const queryClient = useQueryClient();

    const { data: feesData, isLoading } = useQuery({
        queryKey: ["platformFees"],
        queryFn: async () => {
            const resp = await getPlatformFees();
            return resp;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => updatePlatformFeeStatus(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(["platformFees"]);
            toast.success("Platform fee status updated.");
        }
    });

    return (
        <div className="w-full bg-[#f4f7fe] font-poppins min-h-screen">
            <div className={`lg:px-10 sm:px-6 px-3 flex-grow h-screen ${isBlurred ? "blur" : ""}`}>
                <SuperAdminNavbar heading={"Platform Fee Management"} />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8">
                    <div>
                        <h2 className="text-2xl font-bold text-[#0B1053]">Organization Billing</h2>
                        <p className="text-gray-500 text-sm">Manage subscription fees and access for all organizations.</p>
                    </div>

                    <button
                        onClick={() => {
                            toggleBlur();
                            setIsGenerateModal(true);
                        }}
                        className="cursor-pointer flex py-3 px-10 rounded-2xl bg-[#0B1053] text-white text-sm font-bold items-center justify-center hover:bg-[#1a237e] transition-all shadow-xl"
                    >
                        Generate Platform Fee
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-1 items-center justify-center h-[60vh]">
                        <Loader />
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Organization</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Period</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Due Date</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Intervention</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {feesData?.map((fee) => (
                                        <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-gray-900 text-base">{fee.admin.name}</div>
                                                <div className="text-xs text-gray-400 font-medium">{fee.admin.email}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className="text-sm text-gray-600 font-bold">
                                                    {fee.month ? `${new Date(0, fee.month - 1).toLocaleString('en', { month: 'short' })} ${fee.year}` : `Yearly ${fee.year}`}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-lg font-black text-[#6A00FF]">
                                                ${fee.amount}
                                            </td>
                                            <td className="px-8 py-5 text-sm text-gray-500 font-bold">
                                                {new Date(fee.dueDate).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex justify-center">
                                                    <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest border-2 ${fee.status === 'paid'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                        : 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                                                        }`}>
                                                        {fee.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <button
                                                    onClick={() => updateStatusMutation.mutate({
                                                        id: fee.id,
                                                        status: fee.status === 'paid' ? 'unpaid' : 'paid'
                                                    })}
                                                    className={`text-[10px] font-black px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest ${fee.status === 'paid'
                                                        ? 'bg-maroon text-white hover:bg-[#8B1829] shadow-maroon/20'
                                                        : 'bg-green_dark text-white hover:bg-[#0E9003] shadow-green_dark/20'
                                                        }`}
                                                >
                                                    {fee.status === 'paid' ? 'SUSPEND ACCESS' : 'MARK AS PAID'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {feesData?.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-8 py-20 text-center text-gray-400 font-bold italic">
                                                No platform fee records found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {isGenerateModal && (
                <GeneratePlatformFeeModal
                    onClose={() => {
                        setIsGenerateModal(false);
                        toggleBlur();
                    }}
                    onSuccess={() => {
                        setIsGenerateModal(false);
                        toggleBlur();
                        queryClient.invalidateQueries(["platformFees"]);
                    }}
                />
            )}
        </div>
    );
};

export default PlatformFees;

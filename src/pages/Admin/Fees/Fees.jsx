import React, { useState } from "react";
import Navbar from "../../../components/Admin/Navbar";
import { useBlur } from "../../../context/BlurContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../../../utils/Loader";
import { getAllFees, updateFeeStatus, deleteFee } from "../../../api/Admin/FeesApi";
import GenerateFeeModal from "./GenerateFeeModal";
import { toast } from "react-toastify";
import { IoSearch, IoTrashOutline, IoCalendarOutline, IoCashOutline } from "react-icons/io5";

const Fees = () => {
    const { isBlurred, toggleBlur } = useBlur();
    const [isGenerateModal, setIsGenerateModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const queryClient = useQueryClient();

    const { data: feesData, isLoading } = useQuery({
        queryKey: ["adminFees"],
        queryFn: async () => {
            const resp = await getAllFees();
            return resp;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => updateFeeStatus(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(["adminFees"]);
            toast.success("Status updated successfully!");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteFee(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["adminFees"]);
            toast.success("Record deleted.");
        }
    });

    const filteredFees = feesData?.filter(fee =>
        fee.student.name.toLowerCase().includes(searchText.toLowerCase()) ||
        fee.student.level?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        fee.student.rollNo?.toLowerCase().includes(searchText.toLowerCase()) ||
        fee.type.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="w-full bg-[#F3F4F6] font-poppins min-h-screen">
            <div className={`lg:ml-80 lg:px-10 sm:px-6 px-4 py-6 transition-all duration-300 ${isBlurred ? "blur-md scale-[0.99]" : ""}`}>
                <Navbar heading={"Fees Management"} />

                {/* --- Action Bar --- */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-5 my-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div className="relative w-full md:w-96">
                        <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6A00FF]/20 focus:border-[#6A00FF] transition-all text-sm"
                            placeholder="Search students, roll no..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => { toggleBlur(); setIsGenerateModal(true); }}
                        className="w-full md:w-auto px-7 py-3 bg-[#6A00FF] hover:bg-[#5500CC] text-white rounded-xl font-semibold text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#6A00FF]/20 flex items-center justify-center gap-2"
                    >
                        <IoCashOutline className="text-lg" />
                        Generate New Fee
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-[50vh]">
                        <Loader />
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-6 text-start  py-5 text-[11px] font-bold text-gray-400  uppercase tracking-widest">Student Info</th>
                                        <th className="px-6 text-start  py-5 text-[11px] font-bold text-gray-400  uppercase  tracking-widest">Roll No</th>
                                        <th className="px-6 py-5 text-start  text-[11px] font-bold text-gray-400  uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-5 text-start  text-[11px] font-bold text-gray-400  uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-5 text-start  text-[11px] font-bold text-gray-400  uppercase tracking-widest">Period</th>
                                        <th className="px-6 py-5 text-start text-[11px] font-bold text-gray-400  uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-5 text-start text-[11px] font-bold text-gray-400  uppercase tracking-widest text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredFees?.map((fee) => (
                                        <tr key={fee.id} className="hover:bg-blue-50/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800">{fee.student.name}</span>
                                                    <span className="text-[11px] text-gray-400 font-medium">{fee.student.level?.name || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                                    {fee.student.rollNo || "N/A"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-black text-[#6A00FF]">
                                                    ${fee.amount.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-tight ${fee.type === 'monthly' ? 'bg-blue-100 text-blue-700' :
                                                    fee.type === 'six-months' ? 'bg-purple-100 text-purple-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {fee.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <IoCalendarOutline className="text-gray-400" />
                                                    <span className="text-xs font-medium">
                                                        {fee.month ? `${new Date(0, fee.month - 1).toLocaleString('en', { month: 'short' })} ${fee.year}` : fee.year}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={fee.status}
                                                    onChange={(e) => updateStatusMutation.mutate({ id: fee.id, status: e.target.value })}
                                                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full border-2 outline-none cursor-pointer transition-all ${fee.status === 'paid'
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 focus:border-emerald-400'
                                                        : 'bg-rose-50 text-rose-600 border-rose-100 focus:border-rose-400'
                                                        }`}
                                                >
                                                    <option value="unpaid">UNPAID</option>
                                                    <option value="paid">PAID</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => { if (window.confirm("Delete this record permanently?")) deleteMutation.mutate(fee.id) }}
                                                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    title="Delete Record"
                                                >
                                                    <IoTrashOutline className="text-lg" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredFees?.length === 0 && (
                                <div className="py-20 text-center">
                                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <IoSearch className="text-gray-300 text-2xl" />
                                    </div>
                                    <p className="text-gray-400 font-medium">No fee records found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {isGenerateModal && (
                <GenerateFeeModal
                    onClose={() => { setIsGenerateModal(false); toggleBlur(); }}
                    onSuccess={() => {
                        setIsGenerateModal(false);
                        toggleBlur();
                        queryClient.invalidateQueries(["adminFees"]);
                    }}
                />
            )}
        </div>
    );
};

export default Fees;
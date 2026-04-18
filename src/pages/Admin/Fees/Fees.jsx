import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Admin/Navbar";
import { useBlur } from "../../../context/BlurContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../../../utils/Loader";
import { getAllFees, updateFeeStatus, deleteFee } from "../../../api/Admin/FeesApi";
import GenerateFeeModal from "./GenerateFeeModal";
import { toast } from "react-toastify";
import { IoSearch } from "react-icons/io5";

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
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => updateFeeStatus(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(["adminFees"]);
            toast.success("Fee status updated.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteFee(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["adminFees"]);
            toast.success("Fee record deleted.");
        }
    });

    const filteredFees = feesData?.filter(fee => 
        fee.student.name.toLowerCase().includes(searchText.toLowerCase()) ||
        fee.student.level?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        fee.student.rollNo?.toLowerCase().includes(searchText.toLowerCase()) ||
        fee.type.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div className="w-full bg-[#F9F9F9] font-poppins min-h-full pb-10">
            <div className={`lg:ml-72 lg:px-10 sm:px-6 px-3 flex-grow min-h-full ${isBlurred ? "blur" : ""}`}>
                <Navbar heading={"Fees Management"} />
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 my-6">
                    <div className="flex items-center gap-2 border bg-white border-[#00000020] px-4 py-2 rounded-3xl w-full sm:w-96 shadow-sm">
                        <IoSearch className="text-gray-400" />
                        <input
                            type="text"
                            className="bg-transparent outline-none w-full text-sm"
                            placeholder="Search by student, roll no, or type..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    
                    <button
                        onClick={() => {
                            toggleBlur();
                            setIsGenerateModal(true);
                        }}
                        className="cursor-pointer flex py-2.5 px-8 rounded-3xl bg-[#6A00FF] text-white text-sm font-semibold items-center justify-center hover:bg-[#5500CC] transition-all shadow-md w-full sm:w-auto"
                    >
                        Generate New Fee
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex flex-1 items-center justify-center h-[60vh]">
                        <Loader />
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sr. No</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Level</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Roll No</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Month/Year</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredFees?.map((fee, idx) => (
                                    <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">{idx + 1}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{fee.student.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{fee.student.level?.name || "N/A"}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{fee.student.rollNo || "N/A"}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-[#6A00FF]">{fee.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-[11px] font-bold rounded-full uppercase ${
                                                fee.type === 'monthly' ? 'bg-blue-50 text-blue-600' :
                                                fee.type === 'six-months' ? 'bg-purple-50 text-purple-600' :
                                                'bg-orange-50 text-orange-600'
                                            }`}>
                                                {fee.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {fee.month ? `${new Date(0, fee.month-1).toLocaleString('en', {month: 'short'})} ${fee.year}` : fee.year}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(fee.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={fee.status}
                                                onChange={(e) => updateStatusMutation.mutate({ id: fee.id, status: e.target.value })}
                                                className={`text-xs font-bold px-2 py-1 rounded border outline-none cursor-pointer ${
                                                    fee.status === 'paid' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'
                                                }`}
                                            >
                                                <option value="unpaid">Unpaid</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button 
                                                onClick={() => { if(window.confirm("Delete this fee?")) deleteMutation.mutate(fee.id) }}
                                                className="text-red-400 hover:text-red-600 transition-colors text-xs font-bold"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredFees?.length === 0 && (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-10 text-center text-gray-400 font-medium">
                                            No fee records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isGenerateModal && (
                <GenerateFeeModal 
                    onClose={() => {
                        setIsGenerateModal(false);
                        toggleBlur();
                    }} 
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

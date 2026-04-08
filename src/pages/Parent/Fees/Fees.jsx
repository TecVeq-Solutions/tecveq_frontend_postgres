import React from "react";
import Navbar from "../../../components/Parent/Dashboard/Navbar";
import { useBlur } from "../../../context/BlurContext";
import { useParent } from "../../../context/ParentContext";
import { useQuery } from "@tanstack/react-query";
import { getChildFees } from "../../../api/Parent/ParentApi";
import Loader from "../../../utils/Loader";

const Fees = () => {
    const { isBlurred } = useBlur();
    const { selectedChild } = useParent();

    const { data: feesData, isLoading } = useQuery({
        queryKey: ["childFees", selectedChild?.id],
        queryFn: async () => {
            const resp = await getChildFees(selectedChild?.id);
            return resp;
        },
        enabled: !!selectedChild?.id,
        staleTime: 300000,
        refetchOnWindowFocus: false
    });

    return (
        <div className="flex flex-1 bg-[#f9f9f9]/50 font-poppins min-h-screen">
            <div className={`flex flex-col flex-1 px-4 lg:ml-72 ${isBlurred ? "blur" : ""}`}>
                <div className="flex h-20 md:px-14 lg:px-0">
                    <Navbar />
                </div>
                
                <div className="py-6 px-2 sm:px-10 lg:px-0">
                    <h1 className="text-2xl font-bold text-[#0B1053] mb-2 uppercase tracking-tight">Student Fees Portal</h1>
                    <p className="text-gray-500 text-sm">Review fee history and payment status for <span className="font-bold text-[#6A00FF]">{selectedChild?.name || "Student"}</span></p>
                </div>

                {!selectedChild ? (
                    <div className="flex flex-1 items-center justify-center h-[50vh] bg-white rounded-3xl mx-2 sm:mx-10 lg:mx-0 shadow-sm border border-dashed border-gray-200">
                        <div className="text-center">
                            <p className="text-gray-400 font-medium mb-4">No student selected.</p>
                            <button 
                                onClick={() => window.location.href = '/parent/children'}
                                className="px-6 py-2 bg-[#0B1053] text-white rounded-full text-sm font-bold shadow-lg hover:bg-[#0B1053]/90 transition-all"
                            >
                                Select Student
                            </button>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-1 items-center justify-center h-[50vh]">
                        <Loader />
                    </div>
                ) : (
                    <div className="mx-2 sm:mx-10 lg:mx-0 bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden mb-10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#0B1053] border-b border-[#0B1053]">
                                        <th className="py-5 text-xs font-bold text-white uppercase tracking-widest px-8">Fee Type</th>
                                        <th className="px-6 py-5 text-xs font-bold text-white uppercase tracking-widest">Period</th>
                                        <th className="px-6 py-5 text-xs font-bold text-white uppercase tracking-widest">Amount</th>
                                        <th className="px-6 py-5 text-xs font-bold text-white uppercase tracking-widest">Due Date</th>
                                        <th className="px-6 py-5 text-xs font-bold text-white uppercase tracking-widest text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {feesData?.map((fee) => (
                                        <tr key={fee.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="font-bold text-[#0B1053] capitalize text-base">{fee.type.replace('-', ' ')}</div>
                                                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{fee.description || "SCHOOL ACADEMIC FEE"}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm text-gray-600 font-semibold bg-gray-100 px-3 py-1 rounded-lg">
                                                    {fee.month ? `${new Date(0, fee.month-1).toLocaleString('en', {month: 'long'})} ${fee.year}` : `Academic Year ${fee.year}`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-lg font-black text-[#6A00FF]">
                                                ${fee.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-5 text-sm text-gray-500 font-medium">
                                                <div>Due: {new Date(fee.dueDate).toLocaleDateString('en-GB', {day:'2-digit', month:'short', year:'numeric'})}</div>
                                                {fee.paidAt && <div className="text-[10px] text-green-500 font-bold uppercase mt-1">Paid On: {new Date(fee.paidAt).toLocaleDateString('en-GB')}</div>}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <span className={`px-5 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm border-2 ${
                                                        fee.status === 'paid' 
                                                        ? 'bg-green-50 text-green-600 border-green-200' 
                                                        : 'bg-red-50 text-red-600 border-red-200'
                                                    }`}>
                                                        {fee.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!feesData || feesData.length === 0) && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-24 text-center">
                                                <div className="text-gray-300 text-lg font-medium italic">No fee history records available.</div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Fees;

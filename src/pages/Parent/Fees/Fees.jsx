import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../../../components/Parent/Dashboard/Navbar";
import { useBlur } from "../../../context/BlurContext";
import { useParent } from "../../../context/ParentContext";
import { useQuery } from "@tanstack/react-query";
import { getChildFees } from "../../../api/Parent/ParentApi";
import Loader from "../../../utils/Loader";
import {
    IoChevronBackOutline,
    IoChevronForwardOutline,
    IoChevronDownOutline,
} from "react-icons/io5";

const Fees = () => {
    const { isBlurred } = useBlur();
    const { selectedChild } = useParent();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { data: feesData, isLoading } = useQuery({
        queryKey: ["childFees", selectedChild?.id],
        queryFn: async () => {
            const resp = await getChildFees(selectedChild?.id);
            return resp;
        },
        enabled: !!selectedChild?.id,
        staleTime: 300000,
        refetchOnWindowFocus: false,
    });

    const fees = feesData || [];

    // Pagination logic
    const totalItems = fees.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

    const paginatedFees = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;

        return fees.slice(startIndex, endIndex);
    }, [fees, currentPage, rowsPerPage]);

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const endItem = Math.min(currentPage * rowsPerPage, totalItems);

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedChild?.id, rowsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    return (
        <div className="flex flex-col flex-1 bg-[#f9f9f9]/50 font-poppins min-h-screen max-w-full overflow-hidden">
            {/* Navbar stays above the blur */}
            <div className="flex h-20 md:px-14 lg:px-0 lg:ml-80">
                <Navbar />
            </div>

            <div
                className={`flex flex-col flex-1 max-w-full px-4 sm:px-6 lg:ml-80 overflow-x-hidden ${isBlurred ? "blur" : ""
                    }`}
            >
                <div className="py-6 px-0 sm:px-2 sm:px-10 lg:px-0">
                    <h1 className="text-2xl font-bold text-[#0B1053] mb-2 uppercase tracking-tight">
                        Student Fees Portal
                    </h1>

                    <p className="text-gray-500 text-sm">
                        Review fee history and payment status for{" "}
                        <span className="font-bold text-[#6A00FF]">
                            {selectedChild?.name || "Student"}
                        </span>
                    </p>
                </div>

                {!selectedChild ? (
                    <div className="flex flex-1 items-center justify-center h-[50vh] bg-white rounded-3xl mx-2 sm:mx-10 lg:mx-0 shadow-sm border border-dashed border-gray-200">
                        <div className="text-center">
                            <p className="text-gray-400 font-medium mb-4">
                                No student selected.
                            </p>

                            <button
                                onClick={() => (window.location.href = "/parent/children")}
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
                    <div className="mx-0 sm:mx-2 sm:mx-10 lg:mx-0 bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden mb-10">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#0B1053] border-b border-[#0B1053]">
                                        <th className="py-5 text-xs font-bold text-white uppercase tracking-widest px-3 sm:px-8">
                                            Fee Type
                                        </th>

                                        <th className="px-3 sm:px-6 py-5 text-xs font-bold text-white uppercase tracking-widest">
                                            Period
                                        </th>

                                        <th className="px-3 sm:px-6 py-5 text-xs font-bold text-white uppercase tracking-widest">
                                            Amount
                                        </th>

                                        <th className="px-3 sm:px-6 py-5 text-xs font-bold text-white uppercase tracking-widest">
                                            Due Date
                                        </th>

                                        <th className="px-3 sm:px-6 py-5 text-xs font-bold text-white uppercase tracking-widest text-center">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-50">
                                    {paginatedFees.length > 0 ? (
                                        paginatedFees.map((fee) => (
                                            <tr
                                                key={fee.id}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="px-3 sm:px-8 py-5">
                                                    <div className="font-bold text-[#0B1053] capitalize text-base">
                                                        {fee.type.replace("-", " ")}
                                                    </div>

                                                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">
                                                        {fee.description || "SCHOOL ACADEMIC FEE"}
                                                    </div>
                                                </td>

                                                <td className="px-3 sm:px-6 py-5">
                                                    <span className="text-sm text-gray-600 font-semibold bg-gray-100 px-3 py-1 rounded-lg">
                                                        {fee.month
                                                            ? `${new Date(
                                                                0,
                                                                fee.month - 1
                                                            ).toLocaleString("en", {
                                                                month: "long",
                                                            })} ${fee.year}`
                                                            : `Academic Year ${fee.year}`}
                                                    </span>
                                                </td>

                                                <td className="px-3 sm:px-6 py-5 text-lg font-black text-[#6A00FF]">
                                                    ${fee.amount.toLocaleString()}
                                                </td>

                                                <td className="px-3 sm:px-6 py-5 text-sm text-gray-500 font-medium">
                                                    <div>
                                                        Due:{" "}
                                                        {new Date(fee.dueDate).toLocaleDateString(
                                                            "en-GB",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                    </div>

                                                    {fee.paidAt && (
                                                        <div className="text-[10px] text-green-500 font-bold uppercase mt-1">
                                                            Paid On:{" "}
                                                            {new Date(fee.paidAt).toLocaleDateString(
                                                                "en-GB"
                                                            )}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-3 sm:px-6 py-5">
                                                    <div className="flex justify-center">
                                                        <span
                                                            className={`px-5 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm border-2 ${fee.status === "paid"
                                                                ? "bg-green-50 text-green-600 border-green-200"
                                                                : "bg-red-50 text-red-600 border-red-200"
                                                                }`}
                                                        >
                                                            {fee.status}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-24 text-center">
                                                <div className="text-gray-300 text-lg font-medium italic">
                                                    No fee history records available.
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination + Selector Footer */}
                        {totalItems > 0 && (
                            <div className="mt-4 sm:mt-6 mb-4 flex lg:flex-row items-center justify-between sm:gap-4 gap-2 rounded-[15px] sm:rounded-3xl border border-[#E8E3FF] bg-white/80 backdrop-blur-md px-1 sm:px-6 py-4 shadow-[0_8px_30px_rgba(106,0,255,0.08)] mx-4 sm:mx-6">
                                {/* Rows selector */}
                                <div className="flex flex-row items-center gap-1 sm:gap-3 w-full lg:w-auto justify-center lg:justify-start">
                                    <span className="text-sm font-semibold text-[#0B1053]/70">
                                        Rows per page
                                    </span>

                                    <div className="relative">
                                        <select
                                            value={rowsPerPage}
                                            onChange={(e) => {
                                                setRowsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="appearance-none min-w-[50px] sm:min-w-[92px] cursor-pointer rounded-2xl border border-[#DCD4FF] bg-gradient-to-br from-white to-[#F6F3FF] px-2 sm:pl-4 sm:pr-10 py-2.5 text-sm font-bold text-[#6A00FF] outline-none shadow-[0_4px_14px_rgba(106,0,255,0.10)] hover:border-[#6A00FF]/50 focus:border-[#6A00FF] transition-all duration-200"
                                        >
                                            {[2, 4, 6, 10].map((item) => (
                                                <option key={item} value={item}>
                                                    {item}
                                                </option>
                                            ))}
                                        </select>

                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                            <svg
                                                className="w-4 h-4 text-[#6A00FF]"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 9l-7 7-7-7"
                                                />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Showing info */}
                                <div className="hidden sm:flex flex-col items-center text-center">
                                    <p className="text-sm font-semibold text-[#0B1053]">
                                        Showing{" "}
                                        <span className="text-[#6A00FF]">
                                            {startItem}
                                        </span>{" "}
                                        to{" "}
                                        <span className="text-[#6A00FF]">
                                            {endItem}
                                        </span>{" "}
                                        of{" "}
                                        <span className="text-[#6A00FF]">
                                            {totalItems}
                                        </span>{" "}
                                        Fees
                                    </p>

                                    <p className="text-xs text-[#0B1053]/45 mt-0.5">
                                        Page {currentPage} of {totalPages}
                                    </p>
                                </div>

                                {/* Pagination buttons */}
                                <div className="flex items-center gap-2 w-full lg:w-auto justify-center lg:justify-end">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="group flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 sm:py-2.5 py-1.5 rounded-2xl text-sm font-bold border border-[#DCD4FF] bg-white text-[#0B1053] shadow-[0_3_12px_rgba(106,0,255,0.08)] hover:bg-[#F6F3FF] hover:text-[#6A00FF] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#0B1053] active:scale-95 transition-all duration-200"
                                    >
                                        <IoChevronBackOutline className="sm:hidden inline" size={18} />
                                        <span className="hidden sm:inline">Previous</span>
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
                                                        <span className="px-1 text-gray-400 text-sm">
                                                            ...
                                                        </span>
                                                    )}

                                                    <button
                                                        onClick={() => goToPage(page)}
                                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 ${currentPage === page
                                                            ? "bg-gradient-to-br from-[#7B1FFF] to-[#5500CC] text-white shadow-[0_5px_16px_rgba(106,0,255,0.35)]"
                                                            : "bg-[#F6F3FF] text-[#6A00FF] hover:bg-[#ECE6FF]"
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
                                        className="group flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 sm:py-2.5 py-1.5 rounded-2xl text-sm font-bold border border-[#DCD4FF] bg-white text-[#0B1053] shadow-[0_3_12px_rgba(106,0,255,0.08)] hover:bg-[#F6F3FF] hover:text-[#6A00FF] disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#0B1053] active:scale-95 transition-all duration-200"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <IoChevronForwardOutline className="sm:hidden inline" size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Fees;
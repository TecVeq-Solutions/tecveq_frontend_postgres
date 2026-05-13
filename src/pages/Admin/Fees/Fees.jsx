import React, { useState } from "react";
import Navbar from "../../../components/Admin/Navbar";
import { useBlur } from "../../../context/BlurContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Loader from "../../../utils/Loader";
import { getAllFees, updateFeeStatus, deleteFee } from "../../../api/Admin/FeesApi";
import GenerateFeeModal from "./GenerateFeeModal";
import EditFeeModal from "./EditFeeModal";
import { toast } from "react-toastify";
import {
    IoSearch,
    IoTrashOutline,
    IoCalendarOutline,
    IoCashOutline,
    IoPencilOutline,
    IoChevronBackOutline,
    IoChevronForwardOutline,
} from "react-icons/io5";
import { useAdmin } from "../../../context/AdminContext";

const Fees = () => {
    const { isBlurred, toggleBlur } = useBlur();
    const { allLevels } = useAdmin();

    const [isGenerateModal, setIsGenerateModal] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState("");
    const [editFeeData, setEditFeeData] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(2);

    const queryClient = useQueryClient();

    const { data: feesData, isLoading } = useQuery({
        queryKey: ["adminFees"],
        queryFn: async () => {
            const resp = await getAllFees();
            return resp;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }) => updateFeeStatus(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries(["adminFees"]);
            toast.success("Status updated successfully!");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteFee(id),
        onSuccess: () => {
            queryClient.invalidateQueries(["adminFees"]);
            toast.success("Record deleted.");
        },
    });

    const filteredFees = feesData?.filter((fee) => {
        const matchesSearch =
            fee.student.name.toLowerCase().includes(searchText.toLowerCase()) ||
            fee.student.level?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            fee.student.rollNo?.toLowerCase().includes(searchText.toLowerCase()) ||
            fee.type.toLowerCase().includes(searchText.toLowerCase());

        const matchesLevel = selectedLevel
            ? fee.student.level?.name === selectedLevel
            : true;

        return matchesSearch && matchesLevel;
    }) || [];

    const totalPages = Math.ceil(filteredFees.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;

    const paginatedFees = filteredFees.slice(
        startIndex,
        startIndex + rowsPerPage
    );

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredFees.map((fee) => fee.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} records?`)) return;

        setIsDeleting(true);

        try {
            await Promise.all(selectedIds.map((id) => deleteFee(id)));
            toast.success("Selected records deleted.");
            queryClient.invalidateQueries(["adminFees"]);
            setSelectedIds([]);
        } catch (error) {
            toast.error("Failed to delete some records.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="w-full bg-[#F3F4F6] font-poppins min-h-screen">
            <div className="lg:ml-80 lg:px-10 sm:px-6 px-2 py-0 sm:py-6 transition-all duration-300">
                <Navbar heading={"Fees Management"} />

                <div className={`transition-all duration-300 ${isBlurred ? "blur-md scale-[0.99]" : ""}`}>

                    {/* --- Action Bar --- */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-5 my-2 sm:my-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="relative w-full md:w-96">
                            <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />

                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6A00FF]/20 focus:border-[#6A00FF] transition-all text-sm"
                                placeholder="Search students, roll no..."
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    setCurrentPage(1);
                                    setSelectedIds([]);
                                }}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-3 md:mt-0">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isDeleting}
                                    className="w-full sm:w-auto px-5 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-rose-100 whitespace-nowrap"
                                >
                                    <IoTrashOutline className="text-lg" />
                                    {isDeleting ? "Deleting..." : `Delete (${selectedIds.length})`}
                                </button>
                            )}

                            <select
                                className="w-full sm:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6A00FF]/20 focus:border-[#6A00FF] transition-all text-sm font-medium text-gray-600"
                                value={selectedLevel}
                                onChange={(e) => {
                                    setSelectedLevel(e.target.value);
                                    setSelectedIds([]);
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="">All Levels</option>
                                {allLevels?.map((level) => (
                                    <option key={level.id} value={level.name}>
                                        {level.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                onClick={() => {
                                    toggleBlur();
                                    setIsGenerateModal(true);
                                }}
                                className="w-full sm:w-auto px-7 py-3 bg-[#6A00FF] hover:bg-[#5500CC] text-white rounded-xl font-semibold text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#6A00FF]/20 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <IoCashOutline className="text-lg" />
                                Generate New Fee
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-[50vh]">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                                <th className="px-6 py-5 text-start w-10">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded text-[#6A00FF] focus:ring-[#6A00FF] border-gray-300 cursor-pointer"
                                                        checked={filteredFees?.length > 0 && selectedIds.length === filteredFees?.length}
                                                        onChange={handleSelectAll}
                                                    />
                                                </th>

                                                <th className="px-4 text-start py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Student Info
                                                </th>

                                                <th className="px-4 text-start py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Roll No
                                                </th>

                                                <th className="px-4 py-5 text-start text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Amount
                                                </th>

                                                <th className="px-4 py-5 text-start text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Type
                                                </th>

                                                <th className="px-4 py-5 text-start text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Period
                                                </th>

                                                <th className="px-4 py-5 text-start text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                                    Status
                                                </th>

                                                <th className="px-6 py-5 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-50">
                                            {paginatedFees?.map((fee) => (
                                                <tr key={fee.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded text-[#6A00FF] focus:ring-[#6A00FF] border-gray-300 cursor-pointer"
                                                            checked={selectedIds.includes(fee.id)}
                                                            onChange={() => handleSelectOne(fee.id)}
                                                        />
                                                    </td>

                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-800">
                                                                {fee.student.name}
                                                            </span>

                                                            <span className="text-[11px] text-gray-400 font-medium">
                                                                {fee.student.level?.name || "N/A"}
                                                            </span>
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
                                                        <span
                                                            className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase tracking-tight ${fee.type === "monthly"
                                                                ? "bg-blue-100 text-blue-700"
                                                                : fee.type === "six-months"
                                                                    ? "bg-purple-100 text-purple-700"
                                                                    : "bg-amber-100 text-amber-700"
                                                                }`}
                                                        >
                                                            {fee.type}
                                                        </span>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <IoCalendarOutline className="text-gray-400" />

                                                            <span className="text-xs font-medium">
                                                                {fee.month
                                                                    ? `${new Date(0, fee.month - 1).toLocaleString("en", { month: "short" })} ${fee.year}`
                                                                    : fee.year}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={fee.status}
                                                            onChange={(e) => updateStatusMutation.mutate({ id: fee.id, status: e.target.value })}
                                                            className={`text-[11px] font-bold px-3 py-1.5 rounded-full border-2 outline-none cursor-pointer transition-all ${fee.status === "paid"
                                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100 focus:border-emerald-400"
                                                                : "bg-rose-50 text-rose-600 border-rose-100 focus:border-rose-400"
                                                                }`}
                                                        >
                                                            <option value="unpaid">UNPAID</option>
                                                            <option value="paid">PAID</option>
                                                        </select>
                                                    </td>

                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    toggleBlur();
                                                                    setEditFeeData(fee);
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                title="Edit Record"
                                                            >
                                                                <IoPencilOutline className="text-lg" />
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm("Delete this record permanently?")) {
                                                                        deleteMutation.mutate(fee.id);
                                                                    }
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                                title="Delete Record"
                                                            >
                                                                <IoTrashOutline className="text-lg" />
                                                            </button>
                                                        </div>
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

                                            <p className="text-gray-400 font-medium">
                                                No fee records found matching your search.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pagination + Selector */}
                            {filteredFees.length > 0 && (
                                <div className="mt-4 sm:mt-5 mb-10 rounded-[15px] sm:rounded-[22px] border border-[#E9DDFF] bg-white px-1 sm:px-5 py-4 shadow-[0_14px_35px_rgba(106,0,255,0.08)]">
                                    <div className="flex  lg:flex-row items-center justify-between gap-1 sm:gap-4">
                                        {/* Left: Rows per page */}
                                        <div className="flex flex-row items-center gap-1 sm:gap-3 w-full lg:w-auto justify-center lg:justify-start">
                                            <span className="text-sm font-bold text-[#5A6480] ">
                                                Rows per page
                                            </span>

                                            <div className="relative">
                                                <select
                                                    value={rowsPerPage}
                                                    onChange={(e) => {
                                                        setRowsPerPage(Number(e.target.value));
                                                        setCurrentPage(1);
                                                    }}
                                                    className="appearance-none h-11 min-w-[30px] sm:min-w-[78px] cursor-pointer rounded-2xl border border-[#D8C7FF] bg-white px-2 sm:pl-4    pr-6 md:pr-9 text-sm font-extrabold text-[#6A00FF] outline-none shadow-[0_6px_18px_rgba(106,0,255,0.08)] transition-all duration-300 hover:border-[#6A00FF]/50 focus:border-[#6A00FF] focus:ring-4 focus:ring-[#6A00FF]/10"
                                                >
                                                    <option value={2}>2</option>
                                                    <option value={4}>4</option>
                                                    <option value={6}>6</option>
                                                    <option value={10}>10</option>
                                                </select>

                                                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                    <svg
                                                        className="h-4 w-4 text-[#6A00FF]"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Center: Showing text */}
                                        <div className="hidden sm:flex flex-col items-center text-center">
                                            <p className="text-sm font-extrabold text-[#10165F]">
                                                Showing{" "}
                                                <span className="text-[#6A00FF]">
                                                    {startIndex + 1}
                                                </span>{" "}
                                                to{" "}
                                                <span className="text-[#6A00FF]">
                                                    {Math.min(startIndex + rowsPerPage, filteredFees.length)}
                                                </span>{" "}
                                                of{" "}
                                                <span className="text-[#6A00FF]">
                                                    {filteredFees.length}
                                                </span>{" "}
                                                fee records
                                            </p>

                                            <p className="mt-0.5 text-xs font-semibold text-[#A0A8C0]">
                                                Page {currentPage} of {totalPages}
                                            </p>
                                        </div>

                                        {/* Right: Pagination buttons */}
                                        <div className="flex items-center justify-center gap-1 sm:gap-2 w-full lg:w-auto">
                                            <button
                                                disabled={currentPage === 1}
                                                onClick={() => setCurrentPage((prev) => prev - 1)}
                                                className="group flex items-center justify-center h-8 sm:h-11 px-1.5 sm:px-5 rounded-2xl border border-[#E6E0FF] bg-white text-sm font-extrabold text-[#A0A8C0] shadow-sm transition-all duration-300 hover:border-[#6A00FF]/40 hover:bg-[#F7F2FF] hover:text-[#6A00FF] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#A0A8C0] active:scale-95"
                                            >
                                                <IoChevronBackOutline className="sm:hidden inline text-lg" />
                                                <span className="hidden sm:inline">Previous</span>
                                            </button>

                                            <div className="flex items-center gap-2">
                                                {Array.from({ length: totalPages }).map((_, pageIndex) => {
                                                    const pageNumber = pageIndex + 1;

                                                    return (
                                                        <button
                                                            key={pageNumber}
                                                            onClick={() => setCurrentPage(pageNumber)}
                                                            className={`h-8 w-8 sm:h-11 sm:w-11 rounded-2xl text-sm font-extrabold transition-all duration-300 active:scale-95 ${currentPage === pageNumber
                                                                ? "bg-gradient-to-br from-[#7B1FFF] to-[#5B00D6] text-white shadow-[0_10px_22px_rgba(106,0,255,0.30)]"
                                                                : "bg-[#F7F2FF] text-[#6A00FF] hover:bg-[#EEE4FF]"
                                                                }`}
                                                        >
                                                            {pageNumber}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <button
                                                disabled={currentPage === totalPages}
                                                onClick={() => setCurrentPage((prev) => prev + 1)}
                                                className="group flex items-center justify-center h-8 sm:h-11 px-1.5 sm:px-3 sm:px-5 rounded-2xl border border-[#E6E0FF] bg-white text-sm font-extrabold text-[#10165F] shadow-sm transition-all duration-300 hover:border-[#6A00FF]/40 hover:bg-[#F7F2FF] hover:text-[#6A00FF] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#A0A8C0] active:scale-95"
                                            >
                                                <span className="hidden sm:inline">Next</span>
                                                <IoChevronForwardOutline className="sm:hidden inline text-lg" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
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

            {editFeeData && (
                <EditFeeModal
                    feeData={editFeeData}
                    onClose={() => {
                        setEditFeeData(null);
                        toggleBlur();
                    }}
                    onSuccess={() => {
                        setEditFeeData(null);
                        toggleBlur();
                    }}
                />
            )}
        </div>
    );
};

export default Fees;
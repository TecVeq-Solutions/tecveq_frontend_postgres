import React, { useEffect, useState, useMemo } from 'react';
import Loader from '../../../utils/Loader';
import Navbar from '../../../components/Admin/Navbar';
import QuoteCard from '../../../components/Admin/Announcements/QuoteCard';
import AnnouncementCard from '../../../components/Admin/Announcements/AnnouncementCard';
import CreateQuoteModal from '../../../components/Admin/Announcements/CreateQuoteModal';
import CreateAnnouncementModal from '../../../components/Admin/Announcements/CreateAnnouncementModal';

import { toast } from 'react-toastify';
import { FaSearch, FaPlus, FaBullhorn, FaQuoteLeft } from 'react-icons/fa';
import { useBlur } from '../../../context/BlurContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteAnnouncements, getAllAnnouncements } from '../../../api/Admin/AnnouncementsApi';

const Announcements = () => {
    const [annouce, setAccounce] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [editQuoteData, setEditQuoteData] = useState({});
    const [isQuotesExist, setIsQuotesExist] = useState(false);
    const [editQuoteModal, setEditQuoteModal] = useState(false);
    const [createQuoteModal, setCreateQuoteModal] = useState(false);
    const [editAnnouncementData, setEditAnnouncementData] = useState({});
    const [isAnnouncementExist, setIsAnnouncementExist] = useState(false);
    const [editAnnouncementModal, setEditAnnouncementModal] = useState(false);
    const [createAnnouncementModal, setCreateAnnouncementModal] = useState(false);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(2);

    const { isBlurred, toggleBlur } = useBlur();

    const toggleCreateAssignmentModal = () => {
        toggleBlur();
        setCreateAnnouncementModal(!createAnnouncementModal);
    };

    const toggleEditAnnouncementModal = () => {
        toggleBlur();
        setEditAnnouncementModal(!editAnnouncementModal);
    };

    const toggleQuoteModal = () => {
        toggleBlur();
        setCreateQuoteModal(!createQuoteModal);
    };

    const toggleEditQuoteModal = () => {
        toggleBlur();
        setEditQuoteModal(!editQuoteModal);
    };

    const editAnnouncement = (data) => {
        setEditAnnouncementData(data);
        toggleEditAnnouncementModal();
    };

    const editQuote = (data) => {
        setEditQuoteData(data);
        toggleEditQuoteModal();
    };

    const { data: announcemnets, isPending, isSuccess, isError, refetch, isRefetching } = useQuery({
        queryKey: ["announcemnets", "quotes"],
        queryFn: getAllAnnouncements
    });

    const announceDellMutate = useMutation({
        mutationFn: async (id) => await deleteAnnouncements(id),
        onSettled: async () => {
            await refetch();
            return toast.success("Deleted successfully");
        }
    });

    useEffect(() => {
        if (isSuccess && announcemnets) {
            setIsAnnouncementExist(announcemnets.some(item => item.type === 'annoouncement'));
            setIsQuotesExist(announcemnets.some(item => item.type === 'quote'));
        }
    }, [announcemnets, isSuccess]);

    const filteredData = useMemo(() => {
        if (!announcemnets) return [];

        return [...announcemnets].reverse().filter(item => {
            const matchesType = annouce ? item.type === "annoouncement" : item.type !== "annoouncement";

            const matchesSearch = searchText === "" ||
                item.title?.toLowerCase().includes(searchText.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchText.toLowerCase());

            return matchesType && matchesSearch;
        });
    }, [announcemnets, annouce, searchText]);

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;

    const paginatedData = filteredData.slice(
        startIndex,
        startIndex + rowsPerPage
    );

    if (isPending || isRefetching || announceDellMutate?.isPending) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]">
                <Loader />
            </div>
        );
    }

    return (
        <div className='flex min-h-screen w-full bg-[#F3F4F6] font-poppins'>
            <div className={`flex-grow w-full px-3 sm:px-6 lg:px-10 pb-10 lg:ml-80 transition-all duration-300`}>

                <Navbar heading={"Announcements"} />

                <div className={`mt-4 sm:mt-6 transition-all duration-300 ${isBlurred ? "blur-sm" : ""}`}>

                    {/* ── Action Bar ── */}
                    <div className='bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100 mb-5 sm:mb-8 flex flex-col gap-3'>

                        {/* Row 1: Tabs */}
                        <div className='flex bg-gray-100 p-1 rounded-xl w-full'>
                            <button
                                onClick={() => {
                                    setAccounce(true);
                                    setCurrentPage(1);
                                }}
                                className={`flex items-center justify-center gap-1.5 flex-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${annouce
                                    ? "bg-white text-[#6A00FF] shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <FaBullhorn size={12} />
                                <span>Announcements</span>
                            </button>

                            <button
                                onClick={() => {
                                    setAccounce(false);
                                    setCurrentPage(1);
                                }}
                                className={`flex items-center justify-center gap-1.5 flex-1 px-2 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${!annouce
                                    ? "bg-white text-[#6A00FF] shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <FaQuoteLeft size={12} />
                                <span>Quotes</span>
                            </button>
                        </div>

                        {/* Row 2: Search + Create */}
                        <div className='flex gap-2 w-full'>
                            {/* Search */}
                            <div className='relative group flex-1 min-w-0'>
                                <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6A00FF] transition-colors text-xs sm:text-sm' />

                                <input
                                    value={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    type="text"
                                    placeholder={annouce ? 'Search announcements...' : 'Search quotes...'}
                                    className='pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6A00FF]/20 focus:border-[#6A00FF] transition-all w-full text-xs sm:text-sm'
                                />
                            </div>

                            {/* Create Button */}
                            <button
                                onClick={() => annouce ? toggleCreateAssignmentModal() : toggleQuoteModal()}
                                className='flex items-center justify-center gap-1.5 px-3 sm:px-6 py-2.5 bg-[#6A00FF] hover:bg-[#5900d9] text-white rounded-xl font-medium transition-all active:scale-[0.98] shadow-md shadow-[#6A00FF]/20 text-xs sm:text-sm shrink-0'
                            >
                                <FaPlus size={11} />
                                <span className='hidden xs:inline sm:inline'>Create New</span>
                                <span className='xs:hidden sm:hidden'>New</span>
                            </button>
                        </div>
                    </div>

                    {/* ── Cards Grid ── */}
                    {/* ── Cards Grid ── */}
                    <div className="space-y-3 sm:space-y-4 transition-all duration-500">
                        {filteredData.length > 0 ? (
                            paginatedData.map((item, index) => (
                                <div
                                    key={item._id || index}
                                    className="group relative overflow-hidden rounded-[22px] sm:rounded-[26px] bg-white border border-gray-100 shadow-[0_8px_24px_rgba(15,23,42,0.05)] hover:shadow-[0_16px_40px_rgba(106,0,255,0.12)] transition-all duration-300 hover:-translate-y-0.5"
                                >
                                    {/* Soft top glow */}
                                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#6A00FF] via-[#9B5CFF] to-[#C7A6FF]" />

                                    {/* Background decorations */}
                                    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[#F2EBFF] blur-2xl opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="pointer-events-none absolute -left-12 -bottom-12 h-28 w-28 rounded-full bg-[#F8F4FF] blur-2xl opacity-80" />

                                    {/* Card label */}
                                    <div className="relative flex items-center justify-between gap-2 px-3 pt-3 sm:px-4 sm:pt-4">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div
                                                className={`h-9 w-9 shrink-0 rounded-2xl flex items-center justify-center shadow-sm ${annouce
                                                    ? "bg-[#F2EBFF] text-[#6A00FF]"
                                                    : "bg-[#FFF7ED] text-[#EA580C]"
                                                    }`}
                                            >
                                                {annouce ? (
                                                    <FaBullhorn className="text-sm" />
                                                ) : (
                                                    <FaQuoteLeft className="text-sm" />
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-gray-400 leading-none">
                                                    {annouce ? "Announcement" : "Quote"}
                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-gray-500 truncate max-w-[210px] xs:max-w-[240px] sm:max-w-md">
                                                    {annouce
                                                        ? "School update"
                                                        : "Daily inspiration"}
                                                </p>
                                            </div>
                                        </div>

                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${annouce
                                                ? "bg-[#F7F2FF] text-[#6A00FF] ring-[#E8DFFF]"
                                                : "bg-orange-50 text-orange-600 ring-orange-100"
                                                }`}
                                        >
                                            #{startIndex + index + 1}
                                        </span>
                                    </div>

                                    {/* Existing card component - functionality same */}
                                    <div className="relative px-2 pb-2 pt-2 sm:px-3 sm:pb-3">
                                        <div className="rounded-[18px] sm:rounded-[22px] overflow-hidden bg-white">
                                            {annouce ? (
                                                <AnnouncementCard
                                                    refetch={refetch}
                                                    editAnnouncement={editAnnouncement}
                                                    deleteAnnouncement={announceDellMutate.mutate}
                                                    announcement={item}
                                                />
                                            ) : (
                                                <QuoteCard
                                                    refetch={refetch}
                                                    editQuote={editQuote}
                                                    deleteQuote={announceDellMutate.mutate}
                                                    quote={item}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="relative overflow-hidden flex flex-col items-center justify-center py-14 sm:py-20 bg-white rounded-[28px] border-2 border-dashed border-[#E8DFFF] mx-0 shadow-[0_10px_30px_rgba(106,0,255,0.06)]">
                                <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#F2EBFF] blur-3xl opacity-80" />
                                <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[#F8F4FF] blur-3xl opacity-80" />

                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#F7F2FF] to-white rounded-[24px] flex items-center justify-center mb-4 shadow-sm ring-1 ring-[#E8DFFF]">
                                    {annouce ? (
                                        <FaBullhorn className="text-[#6A00FF] text-2xl sm:text-3xl" />
                                    ) : (
                                        <FaQuoteLeft className="text-[#6A00FF] text-2xl sm:text-3xl" />
                                    )}
                                </div>

                                <h3 className="relative text-base sm:text-xl font-bold text-gray-800 text-center">
                                    No {annouce ? "Announcements" : "Quotes"} Found
                                </h3>

                                <p className="relative text-gray-400 mt-1 text-xs sm:text-sm text-center px-4 max-w-xs">
                                    Start by creating your first one today!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Pagination + Selector */}
                    {filteredData.length > 0 && (
                        <div className="mt-4 sm:mt-6 relative overflow-hidden rounded-[15px] sm:rounded-[28px] border border-[#E8DFFF] bg-white shadow-[0_12px_35px_rgba(106,0,255,0.10)]">
                            {/* Soft glow background */}
                            <div className="absolute -top-16 -left-16 w-40 h-40 bg-[#EEE6FF] rounded-full blur-3xl opacity-80" />
                            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-[#F4ECFF] rounded-full blur-3xl opacity-90" />

                            <div className="relative flex lg:flex-row items-center justify-between sm:gap-5 gap-2 px-1 sm:px-6 py-5">

                                {/* Rows selector */}
                                <div className="flex flex-row items-center gap-1 sm:gap-3 w-full lg:w-auto">
                                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">
                                        Rows per page
                                    </span>

                                    <div className="relative group">
                                        <select
                                            value={rowsPerPage}
                                            onChange={(e) => {
                                                setRowsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="appearance-none min-w-[40px] sm:min-w-[96px] cursor-pointer rounded-2xl border border-[#DED0FF] bg-gradient-to-br from-[#F7F2FF] to-white px-2 sm:px-4 py-3 pr-6 sm:pr-10 text-sm font-extrabold text-[#6A00FF] outline-none shadow-[0_8px_20px_-12px_rgba(106,0,255,0.65)] transition-all duration-300 hover:border-[#6A00FF]/40 hover:shadow-[0_10px_24px_-12px_rgba(106,0,255,0.85)] focus:border-[#6A00FF] focus:ring-4 focus:ring-[#6A00FF]/10"
                                        >
                                            <option value={2}>2</option>
                                            <option value={4}>4</option>
                                            <option value={6}>6</option>
                                            <option value={10}>10</option>
                                        </select>

                                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                            <svg
                                                className="h-4 w-4 text-[#6A00FF] transition-transform duration-300 group-hover:rotate-180"
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

                                {/* Showing text */}
                                <div className="hidden sm:flex flex-col items-center text-center">
                                    <div className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full bg-[#F7F2FF] px-4 py-2 ring-1 ring-[#E8DFFF]">
                                        <span className="text-xs font-bold text-gray-400">
                                            Showing
                                        </span>

                                        <span className="text-xs font-extrabold text-[#6A00FF]">
                                            {startIndex + 1}
                                        </span>

                                        <span className="text-xs text-gray-300">to</span>

                                        <span className="text-xs font-extrabold text-[#6A00FF]">
                                            {Math.min(startIndex + rowsPerPage, filteredData.length)}
                                        </span>

                                        <span className="text-xs text-gray-300">of</span>

                                        <span className="text-xs font-extrabold text-[#6A00FF]">
                                            {filteredData.length}
                                        </span>

                                        <span className="text-xs font-bold text-gray-400">
                                            {annouce ? "announcements" : "quotes"}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-[11px] font-semibold text-gray-400">
                                        Page {currentPage} of {totalPages}
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-center gap-2 w-full lg:w-auto">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((prev) => prev - 1)}
                                        className="group inline-flex items-center gap-1 sm:gap-2 rounded-2xl border border-[#DED0FF] bg-white px-2 sm:px-4 py-2 sm:py-3 text-xs font-extrabold text-gray-500 shadow-sm transition-all duration-300 hover:bg-[#F7F2FF] hover:text-[#6A00FF] hover:border-[#6A00FF]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 active:scale-95"
                                    >
                                        <svg
                                            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 19l-7-7 7-7"
                                            />
                                        </svg>
                                        <span className="hidden sm:inline">Prev</span>
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        {Array.from({ length: totalPages }).map((_, pageIndex) => {
                                            const pageNumber = pageIndex + 1;

                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => setCurrentPage(pageNumber)}
                                                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-2xl text-xs font-extrabold transition-all duration-300 active:scale-95 ${currentPage === pageNumber
                                                        ? 'bg-gradient-to-br from-[#7B1FFF] to-[#5500CC] text-white shadow-[0_10px_22px_-8px_rgba(106,0,255,0.75)]'
                                                        : 'bg-[#F7F2FF] text-[#6A00FF] ring-1 ring-[#E8DFFF] hover:bg-[#EFE6FF]'
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
                                        className="group inline-flex items-center gap-1 sm:gap-2 rounded-2xl border border-[#DED0FF] bg-white px-2 sm:px-4 py-2 sm:py-3 text-xs font-extrabold text-gray-500 shadow-sm transition-all duration-300 hover:bg-[#F7F2FF] hover:text-[#6A00FF] hover:border-[#6A00FF]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-500 active:scale-95"
                                    >
                                        <span className="hidden sm:inline">Next</span>
                                        <svg
                                            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {createAnnouncementModal && (
                <CreateAnnouncementModal
                    refetch={refetch}
                    open={createAnnouncementModal}
                    isEditTrue={false}
                    setopen={setCreateAnnouncementModal}
                />
            )}

            {editAnnouncementModal && (
                <CreateAnnouncementModal
                    refetch={refetch}
                    open={editAnnouncementModal}
                    isEditTrue={true}
                    setopen={setEditAnnouncementModal}
                    announcementData={editAnnouncementData}
                />
            )}

            {createQuoteModal && (
                <CreateQuoteModal
                    refetch={refetch}
                    open={createQuoteModal}
                    isEditTrue={false}
                    setopen={setCreateQuoteModal}
                />
            )}

            {editQuoteModal && (
                <CreateQuoteModal
                    refetch={refetch}
                    open={editQuoteModal}
                    isEditTrue={true}
                    setopen={setEditQuoteModal}
                    quoteData={editQuoteData}
                />
            )}
        </div>
    );
};

export default Announcements;
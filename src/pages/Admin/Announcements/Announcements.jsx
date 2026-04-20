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

    const { isBlurred, toggleBlur } = useBlur();

    // Handlers
    const toggleCreateAssignmentModal = () => { toggleBlur(); setCreateAnnouncementModal(!createAnnouncementModal); };
    const toggleEditAnnouncementModal = () => { toggleBlur(); setEditAnnouncementModal(!editAnnouncementModal); };
    const toggleQuoteModal = () => { toggleBlur(); setCreateQuoteModal(!createQuoteModal); };
    const toggleEditQuoteModal = () => { toggleBlur(); setEditQuoteModal(!editQuoteModal); };

    const editAnnouncement = (data) => { setEditAnnouncementData(data); toggleEditAnnouncementModal(); };
    const editQuote = (data) => { setEditQuoteData(data); toggleEditQuoteModal(); };

    // Queries
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

    // Filter Logic
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

    if (isPending || isRefetching || announceDellMutate?.isPending) {
        return <div className="flex h-screen w-full items-center justify-center bg-[#f8fafc]"> <Loader /> </div>;
    }

    return (
        <div className='flex min-h-screen w-full bg-[#F3F4F6] font-poppins'>
            <div className={`flex-grow w-full px-4 lg:px-10 pb-10 lg:ml-80 transition-all duration-300 ${isBlurred ? "blur-sm" : ""}`}>

                <Navbar heading={"Announcements"} />

                {/* Main Content Container   max-w-7xl mx-auto  */}
                <div className="mt-6">

                    {/* Upper Action Bar */}
                    <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-4'>

                        {/* Tabs Style */}
                        <div className='flex bg-gray-100 p-1 rounded-xl w-full md:w-auto'>
                            <button
                                onClick={() => setAccounce(true)}
                                className={`flex items-center gap-2 flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${annouce ? "bg-white text-[#6A00FF] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <FaBullhorn size={14} /> Announcements
                            </button>
                            <button
                                onClick={() => setAccounce(false)}
                                className={`flex items-center gap-2 flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${!annouce ? "bg-white text-[#6A00FF] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <FaQuoteLeft size={14} /> Quotes
                            </button>
                        </div>

                        {/* Search and Create */}
                        <div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
                            <div className='relative group'>
                                <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6A00FF] transition-colors' />
                                <input
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    type="text"
                                    placeholder={annouce ? 'Search announcements...' : 'Search quotes...'}
                                    className='pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#6A00FF]/20 focus:border-[#6A00FF] transition-all w-full sm:w-64 text-sm'
                                />
                            </div>

                            <button
                                onClick={() => annouce ? toggleCreateAssignmentModal() : toggleQuoteModal()}
                                className='flex items-center justify-center gap-2 px-6 py-2.5 bg-[#6A00FF] hover:bg-[#5900d9] text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-[#6A00FF]/20'
                            >
                                <FaPlus size={12} /> Create New
                            </button>
                        </div>
                    </div>

                    {/* Cards Grid */}
                    <div className='grid grid-cols-1 gap-6 transition-all duration-500'>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                annouce ? (
                                    <AnnouncementCard
                                        refetch={refetch}
                                        editAnnouncement={editAnnouncement}
                                        deleteAnnouncement={announceDellMutate.mutate}
                                        key={item._id || index}
                                        announcement={item}
                                    />
                                ) : (
                                    <QuoteCard
                                        refetch={refetch}
                                        editQuote={editQuote}
                                        deleteQuote={announceDellMutate.mutate}
                                        key={item._id || index}
                                        quote={item}
                                    />
                                )
                            ))
                        ) : (
                            /* Empty State UI */
                            <div className='flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200'>
                                <div className='w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4'>
                                    {annouce ? <FaBullhorn className='text-gray-300 text-3xl' /> : <FaQuoteLeft className='text-gray-300 text-3xl' />}
                                </div>
                                <h3 className='text-xl font-semibold text-gray-700'>No {annouce ? 'Announcements' : 'Quotes'} Found</h3>
                                <p className='text-gray-400 mt-1'>Start by creating your first one today!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {createAnnouncementModal && <CreateAnnouncementModal refetch={refetch} open={createAnnouncementModal} isEditTrue={false} setopen={setCreateAnnouncementModal} />}
            {editAnnouncementModal && <CreateAnnouncementModal refetch={refetch} open={editAnnouncementModal} isEditTrue={true} setopen={setEditAnnouncementModal} announcementData={editAnnouncementData} />}
            {createQuoteModal && <CreateQuoteModal refetch={refetch} open={createQuoteModal} isEditTrue={false} setopen={setCreateQuoteModal} />}
            {editQuoteModal && <CreateQuoteModal refetch={refetch} open={editQuoteModal} isEditTrue={true} setopen={setEditQuoteModal} quoteData={editQuoteData} />}
        </div>
    );
};

export default Announcements;
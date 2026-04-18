import React, { useEffect, useState } from 'react'

import Loader from '../../../utils/Loader';
import Navbar from '../../../components/Admin/Navbar'
import QuoteCard from '../../../components/Admin/Announcements/QuoteCard';
import AnnouncementCard from '../../../components/Admin/Announcements/AnnouncementCard';
import CreateQuoteModal from '../../../components/Admin/Announcements/CreateQuoteModal';
import CreateAnnouncementModal from '../../../components/Admin/Announcements/CreateAnnouncementModal';

import { toast } from 'react-toastify';
import { FaSearch } from 'react-icons/fa';
import { useBlur } from '../../../context/BlurContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { deleteAnnouncements, getAllAnnouncements } from '../../../api/Admin/AnnouncementsApi';


const Announcements = () => {

    const [annouce, setAccounce] = useState(true);
    const [isquote, setisQuote] = useState(false);
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

    const toggleCreateAssignmentModal = () => {
        toggleBlur();
        setCreateAnnouncementModal(!createAnnouncementModal);
    }

    const toggleEditAnnouncementModal = () => {
        toggleBlur();
        setEditAnnouncementModal(!editAnnouncementModal);
    }

    const toggleQuoteModal = () => {
        toggleBlur();
        setCreateQuoteModal(!createQuoteModal);
    }

    const toggleEditQuoteModal = () => {
        toggleBlur();
        setEditQuoteModal(!editQuoteModal);
    }

    const announceClick = () => {
        setAccounce(true);
        setisQuote(false);
    }

    const quoteClick = () => {
        setAccounce(false);
        setisQuote(true);
    }

    const editAnnouncement = (data) => {
        console.log("edit annoucnemnet data ", data);
        setEditAnnouncementData(data);
        toggleEditAnnouncementModal();
    }

    const editQuote = (data) => {
        setEditQuoteData(data);
        toggleEditQuoteModal();
    }
    console.log("edit Quote data ", editQuoteData);


    const announceDellMutate = useMutation({
        mutationFn: async (id) => await deleteAnnouncements(id),
        onSettled: async () => {
            await refetch();
            return toast.success("Announcement deleted successfully");
        }
    });

    const { data: announcemnets, isPending, isSuccess, isError, refetch, isRefetching } = useQuery({ queryKey: ["announcemnets", "quotes"], queryFn: getAllAnnouncements });

    if (isError) toast.error("Error while getting the data!");

    useEffect(() => {
        if (isSuccess) {
            if (announcemnets?.some(item => item.type === 'annoouncement')) {
                setIsAnnouncementExist(true);
            }
            if (announcemnets?.some(item => item.type === 'quote')) {
                setIsQuotesExist(true);
            }
        }
    }, [announcemnets]);

    return (
        isPending || isRefetching || announceDellMutate?.isPending ? <div className="flex flex-1"> <Loader /> </div> :
            <div className='flex flex-1 bg-[#f9f9f9]/50 font-poppins min-h-full'>
                <div className={`flex-grow w-full px-4 lg:px-10 sm:px-10 lg:ml-72`}>
                    <div className='min-h-full pb-10'>
                        <div className='flex'>
                            <Navbar heading={"Announcements"} />
                        </div>
                        <div className={`flex ${isBlurred ? "blur" : ""} `}>
                            <div className='flex flex-col gap-4 flex-1 relative'>
                                <div className='flex justify-between flex-wrap space-y-5 lg:space-y-0  items-center'>
                                    <div className='flex gap-2 text-xs lg:text-base'>
                                        <p onClick={announceClick} className={`cursor-pointer py-2 font-medium px-2 ${annouce ? "border-b-2 border-[#6A00FF]" : "text-black/50"} `}>Announcements</p>
                                        <p onClick={quoteClick} className={`cursor-pointer py-2 font-medium px-2 ${annouce ? "text-black/50" : "border-b-2 border-[#6A00FF]"} `}>Motivational Quotes</p>
                                    </div>
                                    <div className='flex gap-2 text-sm mb-5'>
                                        <div className='flex gap-2 border bg-white border-black/20 rounded-3xl py-1 px-2 items-center '>

                                            <FaSearch />
                                            <input
                                                value={searchText}
                                                onChange={(e) => { setSearchText(e.target.value) }}
                                                type="text"
                                                className='flex outline-none w-full'
                                                placeholder='Search Announcements'
                                            />

                                        </div>
                                        <div>
                                            <p onClick={() => { annouce ? toggleCreateAssignmentModal() : toggleQuoteModal() }} className='cursor-pointer px-6 py-2 rounded-3xl bg-[#6A00FF] text-white items-center flex justify-center'>Create</p>
                                        </div>
                                    </div>
                                </div>

                                {annouce ? [...announcemnets].reverse().map((item, index) => {
                                    if (item.type == "annoouncement") {

                                        if (searchText && ((item.title.toLocaleLowerCase()).includes(searchText.toLocaleLowerCase()) || (item.description.toLocaleLowerCase()).includes(searchText.toLocaleLowerCase()))) {
                                            return <AnnouncementCard refetch={refetch} editAnnouncement={editAnnouncement} deleteAnnouncement={announceDellMutate.mutate} key={index} announcement={item} />
                                        }

                                        if (searchText === "") {
                                            return <AnnouncementCard refetch={refetch} editAnnouncement={editAnnouncement} deleteAnnouncement={announceDellMutate.mutate} key={index} announcement={item} />
                                        }
                                    }

                                }) : [...announcemnets].reverse().map((item, index) => {
                                    if (item.type != "annoouncement") {

                                        if (searchText && ((item.title.toLocaleLowerCase()).includes(searchText.toLocaleLowerCase()) || (item.description.toLocaleLowerCase()).includes(searchText.toLocaleLowerCase()))) {
                                            return <QuoteCard refetch={refetch} editQuote={editQuote} deleteQuote={announceDellMutate.mutate} key={index} quote={item} />
                                        }

                                        if (searchText === "") {
                                            return <QuoteCard refetch={refetch} editQuote={editQuote} deleteQuote={announceDellMutate.mutate} key={index} quote={item} />
                                        }
                                    }
                                })}

                                {(annouce && !isAnnouncementExist) ? <div className='flex justify-center w-full py-4'><p className='font-medium text-3xl'>No Announcements to display</p></div>
                                    : (!annouce && !isQuotesExist) ? <div className='flex justify-center w-full py-4 font-medium sm:text-3xl text-xl'>No Quotes to display</div> : <></>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {createAnnouncementModal && <CreateAnnouncementModal refetch={refetch} open={createAnnouncementModal} isEditTrue={false} setopen={setCreateAnnouncementModal} />}
                {editAnnouncementModal && <CreateAnnouncementModal refetch={refetch} open={editAnnouncementModal} isEditTrue={true} setopen={setEditAnnouncementModal} announcementData={editAnnouncementData} />}

                {createQuoteModal && <CreateQuoteModal refetch={refetch} open={createQuoteModal} isEditTrue={false} setopen={setCreateQuoteModal} />}
                {editQuoteModal && <CreateQuoteModal refetch={refetch} open={editQuoteModal} isEditTrue={true} setopen={setEditQuoteModal} quoteData={editQuoteData} />}
            </div>
    )
}

export default Announcements

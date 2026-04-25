import React, { useState } from 'react'
import { LuClock, LuCalendar } from 'react-icons/lu'
import { MdOutlinePerson2 } from 'react-icons/md'
import { PiDotsThreeOutlineVerticalFill } from 'react-icons/pi'
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useSidebar } from '../../../context/SidebarContext';

const audienceConfig = {
    student: { label: 'Student', bg: '#E0F2FE', color: '#0369A1', border: '#BAE6FD' },
    parent: { label: 'Parent', bg: '#F0FDF4', color: '#15803D', border: '#DCFCE7' },
    teacher: { label: 'Teacher', bg: '#FFF7ED', color: '#C2410C', border: '#FFEDD5' },
    all: { label: 'Public', bg: '#EEF2FF', color: '#4338CA', border: '#E0E7FF' },
};

const AudienceBadge = ({ target }) => {
    const config = audienceConfig[target?.toLowerCase()] || audienceConfig['all'];
    return (
        <span className="px-3 py-1 rounded-full font-medium text-[10px] uppercase tracking-wider border transition-all duration-300"
            style={{
                backgroundColor: config.bg,
                color: config.color,
                borderColor: config.border,
            }}>
            {config.label}
        </span>
    );
};

const AnnouncementCard = ({ announcement, deleteAnnouncement, editAnnouncement, refetch }) => {
    const { isSidebarOpen } = useSidebar();
    const [showMenu, setShowMenu] = useState(false);

    const toggleMenu = () => setShowMenu(!showMenu);

    return (
        <div className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-xl hover:shadow-gray-200/50 transition-all  duration-300  sm:mb-4 overflow-visible">

            <div className="flex flex-col gap-4">

                {/* Header Section */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2 max-w-[85%]">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-800 leading-tight tracking-tight break-words">
                                {announcement.title}
                            </h3>
                            <AudienceBadge target={announcement.visibility} />
                        </div>

                        {/* Meta Data (Date & Time) */}
                        <div className="flex items-center gap-4 text-gray-400 text-[12px] font-medium">
                            <div className="flex items-center gap-1.5 group-hover:text-[#6A00FF] transition-colors">
                                <LuCalendar className="text-lg" />
                                <span>{announcement?.date?.split("T")[0]}</span>
                            </div>
                            <div className="flex items-center gap-1.5 group-hover:text-[#6A00FF] transition-colors">
                                <LuClock className="text-lg" />
                                <span>{announcement?.date?.split("T")[1].split(".")[0]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Menu (Dots) */}
                    <div className="relative">
                        <button
                            onClick={toggleMenu}
                            className={`p-2 rounded-xl hover:bg-gray-100 transition-colors ${showMenu ? 'bg-gray-100 text-[#6A00FF]' : 'text-gray-400'}`}
                        >
                            <PiDotsThreeOutlineVerticalFill size={20} />
                        </button>

                        {showMenu && (
                            <>
                                {/* Click outside to close */}
                                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)}></div>

                                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 shadow-2xl rounded-xl py-2 z-30 animate-in fade-in zoom-in duration-200">
                                    <button
                                        onClick={() => { editAnnouncement(announcement); setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-[#6A00FF]/5 hover:text-[#6A00FF] transition-all"
                                    >
                                        <FiEdit size={16} /> <span>Edit</span>
                                    </button>
                                    <div className="my-1 border-t border-gray-50"></div>
                                    <button
                                        onClick={() => { deleteAnnouncement(announcement.id); setShowMenu(false); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all"
                                    >
                                        <FiTrash2 size={16} /> <span>Delete</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Description Body */}
                <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-100 rounded-full group-hover:bg-[#6A00FF]/30 transition-all"></div>
                    <p className="pl-4 text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                        {announcement.description}
                    </p>
                </div>

            </div>

            {/* Subtle Gradient Hover Effect at bottom */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-transparent via-[#6A00FF] to-transparent group-hover:w-full transition-all duration-500 rounded-full"></div>
        </div>
    )
}

export default AnnouncementCard
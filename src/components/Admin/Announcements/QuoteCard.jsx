import React, { useState, useRef, useEffect } from 'react';
import { FiEdit, FiCalendar, FiClock, FiUser, FiMoreVertical } from 'react-icons/fi';
import { RiDeleteBin6Line } from 'react-icons/ri';

const QuoteCard = ({ quote, deleteQuote, editQuote, refetch }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMenu = () => setShowMenu(!showMenu);

    const DotsMenu = () => (
        <div ref={menuRef} className='absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-xl shadow-xl z-20 py-1 overflow-hidden transition-all duration-200 ease-in-out transform scale-100'>
            <button
                onClick={() => { editQuote(quote); refetch(); setShowMenu(false); }}
                className='w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 transition-colors'
            >
                <FiEdit className="text-blue-500" size={16} />
                <span className="font-medium">Edit Quote</span>
            </button>
            <div className='border-b border-gray-50'></div>
            <button
                onClick={() => { deleteQuote(quote.id); refetch(); setShowMenu(false); }}
                className='w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors'
            >
                <RiDeleteBin6Line size={16} />
                <span className="font-medium">Delete</span>
            </button>
        </div>
    );

    return (
        <div className='group relative bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out mb-4'>
            <div className='flex flex-col gap-4'>

                {/* Header Section */}
                <div className='flex justify-between items-start gap-4'>
                    <div className='space-y-1 flex-1'>
                        <h3 className='text-lg font-bold text-gray-800 leading-tight group-hover:text-blue-600 transition-colors'>
                            {quote.title}
                        </h3>
                        <p className='text-gray-500 text-sm leading-relaxed line-clamp-2'>
                            {quote.description}
                        </p>
                    </div>

                    {/* Action Menu */}
                    <div className='relative'>
                        <button
                            onClick={toggleMenu}
                            className='p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none'
                        >
                            <FiMoreVertical size={20} className='text-gray-400 group-hover:text-gray-600' />
                        </button>
                        {showMenu && <DotsMenu />}
                    </div>
                </div>

                {/* Footer Info Section */}
                <div className='flex flex-wrap items-center gap-y-3 gap-x-6 pt-4 border-t border-gray-50 mt-2'>

                    {/* Visibility/Status */}
                    <div className='flex items-center gap-2 text-gray-500'>
                        <div className="p-1.5 bg-blue-50 rounded-lg">
                            <FiCalendar size={14} className="text-blue-600" />
                        </div>
                        <span className='text-xs font-semibold uppercase tracking-wider'>{quote.visibility}</span>
                    </div>

                    {/* Date */}
                    <div className='flex items-center gap-2 text-gray-500'>
                        <div className="p-1.5 bg-purple-50 rounded-lg">
                            <FiUser size={14} className="text-purple-600" />
                        </div>
                        <span className='text-xs font-medium'>{quote?.date?.split("T")[0]}</span>
                    </div>

                    {/* Time */}
                    <div className='flex items-center gap-2 text-gray-500'>
                        <div className="p-1.5 bg-orange-50 rounded-lg">
                            <FiClock size={14} className="text-orange-600" />
                        </div>
                        <span className='text-xs font-medium'>{quote?.date?.split("T")[1]?.split(".")[0]}</span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default QuoteCard;
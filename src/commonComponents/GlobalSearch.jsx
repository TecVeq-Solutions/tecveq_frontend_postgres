import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoSearch, IoClose } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { BACKEND_URL } from "../constants/api";
import profilePlaceholder from "../assets/images/profilepic.png";
import { useBlur } from "../context/BlurContext";
import { useUser } from "../context/UserContext";

const GlobalSearch = ({ desktopOnly = false, mobileOnly = false }) => {
    const { userData } = useUser();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
    const navigate = useNavigate();
    const { toggleBlur } = useBlur();
    const searchRef = useRef(null);
    const mobileSearchRef = useRef(null);

    // Only show for teacher and admin
    if (userData?.userType === 'student' || userData?.userType === 'parent') {
        return null;
    }

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query.trim()) {
                handleSearch();
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [query]);

    // Handle clicks outside to close dropdowns
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BACKEND_URL}/search/students?q=${query}`, {
                withCredentials: true
            });
            setResults(response.data);
            setIsOpen(true);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (studentId) => {
        setIsOpen(false);
        setIsMobileSearchOpen(false);
        setQuery("");
        
        const role = userData?.userType;
        if (role === 'admin' || role === 'super_admin') {
            navigate(`/admin/student-profile/${studentId}`);
        } else if (role === 'teacher') {
            navigate(`/teacher/student-profile/${studentId}`);
        } else if (role === 'parent') {
            navigate(`/parent/student-profile/${studentId}`);
        } else {
            navigate(`/student/student-profile/${studentId}`);
        }
    };

    const SearchInput = ({ isMobile = false }) => (
        <div className={`group flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-2xl transition-all duration-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50 focus-within:border-indigo-400 shadow-sm ${isMobile ? 'w-full' : ''}`}>
            <IoSearch className="text-gray-400 text-xl group-focus-within:text-indigo-500 transition-colors" />
            <input
                type="text"
                autoFocus={isMobile}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search students (name, roll no)..."
                className="bg-transparent outline-none w-full text-[14px] text-gray-700 placeholder:text-gray-400 font-medium"
                onFocus={() => query.trim() && setIsOpen(true)}
            />
            {query && (
                <button
                    onClick={() => {
                        setQuery("");
                        setResults([]);
                        setIsOpen(false);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <IoClose className="text-gray-500 hover:text-red-500" />
                </button>
            )}
        </div>
    );

    const SuggestionsDropdown = ({ customClass = "" }) => (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`absolute top-full left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl z-[60] overflow-hidden mt-3 origin-top ${customClass}`}
                >
                    {loading ? (
                        <div className="p-6 flex flex-col items-center gap-2">
                            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs text-gray-400 font-medium tracking-wide">SEARCHING...</span>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                            <div className="px-3 py-2 bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Search Results ({results.length})
                            </div>
                            {results.map((student) => (
                                <div
                                    key={student.id}
                                    className="group flex items-center gap-4 p-3 hover:bg-indigo-50/50 cursor-pointer transition-all border-b border-gray-50 last:border-none mx-2 my-1 rounded-xl"
                                    onClick={() => handleSelect(student.id)}
                                >
                                    <div className="relative shrink-0">
                                        <img
                                            src={student.profilePic || profilePlaceholder}
                                            alt={student.name}
                                            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-indigo-200 transition-all shadow-sm"
                                        />
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                    </div>

                                    <div className="flex-grow min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className="font-bold text-gray-700 text-[13px] sm:text-[14px] truncate group-hover:text-indigo-700 transition-colors">
                                                {student.name}
                                            </p>
                                            <span className="shrink-0 text-[9px] sm:text-[10px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md font-bold shadow-sm">
                                                #{student.rollNo || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[11px] sm:text-[12px] text-gray-500 font-medium truncate">
                                                {student.level?.name || "No Level"}
                                            </p>
                                            <span className="text-gray-300">•</span>
                                            <p className="text-[11px] sm:text-[12px] text-indigo-500/80 font-semibold truncate">
                                                {student.classroomStudents?.[0]?.name || "Unassigned"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <div className="text-3xl mb-2 text-gray-300">🔍</div>
                            <p className="text-sm text-gray-500 font-medium">
                                No matches for "<span className="text-indigo-600 font-bold">{query}</span>"
                            </p>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="relative">
            {/* Desktop View - Hidden on mobile if mobileOnly is set, else hidden below lg */}
            {!mobileOnly && (
                <div className="hidden lg:block relative flex-grow max-w-md mx-4" ref={searchRef}>
                    <SearchInput />
                    <SuggestionsDropdown />
                </div>
            )}

            {/* Mobile/Tablet View - Hidden on desktop if desktopOnly is set, else hidden above lg */}
            {!desktopOnly && (
                <div className="lg:hidden flex items-center justify-center">
                    <button
                        onClick={() => setIsMobileSearchOpen(true)}
                        className="p-2 border cursor-pointer rounded-md border-black/50 transition-all duration-300 hover:text-indigo-600 bg-white/50 hover:bg-white shadow-sm"
                        aria-label="Open Search"
                    >
                        <IoSearch className="text-lg" />
                    </button>
                </div>
            )}

            {/* Mobile Search Popup Overlay - Independent of which icon triggered it */}
            <AnimatePresence>
                {isMobileSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex flex-col bg-white backdrop-blur-xl p-4 sm:p-6"
                    >
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="w-full max-w-2xl mx-auto bg-white shadow-md"
                            ref={mobileSearchRef}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <SearchInput isMobile={true} />
                                <button
                                    onClick={() => {
                                        setIsMobileSearchOpen(false);
                                        setQuery("");
                                        setIsOpen(false);
                                    }}
                                    className="p-3 bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-2xl transition-all"
                                >
                                    <IoClose className="text-2xl" />
                                </button>
                            </div>

                            {/* Suggestions inside Popup */}
                            <div className="relative mt-2">
                                <SuggestionsDropdown customClass="!static !mt-0 !border-0 !shadow-none !bg-transparent" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlobalSearch;


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { IoSearch, IoClose } from "react-icons/io5";
import { BACKEND_URL } from "../constants/api";
import profilePlaceholder from "../assets/images/profilepic.png";
import { useBlur } from "../context/BlurContext";
import { useUser } from "../context/UserContext";

const GlobalSearch = () => {
    const { userData } = useUser();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { toggleBlur } = useBlur();
    const searchRef = useRef(null);

    // Only show for teacher and admin
    if (userData?.userType === 'student' || userData?.userType === 'parent' || userData?.userType === 'teacher') {
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

    // Handle clicks outside to close dropdown
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
        setQuery("");
        navigate(`/student-profile/${studentId}`);
    };

    return (
        <div className="relative flex-grow max-w-md mx-4" ref={searchRef}>
            <div className="flex items-center gap-3 border bg-white border-black/10 px-4 py-2 rounded-full shadow-sm focus-within:shadow-md transition-shadow">
                <IoSearch className="text-gray-400 text-lg" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search students (name, roll no)..."
                    className="bg-transparent outline-none w-full text-sm"
                    onFocus={() => query.trim() && setIsOpen(true)}
                />
                {query && (
                    <IoClose
                        className="text-gray-400 cursor-pointer hover:text-red-500 transition-colors"
                        onClick={() => {
                            setQuery("");
                            setResults([]);
                            setIsOpen(false);
                        }}
                    />
                )}
            </div>

            {/* Suggestions Dropdown */}
            {isOpen && (
                <div className="absolute top-12 left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500 text-sm italic">
                            Searching...
                        </div>
                    ) : results.length > 0 ? (
                        <div className="max-h-80 overflow-y-auto">
                            {results.map((student) => (
                                <div
                                    key={student.id}
                                    className="flex items-center gap-3 p-3 hover:bg-indigo-50 cursor-pointer transition-colors border-b border-gray-50 last:border-none"
                                    onClick={() => handleSelect(student.id)}
                                >
                                    <img
                                        src={student.profilePic || profilePlaceholder}
                                        alt={student.name}
                                        className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                                    />
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-gray-800 text-sm truncate">{student.name}</p>
                                            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                                                {student.rollNo || "No Roll #"}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-500">
                                            {student.level?.name || "N/A"} • {student.classroomStudents?.[0]?.name || "Unassigned"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">
                            No students found matching "{query}"
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GlobalSearch;

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Search, Filter, X, Users, BookOpen, Clock } from 'lucide-react';
import { fetchStudentAttendanceReport, getMyAllClassroom } from '../../../api/Admin/classroomApi';
import { useMutation, useQuery } from '@tanstack/react-query';

import { Download } from "lucide-react";
import { useSidebar } from '../../../context/SidebarContext';


const INITIAL_FILTERS = {
    classroomId: '',
    subjectId: '',
    startDate: '',
    endDate: ''
};

const AttendanceReportComp = () => {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [isFilterExpanded, setIsFilterExpanded] = useState(true);
    const [attendanceData, setAttendanceData] = useState(null);
    const reportRef = useRef();
    const { isSidebarOpen, setIsSidebarOpen, isopen, setIsopen } = useSidebar();

    // Fetch classrooms
    const { data: myClassroomData, isPending: isLoadingClassrooms } = useQuery({
        queryKey: ["classroom"],
        queryFn: getMyAllClassroom
    });

    // Fetch attendance report
    const attendanceSearch = useMutation({
        mutationFn: fetchStudentAttendanceReport,
        onSuccess: (data) => {
            setAttendanceData(data);
        },
        onError: (error) => {
            console.error('Failed to fetch attendance data:', error);
        }
    });

    const classrooms = useMemo(() => myClassroomData?.data || [], [myClassroomData]);
    const studentReport = attendanceData?.data;

    // Get subjects for selected classroom
    const availableSubjects = useMemo(() => {
        if (!filters.classroomId || !classrooms.length) return [];

        const selectedClassroom = classrooms.find(classroom => classroom.id === filters.classroomId);
        if (!selectedClassroom?.teachers) return [];

        const subjects = selectedClassroom.teachers
            .map(teacher => teacher.subject)
            .filter(Boolean);

        return subjects.reduce((acc, current) => {
            const exists = acc.find(item => item.id === current.id);
            if (!exists) acc.push(current);
            return acc;
        }, []);
    }, [filters.classroomId, classrooms]);

    // Handle filter changes
    const handleFilterChange = useCallback((field, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [field]: value };
            // Reset subject when classroom changes
            if (field === 'classroomId') {
                newFilters.subjectId = '';
            }
            return newFilters;
        });
    }, []);

    const handleReset = useCallback(() => {
        setFilters(INITIAL_FILTERS);
        setAttendanceData(null);
    }, []);

    // Calculate active filters
    const activeFiltersCount = useMemo(() =>
        Object.values(filters).filter(Boolean).length, [filters]
    );

    // Handle search
    const handleSearch = useCallback(async () => {
        if (!filters.classroomId) {
            alert('Please select a classroom');
            return;
        }

        if (filters.startDate && filters.endDate && new Date(filters.startDate) > new Date(filters.endDate)) {
            alert('Start date cannot be after end date');
            return;
        }

        const searchPayload = {
            classroomId: filters.classroomId,
            subjectId: filters.subjectId || null,
            startDate: filters.startDate || null,
            endDate: filters.endDate || null
        };

        console.log(searchPayload, "search")

        attendanceSearch.mutate(searchPayload);
    }, [filters, attendanceSearch]);

    // Get display names
    const selectedClassroomName = useMemo(() => {
        if (!filters.classroomId) return '';
        const classroom = classrooms.find(c => c.id === filters.classroomId);
        return classroom ? `${classroom.name} - ${classroom.level?.name || 'N/A'}` : '';
    }, [filters.classroomId, classrooms]);

    const selectedSubjectName = useMemo(() => {
        if (!filters.subjectId) return '';
        const subject = availableSubjects.find(s => s.id === filters.subjectId);
        return subject?.name || '';
    }, [filters.subjectId, availableSubjects]);

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString() : '';
    };

    if (isLoadingClassrooms) {
        return (
            <div className="bg-white  border border-[#e5e7eb] rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563eb] mx-auto"></div>
                    <p className="mt-2 text-[#6b7280]">Loading classrooms...</p>
                </div>
            </div>
        );
    }


    const handlePrint = () => {
        const content = reportRef.current.innerHTML;
        const win = window.open('', '', 'width=800,height=600');
        win.document.write(`
    <html>
      <head>
        <title>Print Report</title>
        <style>
          .export-button { display: none !important; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>${content}</body>
    </html>
  `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
    };

    return (
        <div className="bg-white border mt-10 border-[#e5e7eb] rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-[#6A00FF] px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
                        <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base sm:text-xl font-bold text-white ">Attendance Report Filters</h2>
                            <p className="text-[#bfdbfe] text-xs sm:text-sm hidden sm:block">Configure your search parameters</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {activeFiltersCount > 0 && (
                            <div className="bg-white/20 px-2 sm:px-3 py-1 rounded-full">
                                <span className="text-white text-xs sm:text-sm font-medium">
                                    {activeFiltersCount} active
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                            className={`bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors ${isSidebarOpen ? "-z-50" : "z-auto"}`}
                        >
                            <Filter className={`h-4 w-4 text-white transition-transform ${isFilterExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter Content */}
            {isFilterExpanded && (
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                        {/* Classroom Selection */}
                        <div className="space-y-2 sm:space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-[#374151]">
                                <Users className="h-4 w-4 text-[#2563eb] flex-shrink-0" />
                                <span>Select Classroom</span>
                            </label>
                            <div className={`${isSidebarOpen ? "-z-50" : "z-auto"}`}>
                                <select
                                    value={filters.classroomId}
                                    onChange={(e) => handleFilterChange('classroomId', e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent transition-all duration-200 appearance-none bg-white text-sm"
                                >
                                    <option value="">Choose a classroom...</option>
                                    {classrooms.map(classroom => (
                                        <option key={classroom.id} value={classroom.id}>
                                            {classroom.name} - {classroom.level?.name || 'N/A'} ({classroom.students?.length || 0} students)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Subject Selection */}
                        <div className="space-y-2 sm:space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-[#374151]">
                                <BookOpen className="h-4 w-4 text-[#059669] flex-shrink-0" />
                                <span>Select Subject</span>
                            </label>
                            <div className={`relative ${isSidebarOpen ? "-z-50" : "z-auto"}`}>
                                <select
                                    value={filters.subjectId}
                                    onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                                    disabled={!filters.classroomId || availableSubjects.length === 0}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent transition-all duration-200 appearance-none bg-white disabled:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-60 text-sm"
                                >
                                    <option value="">Choose a subject...</option>
                                    {availableSubjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                    <svg className="h-5 w-5 text-[#9ca3af]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            {!filters.classroomId && (
                                <p className="text-xs text-[#6b7280] flex items-center">
                                    <span className="w-2 h-2 bg-[#f59e0b] rounded-full mr-2 flex-shrink-0"></span>
                                    Select a classroom first
                                </p>
                            )}
                        </div>

                        {/* Start Date */}
                        <div className="space-y-2 sm:space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-[#374151]">
                                <Clock className="h-4 w-4 text-[#7c3aed] flex-shrink-0" />
                                <span>Start Date</span>
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-all duration-200 text-sm"
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-2 sm:space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-semibold text-[#374151]">
                                <Clock className="h-4 w-4 text-[#7c3aed] flex-shrink-0" />
                                <span>End Date</span>
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                min={filters.startDate}
                                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#d1d5db] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8b5cf6] focus:border-transparent transition-all duration-200 text-sm"
                            />
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {activeFiltersCount > 0 && (
                        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#f9fafb] rounded-lg border border-[#e5e7eb]">
                            <div className="flex items-center justify-between mb-2 sm:mb-3">
                                <h3 className="text-sm font-semibold text-[#374151] flex items-center">
                                    <span className="w-2 h-2 bg-[#2563eb] rounded-full mr-2 flex-shrink-0"></span>
                                    Active Filters ({activeFiltersCount})
                                </h3>
                                <button
                                    onClick={handleReset}
                                    className="text-xs text-[#6b7280] hover:text-[#6A00FF] transition-colors flex items-center flex-shrink-0"
                                >
                                    <X className="h-3 w-3 mr-1" />
                                    Clear all
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {filters.classroomId && (
                                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#dbeafe] text-[#1e40af] border border-[#93c5fd]">
                                        <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate max-w-[120px] sm:max-w-none">{selectedClassroomName}</span>
                                        <button
                                            onClick={() => handleFilterChange('classroomId', '')}
                                            className="ml-1 hover:text-[#2563eb] flex-shrink-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.subjectId && (
                                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#dcfce7] text-[#166534] border border-[#bbf7d0]">
                                        <BookOpen className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span className="truncate max-w-[100px] sm:max-w-none">{selectedSubjectName}</span>
                                        <button
                                            onClick={() => handleFilterChange('subjectId', '')}
                                            className="ml-1 hover:text-[#059669] flex-shrink-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.startDate && (
                                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#f3e8ff] text-[#7c2d12] border border-[#e9d5ff]">
                                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                        From: {formatDate(filters.startDate)}
                                        <button
                                            onClick={() => handleFilterChange('startDate', '')}
                                            className="ml-1 hover:text-[#7c3aed] flex-shrink-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                                {filters.endDate && (
                                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-[#f3e8ff] text-[#7c2d12] border border-[#e9d5ff]">
                                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                                        To: {formatDate(filters.endDate)}
                                        <button
                                            onClick={() => handleFilterChange('endDate', '')}
                                            className="ml-1 hover:text-[#7c3aed] flex-shrink-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-end mt-4 sm:mt-6 pt-4 border-t border-[#e5e7eb]">
                        <button
                            onClick={handleReset}
                            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border border-[#d1d5db] text-[#374151] rounded-lg hover:bg-[#f9fafb] focus:outline-none focus:ring-2 focus:ring-[#6b7280] focus:ring-offset-2 transition-all duration-200 font-medium text-sm"
                        >
                            Reset All Filters
                        </button>
                        <button
                            onClick={handleSearch}
                            disabled={!filters.classroomId || attendanceSearch.isPending}
                            className={`w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-[#6A00FF] text-white rounded-lg hover:from-[#1d4ed8] hover:to-[#1e40af] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm ${isSidebarOpen ? "-z-50" : "z-auto"}`}
                        >
                            {attendanceSearch.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Search className="h-4 w-4" />
                                    Generate Report
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results Table */}
                    <section ref={reportRef}>
                        {studentReport && studentReport.length > 0 && (
                            <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex flex-row justify-between items-center px-0 sm:px-4 mb-4 sm:mb-6 gap-2">
                                    <h3 className="text-lg sm:text-2xl font-semibold text-gray-800">
                                        Attendance Report Results
                                    </h3>
                                    <button
                                        onClick={handlePrint}
                                        className="export-button inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#6A00FF] hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm flex-shrink-0"
                                    >
                                        <Download size={16} />
                                        <span className="hidden xs:inline">Export</span>
                                    </button>
                                </div>
                                <div className="overflow-x-auto -mx-3 sm:mx-0">
                                    <div className="min-w-full inline-block align-middle px-3 sm:px-0">
                                        <table className="w-full border-collapse border border-gray-300 text-xs sm:text-sm">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left whitespace-nowrap">No.</th>
                                                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left whitespace-nowrap">Student</th>
                                                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left whitespace-nowrap">Classroom</th>
                                                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left whitespace-nowrap">Subject</th>
                                                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left whitespace-nowrap">Date</th>
                                                    <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left whitespace-nowrap">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentReport.map((item, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="border border-gray-300 px-2 sm:px-4 py-2">{index + 1}</td>
                                                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                                                            <span className="block font-medium">{item.studentName}</span>
                                                            <span className="text-gray-500 text-xs">({item.rollNo})</span>
                                                        </td>
                                                        <td className="border border-gray-300 px-2 sm:px-4 py-2 whitespace-nowrap">{item.classroomName}</td>
                                                        <td className="border border-gray-300 px-2 sm:px-4 py-2 whitespace-nowrap">{item.subjectName}</td>
                                                        <td className="border border-gray-300 px-2 sm:px-4 py-2 whitespace-nowrap">{formatDate(item.date)}</td>
                                                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                                                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium whitespace-nowrap ${item.status === 'present'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {studentReport && studentReport.length === 0 && (
                        <div className="mt-4 sm:mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-yellow-800 text-center text-sm">No attendance records found for the selected criteria.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttendanceReportComp;

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Search, Filter, BookOpen, Clock, Download } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useUser } from '../../../context/UserContext';
import { fetchStudentAttendanceReport } from '../../../api/Admin/classroomApi';
import { getAllSubjects as fetchStudentSubjects } from '../../../api/Student/Subjects';

const INITIAL_FILTERS = {
    subjectId: '',
    startDate: '',
    endDate: ''
};

const AttendenceReportComp = () => {
    const { userData } = useUser();
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [isFilterExpanded, setIsFilterExpanded] = useState(true);
    const [attendanceData, setAttendanceData] = useState(null);
    const reportRef = useRef();

    // Fetch student's enrolled subjects
    const { data: subjectsData, isPending: isLoadingSubjects } = useQuery({
        queryKey: ["myEnrolledSubjects", userData?.id],
        queryFn: () => fetchStudentSubjects(userData?.id, true),
        enabled: !!userData?.id
    });

    const subjects = useMemo(() => {
        // Based on SubjectsEnrolled.jsx line 161
        const rawData = subjectsData?.subjects || subjectsData || [];
        return Array.isArray(rawData) ? rawData.map(item => ({
            id: item.subject?.id || item.id,
            name: item.subject?.name || item.name
        })) : [];
    }, [subjectsData]);

    // Fetch attendance report mutation
    const attendanceSearch = useMutation({
        mutationFn: fetchStudentAttendanceReport,
        onSuccess: (data) => {
            setAttendanceData(data);
        },
        onError: (error) => {
            console.error('Failed to fetch attendance data:', error);
        }
    });

    const studentReport = attendanceData?.data;

    const handleFilterChange = useCallback((field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleReset = useCallback(() => {
        setFilters(INITIAL_FILTERS);
        setAttendanceData(null);
    }, []);

    const handleSearch = useCallback(async () => {
        if (!filters.subjectId) {
            alert('Please select a Subject');
            return;
        }

        const searchPayload = {
            subjectId: filters.subjectId,
            studentId: userData?.id,
            startDate: filters.startDate || null,
            endDate: filters.endDate || null
        };

        attendanceSearch.mutate(searchPayload);
    }, [filters, attendanceSearch, userData]);

    const getDisplayName = (id) => subjects.find(s => s.id === id)?.name || '';

    const formatDate = (dateString) => {
        return dateString ? new Date(dateString).toLocaleDateString() : '';
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        const date = new Date(timeString);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handlePrint = () => {
        const content = reportRef.current.innerHTML;
        const win = window.open('', '', 'width=1000,height=800');
        win.document.write(`
            <html>
                <head>
                    <title>Attendance Report</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        .export-button { display: none !important; }
                        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                        th { background-color: #f3f4f6; }
                        .status-present { color: #059669; font-weight: bold; }
                        .status-absent { color: #dc2626; font-weight: bold; }
                        .header { margin-bottom: 30px; border-bottom: 2px solid #6A00FF; padding-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Personal Attendance Report</h2>
                        <p>Student: ${userData?.name}</p>
                        <p>Subject: ${getDisplayName(filters.subjectId)}</p>
                        <p>Date Range: ${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}</p>
                    </div>
                    ${content}
                </body>
            </html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => {
            win.print();
            win.close();
        }, 500);
    };

    return (
        <div className="bg-white border mt-6 border-[#e5e7eb] rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#6A00FF] to-[#4A00E0] px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20">
                            <Filter className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Search Attendance</h2>
                            <p className="text-indigo-100 text-sm opacity-80">View your attendance history</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all duration-200"
                    >
                        <Filter className={`h-5 w-5 text-white transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filter Content */}
            {isFilterExpanded && (
                <div className="p-6 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Subject */}
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                                <BookOpen className="h-4 w-4 text-[#EA580C]" />
                                <span>Subject</span>
                            </label>
                            <select
                                value={filters.subjectId}
                                onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EA580C] outline-none text-sm font-medium"
                            >
                                <option value="">{isLoadingSubjects ? 'Loading...' : 'Choose a subject...'}</option>
                                {subjects.map(subject => (
                                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                                <Clock className="h-4 w-4 text-[#7c3aed]" />
                                <span>Start Date</span>
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7c3aed] outline-none text-sm font-medium"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                                <Clock className="h-4 w-4 text-[#7c3aed]" />
                                <span>End Date</span>
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                min={filters.startDate}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7c3aed] outline-none text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
                        <button onClick={handleReset} className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 text-sm font-bold">Reset</button>
                        <button
                            onClick={handleSearch}
                            disabled={attendanceSearch.isPending}
                            className="px-8 py-3 bg-gradient-to-r from-[#6A00FF] to-[#4A00E0] text-white rounded-xl hover:shadow-lg font-bold flex items-center gap-3"
                        >
                            {attendanceSearch.isPending ? 'Fetching...' : <><Search size={18} /><span>View Records</span></>}
                        </button>
                    </div>

                    {/* Results */}
                    {studentReport && (
                        <div className="mt-12" ref={reportRef}>
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Attendance Record</h3>
                                <button
                                    onClick={handlePrint}
                                    className="export-button flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all text-sm"
                                >
                                    <Download size={18} />
                                    <span>Export Report</span>
                                </button>
                            </div>

                            {studentReport.length > 0 ? (
                                <div className="overflow-hidden border border-gray-200 rounded-2xl shadow-sm bg-white">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50/50 border-b border-gray-200">
                                                    <th className="px-6 py-4 text-left font-black text-gray-700 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-4 text-left font-black text-gray-700 uppercase tracking-wider">Class Title</th>
                                                    <th className="px-6 py-4 text-left font-black text-gray-700 uppercase tracking-wider">Time</th>
                                                    <th className="px-6 py-4 text-left font-black text-gray-700 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {studentReport.map((item, index) => (
                                                    <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                                                        <td className="px-6 py-5 font-medium text-gray-900">{formatDate(item.date)}</td>
                                                        <td className="px-6 py-5 text-gray-600 font-medium">{item.classTitle}</td>
                                                        <td className="px-6 py-5 text-gray-600 font-medium">
                                                            {formatTime(item.startTime || item.startEventDate)} - {formatTime(item.endTime || item.endEventDate)}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase ${
                                                                item.status === 'present' ? 'bg-emerald-100 text-emerald-800' : 
                                                                item.status === 'present-late' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                                                            }`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-200 flex flex-wrap gap-8">
                                        <div className="flex flex-col"><span className="text-gray-500 text-[10px] font-black uppercase">Total Classes</span><span className="text-xl font-black text-gray-900">{studentReport.length}</span></div>
                                        <div className="flex flex-col"><span className="text-emerald-600 text-[10px] font-black uppercase">Present</span><span className="text-xl font-black text-emerald-700">{studentReport.filter(r => r.status.includes('present')).length}</span></div>
                                        <div className="flex flex-col"><span className="text-rose-600 text-[10px] font-black uppercase">Absent</span><span className="text-xl font-black text-rose-700">{studentReport.filter(r => r.status === 'absent').length}</span></div>
                                        <div className="flex flex-col"><span className="text-blue-600 text-[10px] font-black uppercase">Attendance %</span><span className="text-xl font-black text-blue-700">
                                            {((studentReport.filter(r => r.status.includes('present')).length / studentReport.length) * 100).toFixed(1)}%
                                        </span></div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 p-12 rounded-3xl text-center font-bold text-amber-800">No records found for the selected criteria.</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttendenceReportComp;

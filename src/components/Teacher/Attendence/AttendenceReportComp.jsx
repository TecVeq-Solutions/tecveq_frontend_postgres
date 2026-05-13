import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Search, Filter, Users, BookOpen, Clock, Download } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getMyStudentsForReport, getMyTeacherStudentSubjects } from '../../../api/Teacher/StudentReport';
import { fetchStudentAttendanceReport } from '../../../api/Admin/classroomApi';

const INITIAL_FILTERS = {
    studentId: '',
    subjectId: '',
    classroomId: '',
    startDate: '',
    endDate: ''
};

const AttendenceReportComp = () => {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [isFilterExpanded, setIsFilterExpanded] = useState(true);
    const [attendanceData, setAttendanceData] = useState(null);
    const reportRef = useRef();

    // Fetch students assigned to teacher
    const { data: studentsData, isPending: isLoadingStudents } = useQuery({
        queryKey: ["myStudentsForReport"],
        queryFn: getMyStudentsForReport
    });

    // Fetch subjects for selected student
    const { data: subjectsData, isPending: isLoadingSubjects } = useQuery({
        queryKey: ["myStudentSubjects", filters.studentId],
        queryFn: () => getMyTeacherStudentSubjects(filters.studentId),
        enabled: !!filters.studentId
    });

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

    const students = useMemo(() => studentsData?.data || [], [studentsData]);
    const subjects = useMemo(() => subjectsData?.data || [], [subjectsData]);
    const studentReport = attendanceData?.data;

    const handleFilterChange = useCallback((field, value) => {
        setFilters(prev => {
            const newFilters = { ...prev, [field]: value };
            if (field === 'studentId') {
                newFilters.subjectId = '';
                newFilters.classroomId = '';
            } else if (field === 'subjectId') {
                const selectedSub = subjects.find(s => s.id === value);
                newFilters.classroomId = selectedSub?.classroomId || '';
            }
            return newFilters;
        });
    }, [subjects]);

    const handleReset = useCallback(() => {
        setFilters(INITIAL_FILTERS);
        setAttendanceData(null);
    }, []);

    const handleSearch = useCallback(async () => {
        if (!filters.studentId || !filters.subjectId) {
            alert('Please select a Student and Subject');
            return;
        }

        const searchPayload = {
            subjectId: filters.subjectId,
            studentId: filters.studentId,
            classroomId: filters.classroomId,
            startDate: filters.startDate || null,
            endDate: filters.endDate || null
        };

        attendanceSearch.mutate(searchPayload);
    }, [filters, attendanceSearch]);

    const getDisplayName = (type, id) => {
        if (type === 'student') return students.find(s => s.id === id)?.name || '';
        if (type === 'subject') return subjects.find(s => s.id === id)?.name || '';
        return '';
    };

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
                        .header { margin-bottom: 30px; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Attendance Report</h2>
                        <p>Student: ${getDisplayName('student', filters.studentId)}</p>
                        <p>Subject: ${getDisplayName('subject', filters.subjectId)}</p>
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
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 px-3 sm:px-6 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20">
                            <Filter className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Attendance Insights</h2>
                            <p className="text-indigo-100 text-sm opacity-80">Analyze student consistency and patterns</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all duration-200 border border-white/10 shadow-inner"
                    >
                        <Filter className={`h-5 w-5 text-white transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filter Content */}
            {isFilterExpanded && (
                <div className="p-3 sm:p-6 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Student */}
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                                <Users className="h-4 w-4 text-indigo-600" />
                                <span>Select Student</span>
                            </label>
                            <div className="relative group">
                                <select
                                    value={filters.studentId}
                                    onChange={(e) => handleFilterChange('studentId', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 outline-none appearance-none group-hover:bg-white group-hover:border-indigo-300 text-sm font-medium text-gray-800"
                                >
                                    <option value="">{isLoadingStudents ? 'Loading students...' : 'Choose student...'}</option>
                                    {students.map(student => (
                                        <option key={student.id} value={student.id}>{student.name} ({student.rollNo})</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                                <BookOpen className="h-4 w-4 text-violet-600" />
                                <span>Subject</span>
                            </label>
                            <div className="relative group">
                                <select
                                    value={filters.subjectId}
                                    onChange={(e) => handleFilterChange('subjectId', e.target.value)}
                                    disabled={!filters.studentId}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 outline-none appearance-none group-hover:bg-white group-hover:border-violet-300 text-sm font-medium text-gray-800 disabled:opacity-50"
                                >
                                    <option value="">{isLoadingSubjects ? 'Loading subjects...' : 'Choose subject...'}</option>
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>{subject.name} - {subject.classroomName}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        </div>

                        {/* Start Date */}
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                                <Clock className="h-4 w-4 text-emerald-600" />
                                <span>Start Date</span>
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 outline-none text-sm font-medium text-gray-800"
                            />
                        </div>

                        {/* End Date */}
                        <div className="space-y-3">
                            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700">
                                <Clock className="h-4 w-4 text-emerald-600" />
                                <span>End Date</span>
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                min={filters.startDate}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 outline-none text-sm font-medium text-gray-800"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-end pt-8 border-t border-gray-100">
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-200 font-bold text-sm shadow-sm"
                        >
                            Reset Filters
                        </button>
                        <button
                            onClick={handleSearch}
                            disabled={!filters.subjectId || !filters.studentId || attendanceSearch.isPending}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 font-bold shadow-md disabled:opacity-50 disabled:scale-100 text-sm"
                        >
                            {attendanceSearch.isPending ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                    <span>Fetching...</span>
                                </div>
                            ) : (
                                <>
                                    <Search className="h-4 w-4" />
                                    <span>Generate Report</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Results Section */}
                    {studentReport && (
                        <div className="mt-12 animate-in fade-in zoom-in duration-500" ref={reportRef}>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Record Summary</h3>
                                    <p className="text-gray-500 text-sm mt-1">
                                        Data for {getDisplayName('student', filters.studentId)} in {getDisplayName('subject', filters.subjectId)}
                                    </p>
                                </div>
                                <button
                                    onClick={handlePrint}
                                    className="export-button group flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all duration-200 text-sm"
                                >
                                    <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                                    <span>Export Report</span>
                                </button>
                            </div>

                            {studentReport.length > 0 ? (
                                <div className="overflow-hidden border border-gray-200 rounded-2xl shadow-sm bg-white">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="px-6 py-4 text-left font-black text-gray-700 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-4 text-left font-black text-gray-700 uppercase tracking-wider">Class Title</th>
                                                    <th className="px-6 py-4 text-left font-black text-gray-700 uppercase tracking-wider">Start Time</th>
                                                    <th className="px-6 py-4 text-left font-black text-gray-700 uppercase tracking-wider">End Time</th>
                                                    <th className="px-6 py-4 text-left font-black text-gray-700 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {studentReport.sort((a, b) => new Date(a.date) - new Date(b.date)).map((item, index) => (
                                                    <tr key={index} className="hover:bg-indigo-50/30 transition-colors duration-150">
                                                        <td className="px-6 py-5 font-medium text-gray-900">{formatDate(item.date)}</td>
                                                        <td className="px-6 py-5 text-gray-600 font-medium">{item.classTitle}</td>
                                                        <td className="px-6 py-5 text-gray-600 font-medium">{formatTime(item.startTime || item.startEventDate)}</td>
                                                        <td className="px-6 py-5 text-gray-600 font-medium">{formatTime(item.endTime || item.endEventDate)}</td>
                                                        <td className="px-6 py-5">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase ${item.status === 'present'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : item.status === 'present-late'
                                                                    ? 'bg-amber-100 text-amber-800'
                                                                    : 'bg-rose-100 text-rose-800'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${item.status === 'present' ? 'bg-emerald-500' : item.status === 'present-late' ? 'bg-amber-500' : 'bg-rose-500'
                                                                    }`}></span>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Summary Stats */}
                                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-wrap gap-8">
                                        <div className="flex flex-col">
                                            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Total Sessions</span>
                                            <span className="text-xl font-black text-gray-900">{studentReport.length}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-emerald-600 text-[10px] font-black uppercase tracking-widest">Present</span>
                                            <span className="text-xl font-black text-emerald-700">{studentReport.filter(r => r.status === 'present' || r.status === 'present-late').length}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-rose-600 text-[10px] font-black uppercase tracking-widest">Absent</span>
                                            <span className="text-xl font-black text-rose-700">{studentReport.filter(r => r.status === 'absent').length}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Attendance %</span>
                                            <span className="text-xl font-black text-indigo-700">
                                                {((studentReport.filter(r => r.status === 'present' || r.status === 'present-late').length / studentReport.length) * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-amber-50 border border-amber-200 p-12 rounded-3xl text-center">
                                    <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Filter className="h-8 w-8 text-amber-600" />
                                    </div>
                                    <h4 className="text-xl font-black text-amber-900 tracking-tight">No records found</h4>
                                    <p className="text-amber-700 mt-2 max-w-xs mx-auto">We couldn't find any attendance data for the selected criteria and date range.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AttendenceReportComp;

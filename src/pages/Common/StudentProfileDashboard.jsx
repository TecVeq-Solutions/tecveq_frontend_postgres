import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoArrowBack, IoPerson, IoBook, IoCalendar, IoWallet,
    IoChatbubbleEllipses, IoTime, IoEllipsisVertical,
    IoDocumentText, IoWarning, IoLibrary, IoBus,
    IoSchool, IoDownload, IoMail, IoCall, IoStar,
    IoTrendingUp, IoCheckmarkCircle, IoCloseCircle, IoList, IoClose
} from "react-icons/io5";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import moment from "moment";
import LargeLoader from "../../utils/LargeLoader";
import { getStudentCompleteProfile, addStudentNote } from "../../api/User/UserApi";
import { sendQuickMessage } from "../../api/UserApis";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import profilePlaceholder from "../../assets/images/profilepic.png";
import { useUser } from "../../context/UserContext";
import AdminNavbar from "../../components/Admin/Navbar";
import StudentNavbar from "../../components/Student/Dashboard/Navbar";
import ParentNavbar from "../../components/Parent/Dashboard/Navbar";
import TeacherNavbar from "../../components/Teacher/Navbar";

/* ── Design tokens & patterns ─────────────────────────────────── */
const dotPattern = `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1.2' fill='%236366f1' fill-opacity='0.07'/%3E%3C/svg%3E")`;
const gridPattern = `url("data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h32v32H0z' fill='none'/%3E%3Cpath d='M0 32V0M32 0v32' stroke='%236366f1' stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E")`;

const StudentProfileDashboard = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { userData } = useUser();
    const [activeTab, setActiveTab] = useState("overview");
    const queryClient = useQueryClient();

    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteContent, setNoteContent] = useState("");
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [messageText, setMessageText] = useState("");

    const addNoteMutation = useMutation({
        mutationFn: (content) => addStudentNote({ studentID: studentId, content }),
        onSuccess: () => {
            queryClient.invalidateQueries(["studentCompleteProfile", studentId]);
            toast.success("Note added successfully");
            setNoteContent("");
            setIsNoteModalOpen(false);
        },
        onError: (err) => toast.error(err.message || "Failed to add note")
    });

    const sendMessageMutation = useMutation({
        mutationFn: (text) => sendQuickMessage({ receiverId: data?.basicInfo?.guardianId, message: text }),
        onSuccess: () => {
            toast.success("Message sent to parent");
            setMessageText("");
            setIsMessageModalOpen(false);
        },
        onError: (err) => toast.error(err.message || "Failed to send message")
    });

    const handleDownloadReport = () => {
        if (!data) return;
        const student = data.basicInfo;
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Student Comprehensive Report: " + student.name + "\n";
        csvContent += "Roll No," + (student.rollNo || "N/A") + "\n";
        csvContent += "Email," + student.email + "\n";
        csvContent += "Level," + (student.level?.name || "N/A") + "\n";
        csvContent += "Classroom," + (student.classroomStudents?.[0]?.name || "N/A") + "\n\n";
        csvContent += "ATTENDANCE SUMMARY\n";
        csvContent += "Total Sessions," + (attendance?.length + classAttendance?.length) + "\n";
        csvContent += "Attendance Percentage," + attendancePct + "%\n\n";
        csvContent += "SUBJECT WISE ATTENDANCE\n";
        csvContent += "Subject,Teacher,Present,Late,Absent,Total,Percentage\n";
        subjectAttendance.forEach(s => {
            csvContent += `"${s.name}","${s.teacher || 'N/A'}",${s.present},${s.late},${s.absent},${s.total},${s.percentage}%\n`;
        });
        csvContent += "\n";
        csvContent += "DETAILED ATTENDANCE LOG\n";
        csvContent += "Date,Day,Session/Class Title,Type,Status,Classroom/Info\n";
        unifiedAttendanceHistory.forEach(record => {
            const status = record.isPresent ? (record.late ? "Late" : "Present") : "Absent";
            const dateStr = moment(record.date).format('YYYY-MM-DD');
            const dayStr = moment(record.date).format('dddd');
            csvContent += `"${dateStr}","${dayStr}","${record.title}","${record.type}","${status}","${record.subtitle || 'N/A'}"\n`;
        });
        csvContent += "\n";
        csvContent += "ACADEMIC PERFORMANCE\n";
        csvContent += "Type,Subject,Title,Marks,Total,Grade,Date\n";
        data.assignments.forEach(a => {
            csvContent += `Assignment,"${a.assignment?.subject?.name || 'N/A'}","${a.assignment.title}",${a.marks || 0},${a.assignment.totalMarks},"${a.grade || 'Pending'}","${moment(a.submittedAt).format('YYYY-MM-DD')}"\n`;
        });
        data.quizzes.forEach(q => {
            csvContent += `Quiz,"${q.quiz?.subject?.name || 'N/A'}","${q.quiz.title}",${q.marks || 0},${q.quiz.totalMarks},"${q.grade || 'Pending'}","${moment(q.submittedAt).format('YYYY-MM-DD')}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${student.name}_Academic_Report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["studentCompleteProfile", studentId],
        queryFn: () => getStudentCompleteProfile(studentId),
        enabled: !!studentId
    });

    if (isLoading) return (
        <div className="h-screen w-full flex items-center justify-center bg-[#F0F2FF]">
            <LargeLoader />
        </div>
    );
    if (error) return (
        <div className="p-10 text-center text-red-500 font-medium">
            Error loading student profile. {error.message}
        </div>
    );

    const {
        basicInfo, attendance, assignments, quizzes, fees,
        notifications, leaves, discipline, certificates,
        library, transport, notes, classes, performanceTrends, classAttendance
    } = data;

    const tabs = [
        { id: "overview", label: "Overview", icon: <IoPerson size={15} /> },
        { id: "academic", label: "Academics", icon: <IoSchool size={15} /> },
        { id: "attendance", label: "Attendance", icon: <IoCalendar size={15} /> },
        { id: "fees", label: "Fees", icon: <IoWallet size={15} /> },
        { id: "timetable", label: "Timetable", icon: <IoTime size={15} /> },
        { id: "more", label: "More", icon: <IoEllipsisVertical size={15} /> }
    ];

    const calculateAttendancePercentage = () => {
        const dailyTotal = attendance?.length || 0;
        const dailyPresent = attendance?.filter(a => a.isPresent || a.late).length || 0;
        const sessionTotal = classAttendance?.length || 0;
        const sessionPresent = classAttendance?.filter(a => a.isPresent || a.late).length || 0;
        const totalRecords = dailyTotal + sessionTotal;
        const totalPresent = dailyPresent + sessionPresent;
        if (totalRecords === 0) return 0;
        return Math.round((totalPresent / totalRecords) * 100);
    };

    const attendancePct = calculateAttendancePercentage();
    const circumference = 2 * Math.PI * 52;

    const getSubjectWiseAttendance = () => {
        const subjectsMap = new Map();
        classes?.forEach(cls => {
            const sId = cls.subject?.id;
            if (sId && !subjectsMap.has(sId)) {
                subjectsMap.set(sId, {
                    id: sId, name: cls.subject.name, teacher: cls.teacher?.name,
                    present: 0, absent: 0, late: 0, total: 0
                });
            }
        });
        classAttendance?.forEach(record => {
            const subjectId = record.class?.subject?.id;
            if (!subjectId) return;
            const stats = subjectsMap.get(subjectId);
            if (stats) {
                stats.total++;
                if (record.late) stats.late++;
                else if (record.isPresent) stats.present++;
                else stats.absent++;
            }
        });
        return Array.from(subjectsMap.values()).map(s => ({
            ...s,
            percentage: s.total > 0 ? Math.round(((s.present + s.late) / s.total) * 100) : 0
        }));
    };

    const subjectAttendance = getSubjectWiseAttendance();

    const unifiedAttendanceHistory = [
        ...(attendance || []).map(a => ({
            id: a.id, date: a.attendance?.date, isPresent: a.isPresent, late: a.late,
            type: 'General', title: 'General Attendance', subtitle: 'Daily School Record'
        })),
        ...(classAttendance || []).map(c => ({
            id: c.id, date: c.class?.startTime || c.date, isPresent: c.isPresent, late: c.late,
            type: 'Class', title: c.class?.subject?.name || 'Subject Session',
            subtitle: c.class?.classroom?.name || 'Classroom'
        }))
    ].sort((a, b) => moment(b.date).diff(moment(a.date)));

    /* ── Sub-components ─────────────────────────────────────────── */

    const GlassCard = ({ children, className = "" }) => (
        <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>
            {children}
        </div>
    );

    const SectionHeader = ({ icon, title, action, accentColor = "indigo" }) => (
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
                <span className={`w-7 h-7 rounded-lg bg-${accentColor}-50 border border-${accentColor}-100 flex items-center justify-center text-${accentColor}-500`}>
                    {icon}
                </span>
                <h3 className="text-sm font-bold text-gray-800 tracking-tight">{title}</h3>
            </div>
            {action}
        </div>
    );

    const StatusPill = ({ status }) => {
        const map = {
            present: "bg-emerald-50 text-emerald-700 border border-emerald-200",
            late: "bg-amber-50 text-amber-700 border border-amber-200",
            absent: "bg-red-50 text-red-600 border border-red-200",
            paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
            unpaid: "bg-red-50 text-red-600 border border-red-200",
            issued: "bg-amber-50 text-amber-700 border border-amber-200",
            returned: "bg-emerald-50 text-emerald-700 border border-emerald-200",
            approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
            pending: "bg-amber-50 text-amber-700 border border-amber-200",
        };
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${map[status?.toLowerCase()] || "bg-gray-50 text-gray-500 border border-gray-200"}`}>
                {status}
            </span>
        );
    };

    const AttendanceDot = ({ isPresent, late }) => {
        if (isPresent && late) return <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />;
        if (isPresent) return <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />;
        return <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg px-3 py-2 text-sm">
                <p className="text-gray-400 text-[10px] mb-0.5">{moment(label).format("MMM DD, YYYY")}</p>
                <p className="font-bold text-indigo-600">{payload[0].value} marks</p>
            </div>
        );
    };

    const InfoRow = ({ label, value }) => (
        <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-400 font-medium">{label}</span>
            <span className="text-xs font-semibold text-gray-700">{value || "N/A"}</span>
        </div>
    );

    const MiniStat = ({ label, count, colorClass }) => (
        <div className={`flex flex-col items-center px-3 py-2 rounded-xl border ${colorClass}`}>
            <span className="text-lg font-extrabold leading-none">{count}</span>
            <span className="text-[10px] font-semibold mt-0.5 uppercase tracking-wider">{label}</span>
        </div>
    );

    return (
        <div className="min-h-screen font-poppins pb-16 lg:ml-80 ml-0" style={{ backgroundImage: dotPattern }}>

            {/* Navbar */}
            <div className="max-w-7xl mx-auto mb-4 px-4 sm:px-0">
                {userData?.userType === 'admin' || userData?.userType === 'super_admin' ? (
                    <AdminNavbar heading="Student Profile" />
                ) : userData?.userType === 'teacher' ? (
                    <TeacherNavbar heading="Student Profile" />
                ) : userData?.userType === 'parent' ? (
                    <ParentNavbar heading="Student Profile" />
                ) : (
                    <StudentNavbar heading="Student Profile" />
                )}
            </div>

            {/* Header */}
            <div className="max-w-7xl mx-auto flex items-center gap-4 mb-7 px-4 sm:px-0">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-gray-500 hover:text-indigo-600 active:scale-95"
                >
                    <IoArrowBack size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Student Profile</h1>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">Full academic overview & analytics</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-7 px-4 sm:px-0">

                {/* ── LEFT SIDEBAR ────────────────────────── */}
                <div className="lg:col-span-1 space-y-4">

                    {/* Profile Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm"
                    >
                        {/* Top accent bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
                        {/* Subtle grid bg on top section */}
                        <div className="relative px-5 pt-5 pb-4 flex flex-col items-center text-center" style={{ backgroundImage: gridPattern }}>
                            <div className="relative mb-3">
                                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md ring-1 ring-indigo-100">
                                    <img
                                        src={basicInfo.profilePic || profilePlaceholder}
                                        alt={basicInfo.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
                            </div>
                            <h2 className="text-base font-extrabold text-gray-900 leading-tight">{basicInfo.name}</h2>
                            <div className="mt-1.5 flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                                    Roll #{basicInfo.rollNo || "N/A"}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full">
                                    {basicInfo.level?.name || "N/A"}
                                </span>
                            </div>
                        </div>

                        <div className="px-5 pb-4 space-y-0.5">
                            <InfoRow label="Class" value={basicInfo.classroomStudents?.[0]?.name} />
                            <InfoRow label="Level" value={basicInfo.level?.name} />
                        </div>

                        <div className="px-5 pb-5 space-y-2.5 border-t border-gray-50 pt-3">
                            <div className="flex items-center gap-2.5 group">
                                <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 flex-shrink-0">
                                    <IoMail size={12} />
                                </span>
                                <span className="text-xs text-gray-500 truncate">{basicInfo.email}</span>
                            </div>
                            <div className="flex items-center gap-2.5 group">
                                <span className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 flex-shrink-0">
                                    <IoCall size={12} />
                                </span>
                                <span className="text-xs text-gray-500">{basicInfo.phoneNumber || "N/A"}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Attendance Ring */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="relative overflow-hidden bg-[#0D1268] rounded-2xl border border-indigo-900/50 shadow-md"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='2' cy='2' r='1' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E")` }}
                    >
                        {/* Corner accent */}
                        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-indigo-700/20 -translate-x-4 -translate-y-8" />
                        <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full bg-purple-700/15 translate-x-[-30%] translate-y-[40%]" />

                        <div className="relative p-5">
                            <div className="flex items-center gap-4">
                                {/* Ring */}
                                <div className="relative w-[72px] h-[72px] flex-shrink-0">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none" />
                                        <motion.circle
                                            cx="60" cy="60" r="52"
                                            stroke="#818cf8"
                                            strokeWidth="10"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            initial={{ strokeDashoffset: circumference }}
                                            animate={{ strokeDashoffset: circumference - (circumference * attendancePct / 100) }}
                                            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-sm font-extrabold text-white">{attendancePct}%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-0.5">Attendance Rate</p>
                                    <p className={`text-xl font-extrabold ${attendancePct >= 75 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {attendancePct >= 75 ? "Good Standing" : "At Risk"}
                                    </p>
                                    <p className="text-indigo-300/70 text-[10px] font-medium mt-0.5">{attendance.length} total sessions</p>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-3 gap-2">
                                {[
                                    { color: "bg-emerald-400", label: "Present", count: attendance?.filter(a => a.isPresent && !a.late).length || 0 },
                                    { color: "bg-amber-400", label: "Late", count: attendance?.filter(a => a.late).length || 0 },
                                    { color: "bg-red-400", label: "Absent", count: attendance?.filter(a => !a.isPresent).length || 0 }
                                ].map(({ color, label, count }) => (
                                    <div key={label} className="flex flex-col items-center gap-1 py-2 rounded-xl bg-white/5 border border-white/10">
                                        <span className={`w-2 h-2 rounded-full ${color}`} />
                                        <span className="text-sm font-extrabold text-white">{count}</span>
                                        <span className="text-[9px] text-indigo-300 font-semibold uppercase tracking-wider">{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 space-y-1.5"
                    >
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">Quick Actions</p>
                        {[
                            { icon: <IoChatbubbleEllipses size={14} />, label: "Message Parent", bg: "bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100", dot: "bg-indigo-400", onClick: () => setIsMessageModalOpen(true) },
                            { icon: <IoDocumentText size={14} />, label: "Download Report", bg: "bg-violet-50 border-violet-100 text-violet-700 hover:bg-violet-100", dot: "bg-violet-400", onClick: handleDownloadReport },
                            { icon: <IoStar size={14} />, label: "Add Teacher Note", bg: "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100", dot: "bg-amber-400", onClick: () => setIsNoteModalOpen(true) }
                        ].map(({ icon, label, bg, dot, onClick }) => (
                            <button
                                key={label}
                                onClick={onClick}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98] ${bg}`}
                            >
                                <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                                {icon}
                                {label}
                            </button>
                        ))}
                    </motion.div>
                </div>

                {/* ── RIGHT CONTENT ─────────────────────────── */}
                <div className="lg:col-span-3 space-y-6">

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${activeTab === tab.id
                                    ? "bg-[#0D1268] text-white shadow-md shadow-indigo-900/20"
                                    : "bg-white text-gray-500 hover:text-gray-700 border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100"
                                    }`}
                            >
                                <span className={activeTab === tab.id ? "text-indigo-300" : "text-gray-400"}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2 }}
                        >

                            {/* ══ OVERVIEW TAB ══════════════════════════ */}
                            {activeTab === "overview" && (
                                <div className="space-y-6">

                                    {/* Stat cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Assignments */}
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden group hover:shadow-md hover:border-orange-200 transition-all">
                                            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-orange-50 -translate-y-8 translate-x-8" />
                                            <div className="relative">
                                                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 mb-3 group-hover:scale-110 transition-transform">
                                                    <IoDocumentText size={16} />
                                                </div>
                                                <p className="text-3xl font-extrabold text-gray-900">{assignments.length}</p>
                                                <p className="text-xs text-gray-400 font-semibold mt-0.5">Assignments</p>
                                                <div className="mt-3 h-1 rounded-full bg-gray-100">
                                                    <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${Math.min(assignments.length * 5, 100)}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quizzes */}
                                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden group hover:shadow-md hover:border-blue-200 transition-all">
                                            <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-blue-50 -translate-y-8 translate-x-8" />
                                            <div className="relative">
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
                                                    <IoBook size={16} />
                                                </div>
                                                <p className="text-3xl font-extrabold text-gray-900">{quizzes.length}</p>
                                                <p className="text-xs text-gray-400 font-semibold mt-0.5">Quizzes Taken</p>
                                                <div className="mt-3 h-1 rounded-full bg-gray-100">
                                                    <div className="h-full bg-blue-400 rounded-full transition-all" style={{ width: `${Math.min(quizzes.length * 8, 100)}%` }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fee Status */}
                                        <div className={`rounded-2xl border shadow-sm p-5 relative overflow-hidden group transition-all ${fees.some(f => f.status === 'unpaid')
                                            ? 'bg-red-50 border-red-100 hover:shadow-md hover:border-red-200'
                                            : 'bg-emerald-50 border-emerald-100 hover:shadow-md hover:border-emerald-200'
                                            }`}>
                                            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-8 translate-x-8 ${fees.some(f => f.status === 'unpaid') ? 'bg-red-100' : 'bg-emerald-100'}`} />
                                            <div className="relative">
                                                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${fees.some(f => f.status === 'unpaid') ? 'bg-red-100 border-red-200 text-red-500' : 'bg-emerald-100 border-emerald-200 text-emerald-600'}`}>
                                                    <IoWallet size={16} />
                                                </div>
                                                <p className={`text-2xl font-extrabold ${fees.some(f => f.status === 'unpaid') ? 'text-red-600' : 'text-emerald-700'}`}>
                                                    {fees.some(f => f.status === 'unpaid') ? 'Dues Pending' : 'All Clear'}
                                                </p>
                                                <p className="text-xs text-gray-400 font-semibold mt-0.5">Fee Status</p>
                                                <p className={`text-[10px] font-bold mt-1.5 ${fees.some(f => f.status === 'unpaid') ? 'text-red-500' : 'text-emerald-600'}`}>
                                                    {fees.filter(f => f.status === 'unpaid').length} unpaid · {fees.filter(f => f.status === 'paid').length} paid
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Parent + Journey */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <GlassCard className="p-5">
                                            <SectionHeader icon={<IoPerson size={13} />} title="Parent / Guardian" />
                                            <div className="flex gap-4 items-center mb-4">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex-shrink-0">
                                                    <img src={basicInfo.guardian?.profilePic || profilePlaceholder} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm leading-tight">{basicInfo.guardian?.name || basicInfo.guardianName}</p>
                                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mt-1 inline-block">Guardian</span>
                                                </div>
                                            </div>
                                            <div className="space-y-0">
                                                <InfoRow label="Contact" value={basicInfo.guardian?.phoneNumber || basicInfo.guardianPhoneNumber} />
                                                <InfoRow label="Email" value={basicInfo.guardian?.email || basicInfo.guardianEmail} />
                                            </div>
                                        </GlassCard>

                                        {/* Quick stats summary */}
                                        <GlassCard className="p-5">
                                            <SectionHeader icon={<IoTrendingUp size={13} />} title="Performance Summary" accentColor="violet" />
                                            <div className="space-y-3">
                                                {[
                                                    {
                                                        label: "Avg Assignment Score",
                                                        value: assignments.length > 0
                                                            ? `${Math.round(assignments.reduce((s, a) => s + (a.marks || 0), 0) / assignments.length)}%`
                                                            : "N/A",
                                                        color: "text-indigo-600",
                                                        bg: "bg-indigo-50"
                                                    },
                                                    {
                                                        label: "Avg Quiz Score",
                                                        value: quizzes.length > 0
                                                            ? `${Math.round(quizzes.reduce((s, q) => s + (q.marks || 0), 0) / quizzes.length)}%`
                                                            : "N/A",
                                                        color: "text-blue-600",
                                                        bg: "bg-blue-50"
                                                    },
                                                    {
                                                        label: "Total Submissions",
                                                        value: assignments.length + quizzes.length,
                                                        color: "text-violet-600",
                                                        bg: "bg-violet-50"
                                                    }
                                                ].map(({ label, value, color, bg }) => (
                                                    <div key={label} className={`flex justify-between items-center px-3 py-2.5 rounded-xl ${bg}`}>
                                                        <span className="text-xs font-semibold text-gray-600">{label}</span>
                                                        <span className={`text-sm font-extrabold ${color}`}>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </GlassCard>
                                    </div>

                                    {/* Enrolled Subjects */}
                                    <GlassCard className="p-5">
                                        <SectionHeader icon={<IoBook size={13} />} title="Enrolled Subjects" accentColor="blue" />
                                        {subjectAttendance.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {subjectAttendance.map((subject, idx) => (
                                                    <div key={idx} className="relative overflow-hidden flex flex-col p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                                                        <div className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-indigo-500 mb-2.5 group-hover:border-indigo-300 transition-colors">
                                                            <IoBook size={11} />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject</span>
                                                        <span className="text-sm font-extrabold text-gray-800 line-clamp-1 group-hover:text-indigo-700 transition-colors mt-0.5">{subject.name}</span>
                                                        <div className="mt-3">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[10px] text-gray-400 font-medium">Attendance</span>
                                                                <span className={`text-[10px] font-extrabold ${subject.percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                    {subject.percentage}%
                                                                </span>
                                                            </div>
                                                            <div className="h-1 rounded-full bg-gray-200">
                                                                <div
                                                                    className={`h-full rounded-full ${subject.percentage >= 75 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                                                    style={{ width: `${subject.percentage}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-center text-gray-400 py-8 text-sm">No enrolled subjects found.</p>
                                        )}
                                    </GlassCard>

                                    {/* Teacher's Notes */}
                                    <GlassCard className="p-5">
                                        <SectionHeader
                                            icon={<IoList size={13} />}
                                            title="Teacher's Notes"
                                            accentColor="amber"
                                            action={
                                                <button
                                                    onClick={() => setIsNoteModalOpen(true)}
                                                    className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                                >
                                                    + Add Note
                                                </button>
                                            }
                                        />
                                        <div className="space-y-3">
                                            {notes && notes.length > 0 ? notes.map((note, i) => (
                                                <div key={i} className="p-4 rounded-xl bg-amber-50 border border-amber-100 relative group hover:border-amber-200 transition-colors">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="w-6 h-6 rounded-lg bg-amber-200 flex items-center justify-center text-[10px] font-extrabold text-amber-800">
                                                            {note.teacher?.name?.charAt(0) || "T"}
                                                        </div>
                                                        <p className="text-xs font-bold text-gray-700">{note.teacher?.name || "Teacher"}</p>
                                                        <p className="text-[10px] text-gray-400 ml-auto">{moment(note.createdAt).format("MMM DD, YYYY")}</p>
                                                    </div>
                                                    <p className="text-xs text-gray-600 leading-relaxed italic border-l-2 border-amber-300 pl-3">"{note.content}"</p>
                                                </div>
                                            )) : (
                                                <div className="py-8 text-center">
                                                    <IoDocumentText className="text-gray-200 mx-auto mb-2" size={28} />
                                                    <p className="text-gray-400 text-sm">No notes recorded yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </GlassCard>
                                </div>
                            )}

                            {/* ══ ACADEMIC TAB ══════════════════════════ */}
                            {activeTab === "academic" && (
                                <div className="space-y-6">
                                    <GlassCard className="p-5">
                                        <SectionHeader
                                            icon={<IoTrendingUp size={13} />}
                                            title="Performance Trend"
                                            accentColor="indigo"
                                            action={
                                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                                    <IoTrendingUp size={10} /> Assignments
                                                </span>
                                            }
                                        />
                                        <div className="h-[240px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={performanceTrends.assignments} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="gradMark" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.12} />
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                    <XAxis dataKey="date" tickFormatter={(v) => moment(v).format("MMM DD")} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Area type="monotone" dataKey="marks" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#gradMark)" dot={{ r: 3.5, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#6366f1' }} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="p-5 overflow-hidden">
                                        <SectionHeader
                                            icon={<IoDocumentText size={13} />}
                                            title="Recent Submissions"
                                            accentColor="violet"
                                            action={
                                                <button onClick={handleDownloadReport} className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                                                    <IoDownload size={11} /> Report Card
                                                </button>
                                            }
                                        />
                                        <div className="overflow-x-auto -mx-5 px-5">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100">
                                                        {["Type", "Subject", "Title", "Score", "Grade"].map(h => (
                                                            <th key={h} className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest pr-4">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        ...assignments.map(a => ({ ...a, _type: 'Assignment' })),
                                                        ...quizzes.map(q => ({ ...q, _type: 'Quiz' }))
                                                    ].slice(0, 10).map((item, idx) => (
                                                        <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-indigo-50/30 transition-colors">
                                                            <td className="py-3 pr-4">
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${item._type === 'Assignment' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                                    {item._type}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 pr-4 font-semibold text-gray-700 text-xs">
                                                                {item.assignment?.subject?.name || item.quiz?.subject?.name || "N/A"}
                                                            </td>
                                                            <td className="py-3 pr-4 text-gray-500 text-xs max-w-[160px] truncate">
                                                                {item.assignment?.title || item.quiz?.title}
                                                            </td>
                                                            <td className="py-3 pr-4">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-bold text-indigo-600 text-sm">{item.marks}</span>
                                                                    <span className="text-gray-300 text-xs">/{item.assignment?.totalMarks || item.quiz?.totalMarks}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3">
                                                                <StatusPill status={item.grade || 'pending'} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </GlassCard>
                                </div>
                            )}

                            {/* ══ ATTENDANCE TAB ════════════════════════ */}
                            {activeTab === "attendance" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Overview donut */}
                                        <GlassCard className="p-5 flex flex-col items-center">
                                            <SectionHeader icon={<IoCalendar size={13} />} title="Attendance Overview" />
                                            <div className="relative w-40 h-40 my-2">
                                                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                                                    <circle cx="80" cy="80" r="68" stroke="#EEF2FF" strokeWidth="14" fill="none" />
                                                    <motion.circle
                                                        cx="80" cy="80" r="68"
                                                        stroke="url(#ringGrad2)"
                                                        strokeWidth="14"
                                                        fill="none"
                                                        strokeLinecap="round"
                                                        strokeDasharray={2 * Math.PI * 68}
                                                        initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
                                                        animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - attendancePct / 100) }}
                                                        transition={{ duration: 1.3, ease: "easeOut", delay: 0.2 }}
                                                    />
                                                    <defs>
                                                        <linearGradient id="ringGrad2" x1="1" y1="0" x2="0" y2="1">
                                                            <stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-3xl font-extrabold text-gray-800">{attendancePct}%</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Average</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 mt-3 w-full justify-center">
                                                <MiniStat label="Present" count={(attendance?.filter(a => a.isPresent && !a.late).length || 0) + (classAttendance?.filter(a => a.isPresent && !a.late).length || 0)} colorClass="border-emerald-100 text-emerald-700 bg-emerald-50" />
                                                <MiniStat label="Late" count={(attendance?.filter(a => a.late).length || 0) + (classAttendance?.filter(a => a.late).length || 0)} colorClass="border-amber-100 text-amber-700 bg-amber-50" />
                                                <MiniStat label="Absent" count={(attendance?.filter(a => !a.isPresent).length || 0) + (classAttendance?.filter(a => !a.isPresent).length || 0)} colorClass="border-red-100 text-red-600 bg-red-50" />
                                            </div>
                                        </GlassCard>

                                        {/* History */}
                                        <GlassCard className="p-5">
                                            <SectionHeader icon={<IoTime size={13} />} title="Attendance History" accentColor="violet" />
                                            <div className="space-y-2 max-h-[360px] overflow-y-auto no-scrollbar pr-1">
                                                {unifiedAttendanceHistory.length > 0 ? unifiedAttendanceHistory.slice(0, 20).map((record, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.025 }}
                                                        className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-white hover:border-indigo-100 border border-transparent hover:shadow-sm transition-all"
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <AttendanceDot isPresent={record.isPresent} late={record.late} />
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-bold text-gray-800 truncate">{record.title}</p>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <span className="text-[10px] font-semibold text-indigo-600">{moment(record.date).format("MMM DD, YYYY")}</span>
                                                                    <span className="text-gray-300">·</span>
                                                                    <span className="text-[10px] text-gray-400 truncate">{record.subtitle}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                                                            <StatusPill status={record.isPresent ? (record.late ? 'late' : 'present') : 'absent'} />
                                                            <span className="text-[9px] text-gray-300 font-bold uppercase tracking-wider">{record.type}</span>
                                                        </div>
                                                    </motion.div>
                                                )) : (
                                                    <p className="text-center text-gray-400 py-12 text-sm">No attendance records found.</p>
                                                )}
                                            </div>
                                        </GlassCard>
                                    </div>

                                    {/* Subject-wise attendance */}
                                    <GlassCard className="p-5">
                                        <SectionHeader icon={<IoBook size={13} />} title="Attendance per Subject" accentColor="blue" />
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100">
                                                        <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject & Teacher</th>
                                                        <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Progress</th>
                                                        <th className="pb-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">P / L / A</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subjectAttendance.length > 0 ? subjectAttendance.map((item, idx) => (
                                                        <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors group">
                                                            <td className="py-4 pr-4">
                                                                <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                                                <p className="text-[10px] text-gray-400 mt-0.5">{item.teacher || "N/A"}</p>
                                                            </td>
                                                            <td className="py-4 pr-6 min-w-[160px]">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="flex-grow h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                        <motion.div
                                                                            initial={{ width: 0 }}
                                                                            animate={{ width: `${item.percentage}%` }}
                                                                            className={`h-full rounded-full ${item.percentage >= 75 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                                                        />
                                                                    </div>
                                                                    <span className={`text-xs font-extrabold w-10 text-right ${item.percentage >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                                        {item.percentage}%
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-gray-300 font-medium mt-1">{item.total} total lectures</p>
                                                            </td>
                                                            <td className="py-4 text-right">
                                                                <div className="flex gap-1.5 justify-end">
                                                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">{item.present}P</span>
                                                                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">{item.late}L</span>
                                                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">{item.absent}A</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan="3" className="py-10 text-center text-gray-400 text-sm">No subject attendance records found.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </GlassCard>
                                </div>
                            )}

                            {/* ══ TIMETABLE TAB ═════════════════════════ */}
                            {activeTab === "timetable" && (
                                <GlassCard className="p-5">
                                    <SectionHeader icon={<IoTime size={13} />} title="Weekly Schedule" accentColor="violet" />
                                    <div className="space-y-2">
                                        {classes.length > 0 ? classes.map((cls, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.04 }}
                                                className="flex gap-4 p-3.5 rounded-xl border border-gray-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group"
                                            >
                                                {/* Day badge */}
                                                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2.5 flex flex-col items-center justify-center min-w-[58px] group-hover:bg-indigo-100 transition-colors">
                                                    <span className="text-[9px] font-extrabold uppercase text-indigo-500 tracking-wider">{moment(cls.startTime).format("ddd")}</span>
                                                    <span className="text-lg font-extrabold text-indigo-700 leading-tight">{moment(cls.startTime).format("DD")}</span>
                                                </div>
                                                <div className="flex-grow min-w-0">
                                                    <h4 className="font-bold text-gray-900 text-sm truncate">{cls.subject?.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                            <IoTime size={10} className="text-indigo-400" />
                                                            {moment(cls.startTime).format("hh:mm A")} – {moment(cls.endTime).format("hh:mm A")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end justify-center flex-shrink-0">
                                                    <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">{cls.teacher?.name}</span>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="py-16 text-center">
                                                <IoCalendar size={36} className="text-gray-200 mx-auto mb-3" />
                                                <p className="text-gray-400 text-sm font-medium">No classes scheduled.</p>
                                            </div>
                                        )}
                                    </div>
                                </GlassCard>
                            )}

                            {/* ══ FEES TAB ══════════════════════════════ */}
                            {activeTab === "fees" && (
                                <div className="space-y-6">
                                    {/* Hero dues card */}
                                    <div
                                        className="relative overflow-hidden bg-[#0D1268] rounded-2xl border border-indigo-900/40 p-7 text-white"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='32' height='32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h32v32H0z' fill='none'/%3E%3Cpath d='M0 32V0M32 0v32' stroke='%23ffffff' stroke-opacity='0.04' stroke-width='1'/%3E%3C/svg%3E")` }}
                                    >
                                        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-indigo-700/20 translate-x-16 -translate-y-16" />
                                        <IoWallet className="absolute bottom-4 right-6 text-white/5" size={96} />
                                        <div className="relative">
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="w-2 h-2 rounded-full bg-red-400" />
                                                <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Pending Dues</p>
                                            </div>
                                            <h3 className="text-4xl font-extrabold mb-1">
                                                ${fees.reduce((sum, f) => f.status === 'unpaid' ? sum + f.amount : sum, 0).toLocaleString()}
                                            </h3>
                                            <p className="text-indigo-300 text-sm mb-6">
                                                {fees.filter(f => f.status === 'unpaid').length} unpaid · {fees.filter(f => f.status === 'paid').length} paid invoices
                                            </p>
                                            <button className="bg-white text-indigo-900 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-indigo-50 transition-colors active:scale-95">
                                                Pay Now →
                                            </button>
                                        </div>
                                    </div>

                                    <GlassCard className="p-5">
                                        <SectionHeader icon={<IoWallet size={13} />} title="Payment History" accentColor="indigo" />
                                        <div className="space-y-1">
                                            {fees.map((fee, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${fee.status === 'paid' ? 'bg-emerald-50 border border-emerald-100 text-emerald-500' : 'bg-red-50 border border-red-100 text-red-500'}`}>
                                                            {fee.status === 'paid' ? <IoCheckmarkCircle size={16} /> : <IoCloseCircle size={16} />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-sm capitalize">
                                                                {fee.type} Fee — {moment().month(fee.month - 1).format("MMMM")} {fee.year}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 mt-0.5">Due: {moment(fee.dueDate).format("MMM DD, YYYY")}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-extrabold text-gray-900 text-sm">${fee.amount}</p>
                                                        <StatusPill status={fee.status} />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                </div>
                            )}

                            {/* ══ MORE TAB ══════════════════════════════ */}
                            {activeTab === "more" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Library */}
                                    <GlassCard className="p-5">
                                        <SectionHeader icon={<IoLibrary size={13} />} title="Library Records" accentColor="indigo" />
                                        <div className="space-y-2">
                                            {library.length > 0 ? library.map((book, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all">
                                                    <div className="w-8 h-10 rounded-md bg-gradient-to-b from-indigo-300 to-indigo-600 flex-shrink-0 shadow-sm" />
                                                    <div className="flex-grow min-w-0">
                                                        <p className="text-xs font-bold text-gray-800 truncate">{book.bookName}</p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">Issued: {moment(book.issueDate).format("MMM DD, YYYY")}</p>
                                                    </div>
                                                    <StatusPill status={book.status} />
                                                </div>
                                            )) : (
                                                <div className="py-8 text-center">
                                                    <IoLibrary className="text-gray-200 mx-auto mb-2" size={28} />
                                                    <p className="text-gray-400 text-sm">No books issued.</p>
                                                </div>
                                            )}
                                        </div>
                                    </GlassCard>

                                    {/* Transport */}
                                    <GlassCard className="p-5">
                                        <SectionHeader icon={<IoBus size={13} />} title="Transport Details" accentColor="orange" />
                                        {transport ? (
                                            <div className="space-y-3">
                                                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="w-5 h-5 rounded bg-orange-200 flex items-center justify-center"><IoBus size={10} className="text-orange-700" /></span>
                                                        <p className="text-[10px] font-extrabold text-orange-600 uppercase tracking-widest">Bus Info</p>
                                                    </div>
                                                    <p className="text-sm font-bold text-gray-800">Bus No: {transport.busNumber}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{transport.route}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { label: "Pickup Time", value: transport.pickupTime },
                                                        { label: "Drop Time", value: transport.dropTime }
                                                    ].map(({ label, value }) => (
                                                        <div key={label} className="p-3 bg-gray-50 border border-gray-100 rounded-xl text-center">
                                                            <p className="text-[10px] text-gray-400 font-semibold mb-1">{label}</p>
                                                            <p className="font-bold text-gray-800 text-sm">{value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="py-8 text-center">
                                                <IoBus className="text-gray-200 mx-auto mb-2" size={28} />
                                                <p className="text-gray-400 text-sm">Not using institute transport.</p>
                                            </div>
                                        )}
                                    </GlassCard>

                                    {/* Discipline */}
                                    <GlassCard className="p-5">
                                        <SectionHeader icon={<IoWarning size={13} />} title="Behavior Records" accentColor="red" />
                                        {discipline.length > 0 ? (
                                            <div className="space-y-3">
                                                {discipline.map((rec, i) => (
                                                    <div key={i} className="p-4 bg-red-50 border border-red-100 rounded-xl">
                                                        <p className="text-sm font-bold text-gray-800">{rec.incident}</p>
                                                        <p className="text-xs text-red-600 mt-1.5 font-semibold border-l-2 border-red-300 pl-2">{rec.actionTaken}</p>
                                                        <p className="text-[10px] text-gray-400 mt-2">{moment(rec.date).format("MMM DD, YYYY")}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="py-6 text-center">
                                                <IoCheckmarkCircle className="text-emerald-400 mx-auto mb-2" size={28} />
                                                <p className="text-emerald-600 font-bold text-sm">Excellent Behavior</p>
                                                <p className="text-gray-400 text-xs mt-0.5">No incidents recorded</p>
                                            </div>
                                        )}
                                    </GlassCard>

                                    {/* Leaves */}
                                    <GlassCard className="p-5">
                                        <SectionHeader icon={<IoCalendar size={13} />} title="Leave Requests" accentColor="emerald" />
                                        <div className="space-y-2">
                                            {leaves.length > 0 ? leaves.map((l, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm transition-all">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800">
                                                            {moment(l.startDate).format("MMM DD")} – {moment(l.endDate).format("MMM DD, YYYY")}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 truncate max-w-[180px] mt-0.5">{l.reason}</p>
                                                    </div>
                                                    <StatusPill status={l.status} />
                                                </div>
                                            )) : (
                                                <div className="py-8 text-center">
                                                    <IoCalendar className="text-gray-200 mx-auto mb-2" size={28} />
                                                    <p className="text-gray-400 text-sm">No leave requests.</p>
                                                </div>
                                            )}
                                        </div>
                                    </GlassCard>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Modals ── */}
            <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Add Teacher's Note" accentColor="amber">
                <div className="space-y-4">
                    <textarea
                        className="w-full h-28 p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 outline-none transition-all text-sm resize-none"
                        placeholder="Write your observation about the student..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                    />
                    <button
                        onClick={() => addNoteMutation.mutate(noteContent)}
                        disabled={addNoteMutation.isPending || !noteContent.trim()}
                        className="w-full py-3 rounded-xl bg-[#0D1268] text-white text-sm font-bold shadow-md hover:shadow-indigo-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {addNoteMutation.isPending ? "Adding..." : "Save Note"}
                    </button>
                </div>
            </Modal>

            <Modal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} title="Message Parent" accentColor="indigo">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
                            {basicInfo?.guardianName?.charAt(0) || "G"}
                        </div>
                        <div>
                            <p className="text-[10px] font-extrabold uppercase text-indigo-400 tracking-widest">Guardian</p>
                            <p className="text-sm font-bold text-indigo-900">{basicInfo?.guardianName}</p>
                        </div>
                    </div>
                    <textarea
                        className="w-full h-28 p-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none transition-all text-sm resize-none"
                        placeholder="Type your message for the parent..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                    />
                    <button
                        onClick={() => sendMessageMutation.mutate(messageText)}
                        disabled={sendMessageMutation.isPending || !messageText.trim()}
                        className="w-full py-3 rounded-xl bg-[#0D1268] text-white text-sm font-bold shadow-md hover:shadow-indigo-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

/* ── Modal component ─────────────────────────────────────────── */
const Modal = ({ isOpen, onClose, title, children, accentColor = "indigo" }) => {
    if (!isOpen) return null;
    const accentMap = {
        indigo: "from-indigo-500 via-violet-500 to-purple-500",
        amber: "from-amber-400 via-orange-400 to-yellow-400",
    };
    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-[#0D1268]/30 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 border border-gray-100 overflow-hidden"
            >
                {/* Accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${accentMap[accentColor] || accentMap.indigo}`} />
                <div className="p-6">
                    <div className="flex justify-between items-center mb-5">
                        <h3 className="text-base font-extrabold text-gray-800 tracking-tight">{title}</h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-200 transition-colors"
                        >
                            <IoClose size={16} />
                        </button>
                    </div>
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

export default StudentProfileDashboard;
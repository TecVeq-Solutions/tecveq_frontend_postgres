import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    IoArrowBack, IoPerson, IoBook, IoCalendar, IoWallet,
    IoChatbubbleEllipses, IoTime, IoEllipsisVertical,
    IoDocumentText, IoWarning, IoLibrary, IoBus,
    IoSchool, IoDownload, IoMail, IoCall, IoStar,
    IoTrendingUp, IoCheckmarkCircle, IoCloseCircle, IoList, IoClose,
    IoSparkles, IoShieldCheckmark, IoRibbon
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

/* ── Premium Design System ──────────────────────────────────── */
// Injecting custom styles
const styleTag = typeof document !== 'undefined' ? (() => {
    const existing = document.getElementById('spd-styles');
    if (existing) return existing;
    const s = document.createElement('style');
    s.id = 'spd-styles';
    s.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        .spd-root { font-family: 'DM Sans', sans-serif; }
        .spd-root h1, .spd-root h2, .spd-root h3 { font-family: 'Sora', sans-serif; }
        .spd-glow-indigo { box-shadow: 0 0 0 1px rgba(99,102,241,0.15), 0 8px 32px -8px rgba(99,102,241,0.25); }
        .spd-glow-emerald { box-shadow: 0 0 0 1px rgba(16,185,129,0.15), 0 8px 32px -8px rgba(16,185,129,0.25); }
        .spd-glow-amber { box-shadow: 0 0 0 1px rgba(245,158,11,0.15), 0 8px 32px -8px rgba(245,158,11,0.25); }
        .spd-card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .spd-card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 40px -8px rgba(99,102,241,0.18); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .spd-tab-active { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); }
        .spd-shimmer {
            background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0) 100%);
            background-size: 200% 100%;
            animation: shimmer 3s infinite;
        }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        .spd-float { animation: floatY 4s ease-in-out infinite; }
        @keyframes floatY { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        .spd-pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.3)} }
        .spd-gradient-text {
            background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .spd-ring-progress { transform-origin: center; transform: rotate(-90deg); }
        .spd-mesh-bg {
            background-color: #f8f7ff;
            background-image:
                radial-gradient(at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 50%),
                radial-gradient(at 80% 10%, rgba(168,85,247,0.06) 0%, transparent 40%),
                radial-gradient(at 50% 80%, rgba(236,72,153,0.04) 0%, transparent 50%);
        }
        .spd-stat-card {
            background: white;
            border: 1px solid rgba(226,232,240,0.8);
            border-radius: 20px;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        .spd-stat-card::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(99,102,241,0.03) 0%, transparent 60%);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .spd-stat-card:hover::before { opacity: 1; }
        .spd-stat-card:hover { border-color: rgba(99,102,241,0.2); transform: translateY(-3px); box-shadow: 0 16px 48px -12px rgba(99,102,241,0.2); }
        .spd-sidebar-card {
            background: white;
            border-radius: 24px;
            border: 1px solid rgba(226,232,240,0.8);
            overflow: hidden;
            transition: box-shadow 0.3s ease;
        }
        .spd-sidebar-card:hover { box-shadow: 0 8px 32px -8px rgba(99,102,241,0.15); }
        .spd-action-btn {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 11px 14px;
            border-radius: 14px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid;
            transition: all 0.2s ease;
            cursor: pointer;
            font-family: 'DM Sans', sans-serif;
        }
        .spd-action-btn:active { transform: scale(0.97); }
        .spd-table-row { transition: background 0.15s ease; }
        .spd-table-row:hover { background: rgba(238,242,255,0.5); }
        .spd-badge {
            display: inline-flex;
            align-items: center;
            padding: 3px 9px;
            border-radius: 8px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.03em;
            text-transform: uppercase;
        }
        .spd-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 9px 0;
            border-bottom: 1px solid rgba(241,245,249,1);
        }
        .spd-info-row:last-child { border-bottom: none; }
    `;
    document.head.appendChild(s);
    return s;
})() : null;

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
        <div className="h-screen w-full flex items-center justify-center spd-mesh-bg">
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
        { id: "overview", label: "Overview", icon: <IoPerson size={14} /> },
        { id: "academic", label: "Academics", icon: <IoSchool size={14} /> },
        { id: "attendance", label: "Attendance", icon: <IoCalendar size={14} /> },
        { id: "fees", label: "Fees", icon: <IoWallet size={14} /> },
        { id: "timetable", label: "Timetable", icon: <IoTime size={14} /> },
        { id: "more", label: "More", icon: <IoEllipsisVertical size={14} /> }
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

    /* ── Premium Sub-components ─────────────────────────────── */

    const PremiumCard = ({ children, className = "", glow = false }) => (
        <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm ${glow ? 'spd-glow-indigo' : ''} ${className}`}
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 24px -8px rgba(99,102,241,0.08)' }}>
            {children}
        </div>
    );

    const SectionHeader = ({ icon, title, action, gradient = "from-indigo-500 to-violet-500" }) => (
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm`}
                    style={{ boxShadow: '0 4px 12px -2px rgba(99,102,241,0.35)' }}>
                    {icon}
                </div>
                <h3 style={{ fontFamily: "'Sora', sans-serif" }} className="text-sm font-bold text-slate-800 tracking-tight">{title}</h3>
            </div>
            {action}
        </div>
    );

    const StatusPill = ({ status }) => {
        const map = {
            present: { bg: "rgba(16,185,129,0.08)", color: "#059669", border: "rgba(16,185,129,0.2)" },
            late: { bg: "rgba(245,158,11,0.08)", color: "#d97706", border: "rgba(245,158,11,0.2)" },
            absent: { bg: "rgba(239,68,68,0.08)", color: "#dc2626", border: "rgba(239,68,68,0.2)" },
            paid: { bg: "rgba(16,185,129,0.08)", color: "#059669", border: "rgba(16,185,129,0.2)" },
            unpaid: { bg: "rgba(239,68,68,0.08)", color: "#dc2626", border: "rgba(239,68,68,0.2)" },
            issued: { bg: "rgba(245,158,11,0.08)", color: "#d97706", border: "rgba(245,158,11,0.2)" },
            returned: { bg: "rgba(16,185,129,0.08)", color: "#059669", border: "rgba(16,185,129,0.2)" },
            approved: { bg: "rgba(16,185,129,0.08)", color: "#059669", border: "rgba(16,185,129,0.2)" },
            pending: { bg: "rgba(245,158,11,0.08)", color: "#d97706", border: "rgba(245,158,11,0.2)" },
        };
        const s = map[status?.toLowerCase()] || { bg: "rgba(148,163,184,0.1)", color: "#64748b", border: "rgba(148,163,184,0.2)" };
        return (
            <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 8, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center' }}>
                {status}
            </span>
        );
    };

    const AttendanceDot = ({ isPresent, late }) => {
        const color = (isPresent && late) ? '#f59e0b' : isPresent ? '#10b981' : '#ef4444';
        return <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block', boxShadow: `0 0 6px ${color}60` }} />;
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid rgba(226,232,240,1)', boxShadow: '0 8px 32px -8px rgba(99,102,241,0.2)', padding: '10px 14px', fontFamily: "'DM Sans', sans-serif" }}>
                <p style={{ color: '#94a3b8', fontSize: 10, marginBottom: 3 }}>{moment(label).format("MMM DD, YYYY")}</p>
                <p style={{ fontWeight: 800, color: '#6366f1', fontSize: 14 }}>{payload[0].value} marks</p>
            </div>
        );
    };

    const InfoRow = ({ label, value }) => (
        <div className="spd-info-row">
            <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{label}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>{value || "N/A"}</span>
        </div>
    );

    const MiniStat = ({ label, count, colorClass, color }) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 12px', borderRadius: 14, border: `1px solid ${color}25`, background: `${color}08` }}>
            <span style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{count}</span>
            <span style={{ fontSize: 9, fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em', color: `${color}CC` }}>{label}</span>
        </div>
    );

    return (
        // w-full
        <div className="spd-root min-h-screen  md:px-8 pb-16 lg:ml-80 ml-0 spd-mesh-bg">

            {/* Navbar */}
            <div className=" mx-auto mb-4 px-4 sm:px-0">
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

            {/* ── Page Header ──────────────────────────────── */}
            <div className=" mx-auto flex items-center gap-4 mb-8 px-4 sm:px-0">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(-1)}
                    style={{
                        width: 44, height: 44, borderRadius: 14, background: 'white',
                        border: '1px solid rgba(226,232,240,0.8)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: '#64748b',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer',
                        flexShrink: 0
                    }}
                >
                    <IoArrowBack size={18} />
                </motion.button>
                <div>
                    <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                        Student Profile
                    </h1>
                    <p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, marginTop: 2 }}>Full academic overview & analytics</p>
                </div>
            </div>

            <div className=" mx-auto grid grid-cols-1 lg:grid-cols-4 gap-7 px-4 sm:px-0">

                {/* ── LEFT SIDEBAR ─────────────────────────── */}
                <div className="lg:col-span-1 space-y-4">

                    {/* ── Profile Card ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="spd-sidebar-card"
                    >
                        {/* Top Hero Banner */}
                        <div style={{
                            height: 80, background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 40%, #6d28d9 100%)',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            {/* Decorative circles */}
                            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
                            <div style={{ position: 'absolute', top: 20, right: 20, width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                            <div style={{ position: 'absolute', bottom: -10, left: 10, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                            {/* Grid overlay */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='none'/%3E%3Cpath d='M0 20V0M20 0v20' stroke='%23ffffff' stroke-opacity='0.06' stroke-width='0.5'/%3E%3C/svg%3E")`
                            }} />
                        </div>

                        {/* Avatar */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px 20px', marginTop: -40, textAlign: 'center' }}>
                            <div style={{ position: 'relative', marginBottom: 12 }}>
                                <div style={{
                                    width: 80, height: 80, borderRadius: 22,
                                    border: '3px solid white', overflow: 'hidden',
                                    boxShadow: '0 8px 24px -4px rgba(99,102,241,0.3), 0 0 0 1px rgba(99,102,241,0.1)'
                                }}>
                                    <img src={basicInfo.profilePic || profilePlaceholder} alt={basicInfo.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                {/* Online dot */}
                                <span className="spd-pulse-dot" style={{
                                    position: 'absolute', bottom: -2, right: -2, width: 16, height: 16,
                                    borderRadius: '50%', background: '#10b981', border: '2px solid white',
                                    boxShadow: '0 0 8px rgba(16,185,129,0.5)', display: 'block'
                                }} />
                            </div>

                            <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.3, marginBottom: 8 }}>
                                {basicInfo.name}
                            </h2>

                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, color: '#6366f1',
                                    background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                                    padding: '4px 10px', borderRadius: 8
                                }}>Roll #{basicInfo.rollNo || "N/A"}</span>
                                <span style={{
                                    fontSize: 10, fontWeight: 700, color: '#64748b',
                                    background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.12)',
                                    padding: '4px 10px', borderRadius: 8
                                }}>{basicInfo.level?.name || "N/A"}</span>
                            </div>

                            <div style={{ width: '100%', borderTop: '1px solid rgba(241,245,249,1)', paddingTop: 14 }}>
                                <InfoRow label="Class" value={basicInfo.classroomStudents?.[0]?.name} />
                                <InfoRow label="Level" value={basicInfo.level?.name} />
                            </div>

                            {/* Contact */}
                            <div style={{ width: '100%', paddingTop: 14, borderTop: '1px solid rgba(241,245,249,1)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: 10,
                                        background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', flexShrink: 0
                                    }}>
                                        <IoMail size={12} />
                                    </div>
                                    <span style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{basicInfo.email}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: 10,
                                        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', flexShrink: 0
                                    }}>
                                        <IoCall size={12} />
                                    </div>
                                    <span style={{ fontSize: 11, color: '#64748b' }}>{basicInfo.phoneNumber || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Attendance Ring Card ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        style={{
                            borderRadius: 24,
                            background: 'linear-gradient(145deg, #0f0c29 0%, #1e1b4b 50%, #24243e 100%)',
                            border: '1px solid rgba(99,102,241,0.2)',
                            overflow: 'hidden',
                            position: 'relative',
                            boxShadow: '0 20px 60px -15px rgba(99,102,241,0.4)'
                        }}
                    >
                        {/* Decorative blobs */}
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.3), transparent)', filter: 'blur(20px)' }} />
                        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.2), transparent)', filter: 'blur(16px)' }} />
                        <div className="spd-shimmer" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

                        <div style={{ position: 'relative', padding: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                                {/* SVG Ring */}
                                <div style={{ position: 'relative', width: 76, height: 76, flexShrink: 0 }}>
                                    <svg width="76" height="76" viewBox="0 0 120 120">
                                        <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.07)" strokeWidth="10" fill="none" />
                                        <defs>
                                            <linearGradient id="ringGrad1" x1="0" y1="0" x2="1" y2="1">
                                                <stop stopColor="#818cf8" />
                                                <stop offset="1" stopColor="#a855f7" />
                                            </linearGradient>
                                        </defs>
                                        <motion.circle
                                            cx="60" cy="60" r="52"
                                            stroke="url(#ringGrad1)"
                                            strokeWidth="10" fill="none"
                                            strokeLinecap="round"
                                            strokeDasharray={circumference}
                                            initial={{ strokeDashoffset: circumference }}
                                            animate={{ strokeDashoffset: circumference - (circumference * attendancePct / 100) }}
                                            transition={{ duration: 1.4, ease: "easeOut", delay: 0.4 }}
                                            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                        />
                                    </svg>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 800, color: 'white' }}>{attendancePct}%</span>
                                    </div>
                                </div>
                                <div>
                                    <p style={{ color: 'rgba(165,180,252,0.7)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Attendance Rate</p>
                                    <p style={{
                                        fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800,
                                        color: attendancePct >= 75 ? '#34d399' : '#f87171', lineHeight: 1
                                    }}>
                                        {attendancePct >= 75 ? "Good Standing" : "At Risk"}
                                    </p>
                                    <p style={{ color: 'rgba(165,180,252,0.5)', fontSize: 10, fontWeight: 500, marginTop: 4 }}>{attendance.length} total sessions</p>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                                {[
                                    { color: '#34d399', label: "Present", count: attendance?.filter(a => a.isPresent && !a.late).length || 0 },
                                    { color: '#fbbf24', label: "Late", count: attendance?.filter(a => a.late).length || 0 },
                                    { color: '#f87171', label: "Absent", count: attendance?.filter(a => !a.isPresent).length || 0 }
                                ].map(({ color, label, count }) => (
                                    <div key={label} style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                        padding: '10px 6px', borderRadius: 14,
                                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)'
                                    }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }} />
                                        <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: 'white', lineHeight: 1 }}>{count}</span>
                                        <span style={{ fontSize: 8, color: 'rgba(165,180,252,0.6)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* ── Quick Actions ── */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.5 }}
                        className="spd-sidebar-card"
                        style={{ padding: 16 }}
                    >
                        <p style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 4px 10px' }}>Quick Actions</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {[
                                {
                                    icon: <IoChatbubbleEllipses size={14} />,
                                    label: "Message Parent",
                                    colors: { bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.15)', text: '#4f46e5', dot: '#6366f1' },
                                    onClick: () => setIsMessageModalOpen(true)
                                },
                                {
                                    icon: <IoDownload size={14} />,
                                    label: "Download Report",
                                    colors: { bg: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.15)', text: '#7c3aed', dot: '#8b5cf6' },
                                    onClick: handleDownloadReport
                                },
                                {
                                    icon: <IoStar size={14} />,
                                    label: "Add Teacher Note",
                                    colors: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)', text: '#d97706', dot: '#f59e0b' },
                                    onClick: () => setIsNoteModalOpen(true)
                                }
                            ].map(({ icon, label, colors, onClick }) => (
                                <motion.button
                                    key={label}
                                    whileHover={{ x: 3 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={onClick}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '10px 12px', borderRadius: 14, fontSize: 12, fontWeight: 600,
                                        border: `1px solid ${colors.border}`, background: colors.bg,
                                        color: colors.text, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif"
                                    }}
                                >
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors.dot, boxShadow: `0 0 6px ${colors.dot}` }} />
                                    {icon}
                                    {label}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ── RIGHT CONTENT ─────────────────────────── */}
                <div className="lg:col-span-3 space-y-6">

                    {/* ── Navigation Tabs ── */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto", paddingBottom: 4 }} className="no-scrollbar">
                        {tabs.map((tab, i) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                whileTap={{ scale: 0.95 }}
                                className={tab.id === "timetable" ? "hidden lg:flex" : "flex"}
                                style={{
                                    alignItems: "center",
                                    gap: 7,
                                    padding: "10px 18px",
                                    borderRadius: 14,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    fontFamily: "'DM Sans', sans-serif",
                                    transition: "all 0.2s ease",
                                    ...(activeTab === tab.id
                                        ? {
                                            background: "linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)",
                                            color: "white",
                                            border: "1px solid rgba(99,102,241,0.3)",
                                            boxShadow: "0 8px 24px -4px rgba(67,56,202,0.4)",
                                        }
                                        : {
                                            background: "white",
                                            color: "#64748b",
                                            border: "1px solid rgba(226,232,240,0.8)",
                                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                                        }),
                                }}
                            >
                                <span style={{ color: activeTab === tab.id ? "rgba(165,180,252,0.9)" : "#94a3b8" }}>
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </motion.button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.22 }}
                        >

                            {/* ══ OVERVIEW TAB ════════════════════════ */}
                            {activeTab === "overview" && (
                                <div className="space-y-6">
                                    {/* Stat cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {/* Assignments */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                                            className="spd-stat-card" style={{ padding: 22 }}
                                        >
                                            <div style={{
                                                position: 'absolute', top: -12, right: -12, width: 64, height: 64,
                                                borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.12), transparent)'
                                            }} />
                                            <div style={{ position: 'relative' }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: 14,
                                                    background: 'linear-gradient(135deg, #fed7aa, #fb923c)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    marginBottom: 14, boxShadow: '0 6px 16px -4px rgba(249,115,22,0.4)'
                                                }}>
                                                    <IoDocumentText size={16} color="white" />
                                                </div>
                                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{assignments.length}</p>
                                                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>Assignments</p>
                                                <div style={{ marginTop: 14, height: 4, borderRadius: 4, background: 'rgba(241,245,249,1)' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }} animate={{ width: `${Math.min(assignments.length * 5, 100)}%` }}
                                                        transition={{ duration: 0.8, delay: 0.2 }}
                                                        style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #fdba74, #f97316)' }}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Quizzes */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                            className="spd-stat-card" style={{ padding: 22 }}
                                        >
                                            <div style={{
                                                position: 'absolute', top: -12, right: -12, width: 64, height: 64,
                                                borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.12), transparent)'
                                            }} />
                                            <div style={{ position: 'relative' }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: 14,
                                                    background: 'linear-gradient(135deg, #bfdbfe, #3b82f6)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    marginBottom: 14, boxShadow: '0 6px 16px -4px rgba(59,130,246,0.4)'
                                                }}>
                                                    <IoBook size={16} color="white" />
                                                </div>
                                                <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{quizzes.length}</p>
                                                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>Quizzes Taken</p>
                                                <div style={{ marginTop: 14, height: 4, borderRadius: 4, background: 'rgba(241,245,249,1)' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }} animate={{ width: `${Math.min(quizzes.length * 8, 100)}%` }}
                                                        transition={{ duration: 0.8, delay: 0.25 }}
                                                        style={{ height: '100%', borderRadius: 4, background: 'linear-gradient(90deg, #93c5fd, #3b82f6)' }}
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Fee Status */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                                            className="spd-stat-card"
                                            style={{
                                                padding: 22,
                                                background: fees.some(f => f.status === 'unpaid')
                                                    ? 'linear-gradient(135deg, #fff5f5, #fef2f2)'
                                                    : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                                                border: `1px solid ${fees.some(f => f.status === 'unpaid') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.12)'}`
                                            }}
                                        >
                                            <div style={{ position: 'relative' }}>
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: 14,
                                                    background: fees.some(f => f.status === 'unpaid')
                                                        ? 'linear-gradient(135deg, #fca5a5, #ef4444)'
                                                        : 'linear-gradient(135deg, #6ee7b7, #10b981)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    marginBottom: 14,
                                                    boxShadow: fees.some(f => f.status === 'unpaid') ? '0 6px 16px -4px rgba(239,68,68,0.4)' : '0 6px 16px -4px rgba(16,185,129,0.4)'
                                                }}>
                                                    <IoWallet size={16} color="white" />
                                                </div>
                                                <p style={{
                                                    fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, lineHeight: 1,
                                                    color: fees.some(f => f.status === 'unpaid') ? '#dc2626' : '#059669'
                                                }}>
                                                    {fees.some(f => f.status === 'unpaid') ? 'Dues Pending' : 'All Clear'}
                                                </p>
                                                <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, marginTop: 4 }}>Fee Status</p>
                                                <p style={{ fontSize: 10, fontWeight: 700, marginTop: 8, color: fees.some(f => f.status === 'unpaid') ? '#ef4444' : '#10b981' }}>
                                                    {fees.filter(f => f.status === 'unpaid').length} unpaid · {fees.filter(f => f.status === 'paid').length} paid
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Parent + Performance */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <PremiumCard className="p-5">
                                            <SectionHeader icon={<IoPerson size={13} />} title="Parent / Guardian" gradient="from-indigo-400 to-violet-500" />
                                            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                                                <div style={{ width: 56, height: 56, borderRadius: 18, overflow: 'hidden', border: '2px solid rgba(226,232,240,0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', flexShrink: 0 }}>
                                                    <img src={basicInfo.guardian?.profilePic || profilePlaceholder} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                                </div>
                                                <div>
                                                    <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0f172a', fontSize: 14, lineHeight: 1.3 }}>{basicInfo.guardian?.name || basicInfo.guardianName}</p>
                                                    <span style={{ fontSize: 9, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: 6, display: 'inline-block', marginTop: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Guardian</span>
                                                </div>
                                            </div>
                                            <InfoRow label="Contact" value={basicInfo.guardian?.phoneNumber || basicInfo.guardianPhoneNumber} />
                                            <InfoRow label="Email" value={basicInfo.guardian?.email || basicInfo.guardianEmail} />
                                        </PremiumCard>

                                        <PremiumCard className="p-5">
                                            <SectionHeader icon={<IoTrendingUp size={13} />} title="Performance Summary" gradient="from-violet-500 to-purple-600" />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {[
                                                    {
                                                        label: "Avg Assignment Score",
                                                        value: assignments.length > 0 ? `${Math.round(assignments.reduce((s, a) => s + (a.marks || 0), 0) / assignments.length)}%` : "N/A",
                                                        color: '#6366f1', bg: 'rgba(99,102,241,0.06)'
                                                    },
                                                    {
                                                        label: "Avg Quiz Score",
                                                        value: quizzes.length > 0 ? `${Math.round(quizzes.reduce((s, q) => s + (q.marks || 0), 0) / quizzes.length)}%` : "N/A",
                                                        color: '#3b82f6', bg: 'rgba(59,130,246,0.06)'
                                                    },
                                                    {
                                                        label: "Total Submissions",
                                                        value: assignments.length + quizzes.length,
                                                        color: '#8b5cf6', bg: 'rgba(139,92,246,0.06)'
                                                    }
                                                ].map(({ label, value, color, bg }) => (
                                                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 14, background: bg }}>
                                                        <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>{label}</span>
                                                        <span style={{ fontSize: 14, fontWeight: 800, color, fontFamily: "'Sora', sans-serif" }}>{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </PremiumCard>
                                    </div>

                                    {/* Enrolled Subjects */}
                                    <PremiumCard className="p-5">
                                        <SectionHeader icon={<IoBook size={13} />} title="Enrolled Subjects" gradient="from-blue-500 to-cyan-500" />
                                        {subjectAttendance.length > 0 ? (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                {subjectAttendance.map((subject, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        whileHover={{ y: -3 }}
                                                        style={{
                                                            padding: 16, borderRadius: 18,
                                                            background: 'rgba(248,250,252,1)',
                                                            border: '1px solid rgba(226,232,240,0.8)',
                                                            cursor: 'default', transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <div style={{
                                                            width: 28, height: 28, borderRadius: 10,
                                                            background: `linear-gradient(135deg, hsl(${(idx * 47) % 360},70%,88%), hsl(${(idx * 47 + 30) % 360},70%,72%))`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10
                                                        }}>
                                                            <IoBook size={12} color="white" />
                                                        </div>
                                                        <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subject</span>
                                                        <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 800, color: '#1e293b', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{subject.name}</p>
                                                        <div style={{ marginTop: 10 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                                                <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 500 }}>Attendance</span>
                                                                <span style={{ fontSize: 10, fontWeight: 800, color: subject.percentage >= 75 ? '#059669' : '#d97706' }}>{subject.percentage}%</span>
                                                            </div>
                                                            <div style={{ height: 4, borderRadius: 4, background: 'rgba(226,232,240,1)' }}>
                                                                <div style={{ height: '100%', borderRadius: 4, width: `${subject.percentage}%`, background: subject.percentage >= 75 ? 'linear-gradient(90deg, #34d399, #10b981)' : 'linear-gradient(90deg, #fcd34d, #f59e0b)' }} />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0', fontSize: 13 }}>No enrolled subjects found.</p>
                                        )}
                                    </PremiumCard>

                                    {/* Teacher's Notes */}
                                    <PremiumCard className="p-5">
                                        <SectionHeader
                                            icon={<IoList size={13} />}
                                            title="Teacher's Notes"
                                            gradient="from-amber-400 to-orange-500"
                                            action={
                                                <motion.button
                                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                                    onClick={() => setIsNoteModalOpen(true)}
                                                    style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', padding: '6px 12px', borderRadius: 10, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                                                >
                                                    + Add Note
                                                </motion.button>
                                            }
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {notes && notes.length > 0 ? notes.map((note, i) => (
                                                <div key={i} style={{
                                                    padding: 16, borderRadius: 18,
                                                    background: 'linear-gradient(135deg, rgba(254,243,199,0.6), rgba(253,230,138,0.3))',
                                                    border: '1px solid rgba(251,191,36,0.2)'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                                        <div style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg, #fcd34d, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: 'white' }}>
                                                            {note.teacher?.name?.charAt(0) || "T"}
                                                        </div>
                                                        <p style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{note.teacher?.name || "Teacher"}</p>
                                                        <p style={{ fontSize: 10, color: '#94a3b8', marginLeft: 'auto' }}>{moment(note.createdAt).format("MMM DD, YYYY")}</p>
                                                    </div>
                                                    <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.6, fontStyle: 'italic', borderLeft: '3px solid rgba(251,191,36,0.5)', paddingLeft: 12 }}>"{note.content}"</p>
                                                </div>
                                            )) : (
                                                <div style={{ padding: '32px 0', textAlign: 'center' }}>
                                                    <IoDocumentText style={{ color: '#e2e8f0', margin: '0 auto 8px' }} size={32} />
                                                    <p style={{ color: '#94a3b8', fontSize: 13 }}>No notes recorded yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </PremiumCard>
                                </div>
                            )}

                            {/* ══ ACADEMIC TAB ════════════════════════ */}
                            {activeTab === "academic" && (
                                <div className="space-y-6">
                                    <PremiumCard className="p-5">
                                        <SectionHeader
                                            icon={<IoTrendingUp size={13} />}
                                            title="Performance Trend"
                                            gradient="from-indigo-500 to-violet-500"
                                            action={
                                                <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', padding: '4px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <IoTrendingUp size={10} /> Assignments
                                                </span>
                                            }
                                        />
                                        <div style={{ height: 240, width: '100%' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={performanceTrends.assignments} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                                    <defs>
                                                        <linearGradient id="gradMark" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226,232,240,0.8)" />
                                                    <XAxis dataKey="date" tickFormatter={(v) => moment(v).format("MMM DD")} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }} />
                                                    <Tooltip content={<CustomTooltip />} />
                                                    <Area type="monotone" dataKey="marks" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#gradMark)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: 'white' }} />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </PremiumCard>

                                    <PremiumCard style={{ overflow: 'hidden' }} className="p-5">
                                        <SectionHeader
                                            icon={<IoDocumentText size={13} />}
                                            title="Recent Submissions"
                                            gradient="from-violet-500 to-purple-600"
                                            action={
                                                <motion.button
                                                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                                    onClick={handleDownloadReport}
                                                    style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', padding: '6px 12px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: "'DM Sans', sans-serif" }}
                                                >
                                                    <IoDownload size={11} /> Report Card
                                                </motion.button>
                                            }
                                        />
                                        <div style={{ overflowX: 'auto', margin: '0 -20px', padding: '0 20px' }}>
                                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid rgba(241,245,249,1)' }}>
                                                        {["Type", "Subject", "Title", "Score", "Grade"].map(h => (
                                                            <th key={h} style={{ paddingBottom: 12, fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', paddingRight: 16 }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        ...assignments.map(a => ({ ...a, _type: 'Assignment' })),
                                                        ...quizzes.map(q => ({ ...q, _type: 'Quiz' }))
                                                    ].slice(0, 10).map((item, idx) => (
                                                        <tr key={idx} className="spd-table-row" style={{ borderBottom: '1px solid rgba(248,250,252,1)' }}>
                                                            <td style={{ padding: '12px 16px 12px 0' }}>
                                                                <span style={{
                                                                    fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 7,
                                                                    ...(item._type === 'Assignment'
                                                                        ? { background: 'rgba(249,115,22,0.08)', color: '#ea580c', border: '1px solid rgba(249,115,22,0.15)' }
                                                                        : { background: 'rgba(59,130,246,0.08)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.15)' })
                                                                }}>
                                                                    {item._type}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '12px 16px 12px 0', fontSize: 12, fontWeight: 600, color: '#475569' }}>
                                                                {item.assignment?.subject?.name || item.quiz?.subject?.name || "N/A"}
                                                            </td>
                                                            <td style={{ padding: '12px 16px 12px 0', fontSize: 11, color: '#94a3b8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {item.assignment?.title || item.quiz?.title}
                                                            </td>
                                                            <td style={{ padding: '12px 16px 12px 0' }}>
                                                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                                                                    <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#6366f1', fontSize: 15 }}>{item.marks}</span>
                                                                    <span style={{ color: '#cbd5e1', fontSize: 11 }}>/{item.assignment?.totalMarks || item.quiz?.totalMarks}</span>
                                                                </div>
                                                            </td>
                                                            <td style={{ padding: '12px 0' }}>
                                                                <StatusPill status={item.grade || 'pending'} />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </PremiumCard>
                                </div>
                            )}

                            {/* ══ ATTENDANCE TAB ══════════════════════ */}
                            {activeTab === "attendance" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Donut Overview */}
                                        <PremiumCard className="p-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <SectionHeader icon={<IoCalendar size={13} />} title="Attendance Overview" gradient="from-indigo-500 to-violet-500" />
                                            <div style={{ position: 'relative', width: 160, height: 160, margin: '8px 0' }}>
                                                <svg width="160" height="160" viewBox="0 0 160 160">
                                                    <circle cx="80" cy="80" r="68" stroke="rgba(226,232,240,1)" strokeWidth="14" fill="none" />
                                                    <defs>
                                                        <linearGradient id="ringGrad2" x1="1" y1="0" x2="0" y2="1">
                                                            <stop stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" />
                                                        </linearGradient>
                                                    </defs>
                                                    <motion.circle
                                                        cx="80" cy="80" r="68"
                                                        stroke="url(#ringGrad2)"
                                                        strokeWidth="14" fill="none"
                                                        strokeLinecap="round"
                                                        strokeDasharray={2 * Math.PI * 68}
                                                        initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
                                                        animate={{ strokeDashoffset: 2 * Math.PI * 68 * (1 - attendancePct / 100) }}
                                                        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                                                        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                                                    />
                                                </svg>
                                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                    <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 30, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{attendancePct}%</span>
                                                    <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 }}>Average</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, marginTop: 16, width: '100%', justifyContent: 'center' }}>
                                                <MiniStat label="Present" count={(attendance?.filter(a => a.isPresent && !a.late).length || 0) + (classAttendance?.filter(a => a.isPresent && !a.late).length || 0)} color="#10b981" />
                                                <MiniStat label="Late" count={(attendance?.filter(a => a.late).length || 0) + (classAttendance?.filter(a => a.late).length || 0)} color="#f59e0b" />
                                                <MiniStat label="Absent" count={(attendance?.filter(a => !a.isPresent).length || 0) + (classAttendance?.filter(a => !a.isPresent).length || 0)} color="#ef4444" />
                                            </div>
                                        </PremiumCard>

                                        {/* History */}
                                        <PremiumCard className="p-5">
                                            <SectionHeader icon={<IoTime size={13} />} title="Attendance History" gradient="from-violet-500 to-purple-600" />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflowY: 'auto' }} className="no-scrollbar">
                                                {unifiedAttendanceHistory.length > 0 ? unifiedAttendanceHistory.slice(0, 20).map((record, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                            padding: '10px 12px', borderRadius: 14,
                                                            background: 'rgba(248,250,252,1)', border: '1px solid transparent',
                                                            transition: 'all 0.15s ease', cursor: 'default'
                                                        }}
                                                        whileHover={{ background: 'white', borderColor: 'rgba(226,232,240,1)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                                            <AttendanceDot isPresent={record.isPresent} late={record.late} />
                                                            <div style={{ minWidth: 0 }}>
                                                                <p style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.title}</p>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                                                    <span style={{ fontSize: 10, fontWeight: 600, color: '#6366f1' }}>{moment(record.date).format("MMM DD, YYYY")}</span>
                                                                    <span style={{ color: '#cbd5e1' }}>·</span>
                                                                    <span style={{ fontSize: 10, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{record.subtitle}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginLeft: 8, flexShrink: 0 }}>
                                                            <StatusPill status={record.isPresent ? (record.late ? 'late' : 'present') : 'absent'} />
                                                            <span style={{ fontSize: 8, color: '#cbd5e1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{record.type}</span>
                                                        </div>
                                                    </motion.div>
                                                )) : (
                                                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '48px 0', fontSize: 13 }}>No attendance records found.</p>
                                                )}
                                            </div>
                                        </PremiumCard>
                                    </div>

                                    {/* Subject-wise */}
                                    <PremiumCard className="p-5">
                                        <SectionHeader icon={<IoBook size={13} />} title="Attendance per Subject" gradient="from-blue-500 to-cyan-500" />
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid rgba(241,245,249,1)' }}>
                                                        {["Subject & Teacher", "Progress", "P / L / A"].map((h, i) => (
                                                            <th key={h} style={{ paddingBottom: 12, fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: i === 2 ? 'right' : 'left' }}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subjectAttendance.length > 0 ? subjectAttendance.map((item, idx) => (
                                                        <tr key={idx} className="spd-table-row" style={{ borderBottom: '1px solid rgba(248,250,252,1)' }}>
                                                            <td style={{ padding: '16px 16px 16px 0' }}>
                                                                <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: '#1e293b', fontSize: 13 }}>{item.name}</p>
                                                                <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{item.teacher || "N/A"}</p>
                                                            </td>
                                                            <td style={{ padding: '16px 24px 16px 0', minWidth: 180 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                                    <div style={{ flexGrow: 1, height: 6, background: 'rgba(226,232,240,1)', borderRadius: 6, overflow: 'hidden' }}>
                                                                        <motion.div
                                                                            initial={{ width: 0 }} animate={{ width: `${item.percentage}%` }}
                                                                            style={{ height: '100%', borderRadius: 6, background: item.percentage >= 75 ? 'linear-gradient(90deg, #34d399, #10b981)' : 'linear-gradient(90deg, #fcd34d, #f59e0b)' }}
                                                                        />
                                                                    </div>
                                                                    <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Sora', sans-serif", color: item.percentage >= 75 ? '#059669' : '#d97706', width: 36, textAlign: 'right' }}>{item.percentage}%</span>
                                                                </div>
                                                                <p style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 500, marginTop: 4 }}>{item.total} total lectures</p>
                                                            </td>
                                                            <td style={{ padding: '16px 0', textAlign: 'right' }}>
                                                                <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                                                                    {[
                                                                        { val: item.present, label: 'P', color: '#059669', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
                                                                        { val: item.late, label: 'L', color: '#d97706', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
                                                                        { val: item.absent, label: 'A', color: '#dc2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' }
                                                                    ].map(({ val, label, color, bg, border }) => (
                                                                        <span key={label} style={{ fontSize: 10, fontWeight: 700, color, background: bg, border: `1px solid ${border}`, padding: '3px 8px', borderRadius: 8 }}>{val}{label}</span>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )) : (
                                                        <tr><td colSpan="3" style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No subject attendance records found.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </PremiumCard>
                                </div>
                            )}

                            {/* ══ TIMETABLE TAB ═══════════════════════ */}
                            {activeTab === "timetable" && (() => {
                                // Accent palette per weekday
                                const DAY_ACCENT = {
                                    'Monday': { hdr: 'rgba(99,102,241,0.08)', hdrBorder: 'rgba(99,102,241,0.2)', dot: '#6366f1', dotBg: 'rgba(99,102,241,0.12)', txt: '#3730a3' },
                                    'Tuesday': { hdr: 'rgba(16,185,129,0.08)', hdrBorder: 'rgba(16,185,129,0.2)', dot: '#10b981', dotBg: 'rgba(16,185,129,0.12)', txt: '#065f46' },
                                    'Wednesday': { hdr: 'rgba(245,158,11,0.08)', hdrBorder: 'rgba(245,158,11,0.2)', dot: '#f59e0b', dotBg: 'rgba(245,158,11,0.12)', txt: '#92400e' },
                                    'Thursday': { hdr: 'rgba(239,68,68,0.08)', hdrBorder: 'rgba(239,68,68,0.2)', dot: '#ef4444', dotBg: 'rgba(239,68,68,0.12)', txt: '#991b1b' },
                                    'Friday': { hdr: 'rgba(168,85,247,0.08)', hdrBorder: 'rgba(168,85,247,0.2)', dot: '#a855f7', dotBg: 'rgba(168,85,247,0.12)', txt: '#6b21a8' },
                                    'Saturday': { hdr: 'rgba(20,184,166,0.08)', hdrBorder: 'rgba(20,184,166,0.2)', dot: '#14b8a6', dotBg: 'rgba(20,184,166,0.12)', txt: '#134e4a' },
                                    'Sunday': { hdr: 'rgba(249,115,22,0.08)', hdrBorder: 'rgba(249,115,22,0.2)', dot: '#f97316', dotBg: 'rgba(249,115,22,0.12)', txt: '#9a3412' },
                                };
                                const CLR_CYCLE = ['#6366f1', '#10b981', '#f59e0b', '#a855f7', '#ef4444', '#14b8a6', '#f97316', '#3b82f6'];

                                // Group & sort classes by day
                                const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                const grouped = classes.reduce((acc, cls) => {
                                    const d = moment(cls.startTime).format('dddd');
                                    if (!acc[d]) acc[d] = [];
                                    acc[d].push(cls);
                                    return acc;
                                }, {});
                                const days = DAY_ORDER.filter(d => grouped[d]);

                                if (classes.length === 0) return (
                                    <PremiumCard className="p-5">
                                        <SectionHeader icon={<IoTime size={13} />} title="Weekly Schedule" gradient="from-violet-500 to-indigo-500" />
                                        <div style={{ padding: '56px 0', textAlign: 'center' }}>
                                            <IoCalendar size={36} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
                                            <p style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>No classes scheduled this week.</p>
                                        </div>
                                    </PremiumCard>
                                );

                                let globalClsIdx = 0;
                                return (
                                    <PremiumCard className="p-5">
                                        <SectionHeader icon={<IoTime size={13} />} title="Weekly Schedule" gradient="from-violet-500 to-indigo-500" />
                                        <style>{`
                                            .tt-cls-item { transition: box-shadow 0.18s, transform 0.18s; }
                                            .tt-cls-item:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
                                            .tt-wrap::-webkit-scrollbar { width: 4px; }
                                            .tt-wrap::-webkit-scrollbar-thumb { background: rgba(124,58,237,0.25); border-radius: 99px; }
                                        `}</style>
                                        <div className="tt-wrap" style={{ maxHeight: 580, overflowY: 'auto', paddingRight: 2, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                            {days.map((dayName, di) => {
                                                const a = DAY_ACCENT[dayName] || DAY_ACCENT['Monday'];
                                                const dayCls = [...grouped[dayName]].sort((x, y) => new Date(x.startTime) - new Date(y.startTime));
                                                return (
                                                    <motion.div key={dayName} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.07 }}>
                                                        {/* ── Day Header ── */}
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: 10,
                                                            background: a.hdr, border: `1px solid ${a.hdrBorder}`,
                                                            borderRadius: 14, padding: '10px 14px', marginBottom: 10,
                                                        }}>
                                                            {/* Day mini-calendar badge */}
                                                            <div style={{
                                                                width: 40, height: 40, borderRadius: 10,
                                                                background: a.dotBg, display: 'flex', flexDirection: 'column',
                                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                            }}>
                                                                <span style={{ fontSize: 8, fontWeight: 800, textTransform: 'uppercase', color: a.dot, letterSpacing: '0.06em', lineHeight: 1 }}>
                                                                    {moment(dayCls[0].startTime).format('ddd')}
                                                                </span>
                                                                <span style={{ fontSize: 17, fontWeight: 800, color: a.txt, lineHeight: 1.15 }}>
                                                                    {moment(dayCls[0].startTime).format('DD')}
                                                                </span>
                                                            </div>
                                                            {/* Day name + date */}
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <p style={{ fontWeight: 800, fontSize: 13, color: a.txt, lineHeight: 1 }}>{dayName}</p>
                                                                <p style={{ fontSize: 10, color: a.dot, marginTop: 2, fontWeight: 500 }}>
                                                                    {moment(dayCls[0].startTime).format('MMMM DD, YYYY')}
                                                                </p>
                                                            </div>
                                                            {/* Class count badge */}
                                                            <div style={{
                                                                padding: '4px 11px', borderRadius: 99,
                                                                background: a.dotBg, border: `1px solid ${a.hdrBorder}`,
                                                                fontSize: 10, fontWeight: 700, color: a.txt, whiteSpace: 'nowrap',
                                                            }}>
                                                                {dayCls.length} {dayCls.length === 1 ? 'class' : 'classes'}
                                                            </div>
                                                        </div>

                                                        {/* ── Classes list ── */}
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingLeft: 4 }}>
                                                            {dayCls.map((cls, ci) => {
                                                                const accentColor = CLR_CYCLE[(globalClsIdx++) % CLR_CYCLE.length];
                                                                const initials = cls.teacher?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';
                                                                return (
                                                                    <div
                                                                        key={ci}
                                                                        className="tt-cls-item"
                                                                        style={{
                                                                            display: 'flex', alignItems: 'center', gap: 0,
                                                                            borderRadius: 13,
                                                                            border: '1px solid rgba(226,232,240,0.8)',
                                                                            background: '#fff',
                                                                            overflow: 'hidden',
                                                                            cursor: 'default',
                                                                        }}
                                                                    >
                                                                        {/* Colored left stripe */}
                                                                        <div style={{ width: 4, alignSelf: 'stretch', background: accentColor, flexShrink: 0 }} />

                                                                        {/* Time block */}
                                                                        <div style={{
                                                                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                                                                            justifyContent: 'center', padding: '10px 12px',
                                                                            borderRight: '1px solid rgba(226,232,240,0.7)',
                                                                            minWidth: 72, flexShrink: 0,
                                                                            background: `${accentColor}09`,
                                                                        }}>
                                                                            <span style={{ fontSize: 11, fontWeight: 700, color: accentColor }}>
                                                                                {moment(cls.startTime).format('hh:mm')}
                                                                            </span>
                                                                            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 500, lineHeight: 1.2 }}>
                                                                                {moment(cls.startTime).format('A')}
                                                                            </span>
                                                                            <span style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 400, marginTop: 2 }}>↓</span>
                                                                            <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                                                                                {moment(cls.endTime).format('hh:mm')}
                                                                            </span>
                                                                            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 500, lineHeight: 1.2 }}>
                                                                                {moment(cls.endTime).format('A')}
                                                                            </span>
                                                                        </div>

                                                                        {/* Subject info */}
                                                                        <div style={{ flex: 1, minWidth: 0, padding: '10px 14px' }}>
                                                                            <div style={{
                                                                                fontWeight: 700, fontSize: 13, color: '#0f172a',
                                                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                                                marginBottom: 4,
                                                                            }}>
                                                                                {cls.subject?.name || 'Unnamed Subject'}
                                                                            </div>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                                                <span style={{
                                                                                    fontSize: 9, fontWeight: 700,
                                                                                    padding: '2px 7px', borderRadius: 99,
                                                                                    background: `${accentColor}15`, color: accentColor,
                                                                                    border: `1px solid ${accentColor}30`,
                                                                                    textTransform: 'uppercase', letterSpacing: '0.06em',
                                                                                }}>
                                                                                    Live Class
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        {/* Teacher pill */}
                                                                        <div style={{
                                                                            display: 'flex', alignItems: 'center', gap: 7,
                                                                            padding: '8px 14px 8px 10px',
                                                                            borderLeft: '1px solid rgba(226,232,240,0.7)',
                                                                            flexShrink: 0,
                                                                        }}>
                                                                            <div style={{
                                                                                width: 26, height: 26, borderRadius: '50%',
                                                                                background: `linear-gradient(135deg, ${accentColor}55, ${accentColor}cc)`,
                                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                                fontSize: 9, fontWeight: 800, color: '#fff', flexShrink: 0,
                                                                            }}>
                                                                                {initials}
                                                                            </div>
                                                                            <div>
                                                                                <p style={{ fontSize: 11, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                                                                                    {cls.teacher?.name || 'N/A'}
                                                                                </p>
                                                                                <p style={{ fontSize: 9, color: '#94a3b8', fontWeight: 400 }}>Teacher</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </div>
                                    </PremiumCard>
                                );
                            })()}

                            {/* ══ FEES TAB ════════════════════════════ */}
                            {activeTab === "fees" && (
                                <div className="space-y-6">
                                    {/* Hero Card */}
                                    <div style={{
                                        position: 'relative', overflow: 'hidden', borderRadius: 28,
                                        background: 'linear-gradient(145deg, #0f0c29 0%, #1e1b4b 40%, #302b63 100%)',
                                        border: '1px solid rgba(99,102,241,0.2)', padding: 28, color: 'white',
                                        boxShadow: '0 24px 64px -16px rgba(99,102,241,0.45)'
                                    }}>
                                        {/* Decorative */}
                                        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent)', filter: 'blur(24px)' }} />
                                        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.15), transparent)', filter: 'blur(20px)' }} />
                                        <div className="spd-shimmer" style={{ position: 'absolute', inset: 0 }} />
                                        <IoWallet style={{ position: 'absolute', bottom: 20, right: 24, color: 'rgba(255,255,255,0.04)' }} size={110} />

                                        <div style={{ position: 'relative' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f87171', boxShadow: '0 0 8px #f87171' }} />
                                                <p style={{ color: 'rgba(165,180,252,0.7)', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Pending Dues</p>
                                            </div>
                                            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 40, fontWeight: 800, marginBottom: 6, lineHeight: 1 }}>
                                                ${fees.reduce((sum, f) => f.status === 'unpaid' ? sum + f.amount : sum, 0).toLocaleString()}
                                            </h3>
                                            <p style={{ color: 'rgba(165,180,252,0.6)', fontSize: 13, marginBottom: 24 }}>
                                                {fees.filter(f => f.status === 'unpaid').length} unpaid · {fees.filter(f => f.status === 'paid').length} paid invoices
                                            </p>
                                            <motion.button
                                                whileHover={{ scale: 1.03, background: '#eef2ff' }} whileTap={{ scale: 0.97 }}
                                                style={{
                                                    background: 'white', color: '#312e81', fontFamily: "'Sora', sans-serif",
                                                    fontWeight: 700, padding: '12px 24px', borderRadius: 14, fontSize: 13,
                                                    cursor: 'pointer', border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                Pay Now →
                                            </motion.button>
                                        </div>
                                    </div>

                                    <PremiumCard className="p-5">
                                        <SectionHeader icon={<IoWallet size={13} />} title="Payment History" gradient="from-indigo-500 to-blue-500" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            {fees.map((fee, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '12px 14px', borderRadius: 16, border: '1px solid transparent',
                                                        transition: 'all 0.15s ease', cursor: 'default'
                                                    }}
                                                    whileHover={{ background: 'rgba(248,250,252,1)', borderColor: 'rgba(226,232,240,1)' }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{
                                                            width: 36, height: 36, borderRadius: 12,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            ...(fee.status === 'paid'
                                                                ? { background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }
                                                                : { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' })
                                                        }}>
                                                            {fee.status === 'paid' ? <IoCheckmarkCircle size={16} /> : <IoCloseCircle size={16} />}
                                                        </div>
                                                        <div>
                                                            <p style={{ fontWeight: 700, color: '#1e293b', fontSize: 13, textTransform: 'capitalize' }}>
                                                                {fee.type} Fee — {moment().month(fee.month - 1).format("MMMM")} {fee.year}
                                                            </p>
                                                            <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Due: {moment(fee.dueDate).format("MMM DD, YYYY")}</p>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#0f172a', fontSize: 15 }}>${fee.amount}</p>
                                                        <div style={{ marginTop: 4 }}><StatusPill status={fee.status} /></div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </PremiumCard>
                                </div>
                            )}

                            {/* ══ MORE TAB ════════════════════════════ */}
                            {activeTab === "more" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Library */}
                                    <PremiumCard className="p-5">
                                        <SectionHeader icon={<IoLibrary size={13} />} title="Library Records" gradient="from-indigo-500 to-blue-500" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {library.length > 0 ? library.map((book, i) => (
                                                <motion.div key={i} whileHover={{ x: 4 }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, background: 'rgba(248,250,252,1)', border: '1px solid transparent', transition: 'all 0.15s ease', cursor: 'default' }}>
                                                    <div style={{ width: 32, height: 42, borderRadius: 8, background: `linear-gradient(160deg, hsl(${i * 67 % 360},65%,60%), hsl(${(i * 67 + 40) % 360},65%,45%))`, flexShrink: 0, boxShadow: '2px 3px 8px rgba(0,0,0,0.15)' }} />
                                                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                                                        <p style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.bookName}</p>
                                                        <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Issued: {moment(book.issueDate).format("MMM DD, YYYY")}</p>
                                                    </div>
                                                    <StatusPill status={book.status} />
                                                </motion.div>
                                            )) : (
                                                <div style={{ padding: '32px 0', textAlign: 'center' }}>
                                                    <IoLibrary size={32} color="#e2e8f0" style={{ margin: '0 auto 8px' }} />
                                                    <p style={{ color: '#94a3b8', fontSize: 13 }}>No books issued.</p>
                                                </div>
                                            )}
                                        </div>
                                    </PremiumCard>

                                    {/* Transport */}
                                    <PremiumCard className="p-5">
                                        <SectionHeader icon={<IoBus size={13} />} title="Transport Details" gradient="from-orange-400 to-rose-500" />
                                        {transport ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                <div style={{ padding: 16, borderRadius: 18, background: 'linear-gradient(135deg, rgba(255,237,213,0.7), rgba(254,215,170,0.4))', border: '1px solid rgba(253,186,116,0.3)' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                        <div style={{ width: 22, height: 22, borderRadius: 8, background: 'linear-gradient(135deg, #fdba74, #f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <IoBus size={10} color="white" />
                                                        </div>
                                                        <p style={{ fontSize: 9, fontWeight: 700, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bus Info</p>
                                                    </div>
                                                    <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: '#1e293b' }}>Bus No: {transport.busNumber}</p>
                                                    <p style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{transport.route}</p>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                                    {[{ label: "Pickup Time", value: transport.pickupTime }, { label: "Drop Time", value: transport.dropTime }].map(({ label, value }) => (
                                                        <div key={label} style={{ padding: 14, background: 'rgba(248,250,252,1)', border: '1px solid rgba(226,232,240,0.8)', borderRadius: 14, textAlign: 'center' }}>
                                                            <p style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</p>
                                                            <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#1e293b', fontSize: 14 }}>{value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ padding: '32px 0', textAlign: 'center' }}>
                                                <IoBus size={32} color="#e2e8f0" style={{ margin: '0 auto 8px' }} />
                                                <p style={{ color: '#94a3b8', fontSize: 13 }}>Not using institute transport.</p>
                                            </div>
                                        )}
                                    </PremiumCard>

                                    {/* Discipline */}
                                    <PremiumCard className="p-5">
                                        <SectionHeader icon={<IoWarning size={13} />} title="Behavior Records" gradient="from-red-400 to-rose-500" />
                                        {discipline.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {discipline.map((rec, i) => (
                                                    <div key={i} style={{ padding: 16, background: 'linear-gradient(135deg, rgba(254,226,226,0.6), rgba(252,165,165,0.2))', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 18 }}>
                                                        <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{rec.incident}</p>
                                                        <p style={{ fontSize: 12, color: '#ef4444', marginTop: 8, fontWeight: 600, borderLeft: '3px solid rgba(239,68,68,0.4)', paddingLeft: 10 }}>{rec.actionTaken}</p>
                                                        <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 8 }}>{moment(rec.date).format("MMM DD, YYYY")}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ padding: '24px 0', textAlign: 'center' }}>
                                                <IoCheckmarkCircle size={36} color="#34d399" style={{ margin: '0 auto 10px' }} />
                                                <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, color: '#059669', fontSize: 14 }}>Excellent Behavior</p>
                                                <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>No incidents recorded</p>
                                            </div>
                                        )}
                                    </PremiumCard>

                                    {/* Leaves */}
                                    <PremiumCard className="p-5">
                                        <SectionHeader icon={<IoCalendar size={13} />} title="Leave Requests" gradient="from-emerald-400 to-teal-500" />
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {leaves.length > 0 ? leaves.map((l, i) => (
                                                <motion.div key={i} whileHover={{ x: 3 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 14, background: 'rgba(248,250,252,1)', border: '1px solid transparent', transition: 'all 0.15s ease', cursor: 'default' }}>
                                                    <div>
                                                        <p style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>
                                                            {moment(l.startDate).format("MMM DD")} – {moment(l.endDate).format("MMM DD, YYYY")}
                                                        </p>
                                                        <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{l.reason}</p>
                                                    </div>
                                                    <StatusPill status={l.status} />
                                                </motion.div>
                                            )) : (
                                                <div style={{ padding: '32px 0', textAlign: 'center' }}>
                                                    <IoCalendar size={32} color="#e2e8f0" style={{ margin: '0 auto 8px' }} />
                                                    <p style={{ color: '#94a3b8', fontSize: 13 }}>No leave requests.</p>
                                                </div>
                                            )}
                                        </div>
                                    </PremiumCard>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* ── Modals ── */}
            <PremiumModal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Add Teacher's Note" subtitle="Record your observation about this student" accentGradient="from-amber-400 to-orange-500">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <textarea
                        style={{ width: '100%', height: 112, padding: 16, borderRadius: 16, border: '1px solid rgba(226,232,240,0.8)', background: 'rgba(248,250,252,1)', outline: 'none', resize: 'none', fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: '#334155', lineHeight: 1.6, transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box' }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(245,158,11,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.08)'; e.target.style.background = 'white'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(226,232,240,0.8)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(248,250,252,1)'; }}
                        placeholder="Write your observation about the student..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                    />
                    <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        onClick={() => addNoteMutation.mutate(noteContent)}
                        disabled={addNoteMutation.isPending || !noteContent.trim()}
                        style={{
                            width: '100%', padding: '14px', borderRadius: 16, border: 'none',
                            background: noteContent.trim() ? 'linear-gradient(135deg, #1e1b4b, #4338ca)' : 'rgba(226,232,240,1)',
                            color: noteContent.trim() ? 'white' : '#94a3b8',
                            fontSize: 13, fontWeight: 700, cursor: noteContent.trim() ? 'pointer' : 'not-allowed',
                            fontFamily: "'Sora', sans-serif",
                            boxShadow: noteContent.trim() ? '0 8px 24px -4px rgba(67,56,202,0.4)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {addNoteMutation.isPending ? "Adding..." : "Save Note"}
                    </motion.button>
                </div>
            </PremiumModal>

            <PremiumModal isOpen={isMessageModalOpen} onClose={() => setIsMessageModalOpen(false)} title="Message Parent" subtitle="Send a direct message to the guardian" accentGradient="from-indigo-500 to-violet-600">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: 'rgba(238,242,255,1)', border: '1px solid rgba(199,210,254,0.8)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, #a5b4fc, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: 'white', flexShrink: 0 }}>
                            {basicInfo?.guardianName?.charAt(0) || "G"}
                        </div>
                        <div>
                            <p style={{ fontSize: 9, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Guardian</p>
                            <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 800, color: '#312e81' }}>{basicInfo?.guardianName}</p>
                        </div>
                    </div>
                    <textarea
                        style={{ width: '100%', height: 112, padding: 16, borderRadius: 16, border: '1px solid rgba(226,232,240,0.8)', background: 'rgba(248,250,252,1)', outline: 'none', resize: 'none', fontSize: 13, fontFamily: "'DM Sans', sans-serif", color: '#334155', lineHeight: 1.6, transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box' }}
                        onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.07)'; e.target.style.background = 'white'; }}
                        onBlur={e => { e.target.style.borderColor = 'rgba(226,232,240,0.8)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(248,250,252,1)'; }}
                        placeholder="Type your message for the parent..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                    />
                    <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        onClick={() => sendMessageMutation.mutate(messageText)}
                        disabled={sendMessageMutation.isPending || !messageText.trim()}
                        style={{
                            width: '100%', padding: '14px', borderRadius: 16, border: 'none',
                            background: messageText.trim() ? 'linear-gradient(135deg, #1e1b4b, #4338ca)' : 'rgba(226,232,240,1)',
                            color: messageText.trim() ? 'white' : '#94a3b8',
                            fontSize: 13, fontWeight: 700, cursor: messageText.trim() ? 'pointer' : 'not-allowed',
                            fontFamily: "'Sora', sans-serif",
                            boxShadow: messageText.trim() ? '0 8px 24px -4px rgba(67,56,202,0.4)' : 'none',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                    </motion.button>
                </div>
            </PremiumModal>
        </div>
    );
};

/* ── Premium Modal ────────────────────────────────────────────── */
const PremiumModal = ({ isOpen, onClose, title, subtitle, children, accentGradient = "from-indigo-500 to-violet-600" }) => {
    if (!isOpen) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ position: 'absolute', inset: 0, background: 'rgba(15,12,41,0.5)', backdropFilter: 'blur(8px)' }}
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                style={{
                    background: 'white', borderRadius: 28, width: '100%', maxWidth: 420,
                    boxShadow: '0 32px 96px -16px rgba(15,12,41,0.4), 0 0 0 1px rgba(226,232,240,0.5)',
                    position: 'relative', zIndex: 10, overflow: 'hidden', fontFamily: "'DM Sans', sans-serif"
                }}
            >
                {/* Accent top bar with gradient */}
                <div style={{ height: 4, background: `linear-gradient(90deg, var(--tw-gradient-from, #6366f1), var(--tw-gradient-to, #8b5cf6))`, backgroundImage: `linear-gradient(90deg, ${accentGradient.includes('amber') ? '#f59e0b, #f97316' : accentGradient.includes('indigo') ? '#6366f1, #8b5cf6' : '#6366f1, #8b5cf6'})` }} />
                {/* Subtle mesh bg in header */}
                <div style={{
                    padding: '24px 24px 20px',
                    background: 'linear-gradient(180deg, rgba(248,250,252,0.8) 0%, white 100%)',
                    borderBottom: '1px solid rgba(241,245,249,1)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>{title}</h3>
                            {subtitle && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 3, fontWeight: 500 }}>{subtitle}</p>}
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.1, background: 'rgba(241,245,249,1)' }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(248,250,252,1)', border: '1px solid rgba(226,232,240,1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0 }}
                        >
                            <IoClose size={15} />
                        </motion.button>
                    </div>
                </div>
                <div style={{ padding: 24 }}>
                    {children}
                </div>
            </motion.div>
        </div>
    );
};

export default StudentProfileDashboard;
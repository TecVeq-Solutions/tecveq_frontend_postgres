import React, { useEffect, useState } from 'react';
import Loader from '../../../utils/Loader';
import IMAGES from '../../../assets/images/index';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitQiuz } from '../../../api/Student/Quiz';
import { uploadFile } from '../../../utils/FileUpload';
import { handleProfileImageUpdate } from '../../../utils/Admin/profileImageUtils';
import { formatDate } from '../../../constants/formattedDate';
import { submitAssignment } from '../../../api/Student/Assignments';
import { useUser } from '../../../context/UserContext';
import { useSidebar } from '../../../context/SidebarContext';
import { FiEdit } from 'react-icons/fi';
import ConfirmModal from './ConfirmModal';
import {
    Download, Upload, CheckCircle2, Clock, AlarmClock, FileText, BookOpen
} from 'lucide-react';

const QuizAssignmentRow = (props) => {
    const queryClient = useQueryClient();
    const [timePassed, setTimePassed] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [isUploaded, setIsUploadded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [textExpanded, setTextExpanded] = useState(false);
    const { isSidebarOpen } = useSidebar();
    const { userData } = useUser();

    const quizAssignmentMutation = useMutation({
        mutationKey: ['quizAssignment'],
        mutationFn: async (fileUrl) => {
            if (!fileUrl) throw new Error('No file uploaded');
            return props.isQuiz
                ? await submitQiuz({ file: fileUrl }, props.alldata.id)
                : await submitAssignment({ file: fileUrl }, props.alldata.id);
        },
        onSettled: (data, error) => {
            if (!error) {
                toast.success('Uploaded successfully!');
                setIsUploadded(true);
                ['assignment', 'quiz', 'reports', 'report', 'studentReports', 'teacherStudets', 'student-assignments-quizes']
                    .forEach(k => queryClient.invalidateQueries([k]));
            }
        },
    });

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setShowConfirmModal(true);
        event.target.value = '';
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;
        setShowConfirmModal(false);
        await handleProfileImageUpdate(
            selectedFile,
            (url) => {
                setUploadedFileUrl(url);
                quizAssignmentMutation.mutate(url);
            },
            setIsUploading
        );
    };

    const compareDateAndTime = (dateTimeString) => {
        const eventDateTime = new Date(dateTimeString);
        const currentDateTime = new Date();
        if (eventDateTime < currentDateTime) {
            setTimePassed(true);
        } else {
            setTimePassed(false);
            const diff = eventDateTime - currentDateTime;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
    };

    useEffect(() => {
        props?.alldata?.submissions?.forEach((item) => {
            if (item?.studentID === userData?.id) setIsUploadded(true);
        });

        if (!props.deadline || props.header) return;

        const formattedDateTimeString = props.deadline
            .replace(/(\d+)(st|nd|rd|th)/, '$1')
            .replace(',', '')
            .replace(/(\d+)([ap]m)$/i, (_, p1, p2) => `${p1} ${p2.toUpperCase()}`);

        compareDateAndTime(formattedDateTimeString);
        const intervalId = setInterval(() => compareDateAndTime(formattedDateTimeString), 1000);
        return () => clearInterval(intervalId);
    }, [props.deadline]);

    const handleCopy = () => {
        navigator.clipboard.writeText(props.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ─── HEADER ROW ────────────────────────────────────────────────────────────
    // Header is now rendered as a CSS grid in the parent (Assignments.jsx)
    // so we just return null for header prop
    if (props.header) return null;

    // ─── DATA ROW ──────────────────────────────────────────────────────────────
    const isLoading = quizAssignmentMutation.isPending || isUploading;
    const isPastDeadline = timePassed && !isUploaded;

    return (
        <>
            <div
                className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                style={{
                    background: '#ffffff',
                    boxShadow: '0 2px 12px rgba(106,0,255,0.07), 0 1px 3px rgba(0,0,0,0.06)',
                    border: isUploaded
                        ? '1.5px solid rgba(16,130,6,0.2)'
                        : isPastDeadline
                            ? '1.5px solid rgba(220,38,38,0.15)'
                            : '1.5px solid rgba(106,0,255,0.1)',
                }}
            >
                {/* Left accent bar */}
                <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{
                        background: isUploaded
                            ? 'linear-gradient(180deg, #22c55e, #16a34a)'
                            : isPastDeadline
                                ? 'linear-gradient(180deg, #ef4444, #dc2626)'
                                : 'linear-gradient(180deg, #6A00FF, #9B4DFF)',
                    }}
                />

                <div className="sm:pl-4 sm:pr-4 sm:py-4 pl-3 pr-2 py-4">
                    {/* ── Desktop Grid ── */}
                    <div className="hidden md:grid grid-cols-12 gap-2 items-center">
                        {/* Index */}
                        <div className="col-span-1 flex justify-center">
                            <span className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-purple-700"
                                style={{ background: 'rgba(106,0,255,0.08)' }}>
                                {props.index}
                            </span>
                        </div>

                        {/* Subject */}
                        <div className="col-span-2 flex justify-center">
                            <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-purple-100">
                                <BookOpen size={11} />
                                {props.subject}
                            </span>
                        </div>

                        {/* Title */}
                        <div className="col-span-3 text-center">
                            <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{props.title}</p>
                        </div>

                        {/* Deadline */}
                        <div className="col-span-2 flex flex-col items-center gap-1">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${isPastDeadline
                                ? 'bg-red-50 text-red-600 border border-red-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                <AlarmClock size={11} />
                                {formatDate(props.deadline)}
                            </span>
                            {props.isQuiz && !isUploaded && (
                                <span className={`text-[10px] font-mono font-bold ${timePassed ? 'text-red-500' : 'text-purple-600'}`}>
                                    {timePassed ? '⏰ Time Up!' : timeLeft}
                                </span>
                            )}
                        </div>

                        {/* Marks */}
                        <div className="col-span-1 flex justify-center">
                            <span className="text-sm font-bold text-gray-700">{props.total_marks}<span className="text-xs text-gray-400 font-normal"> pts</span></span>
                        </div>

                        {/* Download */}
                        <div className="col-span-1 flex justify-center">
                            {props.download ? (
                                <a href={props.download} download target="_blank" rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                    style={{ background: 'linear-gradient(135deg, #6A00FF, #9B4DFF)' }}>
                                    <Download size={14} className="text-white" />
                                </a>
                            ) : (
                                <span className="text-[10px] text-gray-300 font-medium">—</span>
                            )}
                        </div>

                        {/* Upload */}
                        <div className="col-span-2 flex justify-center">
                            {isLoading ? (
                                <div className="scale-75"><Loader /></div>
                            ) : !isUploaded ? (
                                <label htmlFor={`upload-${props.id}`}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-xl cursor-pointer transition-all hover:opacity-90 hover:shadow-lg active:scale-95"
                                    style={{ background: 'linear-gradient(135deg, #6A00FF, #9B4DFF)', boxShadow: '0 4px 14px rgba(106,0,255,0.3)' }}>
                                    <Upload size={13} />
                                    Upload
                                    <input id={`upload-${props.id}`} onChange={handleFileChange} type="file" className="hidden" />
                                </label>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                                        <CheckCircle2 size={12} />
                                        Submitted
                                    </span>
                                    <label htmlFor={`upload-${props.id}`} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer text-purple-500 hover:bg-purple-50 transition-colors">
                                        <FiEdit size={14} />
                                        <input id={`upload-${props.id}`} onChange={handleFileChange} type="file" className="hidden" />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Mobile Card Layout ── */}
                    <div className="md:hidden flex flex-col gap-3">
                        {/* Top row: index + subject + marks badge */}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-purple-700 shrink-0"
                                    style={{ background: 'rgba(106,0,255,0.08)' }}>
                                    {props.index}
                                </span>
                                <div>
                                    <p className="text-sm font-bold text-gray-800 leading-snug">{props.title}</p>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 mt-0.5">
                                        <BookOpen size={9} />{props.subject}
                                    </span>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gray-600 bg-gray-100 rounded-lg px-2 py-1 shrink-0">
                                {props.total_marks} <span className="text-gray-400 font-normal text-[10px]">pts</span>
                            </span>
                        </div>

                        {/* Deadline + Timer */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${isPastDeadline ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                                <AlarmClock size={10} />
                                {formatDate(props.deadline)}
                            </span>
                            {props.isQuiz && !isUploaded && (
                                <span className={`text-[10px] font-mono font-bold ${timePassed ? 'text-red-500' : 'text-purple-600'}`}>
                                    {timePassed ? '⏰ Time Up!' : `⏱ ${timeLeft}`}
                                </span>
                            )}
                            {isUploaded && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                                    <CheckCircle2 size={11} /> Submitted
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {props.download && (
                                <a href={props.download} download target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-2 rounded-xl hover:bg-purple-100 transition-colors">
                                    <Download size={13} /> Download
                                </a>
                            )}
                            {isLoading ? (
                                <div className="scale-75"><Loader /></div>
                            ) : !isUploaded ? (
                                <label htmlFor={`upload-mobile-${props.id}`}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-white px-4 py-2 rounded-xl cursor-pointer"
                                    style={{ background: 'linear-gradient(135deg, #6A00FF, #9B4DFF)', boxShadow: '0 4px 14px rgba(106,0,255,0.3)' }}>
                                    <Upload size={13} /> Upload
                                    <input id={`upload-mobile-${props.id}`} onChange={handleFileChange} type="file" className="hidden" />
                                </label>
                            ) : (
                                <label htmlFor={`upload-mobile-${props.id}`} className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:bg-purple-50 px-2 py-1.5 rounded-lg cursor-pointer transition-colors">
                                    <FiEdit size={13} /> Re-submit
                                    <input id={`upload-mobile-${props.id}`} onChange={handleFileChange} type="file" className="hidden" />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* ── Text Assignment Section ── */}
                    {props.text && (
                        <div className={`mt-4 pt-3 border-t border-dashed border-gray-100 relative ${isSidebarOpen ? '-z-50' : 'z-auto'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                                    <FileText size={13} className="text-purple-500" />
                                    Text Assignment
                                </span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setTextExpanded(v => !v)}
                                        className="text-[11px] text-purple-500 font-medium hover:text-purple-700 transition-colors">
                                        {textExpanded ? 'Collapse' : 'Expand'}
                                    </button>
                                    <button onClick={handleCopy}
                                        className="text-[11px] font-semibold px-3 py-1 rounded-lg text-white transition-all active:scale-95"
                                        style={{ background: copied ? '#16a34a' : '#6A00FF' }}>
                                        {copied ? '✓ Copied!' : 'Copy'}
                                    </button>
                                </div>
                            </div>
                            <div className={`text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5 leading-relaxed border border-gray-100 transition-all duration-300 ${textExpanded ? '' : 'max-h-[85px] overflow-y-auto'}`}
                                style={{
                                    scrollbarWidth: "thin",
                                    scrollbarColor: "rgba(0,0,0,0.15) transparent"
                                }}>
                                {props.text}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                title={`Confirm Submission`}
                description={`Are you sure you want to submit this ${props.isQuiz ? 'Quiz' : 'Assignment'}? once submitted you can still change it but teacher would see both.`}
                onConfirm={handleConfirmUpload}
                onCancel={() => { setShowConfirmModal(false); setSelectedFile(null); }}
            />
        </>
    );
};

export default QuizAssignmentRow;
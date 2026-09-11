import React, { useRef, useEffect, useState } from 'react';
import useClickOutside from '../../../hooks/useClickOutlise';
import { useBlur } from '../../../context/BlurContext';
import moment from 'moment';
import { useUser } from '../../../context/UserContext';
import { 
    IoCalendarOutline, 
    IoBarChartOutline, 
    IoBookmarkOutline, 
    IoSchoolOutline, 
    IoReaderOutline, 
    IoLinkOutline, 
    IoDocumentTextOutline, 
    IoPeopleOutline, 
    IoPersonOutline,
    IoDownloadOutline,
    IoClipboardOutline,
    IoBookOutline,
    IoCloseOutline
} from 'react-icons/io5';

const ShowQuizAssignmentModal = ({ data, isQuiz, setIsShow }) => {
    const { toggleBlur } = useBlur();
    const { userData } = useUser();
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    useClickOutside(ref, () => {
        toggleBlur();
        setIsShow(false);
    });

    console.log(data, "data");

    const {
        title,
        text,
        totalMarks,
        dueDate,
        files,
        classroomID,
        subjectID,
        quizType,
        QuizQuestion
    } = data || {};

    const isTeacher = classroomID?.teachers?.some(
        (t) => t.teacher.id === userData.id && t.subject.id === subjectID?.id
    );

    const myTeacherEntries = classroomID?.teachers?.filter(
        (t) => t.teacher.id === userData.id && t.subject.id === subjectID?.id
    );

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => {
            toggleBlur();
            setIsShow(false);
        }, 250);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex justify-center items-center pt-[4rem]"
            style={{
                background: 'rgba(15,23,42,0.6)',
                backdropFilter: 'blur(8px)',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                .modal-slide { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease; }
                .modal-in  { transform: translateY(0) scale(1); opacity: 1; }
                .modal-out { transform: translateY(24px) scale(0.96); opacity: 0; }
                .modal-scroll::-webkit-scrollbar { width: 4px; }
                .modal-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
                .modal-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
            `}</style>

            <div
                ref={ref}
                className={`modal-slide modal-scroll bg-white rounded-3xl shadow-2xl w-[92%] md:w-[62%] lg:w-[50%] max-h-[90vh] overflow-y-auto ${visible ? 'modal-in' : 'modal-out'}`}
            >
                {/* ══════════════ HEADER ══════════════ */}
                <div className={`relative overflow-hidden rounded-t-3xl px-3 sm:px-6 py-5 ${isQuiz
                    ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600'
                    : 'bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600'
                    }`}>
                    {/* decorative blobs */}
                    <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                    <div className="absolute -bottom-8 left-12 w-24 h-24 rounded-full bg-white/[0.07] pointer-events-none" />

                    <div className="relative flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            {/* type badge */}
                            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-semibold uppercase tracking-widest rounded-full px-3 py-1 mb-3">
                                {isQuiz ? <IoClipboardOutline className="text-sm" /> : <IoBookOutline className="text-sm" />}
                                {isQuiz ? 'Quiz' : 'Assignment'}
                            </span>

                            {/* title */}
                            <h2 className="text-white text-xl font-bold leading-snug">
                                {title || 'Untitled'}
                            </h2>

                            {/* breadcrumb */}
                            <p className="text-white/70 text-sm mt-1 font-medium">
                                {classroomID?.name}
                                {subjectID?.name && (
                                    <> <span className="text-white/40 mx-1">·</span> {subjectID.name}</>
                                )}
                            </p>
                        </div>

                        {/* close button */}
                        <button
                            onClick={handleClose}
                            className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all duration-200"
                        >
                            <IoCloseOutline size={22} />
                        </button>
                    </div>
                </div>

                {/* ══════════════ BODY ══════════════ */}
                <div className="p-3 sm:p-6 flex flex-col gap-5">

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 sm:p-4 hover:border-blue-200 hover:shadow-sm transition-all duration-200">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <IoCalendarOutline className="text-slate-400 text-xs" />
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                    Due Date
                                </p>
                            </div>
                            <p className="text-slate-800 font-semibold text-sm leading-snug">
                                {dueDate ? moment(dueDate).format('MMM Do YYYY, h:mm A') : '—'}
                            </p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 sm:p-4 hover:border-amber-200 hover:shadow-sm transition-all duration-200">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <IoBarChartOutline className="text-slate-400 text-xs" />
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                    Total Marks
                                </p>
                            </div>
                            <span className="inline-flex items-center bg-amber-100 border border-amber-300 text-amber-800 text-sm font-bold rounded-lg px-3 py-0.5 font-mono">
                                {totalMarks ?? '—'} pts
                            </span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2  sm:p-4 hover:border-blue-200 hover:shadow-sm transition-all duration-200">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <IoBookmarkOutline className="text-slate-400 text-xs" />
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                    Subject
                                </p>
                            </div>
                            <p className="text-slate-800 font-semibold text-sm">{subjectID?.name || '—'}</p>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 sm:p-4 hover:border-blue-200 hover:shadow-sm transition-all duration-200">
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <IoSchoolOutline className="text-slate-400 text-xs" />
                                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                    Classroom
                                </p>
                            </div>
                            <p className="text-slate-800 font-semibold text-sm">{classroomID?.name || '—'}</p>
                        </div>
                    </div>

                    {/* Text / Description */}
                    {text && (
                        <div>
                            <div className="flex items-center gap-1.5 mb-2">
                                <IoReaderOutline className="text-slate-400 text-xs" />
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                    Description
                                </p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 border-l-4 border-l-amber-400 rounded-xl px-2 sm:px-4 py-3 text-sm text-amber-900 leading-relaxed">
                                {text}
                            </div>
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* Attached Files or MCQs */}
                    {quizType === 'mcq_objective' ? (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1.5">
                                    <IoClipboardOutline className="text-slate-400 text-xs" />
                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                        Questions
                                    </p>
                                </div>
                                {QuizQuestion?.length > 0 && (
                                    <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5 leading-none">
                                        {QuizQuestion.length}
                                    </span>
                                )}
                            </div>
                            
                            {QuizQuestion?.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {QuizQuestion.map((q, idx) => (
                                        <div key={q.id || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                            <div className="flex justify-between items-start gap-3 mb-3">
                                                <h4 className="text-sm font-semibold text-slate-800">
                                                    <span className="text-indigo-600 mr-1.5">{idx + 1}.</span>
                                                    {q.text}
                                                </h4>
                                                <span className="flex-shrink-0 bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md border border-indigo-100">
                                                    {q.marks} pts
                                                </span>
                                            </div>

                                            {q.questionType === 'mcq' && q.options && (
                                                <div className="flex flex-col gap-2 ml-1">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={opt.id || oIdx} className="flex items-center gap-2.5">
                                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${opt.isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                                                                {opt.isCorrect && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                                            </div>
                                                            <span className={`text-sm ${opt.isCorrect ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                                                                {opt.text}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {q.questionType === 'true_false' && q.acceptedAnswers && (
                                                <div className="flex flex-col gap-2 ml-1">
                                                    {['True', 'False'].map((opt, oIdx) => {
                                                        const isCorrect = q.acceptedAnswers.includes(opt);
                                                        return (
                                                            <div key={oIdx} className="flex items-center gap-2.5">
                                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300'}`}>
                                                                    {isCorrect && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                                                                </div>
                                                                <span className={`text-sm ${isCorrect ? 'text-emerald-700 font-medium' : 'text-slate-600'}`}>
                                                                    {opt}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {q.questionType === 'fill_blank' && q.acceptedAnswers && (
                                                <div className="ml-1 mt-1">
                                                    <p className="text-xs text-slate-500 mb-1">Accepted answers:</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {q.acceptedAnswers.map((ans, aIdx) => (
                                                            <span key={aIdx} className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-2 py-0.5 rounded-md font-medium">
                                                                {ans}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    No questions found.
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-1.5">
                                    <IoLinkOutline className="text-slate-400 text-xs" />
                                    <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                        Attached Files
                                    </p>
                                </div>
                                {files?.length > 0 && (
                                    <span className="bg-indigo-600 text-white text-[10px] font-bold rounded-full px-2 py-0.5 leading-none">
                                        {files.length}
                                    </span>
                                )}
                            </div>

                            {files?.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {files.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm flex-shrink-0">
                                                    <IoDocumentTextOutline className="text-white" />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700 truncate">{file.name}</span>
                                            </div>
                                            <a
                                                href={file.url}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="ml-3 flex-shrink-0 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200 no-underline flex items-center gap-1"
                                            >
                                                <IoDownloadOutline /> Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-5 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    No files attached.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* Assigned Teachers */}
                    <div>
                        <div className="flex items-center gap-1.5 mb-3">
                            <IoPeopleOutline className="text-slate-400 text-xs" />
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                Assigned Teachers
                            </p>
                        </div>
                        {isTeacher ? (
                            <div className="flex flex-col gap-2">
                                {myTeacherEntries.map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-base flex-shrink-0">
                                            <IoPersonOutline className="text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-900">{t.teacher.name}</p>
                                            <p className="text-xs text-emerald-500 font-medium mt-0.5">{t.subject.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-5 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                This assignment was not created by you.
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

                    {/* Students */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1.5">
                                <IoSchoolOutline className="text-slate-400 text-xs" />
                                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                    Students
                                </p>
                            </div>
                            {classroomID?.students?.length > 0 && (
                                <span className="bg-sky-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 leading-none">
                                    {classroomID.students.length}
                                </span>
                            )}
                        </div>

                        {classroomID?.students?.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {classroomID.students.map((student) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center gap-2 bg-sky-50 border border-sky-100 rounded-xl px-3 py-2 text-sm font-medium text-sky-700 hover:bg-sky-100 hover:border-sky-300 hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        <IoPersonOutline className="text-sky-400" />
                                        <span className="truncate">{student.name}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-5 text-sm text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                No students found.
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ShowQuizAssignmentModal;
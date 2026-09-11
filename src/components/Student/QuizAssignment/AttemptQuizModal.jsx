import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getQuizById, submitQiuz } from '../../../api/Student/Quiz';
import { IoClose, IoCheckmarkCircle } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { ClipboardList } from 'lucide-react';
import Loader from '../../../utils/Loader';

const AttemptQuizModal = ({ quizId, open, setOpen }) => {
    const queryClient = useQueryClient();
    const [answers, setAnswers] = useState({}); // { questionId: { selectedOptID, textAnswer } }
    const [visible, setVisible] = useState(false); // controls fade/scale animation

    const { data: quizData, isLoading } = useQuery({
        queryKey: ['studentQuizAttempt', quizId],
        queryFn: () => getQuizById(quizId),
        enabled: open && !!quizId
    });

    const submitMutation = useMutation({
        mutationFn: async (payload) => await submitQiuz(payload, quizId),
        onSuccess: () => {
            toast.success("Quiz submitted successfully!");
            queryClient.invalidateQueries(['student-assignments-quizes', 'studentReports', 'quiz']);
            setOpen(false);
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || err?.message || "Failed to submit quiz");
        }
    });

    // Lock body scroll while modal is open + trigger enter animation
    useEffect(() => {
        if (open) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            // slight delay so the transition actually plays
            const t = setTimeout(() => setVisible(true), 10);
            return () => {
                document.body.style.overflow = originalOverflow;
                clearTimeout(t);
            };
        } else {
            setVisible(false);
        }
    }, [open]);

    if (!open) return null;

    const handleAnswerChange = (questionId, value, type) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                questionId,
                [type === 'mcq' ? 'selectedOptID' : 'textAnswer']: value
            }
        }));
    };

    const handleSubmit = () => {
        if (!quizData?.QuizQuestion) return;

        // Basic validation: attempt at least one or all? Let's say all.
        const ansArray = Object.values(answers);

        const payload = {
            answers: ansArray
        };
        submitMutation.mutate(payload);
    };

    const modalContent = (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1053]/50 backdrop-blur-sm p-4 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'
                }`}
            onClick={() => setOpen(false)}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`bg-white w-full max-w-3xl rounded-[24px] shadow-[0_10px_40px_rgba(106,0,255,0.25)] flex flex-col max-h-[90vh] overflow-hidden border border-[#E8E3FF] transition-all duration-200 ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 sm:px-8 sm:py-6 border-b border-[#E8E3FF] shrink-0 bg-gradient-to-r from-white to-[#F6F3FF]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B1FFF] to-[#5500CC] flex items-center justify-center shadow-lg shadow-purple-200 shrink-0">
                            <ClipboardList className="text-white" size={22} />
                        </div>
                        <div>
                            <h2 className="font-bold text-[#0B1053] text-lg sm:text-xl leading-tight">{quizData?.title || 'Attempt Quiz'}</h2>
                            <p className="text-[11px] sm:text-xs font-semibold text-[#6A00FF] mt-1 bg-[#F6F3FF] inline-block px-2.5 py-0.5 rounded-md border border-[#E8E3FF]">
                                {quizData?.totalMarks} total marks
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                        <IoClose size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar flex-1 min-h-0 flex flex-col gap-6 bg-[#FCFBFF]">
                    {isLoading ? (
                        <div className="flex justify-center py-12"><Loader /></div>
                    ) : (
                        quizData?.QuizQuestion?.map((q, index) => (
                            <div key={q.id} className="p-5 sm:p-6 border border-[#E8E3FF] rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-5 gap-4">
                                    <h3 className="font-semibold text-gray-800 text-[14px] sm:text-[15px] leading-relaxed">
                                        <span className="text-[#6A00FF] font-bold mr-2 text-base">Q{index + 1}.</span>
                                        {q.text}
                                    </h3>
                                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full whitespace-nowrap shrink-0 shadow-sm">
                                        {q.marks} pts
                                    </span>
                                </div>

                                {q.questionType === 'mcq' && (
                                    <div className="flex flex-col gap-3 mt-2">
                                        {q.QuizOption?.map(opt => {
                                            const isSelected = answers[q.id]?.selectedOptID === opt.id;
                                            return (
                                                <label
                                                    key={opt.id}
                                                    className={`flex items-center gap-3.5 p-3.5 sm:px-5 sm:py-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                                        ? 'border-[#6A00FF] bg-[#F6F3FF] shadow-sm'
                                                        : 'border-[#F0EDFF] bg-gray-50/50 hover:border-[#DCD4FF] hover:bg-white'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`q-${q.id}`}
                                                        checked={isSelected}
                                                        onChange={() => handleAnswerChange(q.id, opt.id, 'mcq')}
                                                        className="accent-[#6A00FF] w-4 h-4 scale-110"
                                                    />
                                                    <span className={`text-sm ${isSelected ? 'text-[#6A00FF] font-bold' : 'text-gray-700 font-medium'}`}>{opt.text}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {q.questionType === 'true_false' && (
                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
                                        {['True', 'False'].map(opt => {
                                            const isSelected = answers[q.id]?.textAnswer === opt;
                                            return (
                                                <label
                                                    key={opt}
                                                    className={`flex-1 flex items-center justify-center gap-2.5 p-3.5 sm:py-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                                                        ? 'border-[#6A00FF] bg-[#F6F3FF] shadow-sm'
                                                        : 'border-[#F0EDFF] bg-gray-50/50 hover:border-[#DCD4FF] hover:bg-white'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`q-${q.id}`}
                                                        checked={isSelected}
                                                        onChange={() => handleAnswerChange(q.id, opt, 'text')}
                                                        className="accent-[#6A00FF] w-4 h-4 scale-110"
                                                    />
                                                    <span className={`text-sm ${isSelected ? 'text-[#6A00FF] font-bold' : 'text-gray-700 font-medium'}`}>{opt}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}

                                {q.questionType === 'fill_blank' && (
                                    <div className="mt-2">
                                        <input
                                            type="text"
                                            placeholder="Type your exact answer here..."
                                            value={answers[q.id]?.textAnswer || ''}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value, 'text')}
                                            className="w-full border-2 border-[#F0EDFF] bg-gray-50/50 rounded-xl px-5 py-4 text-sm font-medium text-gray-800 placeholder-gray-400 focus:bg-white focus:border-[#6A00FF] focus:ring-4 focus:ring-[#F6F3FF] outline-none transition-all"
                                        />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 sm:px-8 sm:py-5 border-t border-[#E8E3FF] shrink-0 flex justify-end gap-3 bg-white">
                    <button
                        onClick={() => setOpen(false)}
                        className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitMutation.isPending || isLoading}
                        className="px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-purple-200 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 disabled:active:scale-100 flex items-center gap-2"
                        style={{ background: 'linear-gradient(135deg, #6A00FF, #9B4DFF)' }}
                    >
                        {submitMutation.isPending ? <div className="scale-75"><Loader /></div> : (
                            <>
                                <IoCheckmarkCircle size={18} /> Submit Quiz
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default AttemptQuizModal;





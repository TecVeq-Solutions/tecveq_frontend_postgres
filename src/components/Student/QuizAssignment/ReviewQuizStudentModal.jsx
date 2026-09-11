import React from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { getStudentQuiz } from '../../../api/Student/Quiz';
import { IoClose, IoCheckmarkCircle } from 'react-icons/io5';
import { XCircle, ClipboardList } from 'lucide-react';
import Loader from '../../../utils/Loader';

const ReviewQuizStudentModal = ({ quizId, open, setOpen }) => {
    const { data, isLoading } = useQuery({
        queryKey: ['studentQuizReview', quizId],
        queryFn: () => getStudentQuiz(quizId),
        enabled: open && !!quizId
    });

    if (!open) return null;

    const quizData = data?.data?.quizData;
    const submissionObj = data?.data?.submission;
    const studentAnswers = submissionObj?.QuizStudentAnswer || [];

    const modalContent = (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0B1053]/50 backdrop-blur-sm p-4"
            onClick={() => setOpen(false)}
        >
            <div 
                className="bg-white w-full max-w-3xl rounded-[24px] shadow-xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 sm:px-8 sm:py-6 border-b border-[#E8E3FF] shrink-0 bg-gradient-to-r from-white to-[#F6F3FF]">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#16a34a] to-[#15803d] flex items-center justify-center shadow-lg shadow-green-200 shrink-0">
                            <ClipboardList className="text-white" size={22} />
                        </div>
                        <div>
                            <h2 className="font-bold text-[#0B1053] text-lg sm:text-xl leading-tight">Review Your Answers</h2>
                            <p className="text-[11px] sm:text-xs font-semibold text-green-700 mt-1 bg-green-50 inline-block px-2.5 py-0.5 rounded-md border border-green-200">
                                {submissionObj ? `Score: ${submissionObj.autoScore} / ${quizData?.totalMarks} pts` : 'Loading score...'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                        <IoClose size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 sm:p-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6 bg-[#FCFBFF]">
                    {isLoading ? (
                        <div className="flex justify-center py-12"><Loader /></div>
                    ) : !quizData || !submissionObj ? (
                        <div className="text-center text-gray-500 py-10">Data could not be loaded.</div>
                    ) : (
                        quizData.QuizQuestion?.map((q, index) => {
                            const ans = studentAnswers.find(a => a.questionID === q.id);
                            return (
                                <div key={q.id} className="p-5 border border-[#E8E3FF] rounded-2xl bg-white shadow-sm">
                                    <div className="flex justify-between items-start mb-5 gap-4">
                                        <h3 className="font-semibold text-gray-800 text-[14px] sm:text-[15px] leading-relaxed">
                                            <span className="text-[#6A00FF] font-bold mr-2 text-base">Q{index + 1}.</span>
                                            {q.text}
                                        </h3>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                                                {q.marks} pts
                                            </span>
                                            {ans ? (
                                                ans.isCorrect ? <IoCheckmarkCircle className="text-green-500" size={22} /> : <XCircle className="text-red-500" size={20} />
                                            ) : (
                                                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">No Answer</span>
                                            )}
                                        </div>
                                    </div>

                                    {q.questionType === 'mcq' && (
                                        <div className="flex flex-col gap-3 mt-2">
                                            {q.QuizOption?.map(opt => {
                                                const isStudentChoice = ans?.selectedOptID === opt.id;
                                                const isCorrectChoice = opt.isCorrect;
                                                
                                                let bgClass = "border-[#F0EDFF] bg-gray-50/50";
                                                let textColor = "text-gray-700";
                                                
                                                if (isCorrectChoice) {
                                                    bgClass = "border-green-400 bg-green-50 shadow-sm";
                                                    textColor = "text-green-700 font-bold";
                                                } else if (isStudentChoice && !isCorrectChoice) {
                                                    bgClass = "border-red-400 bg-red-50 shadow-sm";
                                                    textColor = "text-red-700 font-bold";
                                                }

                                                return (
                                                    <div key={opt.id} className={`flex items-center justify-between p-3.5 sm:px-5 sm:py-4 rounded-xl border-2 ${bgClass}`}>
                                                        <span className={`text-sm ${textColor}`}>{opt.text}</span>
                                                        <div className="flex gap-2">
                                                            {isCorrectChoice && <span className="text-[10px] font-bold text-green-700 border border-green-200 bg-green-100 px-2.5 py-0.5 rounded-full">Correct Option</span>}
                                                            {isStudentChoice && <span className="text-[10px] font-bold text-purple-600 border border-purple-200 bg-purple-100 px-2.5 py-0.5 rounded-full">Your Answer</span>}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    {(q.questionType === 'true_false' || q.questionType === 'fill_blank') && (
                                        <div className="mt-4 flex flex-col gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                            <div className="text-sm flex items-center justify-between">
                                                <span className="font-semibold text-gray-600">Your Answer: </span>
                                                <span className={ans?.isCorrect ? "text-green-600 font-bold bg-green-100 px-2 py-1 rounded" : "text-red-600 font-bold bg-red-100 px-2 py-1 rounded"}>
                                                    {ans?.textAnswer || "N/A"}
                                                </span>
                                            </div>
                                            <div className="text-sm flex items-center justify-between border-t border-gray-200 pt-3">
                                                <span className="font-semibold text-gray-600">Accepted Answer(s): </span>
                                                <span className="text-green-700 font-bold bg-green-100 px-2 py-1 rounded text-right max-w-[60%] line-clamp-2">
                                                    {q.acceptedAnswers?.join(", ")}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ReviewQuizStudentModal;

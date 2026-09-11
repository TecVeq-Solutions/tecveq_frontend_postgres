import React from 'react';
import { IoClose, IoCheckmarkCircle } from 'react-icons/io5';
import { XCircle } from 'lucide-react';

const ReviewAnswersModal = ({ open, setOpen, quizData, submissionObj }) => {
    if (!open || !quizData || !submissionObj) return null;

    const studentAnswers = submissionObj.QuizStudentAnswer || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                    <div>
                        <h2 className="font-bold text-gray-800 text-lg">Review Answers</h2>
                        <p className="text-xs text-gray-500">Auto Score: {submissionObj.autoScore} / {quizData.totalMarks}</p>
                    </div>
                    <button onClick={() => setOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <IoClose size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6">
                    {quizData.QuizQuestion?.map((q, index) => {
                        const ans = studentAnswers.find(a => a.questionID === q.id);
                        return (
                            <div key={q.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-semibold text-gray-800 text-sm">
                                        <span className="text-purple-600 mr-2">Q{index + 1}.</span>
                                        {q.text}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-md">{q.marks} pts</span>
                                        {ans ? (
                                            ans.isCorrect ? <IoCheckmarkCircle className="text-green-500" size={20} /> : <XCircle className="text-red-500" size={18} />
                                        ) : (
                                            <span className="text-xs text-gray-400">No Answer</span>
                                        )}
                                    </div>
                                </div>

                                {q.questionType === 'mcq' && (
                                    <div className="flex flex-col gap-2 mt-4">
                                        {q.QuizOption?.map(opt => {
                                            const isStudentChoice = ans?.selectedOptID === opt.id;
                                            const isCorrectChoice = opt.isCorrect;
                                            let bgClass = "border-gray-200 bg-white";
                                            if (isCorrectChoice) bgClass = "border-green-400 bg-green-50";
                                            else if (isStudentChoice && !isCorrectChoice) bgClass = "border-red-400 bg-red-50";

                                            return (
                                                <div key={opt.id} className={`flex items-center justify-between p-3 rounded-lg border ${bgClass}`}>
                                                    <span className="text-sm text-gray-700">{opt.text}</span>
                                                    {isStudentChoice && <span className="text-[10px] font-bold text-purple-600 border border-purple-200 bg-purple-100 px-2 py-0.5 rounded-full">Student's Answer</span>}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {(q.questionType === 'true_false' || q.questionType === 'fill_blank') && (
                                    <div className="mt-4 flex flex-col gap-2">
                                        <div className="text-sm">
                                            <span className="font-semibold text-gray-600">Student Answer: </span>
                                            <span className={ans?.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                                                {ans?.textAnswer || "N/A"}
                                            </span>
                                        </div>
                                        <div className="text-sm">
                                            <span className="font-semibold text-gray-600">Accepted Answer(s): </span>
                                            <span className="text-gray-800">{q.acceptedAnswers?.join(", ")}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default ReviewAnswersModal;

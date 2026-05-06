import React, { useState } from 'react'
import IMAGES from '../../../assets/images';
import { useNavigate, useParams } from 'react-router-dom';
import { VscFeedback } from "react-icons/vsc";
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from "react-icons/io5";

const QuizAssignmentsTable = ({ data }) => {
    const params = useParams()
    const navigate = useNavigate()
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleFeedbackClick = (feedback) => {
        setSelectedFeedback(feedback || "No feedback provided by the teacher yet.");
        setShowModal(true);
    };

    const thClass = "flex justify-center items-center text-center md:text-[15px] text-[11px] font-medium min-w-0 break-words";
    const tdClass = "flex justify-center items-center text-center px-[2px] md:px-[4px] text-[10px] md:text-[14px] py-2 lg:py-3 border-l border-l-black/10 min-w-0 break-words leading-tight";

    return (
        <div className="flex flex-1">
            <div className="flex flex-col flex-1 gap-2">
                <div className="flex flex-1 overflow-x-auto">
                    <table className="flex flex-col flex-1 bg-white rounded-lg w-full">
                        <thead className="flex px-2 py-3 rounded-tl-lg rounded-tr-lg bg-[#afb3f7]">
                            <tr className="flex flex-1 w-full">
                                <td className={`flex-[1] ${thClass}`}>Sr No.</td>
                                <td className={`flex-[3] ${thClass}`}>Title</td>
                                <td className={`flex-[3] ${thClass}`}>Obtained Marks</td>
                                <td className={`flex-[3] ${thClass}`}>Total Marks</td>
                                <td className={`flex-[2] ${thClass}`}>Grade</td>
                                <td className={`flex-[3] ${thClass}`}>Feedback</td>
                            </tr>
                        </thead>

                        <tbody className="flex flex-col w-full">
                            {data?.map((item, index) => {
                                const isGraded = item.isGraded;
                                const isSubmitted = item.isSubmitted;
                                const dueDate = new Date(item.deadline || item.dueDate);
                                const isDueDatePassed = new Date() > dueDate;

                                let displayMarks = item.obtainedMarks;
                                let displayGrade = item.grade || "-";

                                if (!isSubmitted) {
                                    if (isDueDatePassed) {
                                        displayMarks = <span className="text-red-500 font-semibold italic">no assignment</span>;
                                        displayGrade = "F";
                                    } else {
                                        displayMarks = <span className="text-yellow-600 italic">pending</span>;
                                        displayGrade = "-";
                                    }
                                } else if (!isGraded) {
                                    displayMarks = <span className="text-blue-600 italic">Pending Grading</span>;
                                    displayGrade = "-";
                                } else {
                                    // Graded
                                    displayMarks = item.obtainedMarks;
                                    if (!item.grade) {
                                        const per = (item.obtainedMarks / item.totalMarks) * 100;
                                        if (per >= 90) displayGrade = "A";
                                        else if (per >= 80) displayGrade = "B";
                                        else if (per >= 70) displayGrade = "C";
                                        else if (per >= 60) displayGrade = "D";
                                        else if (per >= 50) displayGrade = "E";
                                        else displayGrade = "F";
                                    } else {
                                        displayGrade = item.grade;
                                    }
                                }

                                return (
                                    <tr
                                        key={index}
                                        style={{ cursor: "pointer" }}
                                        className="flex flex-1 w-full border-t border-t-black/10 items-stretch"
                                    >
                                        <td className="flex-[1] py-2 lg:py-3 flex justify-center items-center text-[10px] md:text-[14px] min-w-0">
                                            {index + 1}
                                        </td>
                                        <td className={`flex-[3] ${tdClass}`}>
                                            {item.title}
                                        </td>
                                        <td className={`flex-[3] ${tdClass}`}>
                                            {displayMarks}
                                        </td>
                                        <td className={`flex-[3] ${tdClass}`}>
                                            {item.totalMarks}
                                        </td>
                                        <td className={`flex-[2] ${tdClass}`}>
                                            {displayGrade}
                                        </td>
                                        <td className={`flex-[3] ${tdClass}`}>
                                            <button 
                                                onClick={() => handleFeedbackClick(item.feedback)}
                                                className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200 text-indigo-600"
                                                title="View Feedback"
                                            >
                                                <VscFeedback size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <VscFeedback size={22} />
                                    Teacher Feedback
                                </h3>
                                <button 
                                    onClick={() => setShowModal(false)}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                >
                                    <IoClose size={24} />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 min-h-[120px]">
                                    <p className="text-gray-700 leading-relaxed italic">
                                        "{selectedFeedback}"
                                    </p>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default QuizAssignmentsTable

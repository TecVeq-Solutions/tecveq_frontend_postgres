import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const QuizAssignmentsTable = ({ data }) => {
    const params = useParams()
    const navigate = useNavigate()
    return (
        <div className="flex flex-1 w-full overflow-hidden">
            <div className="flex flex-col flex-1 gap-2 w-full overflow-x-auto">
                <div className="flex flex-1 min-w-[600px]">
                    <table className="flex flex-col flex-1 bg-white rounded-lg table-fixed w-full">
                        <thead className="flex gap-5 px-2 py-3 rounded-tl-lg rounded-tr-lg border-t-[#0B1053] bg-[#dbddf8]">
                            <tr className="flex flex-1">
                                <td className="flex-[1] flex justify-center md:text-[15px] text-[13px]">Sr No.</td>
                                <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Title</td>
                                <td className="flex-[3] flex justify-center md:text-[15px] text-[13px] text-center">Obtained Marks</td>
                                <td className="flex-[3] flex justify-center md:text-[15px] text-[13px] text-center">Total Marks</td>
                                <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Grade</td>
                                <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Feedback</td>
                            </tr>
                        </thead>

                        <tbody className="flex flex-col">
                            {data.map((item, index) => {
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
                                    if (!item.grade || item.grade === "-") {
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
                                    <tr key={index} style={{ cursor: "pointer" }} className="flex flex-1 text-xs border-t border-t-black/10">
                                        <td className="flex-[1] py-2 lg:py-3 flex justify-center">{index + 1}</td>
                                        <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center text-center break-all">
                                            {item.title}
                                        </td>
                                        <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center text-center break-all">
                                            {displayMarks}
                                        </td>
                                        <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center text-center break-all">
                                            {item.totalMarks}
                                        </td>
                                        <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center text-center break-all">
                                            {displayGrade}
                                        </td>
                                        <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center text-center break-all">
                                            {item.feedback || "No Feedback"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default QuizAssignmentsTable

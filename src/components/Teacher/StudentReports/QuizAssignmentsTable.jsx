import React from 'react'
import { useNavigate, useParams } from 'react-router-dom';

const QuizAssignmentsTable = ({ data, type }) => {
    const params = useParams();
    const navigate = useNavigate();

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
                                <td className={`flex-[3] ${thClass}`}>Subject</td>
                                <td className={`flex-[3] ${thClass}`}>Title</td>
                                <td className={`flex-[3] ${thClass}`}>Obtained Marks</td>
                                <td className={`flex-[2] ${thClass}`}>Total Marks</td>
                                <td className={`flex-[3] ${thClass}`}>Grade</td>
                                <td className={`flex-[3] ${thClass}`}>Feedback</td>
                            </tr>
                        </thead>
                        <tbody className="flex flex-col w-full">
                            {data?.map((item, index) => {
                                const isGraded = typeof item.obtainedMarks !== 'undefined' && item.obtainedMarks !== null;
                                const isSubmitted = item.isSubmitted;
                                const dueDate = new Date(item.deadline || item.dueDate);
                                const isDueDatePassed = new Date() > dueDate;

                                let displayMarks = item.obtainedMarks;
                                let displayGrade = item.grade || "-";

                                if (!isSubmitted) {
                                    if (isDueDatePassed) {
                                        displayMarks = <span className="text-red-500 font-semibold italic">{type === 'q' ? "no quiz" : "no assignment"}</span>;
                                        displayGrade = "F";
                                    } else {
                                        displayMarks = <span className="text-yellow-600 italic">pending</span>;
                                        displayGrade = "-";
                                    }
                                } else if (!isGraded) {
                                    displayMarks = <span className="text-blue-600 italic">Pending Grading</span>;
                                    displayGrade = "-";
                                } else {
                                    displayMarks = item.obtainedMarks;
                                    if (!item.grade) {
                                        const val = (item.obtainedMarks / item.totalMarks) * 100;
                                        if (val >= 90) displayGrade = "A";
                                        else if (val >= 80) displayGrade = "B";
                                        else if (val >= 70) displayGrade = "C";
                                        else if (val >= 60) displayGrade = "D";
                                        else if (val >= 50) displayGrade = "E";
                                        else displayGrade = "F";
                                    } else {
                                        displayGrade = item.grade;
                                    }
                                }

                                return (
                                    <tr
                                        key={item.id || index}
                                        style={{ cursor: "pointer" }}
                                        // onClick={() => navigate(`/reports/${params.subject}/${item.title}`, { state: { ...item, grade: displayGrade } })}
                                        className="flex flex-1 w-full border-t border-t-black/10 items-stretch"
                                    >
                                        <td className={`flex-[1] py-2 lg:py-3 flex justify-center items-center text-[10px] md:text-[14px] min-w-0`}>
                                            {index + 1}
                                        </td>
                                        <td className={`flex-[3] ${tdClass}`}>
                                            {item?.subject}
                                        </td>
                                        <td className={`flex-[3] ${tdClass}`}>
                                            {item?.title}
                                        </td>
                                        <td className={`flex-[3] ${tdClass}`}>
                                            {displayMarks}
                                        </td>
                                        <td className={`flex-[3] ${tdClass}`}>
                                            {item?.totalMarks}
                                        </td>
                                        <td className={`flex-[2] ${tdClass}`}>
                                            {displayGrade}
                                        </td>
                                        <td className={`flex-[3] ${tdClass}`}>
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
    );
};

export default QuizAssignmentsTable;

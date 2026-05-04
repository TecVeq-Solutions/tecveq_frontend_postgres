import React from 'react'
import Navbar from '../../../components/Parent/Dashboard/Navbar'
import QuizAssignmentRow from '../../../components/Student/QuizAssignment/QuizAssignmentRow'

import { useBlur } from '../../../context/BlurContext'
import { useParent } from '../../../context/ParentContext'
import { useSidebar } from '../../../context/SidebarContext'
import { ClipboardList } from 'lucide-react'

const Quizzes = () => {
    const { isSidebarOpen } = useSidebar();
    const { allQuizes } = useParent();
    const { isBlurred } = useBlur();

    const studentQuiz = allQuizes || [];

    return (
        <div className="flex flex-1 min-h-screen font-poppins" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f9f9f9 100%)" }}>
            <div className="flex flex-1">
                <div className="w-full lg:px-20 sm:px-10 px-3 flex-grow ml-0 lg:ml-72 xl:ml-80">
                    <div className="pt-1">
                        <Navbar heading={"Quizzes"} />

                        <div className={`${isBlurred ? "blur" : ""} relative ${isSidebarOpen ? "-z-10" : "z-auto"} lg:z-auto`}>
                            {/* Header Banner */}
                            <div className="mt-6 mb-6 rounded-2xl px-6 py-5 flex items-center gap-4"
                                style={{ background: "linear-gradient(135deg, #6A00FF 0%, #9B4DFF 60%, #C084FC 100%)", boxShadow: "0 8px 32px rgba(106,0,255,0.25)" }}>
                                <div className="bg-white/20 rounded-xl p-3">
                                    <ClipboardList className="text-white" size={28} />
                                </div>
                                <div>
                                    <h2 className="text-white font-bold text-xl leading-tight">Quizzes</h2>
                                    <p className="text-purple-200 text-sm mt-0.5">
                                        {studentQuiz.length} quiz{studentQuiz.length !== 1 ? "zes" : ""} assigned
                                    </p>
                                </div>
                            </div>

                            {/* Table Header */}
                            <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 mb-2 rounded-xl text-xs font-semibold text-purple-700 tracking-wide uppercase"
                                style={{ background: "rgba(106,0,255,0.07)", border: "1px solid rgba(106,0,255,0.12)" }}>
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-2 text-center">Subject</div>
                                <div className="col-span-3 text-center">Title</div>
                                <div className="col-span-2 text-center">Deadline</div>
                                <div className="col-span-1 text-center">Marks</div>
                                <div className="col-span-1 text-center">File</div>
                                <div className="col-span-2 text-center">Status</div>
                            </div>

                            {/* Quiz Cards */}
                            <div className="space-y-3">
                                {studentQuiz.map((quiz, index) => (
                                    <QuizAssignmentRow
                                        alldata={quiz}
                                        isQuiz={true}
                                        key={quiz.id}
                                        index={index + 1}
                                        id={quiz.id}
                                        subject={quiz?.subject?.name || quiz?.subjectID?.name}
                                        title={quiz?.title}
                                        deadline={quiz?.dueDate}
                                        header={false}
                                        total_marks={quiz?.totalMarks}
                                        download={quiz?.files?.[0]?.url}
                                        text={quiz?.text}
                                    />
                                ))}
                            </div>

                            {/* Empty State */}
                            {studentQuiz.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="bg-purple-100 rounded-full p-6">
                                        <ClipboardList size={48} className="text-purple-400" />
                                    </div>
                                    <p className="font-semibold text-xl text-gray-500">No quizzes yet</p>
                                    <p className="text-gray-400 text-sm">No quizzes have been posted.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Quizzes;

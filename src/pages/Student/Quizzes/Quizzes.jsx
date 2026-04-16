import React from 'react'
import Navbar from '../../../components/Student/Dashboard/Navbar'
import QuizAssignmentRow from '../../../components/Student/QuizAssignment/QuizAssignmentRow'

import { useBlur } from '../../../context/BlurContext'
import { useStudent } from '../../../context/StudentContext'
import { useUser } from '../../../context/UserContext'

const Quizzes = () => {

    const { allQuizes } = useStudent();
    //console.log("all quizes in quiz are : ", allQuizes);

    const { userData } = useUser();


    const studentQuiz = allQuizes || [];
    //console.log("Filtered Assignments:", studentQuiz);
    const { isBlurred } = useBlur();

    const handleUpload = (data, datad) => {
        //console.log("select file is :", data, datad);
    }

    return (
        <div className="flex flex-1 bg-[#F9F9F9] font-poppins">
            <div className="flex flex-1">
                {/* h-screen */}
                <div className={`w-full  lg:px-20 sm:px-10  flex-grow lg:ml-72`}
                >
                    {/* h-screen */}
                    <div className=' pt-1'>
                        <Navbar heading={"Quizes"} />
                        <div className={`px-2 sm:px-3 ${isBlurred ? "blur" : ""}`}>
                            <div className='mt-4 sm:mt-8 h-[80%] overflow-auto'>
                                <QuizAssignmentRow
                                    index={"Sr. No"}
                                    subject={"Subject"}
                                    title={"Title"}
                                    deadline={"Deadline"}
                                    bgColor={"#F9F9F9"}
                                    header={true}
                                    total_marks={"Total Marks"}
                                    download={"Download"}
                                    upload={"Upload"}
                                />
                                { studentQuiz?.map((quiz, index) => {
                                    return <QuizAssignmentRow
                                        id={quiz.id}
                                        isQuiz={true}
                                        upload={true}
                                        header={false}
                                        key={quiz.id}
                                        alldata={quiz}
                                        index={index + 1}
                                        title={quiz.title}
                                        bgColor={"#FFFFFF"}
                                        download={quiz?.files?.[0]?.url}
                                        deadline={quiz.dueDate}
                                        total_marks={quiz.totalMarks}
                                        subject={quiz?.subject?.name || quiz?.subjectID?.name}
                                        text={quiz?.text}
                                    />
                                })}
                                { studentQuiz?.length == 0 && <div className='flex w-full justify-center'><p className='font-medium text-2xl py-4'>No quizes to display</p> </div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Quizzes;

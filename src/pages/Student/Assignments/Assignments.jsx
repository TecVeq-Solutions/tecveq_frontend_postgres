import React from "react";
import Navbar from "../../../components/Student/Dashboard/Navbar";
import QuizAssignmentRow from "../../../components/Student/QuizAssignment/QuizAssignmentRow";

import { useBlur } from "../../../context/BlurContext";
import { useStudent } from "../../../context/StudentContext";
import { useSidebar } from "../../../context/SidebarContext";
import { useUser } from "../../../context/UserContext";

const Assignments = () => {
  const { isSidebarOpen } = useSidebar(); // new

  const { isBlurred } = useBlur();
  const { allAssignments } = useStudent();

  const { userData } = useUser();


  const studentAssignments = allAssignments || [];
  //console.log("Filtered Assignments:", studentAssignments);
  return (
    <div className="flex flex-1 bg-[#F9F9F9] font-poppins">
      <div className="flex flex-1">
        <div 
        //  h-screen
          className={`w-full lg:px-20 sm:px-10  flex-grow lg:ml-72`}
        >
          {/* h-screen */}
          <div className=" pt-1">
            <Navbar heading={"Assignments"} />
            <div className={`px-[2px] sm:px-3 ${isBlurred ? "blur" : ""} relative ${isSidebarOpen ? "-z-10" : "z-auto"} lg:z-auto `}>
              <div className="mt-4 sm:mt-8 h-[80%] overflow-auto">

                <QuizAssignmentRow
                  isQuiz={false}
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
                {studentAssignments?.map((assignment, index) => (
                  <QuizAssignmentRow
                    alldata={assignment}
                    isQuiz={false}
                    index={index + 1}
                    id={assignment.id}
                    key={assignment.id}
                    subject={assignment?.subject?.name || assignment?.subjectID?.name}
                    title={assignment?.title}
                    deadline={assignment?.dueDate}
                    bgColor={"#FFFFFF"}
                    header={false}
                    total_marks={assignment?.totalMarks}
                    download={assignment?.files?.[0]?.url}
                    upload={true}
                    text={assignment?.text}
                  />
                ))}

                {studentAssignments?.length == 0 &&
                  <div className='flex w-full justify-center'>
                    <p className='font-medium text-2xl py-4'>No assignments to display</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assignments;

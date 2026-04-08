import React, { useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Teacher/Navbar";
import AssignmentMenu from "../../../components/Teacher/QuizAssignment/AssignmentMenu";
import QuizAssignmentRow from "../../../components/Teacher/QuizAssignment/QuizAssignmentRow";
import CreateQuizAssignmentModal from "../../../components/Teacher/QuizAssignment/CreateQuizAssignmentModal";
import EditQuizAssignmentModal from "../../../components/Teacher/QuizAssignment/EditQuizAssignmentModal";
import { FaEye } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteAssignments, getAllAssignments } from "../../../api/Teacher/Assignments";
import { MdDelete, MdEdit } from "react-icons/md";
import { toast } from "react-toastify";
import ShowQuizAssignmentModal from "../../../components/Teacher/QuizAssignment/ShowQuizAssignmentModal"
const Assignments = () => {
  const [isAssignmentMenuOpen, setIsAssignmentMenuOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isShow, setIsShow] = useState(false)
  const [selectedAssignments, setSelectedAssignments] = useState(null);
  const navigate = useNavigate();
  const [assignmentdata, setAssignmentData] = useState({});
  const { data, isPending, isSuccess, isError, refetch, isRefetching } = useQuery({ queryKey: ["assignments"], queryFn: getAllAssignments });

  const toggleAssignmentMenuOpen = (data) => {
    setAssignmentData(data);
    console.log("data in menu is : ", data);
    setIsAssignmentMenuOpen(!isAssignmentMenuOpen);
  }

  const { isBlurred, toggleBlur } = useBlur();

  const onViewSubmission = () => {
    navigate(`/teacher/assignments/submissions`, { state: assignmentdata })
  }

  const onGradingAssignment = () => {
    navigate(`/teacher/assignments/GradingAssignments`, { state: assignmentdata })
  }

  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [changeDeadlineClick, setChangeDeadlineClick] = useState(false);

  const onChangeDeadline = () => {
    setChangeDeadlineClick(!changeDeadlineClick);
  }

  const assignmentDellMutate = useMutation({
    mutationFn: async (id) => await deleteAssignments(id),
    onSettled: async () => {
      await refetch();
      toast.success("Assignment deleted successfully");
    }
  });





  return (
    isPending || isRefetching ? <div className="flex justify-start flex-1"> <Loader /> </div> :
      <>
        <div className="flex flex-col flex-1 bg-[#F9F9F9] font-poppins w-full">
          <div className="flex flex-1 min-w-0">
            <div className={`w-full flex-grow lg:ml-72 min-w-0 overflow-x-hidden`}>
              <Navbar heading={"Assignment"} />
              <div className="p-3 sm:p-4 lg:px-12">
                <div className="flex justify-end my-2">
                  <div
                    className="flex cursor-pointer bg-[#6A00FF] hover:bg-[#007EEA] rounded-3xl"
                    onClick={() => {
                      setCreateModalOpen(true);
                      toggleBlur();
                    }}
                  >
                    <p className="px-2 py-1 text-sm sm:text-lg sm:px-4 sm:py-2 text-white">Create new +</p>
                  </div>
                </div>
                <div className="mt-8 h-[80%] w-full  overflow-x-auto">

                  <QuizAssignmentRow
                    isQuiz={false}
                    index={"Sr. No"}
                    assignedOn={"Assigned On"}
                    title={"Title"}
                    deadline={"Deadline"}
                    bgColor={"#F9F9F9"}
                    header={true}
                    submissions={"Submissions"}
                    actions={"Actions"}

                  />

                  {isSuccess && data.map((assignment, index) => {
                    const expectedCount = assignment?.classroomID?.students?.length || 0;

                    return (
                      <QuizAssignmentRow
                        key={assignment.id}
                        id={assignment.id}
                        alldata={assignment}
                        toggleAssignmentMenu={(e) => toggleAssignmentMenuOpen(e)}
                        data={assignment}
                        isQuiz={false}
                        index={index + 1}
                        assignedOn={assignment.createdAt}
                        title={assignment.title}
                        deadline={assignment.dueDate}
                        bgColor={"#FFFFFF"}
                        header={false}
                        submissions={`${assignment.submissions?.length || 0} / ${expectedCount}`}
                      actions={
                        <div className="flex gap-1 lg:gap-3 justify-center items-center">
                          <span className="text-[blue] cursor-pointer" onClick={() => {
                            setSelectedAssignments(assignment);
                            setIsEdit(true)
                            toggleBlur();
                          }}><MdEdit className="w-6 h-6" /></span>
                          <span className="text-[blue] cursor-pointer" onClick={() => {
                            setSelectedAssignments(assignment);
                            setIsShow(true)
                            toggleBlur();
                          }}><FaEye className="w-6 h-6" /></span>
                          <span className="text-red cursor-pointer " onClick={() => {
                            assignmentDellMutate.mutate(assignment?.id);
                          }}><MdDelete className="w-6 h-6" /></span>
                        </div>
                      }
                      />
                    );
                  })}

                  {data?.length === 0 && <div className="text-center py-4 text-3xl font-medium">No assignments to display!</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        <CreateQuizAssignmentModal
          isQuiz={false}
          refetch={refetch}
          open={createModalOpen}
          setopen={setCreateModalOpen} // ✅ Pass correct setter

        />
        <CreateQuizAssignmentModal
          isQuiz={false}
          isEditTrue={true}
          refetch={refetch}
          data={assignmentdata}
          open={changeDeadlineClick}
          setopen={setChangeDeadlineClick}
        />
        <AssignmentMenu isQuizz={false}
          onEditGradeClick={() => { }}
          isopen={isAssignmentMenuOpen}
          setIsOpen={setIsAssignmentMenuOpen}
          onViewSubmissionClick={onViewSubmission}
          onChangeDeadlineClick={onChangeDeadline}
          onGradeAssignemntClick={onGradingAssignment}
        />

        {isEdit && selectedAssignments && (
          <EditQuizAssignmentModal
            data={selectedAssignments}
            isEditTrue={true}
            refetch={refetch}
            isQuiz={false}
            setIsEdit={setIsEdit}
          />
        )}

        {isShow && selectedAssignments && (
          <ShowQuizAssignmentModal
            data={selectedAssignments}
            setIsShow={setIsShow}
            isQuiz={false}

          />
        )}
      </>
  );
};

export default Assignments;

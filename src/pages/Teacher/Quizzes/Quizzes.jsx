import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Teacher/Navbar";
import AssignmentMenu from "../../../components/Teacher/QuizAssignment/AssignmentMenu";
import QuizAssignmentRow from "../../../components/Teacher/QuizAssignment/QuizAssignmentRow";
import CreateQuizAssignmentModal from "../../../components/Teacher/QuizAssignment/CreateQuizAssignmentModal";
import { FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { deleteQuiz, getAllQuizes } from "../../../api/Teacher/Quiz";
import LargeLoader from "../../../utils/LargeLoader";
import { MdDelete, MdEdit } from "react-icons/md";
import EditQuizAssignmentModal from "../../../components/Teacher/QuizAssignment/EditQuizAssignmentModal";
import { toast } from "react-toastify";
import ShowQuizAssignmentModal from "../../../components/Teacher/QuizAssignment/ShowQuizAssignmentModal";

const Quizzes = () => {
  const [isAssignmentMenuOpen, setIsAssignmentMenuOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isShow, setIsShow] = useState(false)

  const [selectedAssignments, setSelectedAssignments] = useState(null);
  const navigate = useNavigate();
  const [quizdata, setQuizdata] = useState({});

  const toggleAssignmentMenuOpen = (data) => {
    console.log("toggle menu data is : ", data);
    setQuizdata(data);
    setIsAssignmentMenuOpen(!isAssignmentMenuOpen);
  }

  const { toggleBlur } = useBlur();

  const onViewSubmission = () => {
    navigate(`/teacher/quizzes/submissions`, { state: quizdata })
  }

  const onGradingAssignment = () => {
    navigate(`/teacher/quizzes/GradingQuizzes`, { state: quizdata })
  }



  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [changeDeadlineClick, setChangeDeadlineClick] = useState(false);

  const onChangeDeadline = () => {
    setChangeDeadlineClick(!changeDeadlineClick);
  }

  const { data, isPending, error, refetch, isRefetching } = useQuery({ queryKey: ["quizes"], queryFn: getAllQuizes });

  console.log("all quizes are : ", data);
  // if(error){
  //   navigate("/teacher/quizzes")
  // }



  const quizDellMutate = useMutation({
    mutationFn: async (id) => await deleteQuiz(id),
    onSettled: async () => {
      await refetch();
      return toast.success("Quiz deleted successfully");
    }
  });
  return (
    isPending || isRefetching ? <div className="flex justify-center flex-1"> <LargeLoader />  </div> :
      <>
        <div className="flex flex-col flex-1 bg-[#F9F9F9] font-poppins w-full">
          <div className="flex flex-1 min-w-0">
            <div className={`w-full flex-grow lg:ml-72 min-w-0 overflow-x-hidden`}>
              <Navbar heading={"Quizes"} />
              <div className="p-4 lg:px-12">
                <div className="flex justify-end my-2">
                  <div
                    className="flex cursor-pointer bg-[#6A00FF] rounded-3xl"
                    onClick={() => {
                      setCreateModalOpen(true);
                      toggleBlur();
                    }}
                  >
                    <p className="px-4 py-2 text-white">Create new +</p>
                  </div>
                </div>
                <div className="mt-8 min-h-[400px]">

                  <QuizAssignmentRow
                    isQuiz={true}
                    index={"Sr. No"}
                    assignedOn={"Assigned On"}
                    title={"Title"}
                    deadline={"Deadline"}
                    bgColor={"#F9F9F9"}
                    header={true}
                    submissions={"Submissions"}
                    actions={"Actions"}
                  />

                  {data?.map((assignment, index) => {
                    const expectedCount = assignment?.classroomID?.students?.length || 0;

                    return (
                      <QuizAssignmentRow
                        key={index}
                        index={index + 1}
                        toggleAssignmentMenu={(e) => toggleAssignmentMenuOpen(e)}
                        isQuiz={true}
                        data={assignment}
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
                              quizDellMutate.mutate(assignment?.id);
                            }}><MdDelete className="w-6 h-6" /></span>
                          </div>
                        }
                      />
                    );
                  })}

                  {data?.length === 0 && <div className="text-center py-4 text-3xl font-medium">No quizes to display!</div>}

                </div>
              </div>
            </div>
          </div>
        </div>
        <CreateQuizAssignmentModal
          isQuiz={true}
          refetch={refetch}
          open={createModalOpen}
          setopen={setCreateModalOpen}
        />
        <CreateQuizAssignmentModal
          isQuiz={true}
          data={quizdata}
          isEditTrue={true}
          refetch={refetch}
          open={changeDeadlineClick}
          setopen={setChangeDeadlineClick}
        />
        <AssignmentMenu isQuizz={true}
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
            refetch={refetch}
            isEditTrue={true}
            isQuiz={true}
            setIsEdit={setIsEdit}
          />
        )}
        {isShow && selectedAssignments && (
          <ShowQuizAssignmentModal
            data={selectedAssignments}
            setIsShow={setIsShow}
            isQuiz={true}

          />
        )}
      </>
  );
};

export default Quizzes

import React, { useEffect, useState } from "react";
import { useStudent } from "../../../context/StudentContext";
import { formatDate } from "../../../constants/formattedDate";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utils/Loader";
import { useUser } from "../../../context/UserContext";
const Deliverables = () => {

  const navigate = useNavigate();
  const { allAssignments, allQuizes, assignmentRefetch, quizRefetch, quizIsPending, assignmentIsPending } = useStudent();
  const [allDeliverables, setAllDeliverables] = useState([]);


  const { userData } = useUser()



  const matchedAssignments = allAssignments || [];
  const matchedAQuizes = allQuizes || [];



  useEffect(() => {

    if (allAssignments.length == 0) {
      // console.log(" getting assignments in useeffect")
      // assignmentRefetch();
    }
    if (allQuizes.length == 0) {
      // console.log(" getting quiz in useeffect")
      // quizRefetch();
    }
    if (allAssignments.length > 0 || allQuizes.length) {
      let arr = [...matchedAssignments, ...matchedAQuizes];
      arr.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

      setAllDeliverables(arr);
      console.log(arr);
    }

  }, [allAssignments, allQuizes]);


  const Deliverable = ({ item }) => {
    return (
      <div className="flex w-full px-2 py-1 bg-white rounded-lg custom-shadow">
        <div className="flex flex-col flex-1">
          <div className="flex justify-between">
            <div className="flex gap-2 py-2">
              <div className="flex flex-col items-center justify-center px-2 text-lg rounded-md text-orange bg-orange_light">
                <div className="flex gap-1">
                  <p className="h-4">+</p>
                  <p className="h-4">-</p>
                </div>
                <div className="flex gap-1">
                  <p className="">x</p>
                  <p className="">=</p>
                </div>
              </div>
              <div className="">
                <p className="sm:text-base text-sm font-medium">{item.title}</p>
                <p className="text-xs text-black/50">Due date {formatDate(item.dueDate)} </p>
              </div>
            </div>
            <div className="flex justify-end">
              <div>
                <p className="px-3 py-1 text-white bg-[#0B1053] rounded-3xl" style={{ fontSize: 8 }}>{item.subjectID.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 gap-2">
        <div className="flex flex-col">
          <p className="text-lg font-medium">Deliverables</p>
        </div>
        {(quizIsPending || assignmentIsPending) && (
          <div className="flex flex-1">
            <Loader />
          </div>
        )}
        {(!quizIsPending && !assignmentIsPending) && (
          <div className="flex flex-col gap-1 px-4 py-4 bg-white overflow-y-auto register-scrollbar border-t-4 h-72 rounded-xl border-t-[#0B1053]">
            {allDeliverables.length > 0 ? (
              allDeliverables.map((item) => <Deliverable item={item} key={item.id} />)
            ) : (
              <div className="flex flex-1 justify-center items-center">
                <p className="text-sm text-gray-500">
                  No deliverables have been assigned yet.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Deliverables;

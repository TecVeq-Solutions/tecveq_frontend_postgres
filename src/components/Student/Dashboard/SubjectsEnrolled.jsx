import React, { useEffect, useState } from "react";
import TeacherMessageDialog from "./TeacherMessageDialog";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../../context/UserContext";
import { useStudent } from "../../../context/StudentContext";
import { getAllSubjects } from "../../../api/Student/Subjects";
import Loader from "../../../utils/Loader";

const SubjectsEnrolled = () => {

  const [popup, setPopup] = useState(false);
  const [clickedItem, setClickedItem] = useState(false);

  const { userData } = useUser();
  const { setAllSubjects, studentLogedIn } = useStudent();


  //console.log(userData, "student login");




  const toggleClickTeacher = (item) => {
    setPopup(!popup);
    setClickedItem(item)
  }

  const handleFeedback = () => {
    toggleClickTeacher();
    // TODO: backend call
  }

  const subjectQuery = useQuery({
    queryKey: ["subjects"], queryFn: async () => {
      const results = await getAllSubjects(userData.id);
      setAllSubjects(results);
      console.log("inside dashboard")
      return results
    }, 
    refetchInterval: 10000, 
    enabled: studentLogedIn
  });

  const filteredSubjects = subjectQuery?.data?.subjects || subjectQuery?.data || [];

  //console.log(filteredSubjects, "Filtered Subjects for Student");


  // useEffect(() => subjectQuery.data && setAllSubjects(subjectQuery.data), [subjectQuery.isSuccess, subjectQuery.data]);

  return (
    <>
      <div className="flex flex-1">
        <div className="flex flex-col flex-1 gap-2">
          <div>
            <p className="text-lg font-medium">Subjects Enrolled</p>
          </div>
          <div className="flex flex-1">
            <table className="flex flex-col flex-1 bg-white rounded-lg table-fixed">

              <thead className="flex gap-5 px-2 py-3 border-t-4 rounded-tl-lg rounded-tr-lg border-t-[#0B1053] bg-[#ECEEF0]">
                <tr className="flex flex-1 font-medium">
                  <td className="text-sm sm:text-lg flex-[1] flex justify-center">Sr No.</td>
                  <td className="text-sm sm:text-lg flex-[3] flex justify-center">Subject Name</td>
                  <td className="text-sm sm:text-lg flex-[3] flex justify-center">Instructor</td>
                  <td className="text-sm sm:text-lg flex-[3] flex justify-center">Attendence</td>
                </tr>
              </thead>

              <tbody className="flex flex-col overflow-y-auto h-60 register-scrollbar">

                {
                  subjectQuery.isPending ? (
                    <div className="flex flex-1">
                      <Loader />
                    </div>
                  ) : filteredSubjects?.length > 0 ? (
                    filteredSubjects?.map((item, index) => {
                      return (
                        <tr className="flex text-xs border-t border-t-black/10" key={index + 1}>
                          <td className="flex-[1] py-2 lg:py-3 flex justify-center">{index + 1}.</td>
                          <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                            {item?.subject?.name || item?.name}
                          </td>
                          <td
                            onClick={() => toggleClickTeacher(item)}
                            style={{ cursor: "pointer" }}
                            className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center"
                          >
                            {item.teacher}
                          </td>
                          <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex w-full justify-center">
                            <div className="flex w-[90%] h-4 bg-grey/50 rounded-3xl">
                              <div
                                style={{ width: `${item.avgAttendancePer}%` }}
                                className={`text-xs h-4 bg-gradient-to-r from-[#0B1053] to-[#007EEA] rounded-3xl flex justify-center text-white`}
                              >  
                              <span className=" ml-[1.26rem]">
                                {item.avgAttendancePer} 
%
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <div className="flex flex-1 justify-center items-center">
                      <p className="text-lg text-gray-500">Admin has not enrolled subjects yet.</p>
                    </div>
                  )
                }


                {popup && <TeacherMessageDialog handleFeedback={handleFeedback} item={clickedItem} />}

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubjectsEnrolled;

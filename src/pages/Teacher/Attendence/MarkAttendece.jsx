import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Teacher/Navbar";
import DataRow from "../../../components/Teacher/Attendence/Submission/DataRow";

import { BiSearch } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAttendence } from "../../../api/Teacher/Attendence";
import { toast } from "react-toastify";

const MarkAttendence = () => {

    const queryClient = useQueryClient();
    const location = useLocation();
    const { isBlurred, toggleBlur } = useBlur();
    const [classData, setClassData] = useState();
    const [searchText, setSearchText] = useState("");

    const navigate = useNavigate();

    const [attendeceData, setAttendenceData] = useState([{ studentID: "no id", isPresent: true }]);

    console.log(attendeceData, "all attendence")

    const attendenceMutation = useMutation({


        mutationKey: ["mark-attendence"], mutationFn: async () => {
            const result = await markAttendence(attendeceData, location?.state?.id, location?.state?.
                classroomID, location?.state?.startTime
            );
            return result;
        },
        onSettled: (data, error) => {
            if (error) console.log(error, "error is accurs");
            if (!error) {
                toast.success(`Attendance ${location.state.attendance?.length > 0 ? "updated" : "submitted"} successfully!`);
                // Invalidate all relevant queries for all roles to ensure reports "progress"
                queryClient.invalidateQueries(["assignment"]);
                queryClient.invalidateQueries(["quiz"]);
                queryClient.invalidateQueries(["reports"]);
                queryClient.invalidateQueries(["report"]);
                queryClient.invalidateQueries(["studentReports"]);
                queryClient.invalidateQueries(["teacherStudets"]);
                queryClient.invalidateQueries(["student-assignments-quizes"]);
                queryClient.invalidateQueries(["fetchAttandenceGet"]);
                navigate("/teacher/attendence");
                console.log(" data is: ", data);
            } else {
                // toast.error handled globally by axios interceptor
            }
        }
    })

    useEffect(() => {
        console.log("Location state in MarkAttendence:", location.state);
        if (location.state) {
            console.log("Processing class data for attendance...");

            const existingAttendance = location.state.attendance || [];
            let temparray = [];

            const subjectId = location.state?.subject?.id || location.state?.subjectID?.id || location.state?.subjectID;
            const matchedStudentsList = (location.state?.classroom?.students || location.state?.classroom?.studentDetails || location.state?.classroom?.studentdetails || []).filter(student =>
                student.subjects?.includes(subjectId)
            );

            if (existingAttendance.length > 0) {
                console.log("Existing attendance found, pre-filling data:", existingAttendance);
                temparray = matchedStudentsList.map(student => {
                    const studentData = existingAttendance.find(
                        item => (item.studentID.id || item.studentID) === student.id
                    );
                    if (studentData) {
                        return {
                            studentID: studentData.studentID.id || studentData.studentID,
                            isPresent: studentData.isPresent,
                            late: studentData.late || false
                        };
                    } else {
                        return { studentID: student.id, isPresent: true, late: false };
                    }
                });
            } else {
                console.log("No existing attendance, defaulting all present.");
                temparray = matchedStudentsList.map(student => ({
                    studentID: student.id,
                    isPresent: true,
                    late: false
                }));
            }

            setAttendenceData(temparray);
            setClassData(location?.state);
        }
    }, [location])

    console.log(classData, "class dta si");



    const subjectIdCheck = classData?.subject?.id || classData?.subjectID?.id || classData?.subjectID;

    const matchedStudents = (classData?.classroom?.students || classData?.classroom?.studentDetails || classData?.classroom?.studentdetails || []).filter(student =>
        student.subjects?.includes(subjectIdCheck)
    );

    // Example output:
    console.log(matchedStudents, "hhhhhhhhhhh");


    return (
        false ? <div className="flex justify-start flex-1"> <Loader /> </div> :
            <>
                <div className="flex flex-1 bg-[#F9F9F9] font-poppins">
                    <div className="flex flex-1">
                        <div
                            className={`w-full h-screen flex-grow lg:ml-72`}
                        >
                            <div className="h-screen pt-1">
                                <Navbar heading={"Mark Attendence"} />
                                <div className={`px-3 lg:px-20 sm:px-10 ${isBlurred ? "blur" : ""}`}>
                                    <div className="py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="">
                                                <p className="text-black/60"></p>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-3xl">
                                                    <BiSearch />
                                                    <input
                                                        type="text"
                                                        value={searchText}
                                                        placeholder="Search"
                                                        className="outline-none b"
                                                        onChange={(e) => setSearchText(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-8 h-[80%] overflow-auto  ">
                                        <DataRow
                                            isQuiz={true}
                                            header={true}
                                            index={"Sr. No"}
                                            classname={"Name"}
                                            bgColor={"#F9F9F9"}
                                            students={"Students"}
                                            teachers={"Teachers"}
                                        />
                                        {matchedStudents?.map((cls, index) =>

                                        (

                                            <DataRow
                                                data={cls}
                                                header={false}
                                                classname={cls.name}
                                                profile={cls?.profilePic}
                                                index={index + 1}
                                                bgColor={"#FFFFFF"}
                                                attendeceData={attendeceData}
                                                setAttendenceData={setAttendenceData}
                                            />
                                        ))}
                                        {searchText && matchedStudents?.map((cls, index) => {
                                            if (cls.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())) {
                                                return <DataRow
                                                    data={cls}
                                                    header={false}
                                                    classname={cls.name}
                                                    profile={cls.profilePic}
                                                    index={index + 1}
                                                    bgColor={"#FFFFFF"}
                                                    attendeceData={attendeceData}
                                                    setAttendenceData={setAttendenceData}
                                                />
                                            }
                                        })}
                                    </div>

                                    {attendenceMutation.isPending && <div> <Loader /> </div>}

                                    {!attendenceMutation.isPending && <div className="flex justify-end my-4 border-t border-black">
                                        <div className="flex justify-end py-4">
                                            <p onClick={attendenceMutation.mutate} className="flex cursor-pointer px-8 py-3 text-sm text-white rounded-3xl bg-[#0B1053]">{location.state.attendance?.length > 0 ? "Update" : "Submit"}</p>
                                        </div>
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
    )
}

export default MarkAttendence;

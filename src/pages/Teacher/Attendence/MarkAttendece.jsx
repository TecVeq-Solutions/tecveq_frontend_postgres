import React, { useEffect, useState, useMemo } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Teacher/Navbar";
import DataRow from "../../../components/Teacher/Attendence/Submission/DataRow";

import { BiSearch, BiUserCheck } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAttendence } from "../../../api/Teacher/Attendence";
import { toast } from "react-toastify";

const MarkAttendence = () => {
    const queryClient = useQueryClient();
    const location = useLocation();
    const { isBlurred } = useBlur();
    const navigate = useNavigate();

    const [classData, setClassData] = useState(null);
    const [searchText, setSearchText] = useState("");
    const [attendeceData, setAttendenceData] = useState([]);

    const attendenceMutation = useMutation({
        mutationKey: ["mark-attendence"],
        mutationFn: async () => {
            return await markAttendence(
                attendeceData,
                location?.state?.id,
                location?.state?.classroomID,
                location?.state?.startTime
            );
        },
        onSettled: (data, error) => {
            if (!error) {
                toast.success(`Attendance ${location.state.attendance?.length > 0 ? "updated" : "submitted"} successfully!`);
                queryClient.invalidateQueries(["fetchAttandenceGet", "reports"]);
                navigate("/teacher/attendence");
            } else {
                console.error("Attendance Error:", error);
            }
        }
    });

    useEffect(() => {
        if (location.state) {
            const existingAttendance = location.state.attendance || [];
            const subjectId = location.state?.subject?.id || location.state?.subjectID?.id || location.state?.subjectID;

            const students = (location.state?.classroom?.students ||
                location.state?.classroom?.studentDetails ||
                location.state?.classroom?.studentdetails || [])
                .filter(student => student.subjects?.includes(subjectId));

            const initialData = students.map(student => {
                const existing = existingAttendance.find(
                    item => (item.studentID.id || item.studentID) === student.id
                );
                return existing ? {
                    studentID: existing.studentID.id || existing.studentID,
                    isPresent: existing.isPresent,
                    late: existing.late || false
                } : { studentID: student.id, isPresent: true, late: false };
            });

            setAttendenceData(initialData);
            setClassData(location.state);
        }
    }, [location]);

    // Optimized filtering logic
    const filteredStudents = useMemo(() => {
        const subjectId = classData?.subject?.id || classData?.subjectID?.id || classData?.subjectID;
        const students = (classData?.classroom?.students ||
            classData?.classroom?.studentDetails ||
            classData?.classroom?.studentdetails || [])
            .filter(student => student.subjects?.includes(subjectId));

        if (!searchText) return students;
        return students.filter(s => s.name.toLowerCase().includes(searchText.toLowerCase()));
    }, [classData, searchText]);

    if (!classData) return <div className="flex justify-center items-center h-screen"><Loader /></div>;

    return (
        <div className="flex min-h-screen bg-[#F3F4F6] min-w-0 font-poppins">
            <div className="flex-1 ml-0 lg:ml-72 flex  min-w-0 flex-col">
                <Navbar heading="Mark Attendance" />

                <main className={`flex-1 px-4 md:px-8 lg:px-12 py-6 transition-all duration-300 ${isBlurred ? "blur-sm" : ""}`}>

                    {/* Header Card */}
                    <div className="bg-white rounded-2xl p-3 sm:p-6 shadow-sm border border-gray-100 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {classData?.classroom?.name || "Classroom"}
                                </h2>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <BiUserCheck className="text-lg" />
                                    Total Students: {filteredStudents.length}
                                </p>
                            </div>

                            <div className="relative w-full md:w-72">
                                <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                                <input
                                    type="text"
                                    value={searchText}
                                    placeholder="Search student name..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    onChange={(e) => setSearchText(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {/* Sticky Header */}
                        <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-100">
                            <DataRow
                                isQuiz={true}
                                header={true}
                                index={"SR."}
                                classname={"STUDENT NAME"}
                                bgColor={"transparent"}
                                students={"STATUS"}
                                teachers={"LATE"}
                            />
                        </div>

                        <div className="max-h-[calc(100vh-350px)] overflow-y-auto">
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <div key={student.id} className="border-b border-gray-50 last:border-0 hover:bg-blue-50/30 transition-colors">
                                        <DataRow
                                            data={student}
                                            header={false}
                                            classname={student.name}
                                            profile={student?.profilePic}
                                            index={index + 1}
                                            bgColor={"transparent"}
                                            attendeceData={attendeceData}
                                            setAttendenceData={setAttendenceData}
                                        />
                                    </div>
                                ))
                            ) : (
                                <div className="py-20 text-center text-gray-400">
                                    <p>No students found matching your search.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-6 flex items-center justify-between bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-500">
                            Review the list before {location.state.attendance?.length > 0 ? "updating" : "submitting"}.
                        </div>

                        <button
                            disabled={attendenceMutation.isPending}
                            onClick={() => attendenceMutation.mutate()}
                            className={`px-4 sm:px-10 py-2 sm:py-3 rounded-xl font-medium text-white transition-all transform active:scale-95 shadow-lg shadow-blue-900/20 ${attendenceMutation.isPending
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-[#0B1053] hover:bg-[#151b6e]"
                                }`}
                        >
                            {attendenceMutation.isPending ? (
                                <span className="flex items-center gap-2">Processing...</span>
                            ) : (
                                location.state.attendance?.length > 0 ? "Update Attendance" : "Submit Attendance"
                            )}
                        </button>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MarkAttendence;
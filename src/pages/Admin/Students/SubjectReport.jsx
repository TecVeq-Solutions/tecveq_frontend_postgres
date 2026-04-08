import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";
import LargeLoader from "../../../utils/LargeLoader";
import Navbar from "../../../components/Admin/Navbar";
import Card from "../../../components/Admin/StudentReports/Card";
import ActivityCard from "../../../components/Admin/StudentReports/ActivityCard";
import SystemOverview from "../../../components/Admin/StudentReports/SystemOverview"
import QuizAssignmentsTable from "../../../components/Admin/StudentReports/QuizAssignmentsTable";
import AttendanceTable from "../../../components/Admin/StudentReports/AttendanceTable";
import { X } from "lucide-react";
import { LuPhone } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import { IoMailOutline } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudentSubjectsForAdmin, getStudentSubjectsWithLevel, updateStudentSubjects } from "../../../api/Admin/UsersApi";
import { getStudentReport, getStudentSubjectReport } from "../../../api/Admin/AdminApi";
import { toast } from "react-toastify";
import { useGetAllSubjectOfStudent } from "../../../api/Admin/SubjectsApi";
import { useUser } from "../../../context/UserContext";

const SubjectReport = () => {

  const location = useLocation();
  const queryClient = useQueryClient();

  const [studentData, setStudentData] = useState({});
  const [allSubjects, setAllSubjects] = useState([]);
  const [editSubject, setEditSubject] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState("");
  const [subjectQueryFlag, setSubjectQueryFlag] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  useEffect(() => {
    console.log("location.state in SubjectReport:", location.state);
    setStudentData(location.state);
  }, [location.state])

  const { data: report, isPending, isError } = useQuery({
    queryKey: ["report", location.state?.id],
    queryFn: async () => await getStudentReport(location.state?.id),
    enabled: !!location.state?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: subjects, isSuccess, isPending: subjectPending } = useQuery({
    queryKey: ["subjectofstudents", location.state?.id],
    queryFn: async () => await getStudentSubjectsForAdmin(location.state?.id),
    enabled: !!location.state?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log(subjects, "hahahhahahahhahahahhaha");


  const { data: subjectReport, isPending: subjectReportPending } = useQuery({
    queryKey: ["student-assignments-quizes", location.state?.id, selectedSubject && JSON.parse(selectedSubject).id],
    queryFn: async () => await getStudentSubjectReport(location.state?.id, JSON.parse(selectedSubject).id),
    enabled: !!selectedSubject && !!location.state?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isSuccess) setAllSubjects(subjects);
  }, [isSuccess, subjects]);

  useEffect(() => {
    if (!subjectReportPending && subjectReport) {
      console.log("subject report data in subject report section in admin penal is: ", subjectReport);
    }
  }, [selectedSubject, subjectReport, subjectReportPending])

  const { data: studentSubjectWithLevel, isSuccess: studentIsSuccess, isPending: studentSubjectPending } = useQuery({
    queryKey: ["studentSubjectwithLevel", studentData?.levelID],
    queryFn: async () => await getStudentSubjectsWithLevel(studentData?.levelID),
    enabled: !!studentData?.levelID,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log(studentSubjectWithLevel, "student subject with level ");

  const handleCheckboxChange = (subjectId) => {
    setSelectedSubjects((prevSelected) =>
      prevSelected.includes(subjectId)
        ? prevSelected.filter((id) => id !== subjectId)
        : [...prevSelected, subjectId]
    );
  };

  const mutation = useMutation({
    mutationFn: updateStudentSubjects,
    onSuccess: (data) => {
      console.log("Subjects assigned successfully!", data);
      toast.success("Subjects assigned successfully!");

      // Invalidate specific queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["subjectofstudents", studentData?.id] });
      queryClient.invalidateQueries({ queryKey: ["studentSubjects", studentData?.id] });

      // Refetch the student subjects manually
      refetchStudentSubjects();

      // Don't close modal immediately, let the data update first
      setTimeout(() => {
        setEditSubject(false);
      }, 100);
    },
    onError: (error) => {
      console.error("Error assigning subjects:", error.message);
      toast.error("Error assigning subjects!");
    },
  });

  // Get student subjects with proper query key
  const { studentSubject, refetch: refetchStudentSubjects } = useGetAllSubjectOfStudent(studentData?.id);

  // This effect runs when editSubject opens OR when studentSubject data changes
  useEffect(() => {
    if (editSubject && studentSubject?.subjects) {
      console.log("Setting selected subjects:", studentSubject.subjects);
      // Initialize selectedSubjects with already assigned subjects
      const assignedSubjects = studentSubject.subjects.map((subj) => subj.id);
      setSelectedSubjects(assignedSubjects || []);
    }
  }, [editSubject, studentSubject]); // Added studentSubject as dependency

  // Additional effect to handle when studentSubject changes while modal is open
  useEffect(() => {
    if (editSubject && studentSubject?.subjects) {
      const assignedSubjects = studentSubject.subjects.map((subj) => subj.id);
      setSelectedSubjects(assignedSubjects || []);
    }
  }, [studentSubject]); // This will run whenever studentSubject data changes

  return (
    isPending || subjectPending ? <div className="flex justify-center flex-1"> <LargeLoader /> </div> :
      <>
        <div className="flex flex-1 bg-[#F9F9F9] font-poppins">
          <div className="flex flex-1">
            <div className="flex-grow w-full px-3  lg:px-20 sm:px-10 lg:ml-72">
              <div className="">
                <Navbar heading={"Subjects Report"} />
                <div className="mt-7">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <img src={studentData.profilePic || IMAGES.Profile} alt="student profile" className="sm:w-40 sm:h-40 w-20 h-20 rounded-full" />
                    <p className="text-lg font-semibold">{studentData.name}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <LuPhone />
                      <p>{studentData.phoneNumber}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <IoMailOutline />
                      <p>{studentData.email}</p>
                    </div>
                  </div>
                </div>

                <div className="w-full justify-end items-center flex">
                  <button className="mt-5 py-2 px-4 sm:py-2 sm:px-4 bg-[#0B1053] text-white rounded-full" onClick={() => {
                    // Refetch student subjects before opening modal
                    refetchStudentSubjects();
                    setEditSubject(!editSubject);
                  }}>Subject Edit</button>
                </div>
                <div className="mt-7">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col sm:flex-row justify-between">
                      <p className="md:text-[20px]">Overview</p>
                      <div className="flex items-center gap-4 border bg-white border-[#00000020] px-4 py-2 rounded-3xl">
                        <select className="outline-none w-full sm:w-60 text-black font-semibold" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} >
                          <option value={""}>Select Subject</option>
                          {isSuccess && subjects?.subjects?.map((sub, index) => <option key={sub.id || index} className="text-black" value={JSON.stringify(sub)}>{sub?.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex flex-col items-center flex-1 gap-2 sm:flex-row">
                      {selectedSubject !== "" && subjectReportPending ? <Loader /> :
                        (selectedSubject !== "" && subjectReport && (
                          <>
                            <Card
                              type={"Percentage"}
                              data={"Assignment"}
                              grade={subjectReport.assignments?.avgGrade}
                              percentage={subjectReport.assignments?.avgMarksPer || 0}
                            />
                            <Card
                              data={"Quizes"}
                              type={"Percentage"}
                              grade={subjectReport.quizes?.avgGrade}
                              percentage={subjectReport.quizes?.avgMarksPer || 0}
                            />
                            <Card
                              data={"Attendence"}
                              type={"Percentage"}
                              percentage={Math.round(subjectReport.attendance?.avgAttendencePer) || 0}
                            />
                          </>
                        ))
                      }
                    </div>
                  </div>
                </div>

                {selectedSubject !== "" && !subjectReportPending && subjectReport && (
                  <>
                    <div className="mt-7">
                      <div className="flex flex-col gap-2">
                        <p className="md:text-[20px]">Assignments </p>
                        <div className="flex flex-row items-center gap-2">
                          <QuizAssignmentsTable data={subjectReport.assignments?.data || []} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-7">
                      <div className="flex flex-col gap-2">
                        <p className="md:text-[20px]">Quizzes</p>
                        <div className="flex flex-row items-center gap-2">
                          <QuizAssignmentsTable data={subjectReport.quizes?.data || []} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-7">
                      <div className="flex flex-col gap-2">
                        <p className="md:text-[20px]">Attendance</p>
                        <div className="flex flex-row items-center gap-2">
                          <AttendanceTable data={subjectReport.attendance?.classes || []} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="mt-7">
                  <SystemOverview />
                </div>
              </div>
            </div>
          </div>

          <div>
            {editSubject && studentSubjectWithLevel?.subjects?.length > 0 && (
              <div className="absolute top-0 right-0 py-8 bg-white min-w-72 shadow-lg rounded-md z-50 p-4 space-y-3">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Select Subjects</h2>
                  <button
                    onClick={() => setEditSubject(false)}
                    className="text-black hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {studentSubjectWithLevel?.subjects.map((subject) => (
                    <label
                      key={subject.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-white/10 px-2 py-1 rounded-md"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#0B1053] focus:ring-[#0B1053]"
                        checked={selectedSubjects.includes(subject.id)}
                        onChange={() => handleCheckboxChange(subject.id)}
                      />
                      <span className="text-sm">{subject.subjectName}</span>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => {
                    console.log(selectedSubjects, "selected subject");

                    if (!studentData?.id) {
                      console.error("Student ID is missing");
                      return;
                    }

                    mutation.mutate({
                      studentId: studentData?.id,
                      subjects: selectedSubjects,
                    });
                  }}
                  disabled={mutation.isPending}
                  className="w-full mt-4 bg-[#0B1053] text-white font-semibold py-2 rounded-md hover:bg-gray-100 transition disabled:opacity-50"
                >
                  {mutation.isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            )}
          </div>
        </div>
      </>
  );
};

export default SubjectReport;

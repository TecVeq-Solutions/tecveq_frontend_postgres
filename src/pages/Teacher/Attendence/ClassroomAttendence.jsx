import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Teacher/Navbar";
import DataRow from "../../../components/Teacher/Attendence/Submission/DataRow";
import { BiSearch, BiCalendar, BiCheckCircle, BiInfoCircle } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markHeadAttendence,
  useGetAttandenceOfClassroom,
  useUpdateAttandenceOfClassroom
} from "../../../api/Teacher/Attendence";
import { toast } from "react-toastify";
import { useUser } from "../../../context/UserContext";

const ClassroomAttendence = () => {
  const location = useLocation();
  const { userData } = useUser();
  const navigate = useNavigate();
  const { isBlurred } = useBlur();
  const queryClient = useQueryClient();

  const allData = location?.state;
  const matchedTeacher = allData?.teachers?.find((t) => t.teacherID === (userData?.id || userData?._id) || t.teacher === (userData?.id || userData?._id));
  const subjectId = matchedTeacher?.subjectID || matchedTeacher?.subject;

  const [searchText, setSearchText] = useState("");
  const [attendenceData, setAttendenceData] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split("T")[0]);
  const [showPopup, setShowPopup] = useState(false);

  const { getAttandence } = useGetAttandenceOfClassroom(location?.state?.id, currentDate);
  const { updateAttandence } = useUpdateAttandenceOfClassroom();

  useEffect(() => {
    if (!location.state || !subjectId) return;
    const students = allData?.studentDetails || [];
    const matchedStudents = students.filter((student) => student.subjects?.includes(subjectId));

    if (getAttandence) {
      const fetchedAttendanceData = getAttandence?.students?.map((attendance) => ({
        studentID: attendance.studentID,
        isPresent: attendance.isPresent,
        late: attendance.late || false
      }));
      setAttendenceData(fetchedAttendanceData);
      setFilteredStudents(matchedStudents);
    } else {
      const initialAttendanceData = matchedStudents.map((student) => ({
        studentID: student.id,
        isPresent: true,
        late: false
      }));
      setAttendenceData(initialAttendanceData);
      setFilteredStudents(matchedStudents);
    }
  }, [getAttandence, location.state, subjectId, allData?.studentDetails]);

  useEffect(() => {
    const students = allData?.studentDetails || [];
    const matchedStudents = students.filter((student) => student.subjects?.includes(subjectId));
    const filtered = searchText
      ? matchedStudents.filter((student) => student.name.toLowerCase().includes(searchText.toLowerCase()))
      : matchedStudents;
    setFilteredStudents(filtered || []);
  }, [searchText, allData?.studentDetails, subjectId]);

  const attendenceMutation = useMutation({
    mutationKey: ["mark-attendence"],
    mutationFn: async () => await markHeadAttendence(attendenceData, location?.state?.id, currentDate),
    onSettled: (data, error) => {
      if (error) {
        toast.error(error?.response?.data?.message || "Something went wrong");
      } else {
        toast.success("Attendance submitted successfully!");
        queryClient.invalidateQueries(["fetchAttandenceGet"]);
        navigate("/teacher/classroom/head-attendence");
      }
    }
  });

  const handleConfirmUpdate = () => {
    setShowPopup(false);
    updateAttandence({ data: attendenceData, classroomID: location?.state?.id, date: currentDate });
  };

  return (
    <div className="flex flex-1 bg-[#FDFDFD] font-poppins min-h-screen">
      <div className="flex flex-1 min-w-0">
        <div className={`w-full flex-grow lg:ml-80 min-w-0`}>
          <div className="h-screen flex flex-col">
            <Navbar heading={"Mark Attendance"} />

            <div className={`flex flex-col flex-1 px-3 sm:px-4 lg:px-10 py-6 transition-all duration-300 ${isBlurred ? "blur-md" : ""}`}>

              {/* ── Header Toolbar ── */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96 group">
                  <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-[#0B1053] transition-colors" />
                  <input
                    type="text"
                    value={searchText}
                    placeholder="Search by student name..."
                    className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#0B1053]/20 focus:ring-4 focus:ring-indigo-50 transition-all text-sm font-medium"
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-none">
                    <BiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={currentDate}
                      className="pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-[#0B1053]/20 transition-all text-sm font-medium text-gray-600"
                      onChange={(e) => setCurrentDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* ── Attendance List Card ── */}
              <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden">
                <div className="flex-1 flex flex-col overflow-x-auto custom-scrollbar">
                  <div className="min-w-[850px] md:min-w-full flex flex-col flex-1">
                    {/* Header */}
                    <div className="bg-gray-50/50 border-b border-gray-100">
                      <DataRow
                        isQuiz={true}
                        header={true}
                        index={"#"}
                        classname={"Student Name"}
                        bgColor={"transparent"}
                        students={"Status"}
                        teachers={"Remarks"}
                      />
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((student, index) => (
                          <div key={student.id || index} className="hover:bg-gray-50/50 transition-colors rounded-xl overflow-hidden mb-1">
                            <DataRow
                              data={student}
                              header={false}
                              classname={student.name}
                              profile={student.profilePic}
                              index={index + 1}
                              bgColor={"transparent"}
                              attendeceData={attendenceData}
                              setAttendenceData={setAttendenceData}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                          <BiInfoCircle size={40} className="mb-2 opacity-20" />
                          <p className="font-medium">No students found for this subject</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Action Footer ── */}
                <div className="p-5 bg-white border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                    Total: {filteredStudents.length} Students
                  </div>

                  {attendenceMutation.isPending ? (
                    <div className="px-10"><Loader /></div>
                  ) : (
                    <button
                      onClick={!getAttandence ? attendenceMutation.mutate : () => setShowPopup(true)}
                      className="flex items-center gap-1 sm:gap-2 px-2 sm:px-10 py-3 text-[11px] sm:text-sm font-bold text-white rounded-2xl bg-[#0B1053] hover:bg-[#161d7a] active:scale-95 shadow-lg shadow-indigo-100 transition-all"
                    >
                      <BiCheckCircle className="text-lg" />
                      {!getAttandence ? "Submit Attendance" : "Update Attendance"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Elegant Confirmation Modal ── */}
        {showPopup && (
          <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
            <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full mx-4 transform animate-in fade-in zoom-in duration-200">
              <div className="w-16 h-16 bg-indigo-50 text-[#0B1053] rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <BiInfoCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Confirm Update</h3>
              <p className="text-gray-500 text-center text-sm leading-relaxed mb-8">
                Are you sure you want to modify today's attendance records for this class?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 px-4 py-3 text-sm font-bold text-gray-500 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white bg-[#0B1053] rounded-xl hover:bg-[#161d7a] shadow-lg shadow-indigo-100 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomAttendence;
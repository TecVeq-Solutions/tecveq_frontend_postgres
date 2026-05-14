import React, { useCallback, useEffect, useState } from "react";
import IMAGES from "../../../assets/images";
import ProfileMenu from "../../../components/Student/Dashboard/ProfileMenu";
import Notifications from "../../../components/Student/Dashboard/Notifications";
import GradeQuizAssignmentRow from "../../../components/Teacher/QuizAssignment/GradeQuizAssignmentRow";

import { toast } from "react-toastify";
import { BiSearch } from "react-icons/bi";
import { IoBookOutline } from "react-icons/io5";
import { useBlur } from "../../../context/BlurContext";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMultipleAssignmentsForGrading, gradeAssignments } from "../../../api/Teacher/Assignments";
import Loader from "../../../utils/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../../context/UserContext";
import ProfileDetails from "../../../components/Teacher/ProfileDetails";

const SkeletonRow = () => (
  <div className="w-full border-b border-gray-100 flex items-center px-4 py-4 bg-white animate-pulse">
    <div className="w-10 h-4 bg-gray-200 rounded mr-4" />
    <div className="flex-1 flex items-center gap-3">
      <div className="w-9 h-9 bg-gray-200 rounded-full" />
      <div className="w-32 h-4 bg-gray-200 rounded" />
    </div>
    <div className="hidden sm:block w-[130px] h-4 bg-gray-200 rounded mx-2" />
    <div className="w-16 h-8 bg-gray-200 rounded mx-2" />
    <div className="w-14 h-8 bg-gray-200 rounded mx-2" />
    <div className="w-8 h-8 bg-gray-100 rounded-full" />
  </div>
);

const GradingAssignments = () => {

  const [mail, setmail] = useState(false);
  const [bell, setBell] = useState(false);
  const [isProfileMenu, setIsProfileMenu] = useState(false);
  const [isProfileDetails, setIsProfileDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isBlurred, toggleBlur } = useBlur();
  const { userData } = useUser();

  const location = useLocation();
  const [gradingData, setGradingData] = useState([]);

  const toggleProfielMenu = () => {
    setIsProfileMenu(!isProfileMenu);
    setmail(false);
    setBell(false);
  };

  const toggleMail = () => {
    setmail(!mail);
    setIsProfileMenu(false);
    setBell(false);
  };

  const togglebell = () => {
    setBell(!bell);
    setmail(false);
    setIsProfileMenu(false);
  };

  const toggleProfileDetails = () => {
    setIsProfileDetails(!isProfileDetails);
  };

  const onProfileClick = () => {
    toggleProfielMenu();
    toggleProfileDetails();
  };

  const onSettingsClick = () => { };
  const onLogoutClick = async () => {
    localStorage.clear();
    navigate("/");
    await userLogout();
  };

  const navigate = useNavigate();

  const onAssignmentClick = () => {
    navigate("/teacher/assignments");
  };

  const handleGradeAssignment = () => {
    console.log("for submission arry is : ", gradingData);
    let objArray = [];
    let obj = {};
    gradingData.forEach((item) => {
      if (item.marks !== "" || item.grade !== "" || item.feedback !== "") {
        obj = {
          grade: item.grade,
          marks: item.marks,
          feedback: item.feedback,
          studentID: item.studentID.id,
        };
        objArray.push(obj);
      }
    });
    console.log("obj array to push is ", objArray);
    gradeMutation.mutate(objArray);
  };

  const setInputField = useCallback((studentID, field, value) => {
    setGradingData((prev) =>
      prev.map((inp) => {
        if (inp?.studentID.id == studentID) {
          return { ...inp, [field]: value };
        }
        return inp;
      })
    );
  }, []);

  const queryClient = useQueryClient();
  const gradeMutation = useMutation({
    mutationFn: async (data) => {
      console.log("data being sent is : ", data);
      let result = await gradeAssignments({ submissions: data }, location.state.id);
      return result;
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Grades Added Successfully!");
      queryClient.invalidateQueries(["assignment"]);
      queryClient.invalidateQueries(["quiz"]);
      queryClient.invalidateQueries(["reports"]);
      queryClient.invalidateQueries(["report"]);
      queryClient.invalidateQueries(["studentReports"]);
      queryClient.invalidateQueries(["teacherStudets"]);
      queryClient.invalidateQueries(["submissions"]);
      queryClient.invalidateQueries(["student-assignments-quizes"]);
      navigate("/teacher/assignments");
    },
  });

  const allAssignmentsQuery = useQuery({
    queryKey: ["submissions", "assignment", location.state.id],
    queryFn: async () => {
      let result = await getMultipleAssignmentsForGrading(location.state.id);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (allAssignmentsQuery.isSuccess) {
      console.log("all Query data ", allAssignmentsQuery?.data);
      let dataObjArr = allAssignmentsQuery?.data?.submissions.map((item) => {
        return {
          ...item,
          grade: item.submission?.grade || "",
          feedback: item.submission?.feedback || "",
          marks:
            item.submission?.marks !== null &&
              item.submission?.marks !== undefined
              ? item.submission.marks
              : "",
        };
      });
      console.log("data after useeffect is : ", dataObjArr);
      setGradingData(dataObjArr);
    }
  }, [allAssignmentsQuery.data, allAssignmentsQuery.isSuccess]);

  const filteredData = gradingData?.filter((submission) =>
    submission?.studentID?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div
        className={`grading-root font-['DM_Sans',sans-serif] min-h-screen flex flex-1 ${isBlurred ? "blur-sm" : ""
          }`}
      >
        <div className="flex-1 overflow-hidden">
          <div className="min-h-screen bg-[linear-gradient(145deg,#ECEEF8_0%,#F2F0FA_50%,#EEF2F8_100%)] pl-3 pr-3 sm:pl-6 sm:pr-6 lg:pl-[clamp(12px,4vw,80px)] lg:pr-[clamp(12px,4vw,80px)] pt-0 ml-0 lg:ml-[320px]">

            {/* ══════════ TOP BAR ══════════ */}
            <div className="sticky top-0 z-[30] mb-4 sm:mb-8 px-3 sm:px-6 py-3 sm:py-4 bg-white/88 backdrop-blur-[20px] border-b border-[#6366F1]/12 shadow-[0_2px_32px_rgba(15,20,60,0.07)]">

              {/* gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[linear-gradient(90deg,#6366F1_0%,#8B5CF6_40%,#EC4899_80%,#F59E0B_100%)] z-50" />

              <div className="flex items-center justify-between min-h-[52px] sm:h-[68px]">

                {/* Left: icon + title + breadcrumb */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-[0_4px_14px_rgba(99,102,241,0.35)]">
                    <IoBookOutline className="text-white text-[15px] sm:text-[18px]" />
                  </div>

                  <div className="flex flex-col justify-center gap-0.5 min-w-0">
                    <p className="text-[14px] sm:text-[20px] font-bold text-[#0F1441] leading-tight tracking-[-0.4px] font-['Syne',sans-serif] truncate">
                      Grading Assignments
                    </p>
                    <div className="hidden sm:flex items-center gap-1">
                      <span className="text-[11px] text-[#A0A4BE] font-medium">Home</span>
                      <MdOutlineKeyboardArrowRight className="text-[#CDD0E3] text-[13px]" />
                      <span
                        className="text-[11px] text-[#7B7FA8] font-medium cursor-pointer transition-colors duration-200 hover:text-[#6366F1]"
                        onClick={onAssignmentClick}
                      >
                        Assignments
                      </span>
                      <MdOutlineKeyboardArrowRight className="text-[#CDD0E3] text-[13px]" />
                      <span className="text-[11px] font-semibold text-[#6366F1] px-2 py-0.5 rounded-full bg-gradient-to-br from-[#EEF0FF] to-[#F0EEFF] border border-[#6366F1]/20">
                        Grading
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: action buttons */}
                <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                  <button
                    onClick={togglebell}
                    className="hidden  relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-px bg-gradient-to-br from-[#F5F6FF] to-[#EDEEFF] border border-[#6366F1]/15 shadow-[0_2px_8px_rgba(15,20,60,0.06)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.18)]"
                  >
                    <img src={IMAGES.Notification} alt="" className="w-4 h-4 sm:w-[18px] sm:h-[18px] block" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#EF4444] rounded-full border border-white" />
                  </button>

                  <button
                    onClick={toggleMail}
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-px bg-gradient-to-br from-[#F5F6FF] to-[#EDEEFF] border border-[#6366F1]/15 shadow-[0_2px_8px_rgba(15,20,60,0.06)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.18)]"
                  >
                    <img src={IMAGES.SMS} alt="" className="w-4 h-4 sm:w-[18px] sm:h-[18px] block" />
                  </button>
                </div>
              </div>

              {mail && <Notifications dashboard={false} onclose={toggleMail} />}
              {isProfileMenu && (
                <ProfileMenu
                  onProfileClick={onProfileClick}
                  onSettingsClick={onSettingsClick}
                  onLogoutClick={onLogoutClick}
                  dashboard={false}
                />
              )}
              {isProfileDetails && (
                <div className="fixed top-0 right-0 w-full sm:w-96 h-full z-50 overflow-y-auto">
                  <ProfileDetails onclose={toggleProfileDetails} />
                </div>
              )}
            </div>

            {/* ══════════ STATS + SEARCH BAR ══════════ */}
            <div className="py-1 sm:py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

                {/* Stats */}
                <div className="flex flex-row gap-3 sm:flex-col sm:gap-0.5">
                  <p className="text-[11px] sm:text-[13px] text-black/60 font-medium">
                    Submissions:{" "}
                    <span className="font-semibold text-black/80">
                      {gradingData.filter((s) => s.submission).length} / {gradingData.length}
                    </span>
                  </p>
                  <p className="text-[11px] sm:text-[13px] text-black/60">
                    Total Marks:{" "}
                    <span className="font-semibold text-black/80">
                      {location.state.totalMarks}
                    </span>
                  </p>
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-black/10 rounded-2xl shadow-sm w-full sm:max-w-xs">
                  <BiSearch className="text-gray-400 flex-shrink-0" />
                  <input
                    className="outline-none text-[13px] w-full bg-transparent"
                    type="text"
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ══════════ TABLE ══════════ */}
            {/* Outer scroll wrapper — only horizontal scroll on mobile, full height on desktop */}
            <div className="mt-2 sm:mt-3 overflow-x-auto">
              <div className="min-w-[320px]">
                <GradeQuizAssignmentRow
                  isQuiz={false}
                  header={true}
                  bgColor={"#F9F9F9"}
                  index={"Sr."}
                  name={"Name"}
                  submission={"Submitted"}
                  marksObtained={"Marks"}
                  grade={"Grade"}
                />
                <AnimatePresence mode="wait">
                  {allAssignmentsQuery.isLoading ? (
                    <motion.div
                      key="skeleton"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ staggerChildren: 0.05 }}
                    >
                      {filteredData?.map((submission, index) => (
                        <motion.div
                          key={submission?.studentID?.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <GradeQuizAssignmentRow
                            isQuiz={false}
                            header={false}
                            index={index + 1}
                            bgColor={"#FFFFFF"}
                            grade={submission?.grade}
                            marks={submission?.marks}
                            profileLink={
                              submission.studentID.profilePic ||
                              IMAGES.Profile ||
                              "http://bit.ly/4gcOBHl"
                            }
                            setInputField={setInputField}
                            id={submission?.studentID?.id}
                            feedback={submission?.feedback}
                            name={submission?.studentID?.name}
                            marksObtained={submission?.marksObtained}
                            submission={
                              submission?.submission?.submittedAt || "Not Submitted Yet"
                            }
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ══════════ LOADER / SUBMIT ══════════ */}
            {gradeMutation.isPending && (
              <div>
                <Loader />
              </div>
            )}

            {!gradeMutation.isPending && (
              <div className="flex justify-end mt-4 border-t border-black/10">
                <div className="py-3 sm:py-4">
                  <button
                    onClick={handleGradeAssignment}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 text-sm text-white rounded-3xl bg-[#0B1053] transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-md active:translate-y-0 cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default GradingAssignments;
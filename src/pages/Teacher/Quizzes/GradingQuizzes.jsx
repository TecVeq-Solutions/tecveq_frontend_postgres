import React, { useCallback, useEffect, useState } from "react";
import IMAGES from "../../../assets/images";
import ProfileMenu from "../../../components/Student/Dashboard/ProfileMenu";
import Notifications from "../../../components/Student/Dashboard/Notifications";
import ProfileDetails from "../../../components/Teacher/ProfileDetails";
import GradeQuizAssignmentRow from "../../../components/Teacher/QuizAssignment/GradeQuizAssignmentRow";

import { toast } from "react-toastify";
import { BiSearch } from "react-icons/bi";
import { IoBookOutline } from "react-icons/io5";
import { useBlur } from "../../../context/BlurContext";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMultipleQuizesForGrading, gradeQuizes } from "../../../api/Teacher/Quiz";
import { useUser } from "../../../context/UserContext";
import Loader from "../../../utils/Loader";
import { motion, AnimatePresence } from "framer-motion";

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

const GradingQuizzes = () => {
  const [mail, setmail] = useState(false);
  const [bell, setBell] = useState(false);
  const [isProfileMenu, setIsProfileMenu] = useState(false);
  const [isProfileDetails, setIsProfileDetails] = useState(false);

  const [searchText, setSearchText] = useState("");

  const { isBlurred, toggleBlur } = useBlur();

  const [gradingData, setGradingData] = useState([]);
  const { userData } = useUser();

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
    navigate("/teacher/quizzes");
  };

  const location = useLocation();

  const handleGradeQuiz = () => {
    console.log("for submission arry is : ", gradingData);
    let objArray = [];
    let obj = {};
    gradingData.forEach((item) => {
      if (item.marks !== "" || item.grade !== "" || item.feedback !== "") {
        obj = {
          grade: item.grade,
          marks: item.marks,
          feedback: item.feedback,
          studentID: item.studentID.id
        }
        objArray.push(obj);
      }
    })
    gradeMutation.mutate(objArray);
  }

  const setInputField = useCallback((studentID, field, value) => {
    setGradingData(prev => prev.map(inp => {
      if (inp?.studentID.id == studentID) {
        return { ...inp, [field]: value }
      }
      return inp;
    }))
  }, []);

  const queryClient = useQueryClient();

  const gradeMutation = useMutation({
    mutationFn: async (data) => {
      console.log("data being sent is : ", data);
      let result = await gradeQuizes({ submissions: data }, location.state.id);
      return result;
    }, onSuccess: () => {
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
      navigate("/teacher/quizzes");
    }
  });

  const allQuizQuery = useQuery({
    queryKey: ["submissions", "quiz", location.state.id],
    queryFn: async () => {
      let result = await getMultipleQuizesForGrading(location.state.id);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (allQuizQuery.isSuccess) {
      console.log("all Query data ", allQuizQuery.data);
      let dataObjArr = allQuizQuery?.data?.submissions.map(item => {
        return {
          ...item,
          grade: item.submission?.grade || "",
          feedback: item.submission?.feedback || "",
          marks: item.submission?.marks !== null && item.submission?.marks !== undefined ? item.submission.marks : ""
        }
      })
      console.log("data after useeffect is : ", dataObjArr)
      setGradingData(dataObjArr)
    }
  }, [allQuizQuery.data, allQuizQuery.isSuccess]);

  const filteredData = gradingData?.filter((submission) =>
    submission?.studentID?.name
      ?.toLowerCase()
      .includes(searchText.toLowerCase())
  );

  return (
    <>
      <div className={`grading-root font-['DM_Sans',sans-serif] min-h-screen flex flex-1 ${isBlurred ? "blur-sm" : ""}`}>

        <div className="flex-1 min-w-0">
          <div
            className="min-h-screen bg-[linear-gradient(145deg,#ECEEF8_0%,#F2F0FA_50%,#EEF2F8_100%)] bg-[radial-gradient(ellipse_at_10%_0%,rgba(99,102,241,0.1)_0%,transparent_55%),radial-gradient(ellipse_at_90%_100%,rgba(139,92,246,0.08)_0%,transparent_55%)] px-3 xs:px-4 sm:px-6 lg:px-[clamp(24px,4vw,80px)] pt-0 ml-0 lg:ml-[320px]"
          >

            {/* ══════════════════════════════════════
                TOP BAR
            ══════════════════════════════════════ */}
            <div
              className="sticky top-0 z-[30] mb-4 sm:mb-8 px-3 xs:px-4 sm:px-6 py-2.5 xs:py-3 sm:py-5 bg-white/88 backdrop-blur-[20px] border-b border-[#6366F1]/12 shadow-[0_2px_32px_rgba(15,20,60,0.07)]"
            >
              {/* top gradient bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[2.5px] bg-[linear-gradient(90deg,#6366F1_0%,#8B5CF6_40%,#EC4899_80%,#F59E0B_100%)] z-50"
              />

              <div className="flex items-center justify-between min-h-[44px] sm:h-[68px]">

                {/* Left — icon + title + breadcrumb */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  <div
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex-shrink-0 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-[0_4px_14px_rgba(99,102,241,0.35)]"
                  >
                    <IoBookOutline className="text-white text-[15px] sm:text-[18px]" />
                  </div>

                  <div className="flex flex-col justify-center gap-0.5 min-w-0">
                    <p
                      className="text-[14px] xs:text-[16px] sm:text-[22px] font-bold text-[#0F1441] leading-tight tracking-[-0.4px] font-['Syne',sans-serif] truncate max-w-[110px] xs:max-w-[140px] sm:max-w-none"
                    >
                      Grading Quizzes
                    </p>
                    <div className="hidden sm:flex items-center gap-1">
                      <span className="text-[11px] text-[#A0A4BE] font-medium">Home</span>
                      <MdOutlineKeyboardArrowRight className="text-[#CDD0E3] text-[13px]" />
                      <span
                        className="text-[11px] text-[#7B7FA8] font-medium cursor-pointer transition-colors duration-200 hover:text-[#6366F1]"
                        onClick={onAssignmentClick}
                      >
                        Quizzes
                      </span>
                      <MdOutlineKeyboardArrowRight className="text-[#CDD0E3] text-[13px]" />
                      <span
                        className="text-[11px] font-semibold text-[#6366F1] px-2 py-0.5 rounded-full bg-gradient-to-br from-[#EEF0FF] to-[#F0EEFF] border border-[#6366F1]/20"
                      >
                        Grading
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right — notification + mail buttons */}
                <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 flex-shrink-0">
                  <button
                    onClick={togglebell}
                    className="hidden relative flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg xs:rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-px bg-gradient-to-br from-[#F5F6FF] to-[#EDEEFF] border border-[#6366F1]/15 shadow-[0_2px_8px_rgba(15,20,60,0.06)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.18)]"
                  >
                    <img src={IMAGES.Notification} alt="" className="w-[15px] h-[15px] xs:w-4 xs:h-4 sm:w-[18px] sm:h-[18px] block" />
                    <span className="absolute top-1 right-1 xs:top-1.5 xs:right-1.5 w-1.5 h-1.5 bg-[#EF4444] rounded-full border border-white" />
                  </button>

                  <button
                    onClick={toggleMail}
                    className="flex items-center justify-center w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-lg xs:rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-px bg-gradient-to-br from-[#F5F6FF] to-[#EDEEFF] border border-[#6366F1]/15 shadow-[0_2px_8px_rgba(15,20,60,0.06)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.18)]"
                  >
                    <img src={IMAGES.SMS} alt="" className="w-[15px] h-[15px] xs:w-4 xs:h-4 sm:w-[18px] sm:h-[18px] block" />
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
                <div className="fixed top-0 right-0 w-full xs:w-80 sm:w-96 h-full z-50 overflow-y-auto">
                  <ProfileDetails onclose={toggleProfileDetails} />
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════
                STATS + SEARCH BAR
            ══════════════════════════════════════ */}
            <div className="py-1.5 sm:py-4">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-3 sm:gap-0">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[11px] xs:text-[12px] sm:text-[14px] text-black/60 font-medium">
                    Total Submissions: {gradingData.filter(s => s.submission).length} / {gradingData.length}
                  </p>
                  <p className="text-[11px] xs:text-[12px] sm:text-[14px] text-black/60">
                    Total Marks: {location.state?.totalMarks}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-2.5 xs:px-3 sm:px-4 py-1.5 sm:py-2 bg-white border border-black/10 rounded-2xl sm:rounded-3xl shadow-sm w-full xs:w-auto xs:max-w-[200px] sm:max-w-xs">
                  <BiSearch className="text-gray-400 flex-shrink-0 text-[14px] sm:text-[16px]" />
                  <input
                    className="outline-none text-[12px] sm:text-[14px] w-full bg-transparent"
                    type="text"
                    placeholder="Search students..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════
                TABLE
            ══════════════════════════════════════ */}
            <div className="mt-1 sm:mt-0 overflow-x-auto overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(100vh - 260px)" }}>
              <div className="min-w-[320px]">
                <GradeQuizAssignmentRow
                  isQuiz={true}
                  header={true}
                  bgColor={"#F9F9F9"}
                  index={"Sr."}
                  name={"Name"}
                  submission={"Submission"}
                  marksObtained={"Marks"}
                  grade={"Grade"}
                />
                <AnimatePresence mode="wait">
                  {allQuizQuery.isLoading ? (
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
                    >
                      {filteredData?.map((submission, index) => (
                        <motion.div
                          key={submission?.studentID?.id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <GradeQuizAssignmentRow
                            isQuiz={true}
                            header={false}
                            index={index + 1}
                            bgColor={"#FFFFFF"}
                            grade={submission?.grade}
                            marks={submission?.marks}
                            profileLink={submission.studentID.profilePic || IMAGES.Profile}
                            setInputField={setInputField}
                            id={submission?.studentID?.id}
                            feedback={submission?.feedback}
                            name={submission?.studentID?.name}
                            marksObtained={submission?.marksObtained}
                            submission={submission?.submission?.submittedAt || "Not Submitted Yet"}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

            {/* ══════════════════════════════════════
                SUBMIT BUTTON
            ══════════════════════════════════════ */}
            {gradeMutation.isPending && (
              <div><Loader /></div>
            )}

            {!gradeMutation.isPending && (
              <div className="flex justify-end my-3 sm:my-4 border-t border-black/10">
                <div className="flex justify-end py-3 sm:py-4">
                  <p
                    onClick={handleGradeQuiz}
                    className="flex px-6 xs:px-8 py-2.5 xs:py-3 text-[12px] xs:text-sm text-white cursor-pointer rounded-3xl bg-[#6A00FF] transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 shadow-md active:translate-y-0"
                  >
                    Submit
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

export default GradingQuizzes;
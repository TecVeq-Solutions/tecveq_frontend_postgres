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
import { useUser } from "../../../context/UserContext";
import ProfileDetails from "../../../components/Teacher/ProfileDetails";

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
    // toggleBlur();
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
          studentID: item.studentID.id
        }
        objArray.push(obj);
      }
    })
    console.log("obj array to push is ", objArray);
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
    // mutationKey: ["submissions"],
    mutationFn: async (data) => {
      console.log("data being sent is : ", data);
      let result = await gradeAssignments({ submissions: data }, location.state.id);
      return result;
    }, onSuccess: () => {
      toast.dismiss();
      toast.success("Grades Added Successfully!");
      // Invalidate all relevant queries for all roles to ensure reports "progress"
      queryClient.invalidateQueries(["assignment"]);
      queryClient.invalidateQueries(["quiz"]);
      queryClient.invalidateQueries(["reports"]);
      queryClient.invalidateQueries(["report"]);
      queryClient.invalidateQueries(["studentReports"]);
      queryClient.invalidateQueries(["teacherStudets"]);
      queryClient.invalidateQueries(["submissions"]);
      queryClient.invalidateQueries(["student-assignments-quizes"]);
      navigate("/teacher/assignments");
    }
  });

  const allAssignmentsQuery = useQuery({
    queryKey: ["submissions", "assignment", location.state.id],
    queryFn: async () => {
      let result = await getMultipleAssignmentsForGrading(location.state.id);
      return result;
    },
    staleTime: 0 // always fetch fresh grades
  });


  useEffect(() => {
    if (allAssignmentsQuery.isSuccess) {
      console.log("all Query data ", allAssignmentsQuery?.data);
      let dataObjArr = allAssignmentsQuery?.data?.submissions.map(item => {
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
  }, [allAssignmentsQuery.data, allAssignmentsQuery.isSuccess]);


  const filteredData = gradingData?.filter((submission) =>
    submission?.studentID?.name
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        .grading-root { font-family: 'DM Sans', sans-serif; }
        .icon-btn-glow:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.18); }
      `}</style>

      <div className={`grading-root min-h-screen flex flex-1 ${isBlurred ? "blur-sm" : ""}`}>
        <div className="flex-1">
          <div
            className="min-h-screen"
            style={{
              background: "linear-gradient(145deg, #ECEEF8 0%, #F2F0FA 50%, #EEF2F8 100%)",
              backgroundImage:
                "radial-gradient(ellipse at 10% 0%, rgba(99,102,241,0.1) 0%, transparent 55%)," +
                "radial-gradient(ellipse at 90% 100%, rgba(139,92,246,0.08) 0%, transparent 55%)",
              paddingLeft: "clamp(12px, 4vw, 80px)",
              paddingRight: "clamp(12px, 4vw, 80px)",
              paddingTop: 0,
              marginLeft: "288px",
            }}
          >
            {/* ══════════════════════════════════════
                TOP BAR — Redesigned
            ══════════════════════════════════════ */}
            <div
              className="sticky top-0 z-40 mb-8 p-6"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(20px)",
                borderBottom: "1px solid rgba(99,102,241,0.12)",
                boxShadow: "0 2px 32px rgba(15,20,60,0.07)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-[2.5px]"
                style={{ background: "linear-gradient(90deg, #6366F1 0%, #8B5CF6 40%, #EC4899 80%, #F59E0B 100%)" }}
              />

              <div className="flex items-center justify-between" style={{ height: "68px" }}>
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                      boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
                    }}
                  >
                    <IoBookOutline className="text-white text-[18px]" />
                  </div>

                  <div className="flex flex-col justify-center gap-0.5">
                    <p
                      className="text-[22px] font-bold text-[#0F1441] leading-tight tracking-[-0.4px]"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      Grading Assignments
                    </p>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-[#A0A4BE] font-medium">Home</span>
                      <MdOutlineKeyboardArrowRight className="text-[#CDD0E3] text-[13px]" />
                      <span
                        className="text-[11px] text-[#7B7FA8] font-medium cursor-pointer transition-colors duration-200 hover:text-[#6366F1]"
                        onClick={onAssignmentClick}
                      >
                        Assignments
                      </span>
                      <MdOutlineKeyboardArrowRight className="text-[#CDD0E3] text-[13px]" />
                      <span
                        className="text-[11px] font-semibold text-[#6366F1] px-2 py-0.5 rounded-full"
                        style={{
                          background: "linear-gradient(135deg, #EEF0FF 0%, #F0EEFF 100%)",
                          border: "1px solid rgba(99,102,241,0.2)",
                        }}
                      >
                        Grading
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={togglebell}
                    className="icon-btn-glow relative flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-px"
                    style={{
                      background: "linear-gradient(135deg, #F5F6FF 0%, #EDEEFF 100%)",
                      border: "1px solid rgba(99,102,241,0.15)",
                      boxShadow: "0 2px 8px rgba(15,20,60,0.06)",
                    }}
                  >
                    <img src={IMAGES.Notification} alt="Notifications" className="w-[18px] h-[18px] block" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border border-white" />
                  </button>

                  <button
                    onClick={toggleMail}
                    className="icon-btn-glow flex items-center justify-center w-10 h-10 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-px"
                    style={{
                      background: "linear-gradient(135deg, #F5F6FF 0%, #EDEEFF 100%)",
                      border: "1px solid rgba(99,102,241,0.15)",
                      boxShadow: "0 2px 8px rgba(15,20,60,0.06)",
                    }}
                  >
                    <img src={IMAGES.SMS} alt="Messages" className="w-[18px] h-[18px] block" />
                  </button>

                  <div className="w-px h-8" style={{ background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.2), transparent)" }} />

                  <div
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-[0_4px_16px_rgba(99,102,241,0.12)]"
                    style={{
                      background: "linear-gradient(135deg, #F5F6FF 0%, #EDEEFF 100%)",
                      border: "1px solid rgba(99,102,241,0.15)",
                    }}
                    onClick={toggleProfielMenu}
                  >
                    <div className="relative">
                      <img
                        src={userData?.profilePic || IMAGES.ProfilePic}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                        style={{ border: "2px solid rgba(99,102,241,0.3)" }}
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#22C55E] rounded-full border-2 border-white" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[13px] font-semibold text-[#1E2250]">{userData.name}</span>
                      <span className="text-[10px] text-[#9CA3C0] font-medium">Teacher</span>
                    </div>
                    <img src={IMAGES.ArrowLeft} alt="" className="w-3.5 h-3.5 opacity-40" />
                  </div>
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
                <div className="fixed top-0 right-0 w-96 h-full z-50 overflow-y-auto">
                  <ProfileDetails onclose={toggleProfileDetails} />
                </div>
              )}
            </div>
            <div className="py-4">
              <div className="flex items-center justify-between">
                <p className="text-black/60 font-medium">Total Submissions: {gradingData.filter(s => s.submission).length} / {gradingData.length}</p>
                <p className="text-black/60">Total Marks: {location.state.totalMarks} </p>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-3xl">
                    <BiSearch />
                    <input
                      className="outline-none"
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)} // Update searchQuery on input change
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-0 h-[80%] overflow-auto custom-scrollbar">
              <GradeQuizAssignmentRow
                isQuiz={false}
                header={true}
                bgColor={"#F9F9F9"}
                index={"Sr. No"}
                name={"Name"}
                submission={"Submission"}
                marksObtained={"Marks Obtained"}
                grade={"Grade"}
              />
              {filteredData?.map((submission, index) => (
                <GradeQuizAssignmentRow
                  isQuiz={false}
                  header={false}
                  index={index + 1}
                  bgColor={"#FFFFFF"}
                  grade={submission?.grade}
                  marks={submission?.marks}
                  profileLink={submission.studentID.profilePic || IMAGES.Profile || "http://bit.ly/4gcOBHl"}
                  setInputField={setInputField}
                  id={submission?.studentID?.id}
                  feedback={submission?.feedback}
                  name={submission?.studentID?.name}
                  marksObtained={submission?.marksObtained}
                  submission={submission?.submission?.submittedAt || "Not Submitted Yet"}
                />
              ))}
            </div>

            {gradeMutation.isPending && <div> <Loader /> </div>}

            {!gradeMutation.isPending && <div className="flex justify-end my-4 border-t border-black">
              <div className="flex justify-end py-4">
                <p onClick={handleGradeAssignment} className="flex cursor-pointer px-8 py-3 text-sm text-white rounded-3xl bg-[#0B1053]">Submit</p>
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingAssignments;

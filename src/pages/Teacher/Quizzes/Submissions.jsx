import React, { useState } from "react";
import IMAGES from "../../../assets/images";
import ProfileMenu from "../../../components/Student/Dashboard/ProfileMenu";
import Notifications from "../../../components/Student/Dashboard/Notifications";
import ProfileDetails from "../../../components/Student/Dashboard/ProfileDetails";
import SubmissionRow from "../../../components/Teacher/QuizAssignment/SubmissionRow";

import { BiSearch } from "react-icons/bi";
import { IoBookOutline } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { getMultipleQuizesForGrading, checkQuizPlagiarism } from "../../../api/Teacher/Quiz";
import LargeLoader from "../../../utils/LargeLoader";
import { useUser } from "../../../context/UserContext";
import PlagiarismReportModal from "../../../components/Teacher/QuizAssignment/PlagiarismReportModal";
import { LuBrainCircuit } from "react-icons/lu";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Submissions = () => {
  const [mail, setmail] = useState(false);
  const [bell, setBell] = useState(false);
  const [isProfileMenu, setIsProfileMenu] = useState(false);
  const [isProfileDetails, setIsProfileDetails] = useState(false);

  const { userData } = useUser();
  const { isBlurred, toggleBlur } = useBlur();

  const [searchText, setSearchText] = useState("");
  const [isGlobalAnalyzing, setIsGlobalAnalyzing] = useState(false);
  const [globalReportData, setGlobalReportData] = useState(null);
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);

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
    // toggleBlur();
    toggleProfielMenu();
    toggleProfileDetails();
  };

  const onSettingsClick = () => { };
  const onLogoutClick = async () => {
    localStorage.clear();
    navigate("/");
    await userLogout();
  };

  const submissions = [
    {
      name: "Muhammad Haseeb",
      submissionTime: "22nd Jan, 2022 8:30PM",
      profileLink: IMAGES.Profile,
    },
    {
      name: "Muhammad Haseeb",
      submissionTime: "22nd Jan, 2022 8:30PM",
      profileLink: IMAGES.Profile,
    },
    {
      name: "Muhammad Haseeb",
      submissionTime: "22nd Jan, 2022 8:30PM",
      profileLink: IMAGES.Profile,
    },
    {
      name: "Muhammad Haseeb",
      submissionTime: "22nd Jan, 2022 8:30PM",
      profileLink: IMAGES.Profile,
    },
  ];

  const location = useLocation();
  console.log("location state is : ", location.state);
  const navigate = useNavigate();

  const onAssignmentClick = () => {
    navigate("/teacher/quizzes");
  };

  const { data, isPending, isSuccess, isError, refetch, isRefetching } = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      let result = await getMultipleQuizesForGrading(location.state.id);
      return result;
    }
  });

  console.log("all quiz submissions are : ", data);

  const handleGlobalPlagiarismCheck = async () => {
    setIsGlobalAnalyzing(true);
    try {
      const response = await checkQuizPlagiarism(location.state.id);
      if (response) {
        setGlobalReportData(response);
        setIsGlobalModalOpen(true);
      } else {
        toast.error("Failed to run global plagiarism scan.");
      }
    } catch (error) {
      console.error("Global analysis error:", error);
      // toast.error handled globally by axios interceptor
    } finally {
      setIsGlobalAnalyzing(false);
    }
  };

  const handleDownloadAll = () => {
    if (data?.submissions) {
      const filteredSubmissions = data.submissions.filter(submission =>
        (searchText === "" || submission?.studentID?.name?.toLowerCase().includes(searchText.toLowerCase())) &&
        submission?.submission?.file
      );

      filteredSubmissions.forEach((submission, index) => {
        setTimeout(() => {
          const link = document.createElement("a");
          link.href = submission.submission.file;
          link.setAttribute("download", "");
          link.setAttribute("target", "_blank");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 500);
      });
    }
  };

  return (
    isPending ? <div className="flex justify-center flex-1"> <LargeLoader />  </div> :
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
          .submissions-root { font-family: 'DM Sans', sans-serif; }
          .icon-btn-glow:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.18); }
        `}</style>

        <div className={`submissions-root min-h-screen flex flex-1 ${isBlurred ? "blur-sm" : ""}`}>
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
                        Submissions
                      </p>
                      <div className="flex items-center gap-1">
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
                          className="text-[11px] font-semibold text-[#6366F1] px-2 py-0.5 rounded-full"
                          style={{
                            background: "linear-gradient(135deg, #EEF0FF 0%, #F0EEFF 100%)",
                            border: "1px solid rgba(99,102,241,0.2)",
                          }}
                        >
                          Submissions
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
                    <div className="">
                      <p className="text-black/60">Total Submissions: {data?.submissions.filter(s => s.submission).length} / {data?.submissions.length}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-3xl">
                        <BiSearch />
                        <input
                          value={searchText}
                          onChange={(e) => setSearchText(e.target.value)}
                          className="outline-none b"
                          type="text"
                          placeholder="Search"
                        />
                      </div>
                      <p className="flex items-center justify-center px-4 py-2 text-sm text-white bg-[#6A00FF] rounded-3xl cursor-pointer" onClick={handleDownloadAll}>
                        Download All
                      </p>
                      <button
                        disabled={isGlobalAnalyzing}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-3xl transition-all ${isGlobalAnalyzing ? "bg-gray-100 text-gray-400" : "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 shadow-sm"
                          }`}
                        onClick={handleGlobalPlagiarismCheck}
                      >
                        {isGlobalAnalyzing ? (
                          <AiOutlineLoading3Quarters className="animate-spin text-purple-700" />
                        ) : (
                          <LuBrainCircuit className="text-purple-700" size={18} />
                        )}
                        {isGlobalAnalyzing ? "Scanning Class..." : "Check Global Plagiarism"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="mt-0 h-[80%] overflow-auto">

                  <SubmissionRow
                    isQuiz={true}
                    header={true}
                    name={"Name"}
                    index={"Sr. No"}
                    bgColor={"#F9F9F9"}
                    submission={"Submission"}
                  />

                  {/* {console.log(data, "quizese data")} */}


                  {isSuccess && data?.submissions?.length > 0 && data.submissions
                    .filter(submission => searchText === "" || submission?.studentID?.name?.toLowerCase().includes(searchText.toLowerCase()))
                    .map((submission, index) => (
                      <SubmissionRow
                        isQuiz={true}
                        key={submission?.studentID?.id || index}
                        header={false}
                        index={index + 1}
                        bgColor={"#FFFFFF"}
                        quizID={location.state.id}
                        studentID_val={submission?.studentID?.id}
                        name={submission?.studentID?.name}
                        submissionData={submission?.submission}
                        submission={submission?.submission?.submittedAt}
                        profileLink={submission?.studentID?.profilePic || submission?.profilePic || "http://bit.ly/4gcOBHl"}
                      />
                    ))
                  }

                  {data?.submissions?.length == 0 && <div className="text-center py-4 text-3xl font-medium">No submissions right now!</div>}

                </div>
              </div>
            </div>
          </div>
          <PlagiarismReportModal
            isOpen={isGlobalModalOpen}
            onClose={() => setIsGlobalModalOpen(false)}
            data={globalReportData}
          />
        </div>
      </>
  );
};

export default Submissions;

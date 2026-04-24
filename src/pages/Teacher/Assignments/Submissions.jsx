import React, { useState } from "react";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";
import ProfileMenu from "../../../components/Student/Dashboard/ProfileMenu";
import Notifications from "../../../components/Student/Dashboard/Notifications";
import SubmissionRow from "../../../components/Teacher/QuizAssignment/SubmissionRow";

import { BiSearch } from "react-icons/bi";
import { IoBookOutline } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../../../context/UserContext";
import { useBlur } from "../../../context/BlurContext";
import { useLocation, useNavigate } from "react-router-dom";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { getMultipleAssignmentsForGrading, checkAssignmentPlagiarism } from "../../../api/Teacher/Assignments";
import ProfileDetails from "../../../components/Teacher/ProfileDetails";
import PlagiarismReportModal from "../../../components/Teacher/QuizAssignment/PlagiarismReportModal";
import { LuBrainCircuit } from "react-icons/lu";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { HiDownload } from "react-icons/hi";

const Submissions = () => {
  const [mail, setmail] = useState(false);
  const [bell, setBell] = useState(false);
  const [isProfileMenu, setIsProfileMenu] = useState(false);
  const [isProfileDetails, setIsProfileDetails] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isGlobalAnalyzing, setIsGlobalAnalyzing] = useState(false);
  const [globalReportData, setGlobalReportData] = useState(null);
  const [isGlobalModalOpen, setIsGlobalModalOpen] = useState(false);

  const { isBlurred, toggleBlur } = useBlur();
  const { userData } = useUser();

  const toggleProfielMenu = () => { setIsProfileMenu(!isProfileMenu); setmail(false); setBell(false); };
  const toggleMail = () => { setmail(!mail); setIsProfileMenu(false); setBell(false); };
  const togglebell = () => { setBell(!bell); setmail(false); setIsProfileMenu(false); };
  const toggleProfileDetails = () => { setIsProfileDetails(!isProfileDetails); };
  const onProfileClick = () => { toggleProfielMenu(); toggleProfileDetails(); };
  const onSettingsClick = () => { };
  const onLogoutClick = async () => { localStorage.clear(); navigate("/"); await userLogout(); };

  const navigate = useNavigate();
  const onAssignmentClick = () => { navigate("/teacher/assignments"); };
  const location = useLocation();

  const { data, isPending, isSuccess, isError, refetch, isRefetching } = useQuery({
    queryKey: ["submissions"],
    queryFn: async () => {
      let result = await getMultipleAssignmentsForGrading(location.state.id);
      return result;
    }
  });

  const handleGlobalPlagiarismCheck = async () => {
    setIsGlobalAnalyzing(true);
    try {
      const response = await checkAssignmentPlagiarism(location.state.id);
      if (response) { setGlobalReportData(response); setIsGlobalModalOpen(true); }
      else { toast.error("Failed to run global plagiarism scan."); }
    } catch (error) { console.error("Global analysis error:", error); }
    finally { setIsGlobalAnalyzing(false); }
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

  const submittedCount = data?.submissions?.filter(s => s.submission)?.length || 0;
  const totalCount = data?.submissions?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((submittedCount / totalCount) * 100) : 0;

  if (isPending || isRefetching) return <div className="flex flex-1"><Loader /></div>;

  return (
    <>
      {/* ROOT */}
      <div className={`submissions-root font-['DM_Sans',sans-serif] min-h-screen flex flex-1 ${isBlurred ? "blur-sm" : ""}`}>
        <div className="flex-1 min-w-0">

          {/* ── PAGE BACKGROUND ── */}
          <div className="min-h-screen bg-[linear-gradient(145deg,#ECEEF8_0%,#F2F0FA_50%,#EEF2F8_100%)] px-3 sm:px-6 md:px-10 pt-0 ml-0 lg:ml-[320px]">

            {/* ══════════════════════════════════════
                TOP BAR
            ══════════════════════════════════════ */}
            <div className="sticky top-0 z-[30] mb-4 sm:mb-8 px-3 sm:px-4 sm:px-6 py-3 sm:py-4 bg-white/88 backdrop-blur-[20px] border-b border-[#6366F1]/12 shadow-[0_2px_32px_rgba(15,20,60,0.07)]">

              {/* Rainbow accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[linear-gradient(90deg,#6366F1_0%,#8B5CF6_40%,#EC4899_80%,#F59E0B_100%)]" />

              <div className="flex items-center justify-between min-h-[48px] sm:h-[68px] gap-2">

                {/* Left: Icon badge + Title + Breadcrumb */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                  {/* Icon Badge */}
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-[0_4px_14px_rgba(99,102,241,0.35)]">
                    <IoBookOutline className="text-white text-[14px] sm:text-[18px]" />
                  </div>

                  <div className="flex flex-col justify-center gap-0.5 min-w-0">
                    <p className="text-[15px] sm:text-[22px] font-bold text-[#0F1441] leading-tight tracking-[-0.4px] font-['Syne',sans-serif] truncate">
                      Submissions
                    </p>
                    {/* Breadcrumb — only on sm+ */}
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
                        Submissions
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Notification icons */}
                <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                  <button
                    onClick={togglebell}
                    className="relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-px bg-gradient-to-br from-[#F5F6FF] to-[#EDEEFF] border border-[#6366F1]/15 shadow-[0_2px_8px_rgba(15,20,60,0.06)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.18)]"
                  >
                    <img src={IMAGES.Notification} alt="" className="w-[15px] h-[15px] sm:w-[18px] sm:h-[18px] block" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#EF4444] rounded-full border border-white" />
                  </button>

                  <button
                    onClick={toggleMail}
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl cursor-pointer transition-all duration-200 hover:-translate-y-px bg-gradient-to-br from-[#F5F6FF] to-[#EDEEFF] border border-[#6366F1]/15 shadow-[0_2px_8px_rgba(15,20,60,0.06)] hover:shadow-[0_4px_16px_rgba(99,102,241,0.18)]"
                  >
                    <img src={IMAGES.SMS} alt="" className="w-[15px] h-[15px] sm:w-[18px] sm:h-[18px] block" />
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
                <div className="fixed top-0 right-0 w-full sm:w-80 sm:w-96 h-full z-50 overflow-y-auto">
                  <ProfileDetails onclose={toggleProfileDetails} />
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════
                STATS CARDS
            ══════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-3  gap-3 sm:gap-5 mb-4 sm:mb-7">

              {/* Card 1: Total Students */}
              <div className="rounded-2xl relative overflow-hidden transition-all duration-300 cursor-default hover:-translate-y-1 bg-[linear-gradient(135deg,#6366F1_0%,#7C3AED_100%)] shadow-[0_8px_32px_rgba(99,102,241,0.3),0_2px_8px_rgba(99,102,241,0.2)]">
                <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full opacity-20 bg-white/40" />
                <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full opacity-10 bg-white/60" />
                <div className="relative z-10 p-4 sm:p-6 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                  <div className="flex sm:flex-col items-center sm:items-start justify-between w-full sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-0 sm:justify-between sm:w-full">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                      </div>
                      <span className="text-[10px] sm:hidden sm:block font-semibold uppercase tracking-[1px] text-white/60 sm:mt-0 sm:mt-0">Total</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-start gap-1">
                    <div className="text-[26px] sm:text-[30px] font-bold text-white leading-none font-['Syne',sans-serif]">
                      {totalCount}
                    </div>
                    <div className="text-[12px] sm:text-[13px] text-white/70 font-medium sm:mt-1">Students enrolled</div>
                  </div>
                </div>
              </div>

              {/* Card 2: Submitted */}
              <div className="rounded-2xl relative overflow-hidden transition-all duration-300 cursor-default hover:-translate-y-1 bg-[linear-gradient(135deg,#059669_0%,#0D9488_100%)] shadow-[0_8px_32px_rgba(5,150,105,0.28),0_2px_8px_rgba(5,150,105,0.18)]">
                <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full opacity-20 bg-white/40" />
                <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full opacity-10 bg-white/60" />
                <div className="relative z-10 p-4 sm:p-6 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                  <div className="flex sm:flex-col items-center sm:items-start justify-between w-full sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-0 sm:justify-between sm:w-full">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-[10px] sm:hidden sm:block font-semibold uppercase tracking-[1px] text-white/60">Done</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-start gap-1 w-full">
                    <div className="text-[26px] sm:text-[36px] font-bold text-white leading-none font-['Syne',sans-serif]">
                      {submittedCount}
                    </div>
                    <div className="text-[12px] sm:text-[13px] text-white/70 font-medium sm:mt-1 sm:mb-2">{progressPercent}% completion</div>
                    <div className="h-1.5 rounded-full overflow-hidden bg-white/20 w-full sm:block hidden">
                      <div
                        className="h-full rounded-full bg-white/85 transition-[width] duration-800 ease-[cubic-bezier(0.4,0,0.2,1)]"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Pending */}
              <div className="rounded-2xl relative overflow-hidden transition-all duration-300 cursor-default hover:-translate-y-1 bg-[linear-gradient(135deg,#D97706_0%,#DC2626_100%)] shadow-[0_8px_32px_rgba(217,119,6,0.28),0_2px_8px_rgba(217,119,6,0.18)]">
                <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full opacity-20 bg-white/40" />
                <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full opacity-10 bg-white/60" />
                <div className="relative z-10 p-4 sm:p-6 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                  <div className="flex sm:flex-col items-center sm:items-start justify-between w-full sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-0 sm:justify-between sm:w-full">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                        </svg>
                      </div>
                      <span className="text-[10px] sm:hidden sm:block font-semibold uppercase tracking-[1px] text-white/60">Pending</span>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-start gap-1">
                    <div className="text-[26px] sm:text-[36px] font-bold text-white leading-none font-['Syne',sans-serif]">
                      {totalCount - submittedCount}
                    </div>
                    <div className="text-[12px] sm:text-[13px] text-white/70 font-medium sm:mt-1">Awaiting submission</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── TOOLBAR ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-[18px]">

              {/* Search Input */}
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 sm:px-4 py-[9px] w-full sm:w-auto sm:min-w-[200px] sm:min-w-[220px] transition-all duration-200 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)] border-[1.5px] border-[#6366F1]/12 shadow-[0_1px_6px_rgba(15,20,60,0.04)]">
                <BiSearch className="text-[#9CA3C0] text-[16px] flex-shrink-0" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  type="text"
                  placeholder="Search by student name…"
                  className="border-none outline-none text-[13px] sm:text-[13.5px] text-[#1E2250] bg-transparent w-full placeholder-[#B0B4CC] font-['DM_Sans',sans-serif]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 items-center">

                {/* Download All */}
                <button
                  className="flex-1 sm:flex-none flex items-center justify-center gap-[6px] px-3 sm:px-[18px] py-[9px] rounded-xl text-[12px] sm:text-[13.5px] font-semibold text-white cursor-pointer border-none transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(15,20,60,0.28)] active:translate-y-0 bg-[linear-gradient(135deg,#0F1441_0%,#1E2A7A_100%)] shadow-[0_4px_14px_rgba(15,20,60,0.2)] font-['DM_Sans',sans-serif] tracking-[0.1px] whitespace-nowrap"
                  onClick={handleDownloadAll}
                >
                  <HiDownload className="text-[15px] sm:text-[16px] flex-shrink-0" />
                  <span className="hidden sm:inline">Download All</span>
                  <span className="sm:hidden">Download</span>
                </button>

                {/* Global Plagiarism */}
                <button
                  disabled={isGlobalAnalyzing}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-[6px] px-3 sm:px-[18px] py-[9px] rounded-xl text-[12px] sm:text-[13.5px] font-semibold transition-all duration-200 font-['DM_Sans',sans-serif] tracking-[0.1px] whitespace-nowrap ${isGlobalAnalyzing
                    ? "cursor-not-allowed bg-[#F5F5F7] text-[#9CA3C0] border-[1.5px] border-[#E5E7EB]"
                    : "cursor-pointer hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(139,92,246,0.18)] text-[#6D28D9] bg-[linear-gradient(135deg,#EDE9FE_0%,#F3E8FF_100%)] border-[1.5px] border-[#8B5CF6]/25 shadow-[0_2px_12px_rgba(139,92,246,0.12)]"
                    }`}
                  onClick={handleGlobalPlagiarismCheck}
                >
                  {isGlobalAnalyzing
                    ? <AiOutlineLoading3Quarters className="animate-spin text-[14px] sm:text-[16px] flex-shrink-0" />
                    : <LuBrainCircuit className="text-[15px] sm:text-[17px] flex-shrink-0" />
                  }
                  <span className="hidden sm:inline">{isGlobalAnalyzing ? "Scanning Class…" : "Check Global Plagiarism"}</span>
                  <span className="sm:hidden">{isGlobalAnalyzing ? "Scanning…" : "Plagiarism"}</span>
                </button>
              </div>
            </div>

            {/* ── TABLE ── */}
            <div className="bg-white rounded-[18px] overflow-hidden border border-[#6366F1]/08 shadow-[0_2px_24px_rgba(15,20,60,0.05)]">

              {/* Table Header Bar */}
              <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-[#6366F1]/07 bg-[linear-gradient(135deg,#FAFAFE_0%,#F5F5FF_100%)]">
                <span className="text-[13px] sm:text-[14px] font-bold text-[#0F1441] tracking-[0.2px] font-['Syne',sans-serif]">
                  Student Submissions
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-white rounded-[20px] px-2 sm:px-2.5 py-[3px] tracking-[0.3px] bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]">
                  {data?.submissions?.filter(s =>
                    searchText === "" || s?.studentID?.name?.toLowerCase().includes(searchText.toLowerCase())
                  ).length || 0} results
                </span>
              </div>

              {/* Scrollable Rows */}
              <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-380px)] scrollbar-thin scrollbar-thumb-[#6366F1]/15 hover:scrollbar-thumb-[#6366F1]/30 scrollbar-track-transparent">

                <div className="min-w-[320px]">
                  <SubmissionRow
                    header={true}
                    name={"Name"}
                    isQuiz={false}
                    index={"#"}
                    bgColor={"#FAFAFE"}
                    submission={"Submitted"}
                    downloads={"Downloads"}
                  />

                  {isSuccess && data?.submissions?.length > 0 &&
                    data.submissions
                      .filter(s =>
                        searchText === "" || s?.studentID?.name?.toLowerCase().includes(searchText.toLowerCase())
                      )
                      .map((submission, index) => (
                        <SubmissionRow
                          isQuiz={false}
                          header={false}
                          index={index + 1}
                          bgColor={index % 2 === 0 ? "#FFFFFF" : "#FAFAFF"}
                          key={submission?.studentID?.id || index}
                          assignmentID={location.state.id}
                          studentID_val={submission?.studentID?.id}
                          name={submission?.studentID?.name}
                          submissionData={submission?.submission}
                          submission={submission?.submission?.submittedAt}
                          profileLink={submission?.studentID?.profilePic || IMAGES.ProfilePic || "http://bit.ly/4gcOBHl"}
                        />
                      ))
                  }

                  {data?.submissions?.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-[72px] px-4 sm:px-6 gap-3">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] flex items-center justify-center text-[24px] sm:text-[28px] mb-1 bg-gradient-to-br from-[#EEF0FF] to-[#F3F0FF]">
                        📭
                      </div>
                      <p className="text-[15px] sm:text-[17px] font-bold text-[#1E2250] font-['Syne',sans-serif] text-center">
                        No submissions yet
                      </p>
                      <p className="text-[12px] sm:text-[13.5px] text-[#9CA3C0] font-normal text-center">
                        Students haven't submitted their assignments yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom padding for mobile */}
            <div className="h-6 sm:h-8" />
          </div>
        </div>
      </div>

      <PlagiarismReportModal
        isOpen={isGlobalModalOpen}
        onClose={() => setIsGlobalModalOpen(false)}
        data={globalReportData}
      />
    </>
  );
};

export default Submissions;
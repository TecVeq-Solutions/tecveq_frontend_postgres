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
      {/* Minimal style block: Google Fonts + custom scrollbar */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        .submissions-root { font-family: 'DM Sans', sans-serif; }
        .table-scroll::-webkit-scrollbar { width: 5px; }
        .table-scroll::-webkit-scrollbar-track { background: transparent; }
        .table-scroll::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.15); border-radius: 99px; }
        .table-scroll::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.3); }
        .icon-btn-glow:hover { box-shadow: 0 4px 16px rgba(99,102,241,0.18); }
        .stat-card-hover:hover { transform: translateY(-4px); }
      `}</style>

      {/* ── ROOT ── */}
      <div className={`submissions-root min-h-screen flex flex-1 ${isBlurred ? "blur-sm" : ""}`}>
        <div className="flex-1">

          {/* ── PAGE BACKGROUND ── */}
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
                // marginLeft: "calc(-1 * clamp(12px, 4vw, 80px))",
                // marginRight: "calc(-1 * clamp(12px, 4vw, 80px))",
                // padding: "0 clamp(12px, 4vw, 80px)",
              }}
            >
              {/* Thin rainbow accent line at very top */}
              <div
                className="absolute top-0 left-0 right-0 h-[2.5px]"
                style={{ background: "linear-gradient(90deg, #6366F1 0%, #8B5CF6 40%, #EC4899 80%, #F59E0B 100%)" }}
              />

              <div className="flex items-center justify-between" style={{ height: "68px" }}>

                {/* ── Left: Icon badge + Title + Breadcrumb ── */}
                <div className="flex items-center gap-4">
                  {/* Icon Badge */}
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
                    {/* Breadcrumb */}
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
                        Submissions
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Right: Notification icons + User info ── */}
                <div className="flex items-center gap-3">

                  {/* Bell Button */}
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
                    {/* Badge dot */}
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full border border-white" />
                  </button>

                  {/* Mail Button */}
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

                  {/* Divider */}
                  <div className="w-px h-8" style={{ background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.2), transparent)" }} />

                  {/* User Info + Avatar */}
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
                    <img
                      src={IMAGES.ArrowLeft}
                      alt=""
                      className="w-3.5 h-3.5 opacity-40"
                    />
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

            {/* ══════════════════════════════════════
                STATS CARDS — Redesigned
            ══════════════════════════════════════ */}
            <div className="flex gap-5 mb-7 flex-wrap">

              {/* ── Card 1: Total Students ── */}
              <div
                className="stat-card-hover flex-1 rounded-2xl relative overflow-hidden transition-all duration-300 cursor-default"
                style={{
                  background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)",
                  boxShadow: "0 8px 32px rgba(99,102,241,0.3), 0 2px 8px rgba(99,102,241,0.2)",
                  minWidth: "180px",
                }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full opacity-20" style={{ background: "rgba(255,255,255,0.4)" }} />
                <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full opacity-10" style={{ background: "rgba(255,255,255,0.6)" }} />

                <div className="relative z-10 p-6">
                  {/* Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[1px] text-white/60">Total</span>
                  </div>
                  <div className="text-[30px] font-bold text-white leading-none mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {totalCount}
                  </div>
                  <div className="text-[13px] text-white/70 font-medium">Students enrolled</div>
                </div>
              </div>

              {/* ── Card 2: Submitted ── */}
              <div
                className="stat-card-hover flex-1 rounded-2xl relative overflow-hidden transition-all duration-300 cursor-default"
                style={{
                  background: "linear-gradient(135deg, #059669 0%, #0D9488 100%)",
                  boxShadow: "0 8px 32px rgba(5,150,105,0.28), 0 2px 8px rgba(5,150,105,0.18)",
                  minWidth: "180px",
                }}
              >
                <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full opacity-20" style={{ background: "rgba(255,255,255,0.4)" }} />
                <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full opacity-10" style={{ background: "rgba(255,255,255,0.6)" }} />

                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[1px] text-white/60">Done</span>
                  </div>
                  <div className="text-[40px] font-bold text-white leading-none mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {submittedCount}
                  </div>
                  <div className="text-[13px] text-white/70 font-medium mb-3">{progressPercent}% completion</div>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.2)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${progressPercent}%`,
                        background: "rgba(255,255,255,0.85)",
                        transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Card 3: Pending ── */}
              <div
                className="stat-card-hover flex-1 rounded-2xl relative overflow-hidden transition-all duration-300 cursor-default"
                style={{
                  background: "linear-gradient(135deg, #D97706 0%, #DC2626 100%)",
                  boxShadow: "0 8px 32px rgba(217,119,6,0.28), 0 2px 8px rgba(217,119,6,0.18)",
                  minWidth: "180px",
                }}
              >
                <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full opacity-20" style={{ background: "rgba(255,255,255,0.4)" }} />
                <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full opacity-10" style={{ background: "rgba(255,255,255,0.6)" }} />

                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[1px] text-white/60">Pending</span>
                  </div>
                  <div className="text-[40px] font-bold text-white leading-none mb-1" style={{ fontFamily: "'Syne', sans-serif" }}>
                    {totalCount - submittedCount}
                  </div>
                  <div className="text-[13px] text-white/70 font-medium">Awaiting submission</div>
                </div>
              </div>
            </div>

            {/* ── TOOLBAR ── */}
            <div className="flex items-center justify-between gap-3 mb-[18px] flex-wrap">

              {/* Search Input */}
              <div
                className="flex items-center gap-2 bg-white rounded-xl px-4 py-[9px] min-w-[220px] transition-all duration-200 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                style={{
                  border: "1.5px solid rgba(99,102,241,0.12)",
                  boxShadow: "0 1px 6px rgba(15,20,60,0.04)",
                }}
              >
                <BiSearch className="text-[#9CA3C0] text-[16px] flex-shrink-0" />
                <input
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  type="text"
                  placeholder="Search by student name…"
                  className="border-none outline-none text-[13.5px] text-[#1E2250] bg-transparent w-full placeholder-[#B0B4CC]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 items-center flex-wrap">

                {/* Download All */}
                <button
                  className="flex items-center gap-[7px] px-[18px] py-[9px] rounded-xl text-[13.5px] font-semibold text-white cursor-pointer border-none transition-all duration-200 hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(15,20,60,0.28)] active:translate-y-0"
                  style={{
                    background: "linear-gradient(135deg, #0F1441 0%, #1E2A7A 100%)",
                    boxShadow: "0 4px 14px rgba(15,20,60,0.2)",
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.1px",
                  }}
                  onClick={handleDownloadAll}
                >
                  <HiDownload className="text-[16px]" />
                  Download All
                </button>

                {/* Global Plagiarism */}
                <button
                  disabled={isGlobalAnalyzing}
                  className={`flex items-center gap-[7px] px-[18px] py-[9px] rounded-xl text-[13.5px] font-semibold transition-all duration-200 ${isGlobalAnalyzing
                    ? "cursor-not-allowed bg-[#F5F5F7] text-[#9CA3C0]"
                    : "cursor-pointer hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(139,92,246,0.18)] text-[#6D28D9]"
                    }`}
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: "0.1px",
                    ...(isGlobalAnalyzing
                      ? { border: "1.5px solid #E5E7EB" }
                      : {
                        background: "linear-gradient(135deg, #EDE9FE 0%, #F3E8FF 100%)",
                        border: "1.5px solid rgba(139,92,246,0.25)",
                        boxShadow: "0 2px 12px rgba(139,92,246,0.12)",
                      }
                    ),
                  }}
                  onClick={handleGlobalPlagiarismCheck}
                >
                  {isGlobalAnalyzing
                    ? <AiOutlineLoading3Quarters className="animate-spin text-[16px]" />
                    : <LuBrainCircuit className="text-[17px]" />
                  }
                  {isGlobalAnalyzing ? "Scanning Class…" : "Check Global Plagiarism"}
                </button>
              </div>
            </div>

            {/* ── TABLE ── */}
            <div
              className="bg-white rounded-[18px] overflow-hidden"
              style={{
                border: "1px solid rgba(99,102,241,0.08)",
                boxShadow: "0 2px 24px rgba(15,20,60,0.05)",
              }}
            >
              {/* Table Header Bar */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{
                  borderBottom: "1px solid rgba(99,102,241,0.07)",
                  background: "linear-gradient(135deg, #FAFAFE 0%, #F5F5FF 100%)",
                }}
              >
                <span
                  className="text-[14px] font-bold text-[#0F1441] tracking-[0.2px]"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Student Submissions
                </span>
                <span
                  className="text-[11px] font-bold text-white rounded-[20px] px-2.5 py-[3px] tracking-[0.3px]"
                  style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                >
                  {data?.submissions?.filter(s =>
                    searchText === "" || s?.studentID?.name?.toLowerCase().includes(searchText.toLowerCase())
                  ).length || 0} results
                </span>
              </div>

              {/* Scrollable Rows */}
              <div className="table-scroll overflow-y-auto" style={{ maxHeight: "calc(100vh - 380px)" }}>

                <SubmissionRow
                  header={true}
                  name={"Name"}
                  isQuiz={false}
                  index={"Sr. No"}
                  bgColor={"#FAFAFE"}
                  submission={"Submission"}
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
                  <div className="flex flex-col items-center justify-center py-[72px] px-6 gap-3">
                    <div
                      className="w-16 h-16 rounded-[18px] flex items-center justify-center text-[28px] mb-1"
                      style={{ background: "linear-gradient(135deg, #EEF0FF, #F3F0FF)" }}
                    >
                      📭
                    </div>
                    <p
                      className="text-[17px] font-bold text-[#1E2250]"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      No submissions yet
                    </p>
                    <p className="text-[13.5px] text-[#9CA3C0] font-normal">
                      Students haven't submitted their assignments yet.
                    </p>
                  </div>
                )}
              </div>
            </div>

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
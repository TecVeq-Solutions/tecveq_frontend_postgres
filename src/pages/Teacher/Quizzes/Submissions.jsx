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
        <div className="flex flex-1 bg-[#F9F9F9] font-poppins">
          <div className="flex flex-1">
            <div
              className={`w-full ${isBlurred ? "blur" : ""
                } flex-grow lg:ml-72 px-4 md:px-10 lg:px-20`}
            >
              <div className="pt-8 ">
                <div className="flex flex-row items-center justify-between flex-grow">
                  <div className="ml-11 sm:ml-0 flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-4">
                    <p className="font-semibold text-[18px] sm:text-[20px] md:text-[24px]">
                      Submissions
                    </p>
                    <div className="flex items-center gap-1 text-[10px] md:text-xs">
                      <IoBookOutline />
                      <MdOutlineKeyboardArrowRight />
                      <p className="hidden sm:block cursor-pointer" onClick={onAssignmentClick}>
                        Quizz
                      </p>
                      <MdOutlineKeyboardArrowRight className="hidden sm:block" />
                      <p className="px-2 font-medium rounded-sm bg-tea">
                        Submissions
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-2 md:gap-4">
                    <div className="p-1 bg-white rounded-sm cursor-pointer border-1 border-grey">
                      <img
                        onClick={togglebell}
                        src={IMAGES.Notification}
                        alt=""
                        className="md:w-[22px] md:h-[22px] w-[13px] h-[13px]"
                      />

                    </div>
                    <div className="p-1 bg-white rounded-sm cursor-pointer border-1 border-grey">
                      <img
                        onClick={toggleMail}
                        src={IMAGES.SMS}
                        alt=""
                        className="md:w-[22px] md:h-[22px] w-[13px] h-[13px]"
                      />
                    </div>
                    <p className="text-justify md:text-[16px] text-[12px]">
                      M. {userData.name}
                    </p>
                    <div>
                      <img
                        onClick={toggleProfielMenu}
                        src={userData.profilePic || IMAGES.ProfilePic}
                        alt=""
                        className="w-[29px] h-[30px] rounded-full cursor-pointer"
                      />
                    </div>
                    <div>
                      <img
                        onClick={toggleProfielMenu}
                        src={IMAGES.ArrowLeft}
                        alt=""
                        className="w-[22px] h-[30px] cursor-pointer"
                      />
                    </div>
                  </div>
                  {mail ? (
                    <Notifications dashboard={false} onclose={toggleMail} />
                  ) : (
                    ""
                  )}
                  {/* {isProfileDetails && <ProfileDetails onclose={toggleProfileDetails} />} */}
                  {isProfileDetails && (
                    <div className="fixed top-0 right-0 w-96 overflow-y-auto h-full z-50">
                      <ProfileDetails onclose={toggleProfileDetails} />
                    </div>
                  )}
                  {isProfileMenu ? (
                    <ProfileMenu
                      onProfileClick={onProfileClick}
                      onSettingsClick={onSettingsClick}
                      onLogoutClick={onLogoutClick}
                      dashboard={false}
                    />
                  ) : (
                    ""
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
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-3xl transition-all ${
                          isGlobalAnalyzing ? "bg-gray-100 text-gray-400" : "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 shadow-sm"
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

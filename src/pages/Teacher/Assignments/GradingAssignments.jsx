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
import { useMutation, useQuery ,useQueryClient } from "@tanstack/react-query";
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
      if (item.marks !== "" || item.grade !== "" || item.feedback !== "" || item.isPlagiarized) {
        obj = {
          grade: item.grade,
          marks: item.marks,
          feedback: item.feedback,
          isPlagiarized: item.isPlagiarized || false,
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
          isPlagiarized: item.submission?.isPlagiarized || false,
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
                  Grading Assignments
                </p>
                <div className="flex items-center gap-1 text-[10px] md:text-xs">
                  <IoBookOutline />
                  <MdOutlineKeyboardArrowRight />
                  <p className="hidden sm:block cursor-pointer" onClick={onAssignmentClick}>
                    Assignment
                  </p>
                  <MdOutlineKeyboardArrowRight className="hidden sm:block" />
                  <p className="px-2 font-medium rounded-sm bg-tea">
                    Grading Assignments
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
                  {userData.name}
                </p>
                <div>
                  <img
                    onClick={toggleProfielMenu}
                    src={userData.profilePic || IMAGES.ProfilePic}
                    alt=""
                    className="w-[29px] h-[30px] cursor-pointer"
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
              {isProfileDetails && <ProfileDetails onclose={toggleProfileDetails} />}

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
                  isPlagiarized={submission?.isPlagiarized}
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

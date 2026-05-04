import React, { useEffect } from "react";
import LargeLoader from "../../../utils/LargeLoader";
import Navbar from "../../../components/Student/Dashboard/Navbar";
import Deliverables from "../../../components/Student/Dashboard/Deliverables";
import Announcements from "../../../components/Student/Dashboard/Announcements";
import SubjectsEnrolled from "../../../components/Student/Dashboard/SubjectsEnrolled";
import ScheduledClasses from "../../../components/Student/Dashboard/SchedualedClasses";


import { useUser } from "../../../context/UserContext";
import { useStudent } from "../../../context/StudentContext";
import { studentLogin } from "../../../api/Student/StudentApis";
import { useSidebar } from "../../../context/SidebarContext"


const Dashboard = () => {

  const { setUserData, addUserToLS } = useUser();

  const { isSidebarOpen } = useSidebar(); // new

  const loginUser = async () => {
    const user = await studentLogin({ email: "tests@gmail.com", password: "password" })
    //console.log("user is : ", user);
    // setUserData(user)
  }

  useEffect(() => {
    const tcauser = localStorage.getItem("tcauser")
    // if (!tcauser) {
    //   loginUser()
    // }
  }, [])

  const { studentLogedIn, assignmentIsPending, announcementIsPending, quizIsPending, } = useStudent();

  return (
    assignmentIsPending || announcementIsPending || quizIsPending || !studentLogedIn ? <div className="flex justify-center flex-1"> <LargeLoader /> </div> :
      <>
        <div className="flex w-full min-h-screen bg-[#f9f9f9]/50 font-poppins">
          <div className="flex w-full">
            <div className={`flex flex-col flex-1 w-full lg:w-[calc(100%-20rem)] lg:max-w-[calc(100%-20rem)] px-2 sm:px-5 ml-0 lg:ml-80`}>
              <div className="flex h-16 md:px-14 lg:px-0">
                <Navbar />
              </div>
              <div
                className="  flex-col md:px-10 lg:px-0 flex xl:flex-row flex-1 gap-5 pt-4 sm:pt-8 pb-6"
              >
                <div className="flex-[3] flex w-full">
                  <SubjectsEnrolled />
                </div>
                <div className="flex-[2] flex">
                  <Deliverables />
                </div>
              </div>
              <div
                className="flex flex-col md:px-10 lg:px-0 xl:flex-row flex-1 gap-5 my-2"
              >
                <div className="hidden lg:flex flex-[3]">
                  <ScheduledClasses />
                </div>
                <div className="flex flex-[2]">
                  <Announcements />
                </div>

              </div>
            </div>
          </div>
        </div>
      </>
  );
};

export default Dashboard;

import React from "react";
import IMAGES from "../../../assets/images";
import Card from "../../../components/Student/Reports/Card";
import GradeCard from "../../../components/Student/Reports/GradeCard";
import StudentNavbar from "../../../components/Student/Dashboard/Navbar";

import { useUser } from "../../../context/UserContext";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const AssignmentReport = () => {
  const { subject, title } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { userData } = useUser();

  return (
    <div className="flex flex-1 bg-[#F9F9F9] min-h-screen font-poppins overflow-auto">
      <div className="flex flex-1">
        <div className="flex-grow w-full px-3 sm:px-6 md:px-10 lg:px-20 ml-0 lg:ml-72">
          <div className="pt-2">
            <StudentNavbar heading={title} />

            {/* Breadcrumb */}
            <div className="flex flex-row items-center mt-2">
              <div className="flex flex-wrap flex-row gap-1 text-[10px] items-center">
                <p>
                  <img
                    src={IMAGES.Book}
                    alt=""
                    className="w-[13px] h-[13px] md:w-[18px] md:h-[18px]"
                  />
                </p>
                <img
                  src={IMAGES.ChevronRight}
                  alt=""
                  className="w-[13px] h-[13px] md:w-[18px] md:h-[18px]"
                />
                <p
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/reports")}
                >
                  Reports
                </p>
                <img
                  src={IMAGES.ChevronRight}
                  alt=""
                  className="w-[13px] h-[13px] md:w-[18px] md:h-[18px]"
                />
                <p
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/reports/${subject}`)}
                  className="font-semibold"
                >
                  {subject}
                </p>
                <img
                  src={IMAGES.ChevronRight}
                  alt=""
                  className="w-[13px] h-[13px] md:w-[18px] md:h-[18px]"
                />
                <div
                  style={{ cursor: "pointer" }}
                  className="px-1 sm:px-3 bg-[#F6E8EA] flex"
                >
                  <p className="font-semibold text-center">{title}</p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col mt-6 sm:flex-row gap-4">

              {/* Left Column */}
              <div className="flex-[3] flex flex-col gap-4">

                {/* Cards Row */}
                <div className="flex flex-col xs:flex-row items-center gap-2">
                  <div className="w-full xs:w-auto flex-1">
                    <Card
                      percentage={
                        (location.state.obtainedMarks /
                          location.state.totalMarks) *
                        100
                      }
                      value={location.state.obtainedMarks}
                      data={"Marks Obtained"}
                      type={"Marks"}
                    />
                  </div>
                  <div className="w-full xs:w-auto flex-1">
                    <GradeCard
                      type={"Average Grade"}
                      grade={location?.state?.grade}
                      data={"Grade"}
                    />
                  </div>
                </div>

                {/* Total Marks */}
                <div className="flex flex-col gap-2">
                  <p className="text-[14px] sm:text-[17px]">Total Marks</p>
                  <div className="flex py-2 pl-5 border-2 border-[#D0D5DD] rounded-md text-[#101828]/50">
                    <p className="text-[13px] sm:text-[15px]">
                      {location.state.totalMarks} Marks
                    </p>
                  </div>
                </div>

                {/* Deadline */}
                <div className="flex flex-col gap-2">
                  <p className="text-[14px] sm:text-[17px]">Deadline</p>
                  <div className="flex flex-col xs:flex-row gap-2">
                    <div className="flex py-2 flex-row items-center justify-between px-5 border-2 border-[#D0D5DD] rounded-md text-[#101828]/50 flex-1">
                      <p className="text-[13px] sm:text-[15px]">
                        {new Date(location.state.deadline).toDateString()}
                      </p>
                      <img
                        src={IMAGES.Calendar}
                        alt=""
                        className="w-[20px] h-[20px]"
                      />
                    </div>
                    <div className="flex flex-row items-center justify-between py-2 px-5 border-2 flex-1 border-[#D0D5DD] rounded-md text-[#101828]/50">
                      <p className="text-[13px] sm:text-[15px]">
                        {new Date(location.state.deadline).toLocaleTimeString()}
                      </p>
                      <img
                        src={IMAGES.Clock}
                        alt=""
                        className="w-[20px] h-[20px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Submission */}
                <div className="flex flex-col gap-2">
                  <p className="text-[14px] sm:text-[17px]">Submission</p>
                  <div className="flex flex-col xs:flex-row gap-2">
                    <div className="flex py-2 flex-row items-center justify-between px-5 border-2 border-[#D0D5DD] rounded-md text-[#101828]/50 flex-1">
                      <p className="text-[13px] sm:text-[15px]">
                        {new Date(location.state.submittedAt).toDateString()}
                      </p>
                      <img
                        src={IMAGES.Calendar}
                        alt=""
                        className="w-[20px] h-[20px]"
                      />
                    </div>
                    <div className="flex flex-row items-center justify-between py-2 px-5 border-2 flex-1 border-[#D0D5DD] rounded-md text-[#101828]/50">
                      <p className="text-[13px] sm:text-[15px]">
                        {new Date(
                          location.state.submittedAt
                        ).toLocaleTimeString()}
                      </p>
                      <img
                        src={IMAGES.Clock}
                        alt=""
                        className="w-[20px] h-[20px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-[2] flex flex-col gap-4">
                <div className="hidden sm:flex justify-center">
                  <img src={IMAGES.DataReport} alt="" className="w-full max-w-[280px]" />
                </div>

                {location.state.feedback && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[14px] sm:text-[17px]">Feedback</p>
                    <div className="flex py-2 px-3 text-justify border-2 border-[#D0D5DD] rounded-md text-[#101828]/50">
                      <p className="text-[13px] sm:text-[15px]">
                        {location.state.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentReport;
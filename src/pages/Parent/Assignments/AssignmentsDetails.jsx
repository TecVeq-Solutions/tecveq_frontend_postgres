import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import IMAGES from "../../../assets/images";
import Card from "../../../components/Parent/Reports/Card";
import GradeCard from "../../../components/Parent/Reports/GradeCard";
import moment from "moment"
import ParentNavbar from "../../../components/Parent/Dashboard/Navbar";
import { FaFilePdf } from "react-icons/fa6";

const AssignmentsDetails = () => {
  const { subject, title } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
 // console.log(state, "item of data is blaw blaw blaw blaw blaw blaw blaw blaw blaw");

  let data = state;

  const date = moment(data?.assignments[0]?.dueDate).format("DD/MM/YYYY");
  const time = moment(data?.assignments[0]?.dueDate).format("h:mm A");

  const subDate = moment(data?.assignments[0]?.submissions[0]?.submittedAt).format("DD/MM/YYYY");
  const subTime = moment(data?.assignments[0]?.submissions[0]?.submittedAt).format("h:mm A");


  //console.log(date, "date is ", time, "time is");

  return (
    <div className="flex flex-1 bg-[#F9F9F9] h-screen font-poppins overflow-auto ">
      <div className="flex flex-1 ">
        {/* <div className="fixed flex">
            <Sidebar currentScreen={"reports"} />
          </div> */}
        <div className="flex-grow w-full lg:px-20 sm:px-10 px-7 lg:ml-72 ">
          <div className="pt-2 ">
            <ParentNavbar heading={title} />
            <div className="flex flex-row items-center justify-between flex-grow mt-2">
              <div className="flex flex-col justify-between gap-3 xl:flex-row md:gap-4">
                <div className="flex flex-row gap-1 text-[10px] items-center ml-14 lg:ml-0">
                  <p>
                    <img
                      src={IMAGES.Book}
                      alt=""
                      className="md:w-[18px] md:h-[18px] w-[13px] h-[13px]"
                    />
                  </p>
                  <p>
                    <img
                      src={IMAGES.ChevronRight}
                      alt=""
                      className="md:w-[18px] md:h-[18px] w-[13px] h-[13px]"
                    />
                  </p>
                  <p
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/parent/reports")}
                  >
                    Reports
                  </p>
                  <p>
                    <img
                      src={IMAGES.ChevronRight}
                      alt=""
                      className="md:w-[18px] md:h-[18px] w-[13px] h-[13px]"
                    />
                  </p>

                  <p
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/parent/quizzes`)}
                    className="font-semibold"
                  >
                    Mathematics
                  </p>

                  <p>
                    <img
                      src={IMAGES.ChevronRight}
                      alt=""
                      className="md:w-[18px] md:h-[18px] w-[13px] h-[13px]"
                    />
                  </p>
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/parent/quizzes`)}
                    className="sm:px-3 px-1 bg-[#F6E8EA] flex "
                  >
                    <p className="font-semibold text-center">{data?.assignments?.[0]?.title}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col mt-6 sm:flex-row">
              <div className="flex-[3] flex-col flex mr-5">
                <div className="flex flex-col items-center flex-1 gap-2 md:flex-row">
                  <Card
                    percentage={data?.assignments[0]?.marksObtained}
                    data={"Marks Obtained"}
                    type={"Marks"}
                  />
                  <GradeCard
                    type={"Average Grade"}
                    grade={data?.averageAssignmentMarks?.grade}
                    data={"Grade"}
                  />
                </div>
                <div className="flex flex-col gap-4 mt-7">
                  <div className="flex flex-col gap-2">
                    <p className="sm:text-[17px] text-[14px]">Total Marks</p>
                    <div className="flex py-2 pl-5 flex-grow border-2 border-[#D0D5DD] rounded-md text-[14px] text-[#101828]/50">
                      <p className="sm:text-[15px] text-[13px]">{data?.assignments[0]?.totalMarks}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="sm:text-[17px] text-[14px]">Deadline</p>
                    <div className="flex flex-row gap-2">
                      <div className="flex py-2 flex-row items-center justify-between px-5 border-2 border-[#D0D5DD] rounded-md text-[14px] text-[#101828]/50 flex-grow">
                        <p className="sm:text-[15px] text-[13px]">
                          {date}
                        </p>
                        <img
                          src={IMAGES.Calendar}
                          alt=""
                          className="md:w-[20px] md:h-[20px] w-[20px] h-[20px]"
                        />
                      </div>
                      <div className="flex flex-row items-center justify-between py-2 px-5 border-2 flex-grow border-[#D0D5DD] rounded-md text-[14px] text-[#101828]/50">
                        <p className="sm:text-[15px] text-[13px]">{time}</p>
                        <img
                          src={IMAGES.Clock}
                          alt=""
                          className="md:w-[20px] md:h-[20px] w-[20px] h-[20px]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="sm:text-[17px] text-[14px]">Submission</p>
                    <div className="flex flex-row gap-2">
                      <div className="flex py-2 flex-row items-center justify-between px-5 border-2 border-[#D0D5DD] rounded-md text-[14px] text-[#101828]/50 flex-grow">
                        <p className="sm:text-[15px] text-[13px]">
                          {subDate}
                        </p>
                        <img
                          src={IMAGES.Calendar}
                          alt=""
                          className="md:w-[20px] md:h-[20px] w-[20px] h-[20px]"
                        />
                      </div>
                      <div className="flex flex-row items-center justify-between py-2 px-5 border-2 flex-grow border-[#D0D5DD] rounded-md text-[14px] text-[#101828]/50">
                        <p className="sm:text-[15px] text-[13px]">{subTime}</p>
                        <img
                          src={IMAGES.Clock}
                          alt=""
                          className="md:w-[20px] md:h-[20px] w-[20px] h-[20px]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="sm:text-[17px] text-[14px]">
                      Assignment and Solution
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="border flex gap-3 bg-white/90 border-black border-opacity-30 p-2 rounded-xl">
                        <span>
                          <FaFilePdf className="text-red h-full w-6" />
                        </span>
                        <span>
                          <p className="text-xs">
                            {data?.assignments[0]?.files[0]?.name.slice(0, 15)}
                            <p>200kb</p>
                          </p>
                        </span>

                      </div>
                      <div className="border flex gap-3 bg-white/90 border-black border-opacity-30 p-2 rounded-xl">
                        <span>
                          <FaFilePdf className="text-red h-full w-6" />
                        </span>
                        <span>
                          <p className="text-xs">
                            {data?.assignments[0]?.files[0]?.name.slice(0, 15)}
                            <p>200kb</p>
                          </p>
                        </span>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-[2]">
                <div className="flex-col flex-1 hidden sm:flex">
                  <img src={IMAGES.DataReport} alt="" className="flex-[1]" />
                </div>
                <div className="flex flex-col gap-2 mt-3 sm:mt-0">
                  <p className="sm:text-[17px] text-[14px]">Feedback</p>
                  <div className="flex py-2 px-3 text-justify flex-grow border-2 border-[#D0D5DD] rounded-md text-[14px] text-[#101828]/50">
                    <p className="sm:text-[15px] text-[13px]">
                      {data?.assignments[0]?.submissions[0]?.feedback ? data?.assignments[0]?.submissions[0]?.feedback : "No Feedback"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssignmentsDetails

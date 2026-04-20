import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";
import Navbar from "../../../components/Admin/Navbar";
import DataRows from "../../../components/Admin/Teachers/DataRows";

import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { useAdmin } from "../../../context/AdminContext";
import { getAllTeachers } from "../../../api/Admin/AdminApi";

const Teachers = () => {
  const navigate = useNavigate();
  const { isBlurred } = useBlur();
  const { adminUsersDataPending } = useAdmin();
  const [searchText, setSearchText] = useState("");
  const [teacherData, setTeacherData] = useState([]);

  const handleFunctionClick = (thr) => {
    return () => {
      navigate(`/admin/teachers/${thr.teacher.name}`, { state: thr });
    };
  };

  const teacherQuery = useQuery({
    queryKey: ["teacherDetails"],
    queryFn: getAllTeachers,
  });
  console.log("teacher data is : ", teacherQuery?.data);

  useEffect(() => {
    if (!teacherQuery.isPending) {
      let values = Object.values(teacherQuery.data);
      console.log("teacher object values are : ", values);
      setTeacherData(values);
    }
  }, [teacherQuery.isPending]);

  return adminUsersDataPending || teacherQuery.isPending ? (
    <div className="flex flex-1">
      {" "}
      <Loader />{" "}
    </div>
  ) : (
    <>
      <div className="flex flex-1 bg-[#F9F9F9] font-poppins">
        <div className="flex flex-1 ">
          <div
            className={`sm:w-full w-screen h-[100vh] lg:px-10 sm:px-10 px-3 flex-grow lg:ml-80`}
          >
            <div className="min-h-full">
              <Navbar heading={"Teachers"} />
              <div className={`${isBlurred ? "blur" : ""}`}>
                <div className="flex flex-row-reverse my-6">
                  <div className="flex items-center gap-4">
                    {/* Main Container with Glass Effect */}
                    <div className="group flex items-center gap-3 bg-white/80 backdrop-blur-md border border-gray-100 px-5 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus-within:shadow-[0_8px_30px_rgb(59,130,246,0.1)] focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all duration-300 w-full md:w-80">

                      {/* Search Icon with Animation */}
                      <IoSearch
                        className="text-gray-400 group-focus-within:text-blue-500 group-hover:scale-110 transition-all duration-300 cursor-pointer"
                        size={20}
                      />

                      {/* Input Field */}
                      <input
                        type="text"
                        value={searchText}
                        placeholder="Search Teacher..."
                        className="bg-transparent outline-none w-full text-sm font-medium text-gray-700 placeholder:text-gray-400 placeholder:font-normal"
                        onChange={(e) => setSearchText(e.target.value)}
                      />

                      {/* Optional: Clear Button (Sirf tab dikhega jab text ho) */}
                      {searchText && (
                        <button
                          onClick={() => setSearchText("")}
                          className="text-gray-300 hover:text-red-400 transition-colors"
                        >
                          <span className="text-xs">✕</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 min-h-[400px]">
                  <DataRows
                    index={"Sr No."}
                    teacherProfile={"Image"}
                    teacherName={"Name"}
                    teacherId={"Classroom"}
                    subject={"Subject"}
                    classAvg={"Class Average"}
                    attendance={"Attandence"}
                    bgColor={"#F9F9F9"}
                    header={true}
                  />

                  {/* When search filter is not applied */}
                  {searchText == "" &&
                    teacherData &&
                    teacherData.map((thr, index) => {
                      return thr.map((item) => {
                        console.log(item, "item data is");

                        return (
                          <DataRows
                            key={JSON.stringify(item)}
                            header={false}
                            attendance={
                              item?.attendence?.classData?.length == 0
                                ? 0
                                : (item.attendence.attendnececount.presents /
                                  item.attendence.classData.length) *
                                100
                            }
                            index={index + 1}
                            bgColor={"#FFFFFF"}
                            classAvg={item?.classAvg}
                            subject={item?.subject?.name}
                            teacherProfile={
                              item?.teacher?.profilePic || IMAGES?.Profile
                            }
                            teacherName={item?.teacher?.name}
                            teacherId={item?.classroomName}
                            onClickFunction={handleFunctionClick(item)}
                          />
                        );
                      });
                    })}

                  {/* When search filter is applied */}
                  {searchText &&
                    teacherData.map((thr, index) => {
                      return thr.map((item) => {
                        if (item?.teacher?.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())) {
                          return (
                            <DataRows
                              key={JSON.stringify(item)}
                              index={index + 1}
                              teacherName={item.teacher.name}
                              teacherId={item.teacher.id.slice(0, 4)}
                              subject={item.subject.name}
                              classAvg={item.classAvg}
                              attendance={
                                item.attendence.classData.length == 0
                                  ? 0
                                  : (item.attendence.attendnececount.presents /
                                    item.attendence.classData.length) *
                                  100
                              }
                              teacherProfile={
                                item?.teacher?.profilePic || IMAGES?.Profile
                              }
                              bgColor={"#FFFFFF"}
                              header={false}
                              onClickFunction={handleFunctionClick(item)}
                            />
                          );
                        }
                      });
                    })}

                  {/* When there is not any teacher present*/}
                  {teacherData.length == 0 && (
                    <div className="text-center py-4 text-3xl font-medium">
                      No teachers to display!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Teachers;

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
      <div className="flex flex-1 bg-[#F9F9F9] font-poppins overflow-x-hidden w-full">
        <div className="flex flex-1 w-full max-w-full">
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
                <div className="mt-4 min-h-[400px] w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="w-full overflow-x-auto">
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
                    {(() => {
                      const allTeachersList = teacherData.flat();
                      const filteredTeachers = allTeachersList.filter((item) => {
                        if (!searchText) return true;
                        return item?.teacher?.name.toLowerCase().includes(searchText.toLowerCase());
                      });

                      if (filteredTeachers.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-100 mt-4">
                            <div className="text-gray-300 mb-2">
                              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <p className="text-lg font-medium text-gray-500">No teachers found matching your criteria</p>
                          </div>
                        );
                      }

                      return filteredTeachers.map((item, index) => {
                        const attendance = item?.attendence?.classData?.length === 0
                          ? 0
                          : (item.attendence.attendnececount.presents / item.attendence.classData.length) * 100;

                        return (
                          <DataRows
                            key={item.teacher.id + item.subject.id}
                            header={false}
                            index={index + 1}
                            bgColor={"#FFFFFF"}
                            attendance={attendance}
                            classAvg={item?.classAvg}
                            subject={item?.subject?.name}
                            teacherProfile={item?.teacher?.profilePic || IMAGES?.Profile}
                            teacherName={item?.teacher?.name}
                            teacherId={item?.teacher?.referenceNo || item?.teacher?.id.slice(0, 6).toUpperCase()}
                            onClickFunction={handleFunctionClick(item)}
                          />
                        );
                      });
                    })()}
                  </div>
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

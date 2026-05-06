import React, { useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import DataRows from "../../../components/Admin/StudentReports/DataRows";

import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useBlur } from "../../../context/BlurContext";
import { useAdmin } from "../../../context/AdminContext";


const StudentReports = () => {

  const navigate = useNavigate();
  const { isBlurred } = useBlur();
  const [searchText, setSearchText] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const { adminUsersDataPending, adminUsersData, allLevels } = useAdmin();

  const handleFunctionClick = (std) => {
    return () => {
      navigate(`/admin/reports/${std.name}`, { state: std });
    };
  };




  // console.log("admin studnets are : ", adminUsersData.allStudents);

  return (
    adminUsersDataPending ? <div className="flex justify-center flex-1"> <Loader /> </div> :
      <>
        <div className="flex flex-1 bg-[#F9F9F9] font-poppins min-w-0">
          <div className="flex flex-1 min-w-0">
            <div
              // h-[100vh]
              className={`w-full  lg:px-10 sm:px-10 px-3 flex-grow lg:ml-80 min-w-0`}
            >
              <div className="min-h-full flex flex-col min-w-0">
                <Navbar heading={"Student Details"} />
                <div className={`flex flex-col flex-1 min-w-0 ${isBlurred ? "blur" : ""}`}>
                  <div className="my-6 sm:my-8 w-full min-w-0">
                    <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 sm:gap-6 min-w-0">

                      {/* --- Search Input Container --- */}
                      <div className="group flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-gray-200 px-5 py-3 rounded-2xl w-full md:max-w-md shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-300">
                        <IoSearch className="text-gray-400 group-focus-within:text-blue-500 transition-colors text-xl" />
                        <input
                          type="text"
                          value={searchText}
                          placeholder="Search anything..."
                          className="bg-transparent outline-none w-full text-gray-700 placeholder:text-gray-400 font-medium"
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                      </div>

                      {/* --- Select Dropdown Container --- */}
                      <div className="relative group w-full md:w-72">
                        {/* Label - Thora ooper aur chota jo premium look deta hai */}
                        <label className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-bold uppercase tracking-wider text-blue-600 z-10 rounded-full border border-blue-100 shadow-sm">
                          Class Category
                        </label>

                        <div className="relative flex items-center shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden transition-all duration-300 group-hover:shadow-blue-100 group-hover:shadow-lg">

                          {/* Decorative Left Bar */}
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-blue-500 to-indigo-600 transition-all duration-300 group-hover:w-2" />

                          <select
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                            className="appearance-none w-full bg-white pl-6 pr-12 py-4 text-gray-700 font-semibold text-sm cursor-pointer outline-none border border-gray-100 rounded-2xl focus:border-blue-400 transition-colors"
                          >
                            <option value="" className="text-gray-400">Select Class</option>
                            {allLevels.map((item) => (
                              <option key={item.id} className="py-4" value={JSON.stringify(item)}>
                                {item.name}
                              </option>
                            ))}
                          </select>

                          {/* Elegant Animated Arrow Container */}
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                            <div className="bg-blue-50 p-2 rounded-xl group-hover:bg-blue-600 transition-colors duration-300">
                              <svg
                                className="h-4 w-4 text-blue-600 group-hover:text-white transition-transform duration-300 group-hover:rotate-180"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Glow Effect Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 min-h-[400px]">

                    <DataRows
                      header={true}
                      index={"Sr No."}
                      bgColor={"#F9F9F9"}
                      contact={"Contact"}
                      studentName={"Name"}
                      studentClass={"Class"}
                      studentRollno={"Roll No."}
                    />

                    {(() => {
                      const filteredStudents = adminUsersData.allStudents.filter((std) => {
                        const matchesSearch = std.name?.toLowerCase().includes(searchText.toLowerCase());
                        const matchesClass = !classFilter || JSON.parse(classFilter).id === std.levelID;
                        return matchesSearch && matchesClass;
                      });

                      if (filteredStudents.length === 0) {
                        return (
                          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-100 mt-4">
                            <div className="text-gray-300 mb-2">
                              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <p className="text-lg font-medium text-gray-500">No students found matching your criteria</p>
                          </div>
                        );
                      }

                      return filteredStudents.map((std, index) => (
                        <DataRows
                          key={std.id || index}
                          header={false}
                          index={index + 1}
                          bgColor={"#FFFFFF"}
                          studentName={std.name}
                          contact={std.phoneNumber}
                          studentClass={std.level?.name || allLevels.find(l => l.id === std.levelID)?.name || "N/A"}
                          studentRollno={std.rollNo || "N/A"}
                          studentProfile={std?.profilePic}
                          onClickFunction={handleFunctionClick(std)}
                        />
                      ));
                    })()}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
  );
};

export default StudentReports;

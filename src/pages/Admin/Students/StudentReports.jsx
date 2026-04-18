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
        <div className="flex flex-1 bg-[#F9F9F9] font-poppins">
          <div className="flex flex-1">
            <div
              className={`w-full min-h-full lg:px-10 sm:px-10 px-3 flex-grow lg:ml-72`}
            >
              <div className="min-h-full">
                <Navbar heading={"Student Details"} />
                <div className={`${isBlurred ? "blur" : ""}`}>
                  <div className="flex flex-row-reverse my-4 w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4 md:gap-0">
                      <div className="flex items-center gap-4 border bg-white border-[#00000020] px-4 py-2 rounded-3xl">
                        <IoSearch />
                        <input
                          type="text"
                          value={searchText}
                          placeholder="Search"
                          className="bg-transparent outline-none w-full"
                          onChange={(e) => setSearchText(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-4 border bg-white border-[#00000020] px-4 py-2 rounded-3xl">
                        <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} className="bg-transparent outline-none w-full md:w-52">
                          <option value="">Select Class</option>
                          {/* {allLevels.map((item) => {
                            return <option className="text-black" value={JSON.stringify(item)}>{item.name}</option>
                          })} */}
                          {allLevels.map((item) => {
                            return <option key={item.id} className="text-black" value={JSON.stringify(item)}>{item.name}</option>
                          })}
                        </select>
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

                    {/* When search and class filter is not applied */}
                    {searchText == "" && classFilter == "" && adminUsersData.allStudents.map((std, index) => (
                      <DataRows
                        key={index}
                        header={false}
                        index={index + 1}
                        bgColor={"#FFFFFF"}
                        studentName={std.name}
                        contact={std.phoneNumber}
                        studentClass={std.level?.name || "N/A"}
                        studentRollno={std.rollNo || "N/A"}
                        studentProfile={std?.profilePic}
                        onClickFunction={handleFunctionClick(std)}
                      />
                    ))}

                    {/* When only search filter is applied */}
                    {classFilter == "" && searchText && adminUsersData.allStudents.map((std, index) => {
                      console.log("stunet name  outoside is : ", searchText);
                      console.log(std)
                      if (std?.name.toLowerCase()?.includes(searchText.toLowerCase())) {
                        console.log("stunet name is : ", searchText);
                        return <DataRows
                          key={index}
                          header={false}
                          index={index + 1}
                          bgColor={"#FFFFFF"}
                          studentName={std.name}
                          contact={std.phoneNumber}
                          studentClass={std?.class}
                          studentRollno={std?.rollno}
                          studentProfile={std.profilePic}
                          onClickFunction={handleFunctionClick(std)}
                        />
                      }
                    })}

                    {/* When only class filter is applied */}
                    {adminUsersData.allStudents.map((std, index) => {
                      if (classFilter && (JSON.parse(classFilter).id == std.levelID)) {
                        return <DataRows
                          key={index}
                          header={false}
                          index={index + 1}
                          bgColor={"#FFFFFF"}
                          studentName={std.name}
                          studentClass={std?.class}
                          contact={std.phoneNumber}
                          studentRollno={std?.rollno}
                          studentProfile={std?.profilePic}
                          onClickFunction={handleFunctionClick(std)}
                        />
                      }
                    })}

                    {/* When there is not any student */}
                    {adminUsersData.allStudents.length == 0 && <div className="text-center py-4 text-3xl font-medium">No students to display!</div>}

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

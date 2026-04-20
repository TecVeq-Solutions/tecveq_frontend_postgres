import React, { useRef, useState } from "react";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";
import Navbar from "../../../components/Teacher/Navbar";
import useClickOutside from "../../../hooks/useClickOutlise";
import DataRows from "../../../components/Teacher/StudentReports/DataRows";

import { FiFilter } from "react-icons/fi";
import { IoClose, IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

import { useBlur } from "../../../context/BlurContext";
import { useTeacher } from "../../../context/TeacherContext";
import { getAllStudentsOfTeacher } from "../../../api/Teacher/StudentReport";
import { useUser } from "../../../context/UserContext";
import { getTeacherSubjectsOfClassroom } from "../../../api/Teacher/TeacherSubjectApi";
import { useQuery } from "@tanstack/react-query";

const FilterPopup = ({
  open,
  setopen,
  subject,
  applyFilter,
  setSubject,
  classroom,
  setClassroom,
}) => {
  const ref = useRef(null);
  useClickOutside(ref, () => setopen(false));
  const { allClassrooms, allSubjects } = useTeacher();

  const { data: teacherSubjectOfClassroom } = useQuery({
    queryKey: ["teacherSubjectsOfClassrooms", classroom?.id],
    queryFn: async () => await getTeacherSubjectsOfClassroom({ classroomIDs: [classroom.id] }),
    enabled: !!classroom?.id,
  });

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute z-20 top-44 right-0 sm:right-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="#6A00FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-800">Filter</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setopen(false); }}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <IoClose size={16} />
        </button>
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-4 px-5 py-4">

        {/* Classroom */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Classroom
          </label>
          <div className="relative">
            <select
              value={JSON.stringify(classroom)}
              onChange={(e) => setClassroom(JSON.parse(e.target.value))}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all cursor-pointer"
            >
              <option value="">Select classroom</option>
              {allClassrooms?.map((item) => (
                <option key={item.id} value={JSON.stringify(item)}>
                  {item.name}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Subject
          </label>
          <div className="relative">
            <select
              value={JSON.stringify(subject)}
              onChange={(e) => setSubject(JSON.parse(e.target.value))}
              disabled={!classroom?.id}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {!classroom?.id ? "Select a classroom first" : "Select subject"}
              </option>
              {teacherSubjectOfClassroom?.subjects?.map((item) => (
                <option key={item.id} value={JSON.stringify(item)}>
                  {item.subjectName}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
              width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {!classroom?.id && (
            <p className="text-[10px] text-gray-400 px-0.5">
              Choose a classroom to load subjects
            </p>
          )}
        </div>

        {/* Apply Button */}
        <button
          onClick={() => { applyFilter(); setopen(false); }}
          className="w-full py-2.5 rounded-xl bg-[#6A00FF] hover:bg-[#5800D6] text-white text-sm font-semibold shadow-md shadow-purple-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          Apply Filter
        </button>
      </div>
    </div>
  );
};

const StudentReports = () => {
  const navigate = useNavigate();
  const { isBlurred } = useBlur();

  const [subject, setSubject] = useState("");
  const [classroom, setClassroom] = useState("");
  const [searchText, setSearchText] = useState("");
  const [openFilterModal, setOpenFilterModal] = useState(false);

  const [filterActive, setFilterActive] = useState(false);
  const [filteredData, setFilteredData] = useState([]);

  const handleFunctionClick = (std) => {
    return () => {
      navigate(`/teacher/reports/${std.name}`, { state: std });
    };
  };

  const { data, isPending, isSuccess, isError, refetch, isRefetching } =
    useQuery({
      queryKey: ["teacherStudets"],
      queryFn: async () => {
        let result = await getAllStudentsOfTeacher();
        // console.log("result is : ", result);
        return result;
      },
    });


  const applyFilter = () => {
    if (!isPending) {

      console.log(classroom, "classroom");
      console.log(subject, "subject");
      console.log(data, "data");



      let temparr = data?.filter((item) => {
        if (
          item?.classroom?.id === classroom?.id &&
          item?.subject?.id === subject?.subjectId

        ) {
          return item;
        }
      });
      console.log(temparr, "temporary");

      setFilterActive(true);
      setFilteredData(temparr);
      console.log("filtered array is : ", temparr);
    }
  };



  return isPending || isRefetching ? (
    <div className="flex justify-start flex-1">
      {" "}
      <Loader />{" "}
    </div>
  ) : (
    <>
      <div className="flex flex-1 bg-[#F9F9F9] font-poppins min-w-0">
        <div className="flex flex-1 min-w-0">
          <div
            className={`w-full h-screen flex-grow lg:ml-72 min-w-0`}
          >
            <div className="h-screen pt-1">
              <Navbar heading={"Student Reports"} />
              <div className={`px-3 lg:px-20 sm:px-10 ${isBlurred ? "blur" : ""}`}>
                <div className="flex sm:flex-row-reverse my-4">
                  <div className="flex items-center gap-1 sm:gap-4">
                    <div className="flex items-center gap-4 border bg-white border-[#00000020] px-2 py-[8px]  sm:px-4 sm:py-3 rounded-3xl">
                      <IoSearch />
                      <input
                        type="text"
                        value={searchText}
                        placeholder="Search"
                        className="bg-transparent outline-none"
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                    </div>
                    <div
                      className="p-2 sm:p-4 text-white rounded-lg cursor-pointer bg-[#0B1053]"
                      onClick={() => {
                        setOpenFilterModal(true);
                      }}
                    >
                      <FiFilter />
                    </div>
                  </div>
                </div>
                <div className="mt-8 h-[80%] overflow-auto">
                  <div className="min-w-[700px] md:min-w-full">
                    <DataRows
                      header={true}
                      index={"Sr. No"}
                      subject={"Subject"}
                      bgColor={"#F9F9F9"}
                      studentName={"Name"}
                      studentClass={"Class"}
                      attendance={"Attendance"}
                    />

                    {!filterActive &&
                      searchText == "" &&
                      data?.map((std, index) => {
                        console.log(std, "fileter");
                        return (
                          <DataRows
                            key={std.id}
                            header={false}
                            index={index + 1}
                            bgColor={"#FFFFFF"}
                            studentName={std.name}
                            subject={std.subject.name}
                            attendance={std?.avgAttendancePer}
                            studentClass={std.classroom.name}
                            onClickFunction={handleFunctionClick(std)}
                            studentProfile={std.profilePic || IMAGES.Profile}
                          />
                        );
                      })}

                    {!filterActive &&
                      searchText &&
                      data?.map((std, index) => {
                        if (
                          std?.classroom?.name?.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) ||
                          std?.name?.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) ||
                          std?.subject?.name?.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
                        ) {
                          return (
                            <DataRows
                              key={std.id}
                              header={false}
                              index={index + 1}
                              bgColor={"#FFFFFF"}
                              studentName={std.name}
                              subject={std.subject.name}
                              attendance={std.avgAttendancePer}
                              studentClass={std.classroom.name}
                              onClickFunction={handleFunctionClick(std)}
                              studentProfile={std.profilePic || IMAGES.Profile}
                            />
                          );
                        }
                        return null;
                      })}

                    {filterActive &&
                      filteredData?.map((std, index) => (
                        <DataRows
                          key={std.id}
                          header={false}
                          index={index + 1}
                          bgColor={"#FFFFFF"}
                          studentName={std.name}
                          subject={std.subject.name}
                          attendance={std.avgAttendancePer}
                          studentClass={std.classroom.name}
                          onClickFunction={handleFunctionClick(std)}
                          studentProfile={std.profilePic || IMAGES.Profile}
                        />
                      ))}

                    {data?.length == 0 && (
                      <div className="text-center py-4 text-3xl font-medium">
                        No student reports to display!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FilterPopup
        subject={subject}
        classroom={classroom}
        open={openFilterModal}
        setSubject={setSubject}
        applyFilter={applyFilter}
        setClassroom={setClassroom}
        setopen={setOpenFilterModal}
      />
    </>
  );
};

export default StudentReports;

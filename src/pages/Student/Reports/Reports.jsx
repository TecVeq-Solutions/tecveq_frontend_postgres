import React, { useEffect } from 'react'
import Navbar from '../../../components/Student/Dashboard/Navbar'
import DataRows from '../../../components/Student/Reports/DataRows'

import { useNavigate } from 'react-router-dom'
import { useBlur } from '../../../context/BlurContext'
import { useStudent } from '../../../context/StudentContext'
import { getAllSubjects } from '../../../api/Student/Subjects'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '../../../context/UserContext'

const Reports = () => {
  const navigate = useNavigate();
  const { isBlurred } = useBlur();
  const { allSubjects, setAllSubjects } = useStudent();
  const { userData } = useUser();

  const handleFunctionClick = (report) => {
    navigate(`/reports/${report.name}`, { state: report });
  };

  const subjectQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const results = await getAllSubjects(userData.id);
      setAllSubjects(results);
      return results;
    },
    staleTime: 300000,
    enabled: allSubjects.length == 0
  });

  return (
    <div className="flex flex-1 bg-[#F4F6FB] font-poppins">
      <div className="flex flex-1">
        <div className="w-full min-h-screen px-4 sm:px-10 lg:px-20 lg:ml-72 sm:py-6">

          {/* Navbar */}
          <div className="flex items-center justify-between mb-3">
            <Navbar heading={"Reports"} />

          </div>

          <div className='mb-3'>
            {allSubjects?.subjects?.length > 0 && (
              <span className="bg-[#E8EEFF] text-[#0B1053] text-xs font-semibold px-3 py-1.5 rounded-full">
                {allSubjects.subjects.length} Subjects
              </span>
            )}
          </div>
          <div className={`${isBlurred ? "blur" : ""}`}>

            {/* Stats cards */}
            {/* Stats cards */}
            {allSubjects?.subjects?.length > 0 && (() => {
              const subjects = allSubjects.subjects;
              const avg = Math.round(subjects.reduce((s, r) => s + r.avgAttendancePer, 0) / subjects.length);
              const atRisk = subjects.filter(r => r.avgAttendancePer < 60).length;
              return (
                <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                  {[
                    { label: "Total Subjects", value: subjects.length, color: "text-[#0B1053]" },
                    { label: "Avg Attendance", value: `${avg}%`, color: avg >= 75 ? "text-green-600" : avg >= 60 ? "text-amber-600" : "text-red-600" },
                    { label: "At Risk", value: atRisk, color: atRisk > 0 ? "text-red-600" : "text-green-600" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-[#E8EAEF] p-3 sm:p-4">
                      {/* Shorter label on mobile */}
                      <p className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8B92B3] mb-1 leading-tight">
                        {label}
                      </p>
                      <p className={`text-xl sm:text-2xl font-bold ${color}`}>{value}</p>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-[#E8EAEF] overflow-hidden">
              <DataRows index={"#"} subject={"Subject"} instructor={"Instructor"} attendance={"Attendance"} header={true} />
              {allSubjects?.subjects?.length > 0 ? (
                allSubjects.subjects.map((report, index) => (
                  <DataRows
                    key={index + 1}
                    index={index + 1}
                    subject={report.name}
                    instructor={report.teacher}
                    attendance={report.avgAttendancePer}
                    header={false}
                    onClickFunction={() => handleFunctionClick(report)}
                  />
                ))
              ) : (
                <div className="flex justify-center py-16">
                  <p className="font-medium text-xl text-gray-400">No subjects to display</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
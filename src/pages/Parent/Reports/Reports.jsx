import React, { useEffect, useState } from 'react'
import Navbar from '../../../components/Parent/Dashboard/Navbar'
import DataRows from '../../../components/Parent/Reports/DataRows'

import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useBlur } from '../../../context/BlurContext'
import { useParent } from '../../../context/ParentContext'
import { getAllSubjects } from '../../../api/Parent/ParentApi'

const Reports = () => {
  const navigate = useNavigate();
  const { isBlurred } = useBlur();
  const { allSubjects, setAllSubjects, selectedChild } = useParent();
  const [enableQuery, setEnableQuery] = useState(false);

  const subjectQuery = useQuery({
    queryKey: ["subjects"], 
    queryFn: async () => {
      const results = await getAllSubjects(selectedChild.id);
      setAllSubjects(results);
      return results;
    }, 
    staleTime: 300000, 
    enabled: enableQuery
  });

  useEffect(() => {
    if (allSubjects.length == 0) {
      setEnableQuery(true);
    }
  }, []);

  const handleFunctionClick = (report) => {
    navigate(`/parent/reports/${report?.subject?.name}`, { state: report });
  };

  return (
    <div className="flex flex-1 bg-[#F4F6FB] font-poppins">
      <div className="flex flex-1">
        <div className="w-full min-h-screen px-4 sm:px-10 lg:px-20 lg:ml-72 py-6">

          {/* Navbar */}
          <div className="flex items-center justify-between mb-6">
            <Navbar heading={"Reports"} />
            {allSubjects?.subjects?.length > 0 && (
              <span className="bg-[#E8EEFF] text-[#0B1053] text-xs font-semibold px-3 py-1.5 rounded-full">
                {allSubjects.subjects.length} Subjects
              </span>
            )}
          </div>

          <div className={`${isBlurred ? "blur" : ""}`}>

            {/* Stats cards */}
            {allSubjects?.subjects?.length > 0 && (() => {
              const subjects = allSubjects.subjects;
              const avg = Math.round(subjects.reduce((s, r) => s + r.avgAttendancePer, 0) / subjects.length);
              const atRisk = subjects.filter(r => r.avgAttendancePer < 60).length;
              return (
                <div className="studntt grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: "Total Subjects", value: subjects.length, color: "text-[#0B1053]" },
                    { label: "Avg Attendance", value: `${avg}%`, color: avg >= 75 ? "text-green-600" : avg >= 60 ? "text-amber-600" : "text-red-600" },
                    { label: "At Risk", value: atRisk, color: atRisk > 0 ? "text-red-600" : "text-green-600" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-2xl border border-[#E8EAEF] p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B92B3] mb-1">{label}</p>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
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
                    subject={report?.subject?.name || "Unknown Subject"}
                    instructor={report?.teacher?.name || "Unknown Instructor"}
                    attendance={report?.avgAttendancePer}
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

import React, { useEffect, useState } from "react";
import TeacherMessageDialog from "./TeacherMessageDialog";
import { useParent } from "../../../context/ParentContext";
import { useQuery } from "@tanstack/react-query";
import { getAllSubjects } from "../../../api/Parent/ParentApi";
import Loader from "../../../utils/Loader";

const SubjectsEnrolled = ({ hideHeader }) => {
  const [popup, setPopup] = useState(false);
  const [clickedItem, setClickedItem] = useState(null);
  const [enableQuery, setEnableQuery] = useState(false);

  const { allSubjects, setAllSubjects, selectedChild } = useParent();

  const toggleClickTeacher = (item) => {
    setPopup(!popup);
    setClickedItem(item);
  };

  const handleFeedback = () => {
    toggleClickTeacher();
  };

  const subjectQuery = useQuery({
    queryKey: ["subjects", selectedChild?.id],
    queryFn: async () => {
      const results = await getAllSubjects(selectedChild?.id);
      setAllSubjects(results);
      return results;
    },
    staleTime: 300000,
    enabled: enableQuery && !!selectedChild?.id,
  });

  useEffect(() => {
    if (allSubjects.length === 0 && selectedChild?.id) {
      setEnableQuery(true);
    }
  }, [allSubjects, selectedChild]);

  /* ─── Shared empty / error / loading states ─── */
  const renderLoading = () => (
    <div className="flex justify-center items-center py-12">
      <Loader />
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center gap-2 py-12">
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
        <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <span className="text-sm text-red-500 font-medium text-center">
        Error fetching subjects. Please try again later.
      </span>
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="w-14 h-14 rounded-2xl bg-[#eef2ff] flex items-center justify-center">
        <svg className="w-7 h-7 text-[#007EEA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <p className="text-sm text-[#64748b] font-medium">No subjects found</p>
    </div>
  );

  /* ─── Mobile Card (shown on screens < sm) ─── */
  const MobileCard = ({ item, index }) => {
    const attendance = item?.avgAttendancePer || 0;
    return (
      <div className="bg-white rounded-xl p-3 flex flex-col gap-2.5"
        style={{ boxShadow: "0 2px 12px rgba(11,16,83,0.07)" }}>
        {/* Row 1: index + subject name */}
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[#eef2ff] text-[#0B1053] text-[10px] font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: `hsl(${(index * 47) % 360}, 65%, 55%)` }} />
            <span className="text-sm font-semibold text-[#1a1a2e] truncate">
              {item.subject.name}
            </span>
          </div>
        </div>

        {/* Row 2: instructor clickable */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => toggleClickTeacher(item)}
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #007EEA, #0B1053)" }}
          >
            {item.teacher.name?.charAt(0)?.toUpperCase()}
          </div>
          <span className="text-xs text-[#007EEA] font-medium hover:underline underline-offset-2">
            {item.teacher.name}
          </span>
        </div>

        {/* Row 3: attendance bar */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#64748b] font-medium">Attendance</span>
            <span className="text-[10px] font-bold text-[#0B1053]">{attendance}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#eef2ff] overflow-hidden">
            <div
              style={{
                width: `${attendance}%`,
                background: "linear-gradient(90deg, #0B1053 0%, #007EEA 100%)",
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              }}
              className="h-full rounded-full"
            />
          </div>
        </div>
      </div>
    );
  };

  const subjects = subjectQuery?.data?.subjects;

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 gap-3">

        {/* Section Header */}
        {!hideHeader && (
          <div className="flex items-center gap-3 pt-6">
            <div className="w-1 h-6 rounded-full"
              style={{ background: "linear-gradient(180deg, #007EEA, #0B1053)" }} />
            <p className="text-lg font-semibold text-[#0B1053] tracking-tight">Subjects Enrolled</p>
            {subjects?.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #007EEA, #0B1053)" }}>
                {subjects.length}
              </span>
            )}
          </div>
        )}

        {/* ── MOBILE VIEW (< sm) ── */}
        <div className="flex flex-col gap-3 sm:hidden">
          {subjectQuery.isPending ? renderLoading()
            : subjectQuery.isError ? renderError()
              : subjects?.length > 0
                ? subjects.map((item, index) => (
                  <MobileCard key={index} item={item} index={index} />
                ))
                : renderEmpty()
          }
          {popup && (
            <TeacherMessageDialog handleFeedback={handleFeedback} item={clickedItem} />
          )}
        </div>

        {/* ── DESKTOP VIEW (sm+) — original table, unchanged ── */}
        <div className="hidden sm:flex flex-1 overflow-x-auto rounded-2xl"
          style={{ boxShadow: "0 4px 24px rgba(11,16,83,0.08), 0 1px 4px rgba(0,126,234,0.06)" }}>
          <table className="flex flex-col flex-1 w-full min-w-[650px] lg:min-w-full rounded-2xl overflow-hidden bg-white">
            <thead>
              <tr className="flex w-full px-4 py-4"
                style={{ background: "linear-gradient(135deg, #0B1053 0%, #1a2580 50%, #007EEA 100%)" }}>
                <td className="flex-[1] flex justify-center items-center text-center text-xs font-semibold text-white/70 uppercase tracking-widest">#</td>
                <td className="flex-[3] flex justify-center items-center text-center text-xs font-semibold text-white uppercase tracking-widest">Subject</td>
                <td className="flex-[3] flex justify-center items-center text-center text-xs font-semibold text-white uppercase tracking-widest">Instructor</td>
                <td className="flex-[3] flex justify-center items-center text-center text-xs font-semibold text-white uppercase tracking-widest">Attendance</td>
              </tr>
            </thead>

            {subjectQuery.isPending ? (
              <tbody className="flex flex-1">
                <tr className="flex flex-1 justify-center items-center py-12">
                  <td colSpan="4"><Loader /></td>
                </tr>
              </tbody>
            ) : subjectQuery.isError ? (
              <tbody className="flex flex-1">
                <tr className="flex flex-1 justify-center items-center py-12">
                  <td colSpan="4" className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm text-red-500 font-medium">Error fetching subjects. Please try again later.</span>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody className="flex flex-col w-full divide-y divide-[#f1f4ff]">
                {subjects?.length > 0 ? (
                  subjects.map((item, index) => (
                    <tr key={index}
                      className="flex w-full items-stretch px-4 transition-all duration-200 hover:bg-[#f7f9ff] group">
                      <td className="flex-[1] py-4 flex justify-center items-center">
                        <span className="w-7 h-7 rounded-full bg-[#eef2ff] text-[#0B1053] text-xs font-bold flex items-center justify-center group-hover:bg-[#007EEA] group-hover:text-white transition-colors duration-200">
                          {index + 1}
                        </span>
                      </td>
                      <td className="flex-[3] py-4 flex justify-center items-center border-l border-[#f1f4ff] px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: `hsl(${(index * 47) % 360}, 65%, 55%)` }} />
                          <span className="text-sm font-semibold text-[#1a1a2e] text-center leading-tight">
                            {item.subject.name}
                          </span>
                        </div>
                      </td>
                      <td onClick={() => toggleClickTeacher(item)}
                        className="flex-[3] py-4 flex justify-center items-center border-l border-[#f1f4ff] px-3 cursor-pointer">
                        <div className="flex items-center gap-2 group/teacher">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 transition-transform duration-200 group-hover/teacher:scale-110"
                            style={{ background: "linear-gradient(135deg, #007EEA, #0B1053)" }}>
                            {item.teacher.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="text-sm text-[#007EEA] font-medium group-hover/teacher:underline underline-offset-2 leading-tight">
                            {item.teacher.name}
                          </span>
                        </div>
                      </td>
                      <td className="flex-[3] py-4 border-l border-[#f1f4ff] flex flex-col items-center justify-center gap-1 px-3 md:px-5">
                        <div className="flex w-full items-center justify-between mb-1">
                          <span className="text-[10px] text-[#64748b] font-medium">Progress</span>
                          <span className="text-[10px] font-bold text-[#0B1053]">
                            {item?.avgAttendancePer || 0}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[#eef2ff] overflow-hidden">
                          <div
                            style={{
                              width: `${item.avgAttendancePer || 0}%`,
                              background: "linear-gradient(90deg, #0B1053 0%, #007EEA 100%)",
                              transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                            }}
                            className="h-full rounded-full shadow-sm"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-16 flex flex-col items-center justify-center gap-3 w-full">
                      <div className="w-14 h-14 rounded-2xl bg-[#eef2ff] flex items-center justify-center">
                        <svg className="w-7 h-7 text-[#007EEA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <p className="text-sm text-[#64748b] font-medium">No subjects found</p>
                    </td>
                  </tr>
                )}
                {popup && (
                  <TeacherMessageDialog handleFeedback={handleFeedback} item={clickedItem} />
                )}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubjectsEnrolled;
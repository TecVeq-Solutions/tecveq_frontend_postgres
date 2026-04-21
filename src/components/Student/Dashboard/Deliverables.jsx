import React, { useEffect, useState } from "react";
import { useStudent } from "../../../context/StudentContext";
import { formatDate } from "../../../constants/formattedDate";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utils/Loader";
import { useUser } from "../../../context/UserContext";
import { Package } from 'lucide-react';
const getUrgencyColor = (dueDate) => {
  const diff = (new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24);
  if (diff < 2) return "bg-[#E24B4A]";
  if (diff < 5) return "bg-[#BA7517]";
  return "bg-[#1D9E75]";
};

const DeliverableItem = ({ item }) => {
  const isQuiz = item.hasOwnProperty("questions") || item.type === "quiz";
  const urgency = getUrgencyColor(item.dueDate);

  return (
    <div className="flex items-center gap-3 px-3.5 py-[11px] border-b border-black/[0.05] last:border-b-0 hover:bg-gray-50/70 transition-colors duration-150 cursor-pointer">

      {/* Type Icon */}
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isQuiz ? "bg-[#E1F5EE]" : "bg-[#EEEDFE]"
          }`}
      >
        {isQuiz ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        )}
      </div>

      {/* Urgency dot */}
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${urgency}`} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-gray-800 truncate mb-0.5">{item.title}</p>
        <p className="text-[11px] text-gray-400 flex items-center gap-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Due {formatDate(item.dueDate)}
        </p>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <span className="text-[10px] font-medium bg-[#0B1053] text-[#B5D4F4] px-2.5 py-0.5 rounded-full whitespace-nowrap">
          {item.subjectID?.name}
        </span>
        <span
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${isQuiz
            ? "bg-[#E1F5EE] text-[#085041]"
            : "bg-[#EEEDFE] text-[#3C3489]"
            }`}
        >
          {isQuiz ? "Quiz" : "Assignment"}
        </span>
      </div>
    </div>
  );
};

const Deliverables = () => {
  const navigate = useNavigate();
  const { allAssignments, allQuizes, quizIsPending, assignmentIsPending } = useStudent();
  const [allDeliverables, setAllDeliverables] = useState([]);
  const { userData } = useUser();

  const matchedAssignments = allAssignments || [];
  const matchedQuizes = allQuizes || [];

  useEffect(() => {
    if (allAssignments.length > 0 || allQuizes.length > 0) {
      const arr = [...matchedAssignments, ...matchedQuizes];
      arr.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      setAllDeliverables(arr);
    }
  }, [allAssignments, allQuizes]);

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 gap-3">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Icon yahan add kiya hai */}
            <Package className="w-5 h-5 text-gray-600" />

            <p className="text-xl font-semibold text-gray-800 tracking-tight">
              Deliverables
            </p>
          </div>

          {allDeliverables.length > 0 && (
            <span className="text-[11px] font-medium bg-[#E6F1FB] text-[#0C447C] px-3 py-1 rounded-full">
              {allDeliverables.length} pending
            </span>
          )}
        </div>

        {/* Loading */}
        {(quizIsPending || assignmentIsPending) && (
          <div className="flex flex-1 justify-center items-center">
            <Loader />
          </div>
        )}

        {/* List Card */}
        {!quizIsPending && !assignmentIsPending && (
          <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden shadow-sm">
            {/* Top accent bar */}
            <div className="h-[3px] bg-[#0B1053]" style={{ borderRadius: 0 }} />

            <div
              className="flex flex-col overflow-y-auto"
              style={{
                maxHeight: "290px",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0,0,0,0.1) transparent",
              }}
            >
              {allDeliverables.length > 0 ? (
                allDeliverables.map((item) => (
                  <DeliverableItem item={item} key={item.id} />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-12">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-gray-400 text-center">
                    No deliverables have been assigned yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deliverables;
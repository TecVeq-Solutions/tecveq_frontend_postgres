import React, { useState } from "react";
import { formatDate } from "../../../constants/formattedDate";
import moment from "moment";
import { toast } from "react-toastify";
import { checkSingleAssignmentSubmission } from "../../../api/Teacher/Assignments";
import { checkSingleQuizSubmission } from "../../../api/Teacher/Quiz";
import PlagiarismReportModal from "./PlagiarismReportModal";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { LuBrainCircuit } from "react-icons/lu";
import { HiDownload } from "react-icons/hi";

const SubmissionRow = (props) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCheckAI = async () => {
    if (!props.submissionData?.file) {
      toast.info("No file submitted to check.");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = props.isQuiz
        ? await checkSingleQuizSubmission(props.quizID, props.studentID_val)
        : await checkSingleAssignmentSubmission(props.assignmentID, props.studentID_val);

      if (response) {
        setReportData(response);
        setIsModalOpen(true);
      } else {
        toast.error("Failed to get analysis results.");
      }
    } catch (error) {
      console.error("AI Analysis error:", error);
      toast.error(error?.response?.data?.message || "Error analyzing submission with AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ─── HEADER ROW ─────────────────────────────────────── */
  if (props.header) {
    return (
      <div
        style={{ backgroundColor: props.bgColor }}
        className="w-full border-b border-[#6366F1]/07"
      >
        <div className="flex items-center px-3 sm:px-5 py-2.5 sm:py-3 gap-2">
          {/* # */}
          <div className="w-7 sm:w-10 flex-shrink-0">
            <span className="text-[11px] sm:text-[13px] font-bold text-[#0F1441]">
              {props.index}
            </span>
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0">
            <span className="text-[11px] sm:text-[13px] font-bold text-[#0F1441]">
              {props.name}
            </span>
          </div>

          {/* Submitted */}
          <div className="w-[90px] xs:w-[100px] sm:w-[120px] flex-shrink-0">
            <span className="text-[11px] sm:text-[13px] font-bold text-[#0F1441]">
              {props.submission}
            </span>
          </div>

          {/* Actions label */}
          <div className="w-[100px] xs:w-[110px] sm:w-[150px] flex-shrink-0 text-right">
            <span className="text-[11px] sm:text-[13px] font-bold text-[#0F1441]">
              Actions
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ─── DATA ROW ────────────────────────────────────────── */
  return (
    <div
      style={{ backgroundColor: props.bgColor }}
      className="w-full border-b border-[#E8EAFF]/60 last:border-b-0"
    >
      <div className="flex items-center px-3 sm:px-5 py-3 sm:py-4 gap-2">

        {/* Sr. No */}
        <div className="w-7 sm:w-10 flex-shrink-0">
          <span className="text-[11px] sm:text-[13px] text-gray-400 font-medium">
            {props.index}.
          </span>
        </div>

        {/* Avatar + Name */}
        <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
          <img
            src={props?.profileLink}
            alt=""
            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-gray-100 shadow-sm flex-shrink-0"
          />
          <span className="text-[12px] sm:text-[13.5px] font-medium text-[#1E2250] truncate leading-tight">
            {props?.name}
          </span>
        </div>

        {/* Date */}
        <div className="w-[90px] xs:w-[100px] sm:w-[120px] flex-shrink-0">
          {props?.submission ? (
            <span className="text-[10px] xs:text-[11px] sm:text-[13px] text-gray-500 whitespace-nowrap">
              {moment(props.submission).format("DD MMM, YY")}
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] xs:text-[10px] sm:text-[11px] font-medium text-amber-600 bg-amber-50 border border-amber-100 whitespace-nowrap">
              No sub.
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="w-[100px] xs:w-[110px] sm:w-[150px] flex-shrink-0 flex items-center justify-end gap-1.5 sm:gap-2">
          {props?.submissionData?.file ? (
            <>
              {/* AI Check Button */}
              <button
                onClick={handleCheckAI}
                disabled={isAnalyzing}
                title="AI Plagiarism Check"
                className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl transition-all text-[10px] sm:text-[11px] font-semibold flex-shrink-0 ${isAnalyzing
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-100 cursor-pointer"
                  }`}
              >
                {isAnalyzing ? (
                  <AiOutlineLoading3Quarters className="animate-spin text-[12px] sm:text-[14px]" />
                ) : (
                  <LuBrainCircuit className="text-[13px] sm:text-[15px]" />
                )}
                <span className="hidden sm:inline whitespace-nowrap">
                  {isAnalyzing ? "..." : "AI Check"}
                </span>
              </button>

              {/* Download Button */}
              <a
                href={props?.submissionData?.file}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-bold text-white bg-[#0B1053] hover:bg-[#1a1f6a] transition-all shadow-sm whitespace-nowrap flex-shrink-0"
              >
                <HiDownload className="text-[12px] sm:text-[14px]" />
                <span className="hidden xs:inline">PDF</span>
              </a>
            </>
          ) : (
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] xs:text-[10px] sm:text-[11px] font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-lg whitespace-nowrap">
              Pending
            </span>
          )}
        </div>
      </div>

      <PlagiarismReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        data={reportData}
      />
    </div>
  );
};

export default SubmissionRow;
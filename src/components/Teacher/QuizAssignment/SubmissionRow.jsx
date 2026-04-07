import React, { useState } from "react";
import { formatDate } from "../../../constants/formattedDate";
import moment from "moment";
import { toast } from "react-toastify";
import { checkSingleAssignmentSubmission } from "../../../api/Teacher/Assignments";
import { checkSingleQuizSubmission } from "../../../api/Teacher/Quiz";
import PlagiarismReportModal from "./PlagiarismReportModal";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { LuBrainCircuit } from "react-icons/lu";

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

  return (
    <div className="min-w-full">
      <div
        style={{ backgroundColor: props.bgColor }}
        className={`min-w-full border-b flex border-grey items-center`}
      >
        <div className="flex flex-row items-center flex-1 py-1 my-1 md:pl-3 md:pr-5 ">
          <p
            className={`w-full md:flex-[1] flex-[1] md:text-[14px] text-[11px] text-center md:text-left ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.index + (props.header ? "" : ".")}
          </p>
          <p
            className={`w-full md:flex-[3] my-1 md:my-0 items-center flex gap-4 text-center md:text-center md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {!props.header ? (
              <img src={props?.profileLink} className="sm:w-12 w-8 sm:h-12 h-8 rounded-full object-cover" alt="profile link" />
            ) : (
              <></>
            )}
            {props?.name}
          </p>
          <p
            className={`w-full md:flex-[3] my-1 md:my-0  md:text-[14px]  text-[11px] ${props.header ? "font-semibold" : ""
              }`}
          >
            {props.header ? props?.submission :
              props?.submission ? moment(props?.submission).format("Do MM YYYY hh:mm a") : "Not Submitted"
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2 ml-3 mr-2 lg:mr-5">
          {!props.header && props?.submissionData?.file && (
            <button
              onClick={handleCheckAI}
              disabled={isAnalyzing}
              className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-3xl transition-all ${
                isAnalyzing ? "bg-gray-100 text-gray-400" : "bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 shadow-sm"
              }`}
              title="AI Analysis (Plagiarism & AI Detection)"
            >
              {isAnalyzing ? (
                <AiOutlineLoading3Quarters className="animate-spin" />
              ) : (
                <LuBrainCircuit size={16} />
              )}
              {isAnalyzing ? "Analyzing..." : "Check AI"}
            </button>
          )}

          <div
            className={`my-1 md:my-0 text-center md:text-[14px] text-[14px] ${props.header ? "text-start mr-10 font-semibold" : ""
              }`}
          >
            {!props.header ?
              props?.submissionData?.file ?
                <p className="px-4 py-2 text-sm text-white bg-[#0B1053] rounded-3xl cursor-pointer hover:opacity-90 transition-all shadow-sm">
                  <a href={props?.submissionData?.file} download target="_blank" rel="noopener noreferrer"> Download</a>
                </p>
                :
                <p className="px-4 py-2 text-sm text-gray-400 bg-gray-100 border border-gray-200 rounded-3xl cursor-not-allowed">
                  Pending
                </p>
              : "Actions"}
          </div>
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


import React, { useEffect, useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import moment from "moment";
import ReviewAnswersModal from "./ReviewAnswersModal";

const GradeQuizAssignmentRow = React.memo((props) => {
  const [timePassed, setTimePassed] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [arrowActive, setArrowActive] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleChange = (field) => (event) => {
    console.log("field data is : ", field, event.target.value);
    props.setInputField(props.id, field, event.target.value);
  };

  const toggleArrowActive = () => {
    setArrowActive(!arrowActive);
  };

  const compareDateAndTime = (dateTimeString) => {
    const eventDateTime = new Date(dateTimeString);
    const currentDateTime = new Date();

    if (eventDateTime < currentDateTime) {
      setTimePassed(true);
    } else {
      setTimePassed(false);
      const difference = eventDateTime - currentDateTime;
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }
  };

  useEffect(() => {
    const formattedDateTimeString = props.submission
      .replace(/(\d+)(st|nd|rd|th)/, "$1")
      .replace(",", "")
      .replace(
        /(\d+)([ap]m)$/i,
        (match, p1, p2) => `${p1} ${p2.toUpperCase()}`
      );

    compareDateAndTime(formattedDateTimeString);

    const intervalId = setInterval(() => {
      compareDateAndTime(formattedDateTimeString);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [props.deadline]);

  /* ─── HEADER ROW ─────────────────────────────────────────── */
  if (props.header) {
    return (
      <div
        style={{ backgroundColor: props.bgColor }}
        className="w-full border-b border-grey"
      >
        <div className="flex items-center px-2 xs:px-3 sm:px-4 py-2 sm:py-3">

          {/* Sr */}
          <div className="w-5 xs:w-7 sm:w-10 flex-shrink-0">
            <span className="text-[10px] xs:text-[11px] sm:text-[13px] font-bold text-black">
              {props.index}
            </span>
          </div>

          {/* Name */}
          <div className="flex-1 min-w-0 px-1 xs:px-2">
            <span className="text-[10px] xs:text-[11px] sm:text-[13px] font-bold text-black">
              {props.name}
            </span>
          </div>

          {/* Submission — hidden on mobile, visible sm+ */}
          <div className="hidden sm:block w-[110px] md:w-[130px] flex-shrink-0 px-1">
            <span className="text-[11px] sm:text-[13px] font-bold text-black">
              {props.submission}
            </span>
          </div>

          {/* Total Marks */}
          <div className="w-[48px] xs:w-[60px] sm:w-[90px] flex-shrink-0 text-center px-0.5 xs:px-1">
            <span className="text-[9px] xs:text-[10px] sm:text-[13px] font-bold text-black leading-tight">
              {props.totalMarks}
            </span>
          </div>

          {/* Marks */}
          <div className="w-[48px] xs:w-[56px] sm:w-[80px] flex-shrink-0 text-center px-0.5 xs:px-1">
            <span className="text-[9px] xs:text-[10px] sm:text-[13px] font-bold text-black leading-tight">
              {props.marksObtained}
            </span>
          </div>

          {/* Grade */}
          <div className="w-[38px] xs:w-[46px] sm:w-[70px] flex-shrink-0 text-center px-0.5 xs:px-1">
            <span className="text-[10px] xs:text-[11px] sm:text-[13px] font-bold text-black">
              {props.grade}
            </span>
          </div>

          {/* Arrow spacer */}
          <div className="w-6 xs:w-7 sm:w-8 flex-shrink-0" />
        </div>
      </div>
    );
  }

  /* ─── DATA ROW ───────────────────────────────────────────── */
  return (
    <div
      style={{ backgroundColor: props.bgColor }}
      className="w-full border-b border-grey flex flex-col"
    >
      <div className="flex items-center px-2 xs:px-3 sm:px-4 py-2 sm:py-4">

        {/* Sr. No */}
        <div className="w-5 xs:w-7 sm:w-10 flex-shrink-0">
          <span className="text-[9px] xs:text-[11px] sm:text-[13px] text-gray-500">
            {props.index}.
          </span>
        </div>

        {/* Profile + Name */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5 xs:gap-2 px-1 xs:px-2">
          <img
            src={props?.profileLink}
            alt=""
            className="w-6 h-6 xs:w-7 xs:h-7 sm:w-9 sm:h-9 rounded-full object-cover border border-gray-100 shadow-sm flex-shrink-0"
          />
          <span className="text-[9px] xs:text-[11px] sm:text-[13px] font-medium text-gray-800 truncate leading-tight">
            {props?.name}
          </span>
        </div>

        {/* Submission Date — hidden on mobile, visible sm+ */}
        <div className="hidden sm:block w-[110px] md:w-[130px] flex-shrink-0 px-1">
          <span className="text-[11px] sm:text-[13px] text-gray-500 whitespace-nowrap">
            {props?.submission === "Not Submitted Yet" ? (
              <span className="text-gray-400 text-[10px] sm:text-[12px]">Not Submitted</span>
            ) : (
              moment(props.submission).format("DD MMM, YY")
            )}
          </span>
        </div>

        {/* Total Marks */}
        <div className="w-[48px] xs:w-[60px] sm:w-[90px] flex-shrink-0 flex justify-center px-0.5 xs:px-1">
          <span className="text-[10px] xs:text-[11px] sm:text-[13px] font-medium text-gray-800 text-center flex items-center justify-center">
            {props.totalMarks}
          </span>
        </div>

        {/* Marks input */}
        <div className="w-[48px] xs:w-[56px] sm:w-[80px] flex-shrink-0 flex justify-center px-0.5 xs:px-1">
          <input
            type="number"
            placeholder="0"
            value={props.marks}
            onChange={handleChange("marks")}
            className="w-full max-w-[40px] xs:max-w-[46px] sm:max-w-[68px] px-1 py-1 xs:py-1.5 text-[9px] xs:text-[11px] sm:text-[13px] border rounded-md xs:rounded-lg outline-none border-gray-200 focus:border-[#6366F1] transition-colors text-center"
          />
        </div>

        {/* Grade input */}
        <div className="w-[38px] xs:w-[46px] sm:w-[70px] flex-shrink-0 flex justify-center px-0.5 xs:px-1">
          <input
            type="text"
            value={props.grade}
            placeholder="A+"
            onChange={handleChange("grade")}
            className="w-full max-w-[32px] xs:max-w-[38px] sm:max-w-[58px] px-0.5 xs:px-1 py-1 xs:py-1.5 text-[9px] xs:text-[11px] sm:text-[13px] border rounded-md xs:rounded-lg outline-none border-gray-200 focus:border-[#6366F1] transition-colors uppercase text-center"
          />
        </div>

        {/* Expand arrow */}
        <div
          className="w-6 xs:w-7 sm:w-8 flex-shrink-0 flex items-center justify-center h-6 xs:h-7 sm:h-8 rounded-full hover:bg-gray-100 transition-colors cursor-pointer text-gray-400"
          onClick={toggleArrowActive}
        >
          {arrowActive ? <IoIosArrowUp size={14} /> : <IoIosArrowDown size={14} />}
        </div>
      </div>

      {/* Submission date shown when expanded on mobile */}
      {arrowActive && props?.submission !== "Not Submitted Yet" && (
        <div className="sm:hidden px-2 xs:px-3 pb-1">
          <span className="text-[9px] xs:text-[10px] text-gray-400">
            Submitted: {moment(props.submission).format("DD MMM, YYYY")}
          </span>
        </div>
      )}

      {/* Not submitted badge when expanded on mobile */}
      {arrowActive && props?.submission === "Not Submitted Yet" && (
        <div className="sm:hidden px-2 xs:px-3 pb-1">
          <span className="text-[9px] xs:text-[10px] text-gray-400">
            Not Submitted Yet
          </span>
        </div>
      )}

      {/* Feedback row */}
      {arrowActive && (
        <div className="px-2 pb-2 xs:px-3 xs:pb-3 sm:px-6 sm:pb-5">
          <div className="flex flex-col gap-1.5 xs:gap-2 p-2 xs:p-3 bg-gray-50 rounded-lg xs:rounded-xl border border-gray-100">
            <p className="text-[10px] xs:text-[11px] sm:text-[12px] font-semibold text-gray-600 whitespace-nowrap flex-shrink-0">
              Feedback:
            </p>
            <input
              type="text"
              placeholder="Write feedback for the student..."
              value={props.feedback}
              onChange={handleChange("feedback")}
              className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-[10px] xs:text-[12px] sm:text-[13px] bg-white border border-gray-200 rounded-md xs:rounded-lg outline-none focus:border-[#6366F1] transition-colors shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Review Answers Button (for MCQ) */}
      {arrowActive && props.quizType === 'mcq_objective' && props.submission !== "Not Submitted Yet" && (
        <div className="px-2 pb-2 xs:px-3 xs:pb-3 sm:px-6 sm:pb-5">
           <button
             onClick={() => setShowReviewModal(true)}
             className="px-4 py-2 text-[11px] sm:text-[13px] bg-purple-50 text-purple-700 font-semibold border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
           >
             Review Student's Answers
           </button>
        </div>
      )}

      <ReviewAnswersModal 
        open={showReviewModal}
        setOpen={setShowReviewModal}
        quizData={props.quizData}
        submissionObj={props.submissionObj}
      />
    </div>
  );
});

export default GradeQuizAssignmentRow;
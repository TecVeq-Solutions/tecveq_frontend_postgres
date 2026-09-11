import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { FiUploadCloud, FiEdit } from "react-icons/fi";
import { IoClose, IoCloseCircle } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { handleProfileImageUpdate } from "../../../utils/Admin/profileImageUtils";
import { useBlur } from "../../../context/BlurContext";
import { useTeacher } from "../../../context/TeacherContext";
import { editAssignment } from "../../../api/Teacher/Assignments";
import { editQuiz } from "../../../api/Teacher/Quiz";
import useClickOutside from "../../../hooks/useClickOutlise";
import { getTeacherSubjectsOfClassroom } from "../../../api/Teacher/TeacherSubjectApi";
import IMAGES from "../../../assets/images";
import { BookOpen, ClipboardList, ChevronDown, Check } from "lucide-react";
import QuestionBuilder from "./QuestionBuilder";

const EditQuizAssignmentModal = ({ isEditTrue, refetch, data, setIsEdit, isQuiz }) => {
  const { toggleBlur } = useBlur();
  const { allClassrooms } = useTeacher();
  const modalRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "", text: "", totalMarks: 0,
    dueDate: "", files: "", canSubmitAfterTime: false,
  });
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quizType, setQuizType] = useState("file_upload");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (quizType === 'mcq_objective') {
      const sum = questions.reduce((acc, q) => acc + (parseInt(q.marks) || 0), 0);
      setFormData((p) => ({ ...p, totalMarks: sum }));
    }
  }, [questions, quizType]);

  useEffect(() => {
    if (isEditTrue && data) {
      const { title, text, totalMarks, dueDate, files, canSubmitAfterTime, classroomID, subjectID, quizType, QuizQuestion } = data;
      let safeDateStr = "";
      let safeTimeStr = "";
      if (dueDate) {
        const formatted = new Date(dueDate);
        if (!isNaN(formatted.getTime())) {
          try {
            safeDateStr = formatted.toISOString().split("T")[0];
            safeTimeStr = formatted.toISOString().split("T")[1].slice(0, 5);
          } catch(e) {}
        }
      }
      
      setFormData({ 
        title: title || "", 
        text: text || "", 
        totalMarks: totalMarks || 0, 
        dueDate, 
        files: files?.[0] || "", 
        canSubmitAfterTime: canSubmitAfterTime || false 
      });
      setDueDate(safeDateStr);
      setDueTime(safeTimeStr);
      setSelectedClassroom(classroomID);
      setSelectedSubject(subjectID?.id || "");
      setUploadedFileUrl(files?.[0]?.url || "");
      setQuizType(quizType || "file_upload");
      setQuestions((QuizQuestion || []).map(q => ({
        ...q,
        options: q.QuizOption || q.options || []
      })));
    }
  }, [isEditTrue, data]);

  const { data: teacherSubjects, isPending: isSubjectsPending } = useQuery({
    queryKey: ["teacherSubjectsOfClassrooms", selectedClassroom?.id],
    queryFn: async () => await getTeacherSubjectsOfClassroom({ classroomIDs: [selectedClassroom.id] }),
    enabled: !!selectedClassroom?.id,
  });

  useClickOutside(modalRef, () => { setIsEdit(false); toggleBlur(); });

  const handleInputChange = (field, value) => setFormData((p) => ({ ...p, [field]: value }));

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
    await handleProfileImageUpdate(file, (url) => setUploadedFileUrl(url), setIsLoading, "auto");
  };

  const handleRemoveFile = () => { setSelectedFile(null); setPreviewUrl(null); setUploadedFileUrl(""); };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const finalDueDate = new Date(`${dueDate}T${dueTime}`).toISOString();
      if (new Date(finalDueDate) < new Date()) {
        toast.error("Due date must be in the future"); setIsLoading(false); return;
      }
      if (!selectedSubject) { toast.error("Please select a subject"); setIsLoading(false); return; }
      if (!selectedClassroom?.id) { toast.error("Please select a classroom"); setIsLoading(false); return; }

      const files = uploadedFileUrl
        ? [{ name: selectedFile?.name || data?.files?.[0]?.name || "File", url: uploadedFileUrl }]
        : [];

      const payload = { ...formData, subjectID: selectedSubject, classroomID: selectedClassroom.id, files, dueDate: finalDueDate };
      
      if (isQuiz) {
        payload.quizType = quizType;
        payload.questions = questions;
      }

      isQuiz ? await editQuiz(payload, data?.id) : await editAssignment(payload, data?.id);
      await refetch();
      toast.success(`${isQuiz ? "Quiz" : "Assignment"} updated successfully!`);
      setIsEdit(false);
      toggleBlur();
    } catch (err) {
      toast.error(err?.message || "Failed to update. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all";

  const closeModal = () => { setIsEdit(false); toggleBlur(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 pt-20">
      <div
        ref={modalRef}
        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isQuiz ? "bg-purple-50" : "bg-blue-50"}`}>
              {isQuiz
                ? <ClipboardList size={17} className="text-[#6A00FF]" />
                : <BookOpen size={17} className="text-blue-600" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {isQuiz ? "Edit Quiz" : "Edit Assignment"}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Update the details below</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col gap-5 px-3 sm:px-6 py-5 overflow-y-auto custom-scrollbar">

          {/* Classroom */}
          <Field label="Classroom">
            <div className="relative">
              <div
                onClick={() => setIsDropdownOpen((p) => !p)}
                className={`${inputCls} flex items-center justify-between cursor-pointer pr-9`}
              >
                <span className={selectedClassroom?.name ? "text-gray-800" : "text-gray-400"}>
                  {selectedClassroom?.name || "Select classroom"}
                </span>
                <ChevronDown
                  size={14}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                    {allClassrooms?.map((classroom) => {
                      const isSelected = selectedClassroom?.id === classroom.id;
                      return (
                        <div
                          key={classroom.id}
                          onClick={() => { setSelectedClassroom(classroom); setIsDropdownOpen(false); }}
                          className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors
                            ${isSelected ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                          {classroom.name}
                          {isSelected && <Check size={13} className="text-purple-600" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Field>

          {/* Subject */}
          <Field label="Subject">
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                disabled={!selectedClassroom?.id || isSubjectsPending}
                className={`${inputCls} appearance-none pr-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {!selectedClassroom?.id ? "Select a classroom first" : isSubjectsPending ? "Loading..." : "Select subject"}
                </option>
                {teacherSubjects?.subjects?.map((s) => (
                  <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </Field>

          {/* Quiz Type */}
          {isQuiz && (
            <Field label="Quiz Type">
              <div className="relative">
                <select
                  value={quizType}
                  onChange={(e) => setQuizType(e.target.value)}
                  className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                >
                  <option value="file_upload">File Upload (Manual Grade)</option>
                  <option value="mcq_objective">MCQ / Objective (Auto Grade)</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>
          )}

          {/* Title */}
          <Field label="Title">
            <input
              type="text"
              placeholder="Enter title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={inputCls}
            />
          </Field>

          {/* Description */}
          <Field label={isQuiz ? "Quiz Description" : "Assignment Description"}>
            <textarea
              rows={3}
              placeholder="Write instructions or description..."
              value={formData.text}
              onChange={(e) => handleInputChange("text", e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Total Marks */}
          <Field label="Total Marks">
            <input
              type="number"
              placeholder="e.g. 100"
              value={formData.totalMarks}
              disabled={isQuiz && quizType === 'mcq_objective'}
              onChange={(e) => handleInputChange("totalMarks", e.target.value)}
              className={`${inputCls} ${isQuiz && quizType === 'mcq_objective' ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
            />
            {isQuiz && quizType === 'mcq_objective' && (
              <p className="text-[10px] text-gray-400 px-0.5 mt-1">Total marks are auto-calculated from questions.</p>
            )}
          </Field>

          {/* Deadline */}
          <Field label="Deadline">
            <div className="grid grid-cols-2 gap-3">
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
              <input type="time" value={dueTime} onChange={(e) => setDueTime(e.target.value)} className={inputCls} />
            </div>
          </Field>

          {/* Late Submit (quiz only) */}
          {isQuiz && (
            <Field label="Allow submission after deadline">
              <div className="relative">
                <select
                  value={formData.canSubmitAfterTime}
                  onChange={(e) => handleInputChange("canSubmitAfterTime", e.target.value === "true")}
                  className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                >
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>
          )}

          {(!isQuiz || quizType === 'file_upload') ? (
            <Field label="Attachment">
              {!uploadedFileUrl && !selectedFile ? (
                <label
                  htmlFor="assignmentFile"
                  className="flex flex-col items-center justify-center gap-3 px-6 py-7 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 group-hover:border-purple-200 flex items-center justify-center shadow-sm transition-colors">
                    <FiUploadCloud size={18} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      <span className="text-purple-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, Word or PDF</p>
                  </div>
                </label>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    {previewUrl || (uploadedFileUrl && /\.(jpeg|jpg|gif|png|webp|avif|svg)(?:\?.*)?$/i.test(uploadedFileUrl)) ? (
                      <img src={previewUrl || uploadedFileUrl} alt="preview" className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      <div className="w-10 h-10 bg-white rounded-lg border border-purple-100 flex items-center justify-center">
                        <img src={IMAGES.pdf} alt="file" className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-gray-700 truncate max-w-[200px]">
                        {selectedFile?.name || data?.files?.[0]?.name || "Uploaded file"}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {selectedFile ? "Ready to save" : "Existing file"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <label htmlFor="assignmentFile" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white cursor-pointer transition-colors">
                      <FiEdit size={13} className="text-purple-500" />
                    </label>
                    <button onClick={handleRemoveFile} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white transition-colors">
                      <IoCloseCircle size={15} className="text-red-400" />
                    </button>
                  </div>
                </div>
              )}
              <input id="assignmentFile" type="file" className="hidden" onChange={handleFileChange} />
            </Field>
          ) : (
            <QuestionBuilder questions={questions} setQuestions={setQuestions} />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-3 sm:px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2.5 py-2.5">
              <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-500 font-medium">Saving changes...</span>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-[#6A00FF] hover:bg-[#5800D6] text-white text-sm font-semibold shadow-md shadow-purple-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-0.5">
      {label}
    </label>
    {children}
  </div>
);

export default EditQuizAssignmentModal;
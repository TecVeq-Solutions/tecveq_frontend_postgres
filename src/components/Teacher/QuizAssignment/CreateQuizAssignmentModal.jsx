import React, { useEffect, useRef, useState } from "react";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";

import { toast } from "react-toastify";
import { FiUploadCloud, FiEdit } from "react-icons/fi";
import { IoClose, IoCloseCircle } from "react-icons/io5";
import { useMutation, useQuery } from "@tanstack/react-query";
import { handleProfileImageUpdate } from "../../../utils/Admin/profileImageUtils";
import { useBlur } from "../../../context/BlurContext";
import { useUser } from "../../../context/UserContext";
import { useTeacher } from "../../../context/TeacherContext";
import { createQuiz, editQuiz } from "../../../api/Teacher/Quiz";
import { createAssignment, editAssignment } from "../../../api/Teacher/Assignments";
import useClickOutside from "../../../hooks/useClickOutlise";
import { getTeacherSubjectsOfClassroom } from "../../../api/Teacher/TeacherSubjectApi";
import { BookOpen, ClipboardList, ChevronDown, X } from "lucide-react";

const CreateQuizAssignmentModal = ({ open, setopen, isQuiz, isEditTrue, refetch, data }) => {

  const { userData } = useUser();
  const { allClassrooms } = useTeacher();
  const ref = useRef(null);
  const { toggleBlur } = useBlur();

  useClickOutside(ref, () => { setopen(false); if (open) toggleBlur(); });

  const [QADate, setQADate] = useState(isEditTrue && data?.dueDate ? data.dueDate.split("T")[0] : "");
  const [QATime, setQATime] = useState(isEditTrue && data?.dueDate ? data.dueDate.split("T")[1]?.slice(0, 5) : "");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(isEditTrue && data?.files?.[0]?.url ? data.files[0].url : "");
  const [selectedClassroom, setSelectedClassroom] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [quizAssignmentDataObj, setQuizAssignmentDataObj] = useState({
    canSubmitAfterTime: false,
    title: isEditTrue ? data?.title : "",
    text: isEditTrue ? data?.text : "",
    dueDate: isEditTrue ? data?.dueDate : "",
    subjectID: isEditTrue ? data?.subjectID : "",
    totalMarks: isEditTrue ? data?.totalMarks : 0,
    classroomID: isEditTrue ? data?.classroomID : "",
    files: "",
  });

  const updateObj = (key, value) => setQuizAssignmentDataObj((p) => ({ ...p, [key]: value }));

  useEffect(() => {
    if (open) {
      if (isEditTrue && data) {
        setQADate(data?.dueDate ? data.dueDate.split("T")[0] : "");
        setQATime(data?.dueDate ? data.dueDate.split("T")[1]?.slice(0, 5) : "");
        setUploadedFileUrl(data?.files?.[0]?.url ? data.files[0].url : "");
        setQuizAssignmentDataObj({
          canSubmitAfterTime: data?.canSubmitAfterTime || false,
          title: data?.title || "",
          text: data?.text || "",
          dueDate: data?.dueDate || "",
          subjectID: data?.subjectID || "",
          totalMarks: data?.totalMarks || 0,
          classroomID: data?.classroomID || "",
          files: "",
        });
        setSelectedClassroom([]);
        setSelectedSubject("");
      } else {
        setQADate("");
        setQATime("");
        setUploadedFileUrl("");
        setQuizAssignmentDataObj({
          canSubmitAfterTime: false,
          title: "",
          text: "",
          dueDate: "",
          subjectID: "",
          totalMarks: 0,
          classroomID: "",
          files: "",
        });
        setSelectedClassroom([]);
        setSelectedSubject("");
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setLoading(false);
      setDropdownOpen(false);
    }
  }, [open, isEditTrue, data]);



  /* ── Queries & Mutations (unchanged logic) ── */
  const { data: teacherSubjectOfClassroom } = useQuery({
    queryKey: ["teacherSubjectsOfClassrooms", selectedClassroom.map((c) => c.id)],
    queryFn: async () => await getTeacherSubjectsOfClassroom({ classroomIDs: selectedClassroom.map((c) => c.id) }),
    enabled: selectedClassroom.length > 0,
  });

  const assignmentUpdateMutate = useMutation({
    mutationFn: async (dataobj) => {
      const id = dataobj?.id || data?.id;
      if (!id) throw new Error("Assignment ID is missing");
      const { id: _, ...payload } = dataobj;
      return await editAssignment(payload, id);
    },
    onSuccess: async () => { await refetch(); toast.success("Assignment updated"); toggleBlur(); setopen(false); },
    onError: (e) => toast.error(e?.message || "Failed to update assignment"),
  });

  const assignmentCreateMutate = useMutation({
    mutationFn: async (d) => await createAssignment(d),
    onSuccess: async () => { await refetch(); toast.success("Assignment created"); toggleBlur(); setopen(false); },
    onError: (e) => toast.error(e?.message || "Failed to create assignment"),
  });

  const quizEditMutate = useMutation({
    mutationFn: async (dataobj) => {
      const id = dataobj?.id || data?.id;
      if (!id) throw new Error("Quiz ID is missing");
      const { id: _, ...payload } = dataobj;
      return await editQuiz(payload, id);
    },
    onSuccess: async () => { await refetch(); toast.success("Quiz updated"); toggleBlur(); setopen(false); },
    onError: (e) => toast.error(e?.message || "Failed to update quiz"),
  });

  const quizCreateMutate = useMutation({
    mutationFn: async (d) => await createQuiz(d),
    onSuccess: async () => { await refetch(); toast.success("Quiz created"); toggleBlur(); setopen(false); },
    onError: (e) => toast.error(e?.message || "Failed to create quiz"),
  });

  const isSubmitting =
    loading ||
    quizCreateMutate?.isPending ||
    quizEditMutate?.isPending ||
    assignmentCreateMutate?.isPending ||
    assignmentUpdateMutate?.isPending;

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
    await handleProfileImageUpdate(file, (url) => setUploadedFileUrl(url), setLoading);
  };

  const handleRemoveFile = () => { setSelectedFile(null); setPreviewUrl(null); setUploadedFileUrl(""); };

  const handleSubmit = () => {
    if (isSubmitting) return;
    isQuiz ? handleCreateQuiz() : handleCreateAssignment();
  };

  const handleCreateAssignment = async () => {
    setLoading(true);
    if (!quizAssignmentDataObj?.text?.trim() && !selectedFile?.name && !uploadedFileUrl) {
      toast.error("Please provide text or a file."); setLoading(false); return;
    }
    try {
      const filesArr = uploadedFileUrl ? [{ name: selectedFile?.name || data?.files?.[0]?.name || "File", url: uploadedFileUrl }] : [];
      const dueDate = QADate && QATime ? new Date(`${QADate}T${QATime}`).toISOString() : new Date().toISOString();
      if (isEditTrue) { assignmentUpdateMutate.mutate({ ...quizAssignmentDataObj, dueDate, files: filesArr, id: data?.id }); return; }
      for (const classroom of selectedClassroom) {
        await createAssignment({ ...quizAssignmentDataObj, classroomID: classroom.id, subjectID: selectedSubject, files: filesArr, dueDate });
      }
      toast.success("Assignments created!"); toggleBlur(); setopen(false); await refetch();
    } catch { toast.error("Something went wrong."); } finally { setLoading(false); }
  };

  const handleCreateQuiz = async () => {
    setLoading(true);
    if (!quizAssignmentDataObj?.text?.trim() && !selectedFile?.name && !uploadedFileUrl) {
      toast.error("Please provide text or a file."); setLoading(false); return;
    }
    try {
      const filesArr = uploadedFileUrl ? [{ name: selectedFile?.name || data?.files?.[0]?.name || "File", url: uploadedFileUrl }] : [];
      const dueDate = QADate && QATime ? new Date(`${QADate}T${QATime}`).toISOString() : new Date().toISOString();
      if (isEditTrue) { quizEditMutate.mutate({ ...quizAssignmentDataObj, dueDate, files: filesArr, id: data?.id }); return; }
      for (const classroom of selectedClassroom) {
        await createQuiz({ ...quizAssignmentDataObj, classroomID: classroom.id, subjectID: selectedSubject, files: filesArr, dueDate });
      }
      toast.success("Quizzes created!"); toggleBlur(); setopen(false); await refetch();
    } catch { toast.error("Something went wrong."); } finally { setLoading(false); }
  };

  /* ── Shared input class ── */
  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 pt-20">
      <div
        ref={ref}
        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isQuiz ? "bg-purple-50" : "bg-blue-50"}`}>
              {isQuiz
                ? <ClipboardList size={17} className="text-[#6A00FF]" />
                : <BookOpen size={17} className="text-blue-600" />
              }
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {isEditTrue ? "Edit" : "Create"} {isQuiz ? "Quiz" : "Assignment"}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Fill in the details below
              </p>
            </div>
          </div>
          <button
            onClick={() => { setopen(false); toggleBlur(); }}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <IoClose size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-col gap-5 px-6 py-5 overflow-y-auto custom-scrollbar">

          {/* Classroom Multi-select */}
          <Field label="Classroom">
            <div className="relative">
              <div
                onClick={() => setDropdownOpen((p) => !p)}
                className={`${inputCls} flex items-center justify-between cursor-pointer pr-9`}
              >
                <span className={selectedClassroom.length > 0 ? "text-gray-800" : "text-gray-400"}>
                  {selectedClassroom.length > 0
                    ? selectedClassroom.map((c) => c.name).join(", ")
                    : "Select classrooms"}
                </span>
                <ChevronDown
                  size={14}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </div>

              {dropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                    {allClassrooms?.map((item) => {
                      const checked = selectedClassroom.some((c) => c.id === item.id);
                      return (
                        <label
                          key={item.id}
                          className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer text-sm transition-colors
                            ${checked ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSelectedClassroom((prev) =>
                                prev.some((c) => c.id === item.id)
                                  ? prev.filter((c) => c.id !== item.id)
                                  : [...prev, item]
                              );
                              setDropdownOpen(false);
                            }}
                            className="accent-purple-600 w-3.5 h-3.5"
                          />
                          {item.name}
                        </label>
                      );
                    })}
                  </div>
                  {/* Selected pills */}
                  {selectedClassroom.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                      {selectedClassroom.map((c) => (
                        <span key={c.id} className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {c.name}
                          <button onClick={() => setSelectedClassroom((p) => p.filter((x) => x.id !== c.id))}>
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
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
                disabled={selectedClassroom.length === 0}
                className={`${inputCls} appearance-none pr-9 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <option value="">{selectedClassroom.length === 0 ? "Select a classroom first" : "Select subject"}</option>
                {teacherSubjectOfClassroom?.subjects?.map((item) => (
                  <option key={item.subjectId} value={item.subjectId}>{item.subjectName}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {selectedClassroom.length === 0 && (
              <p className="text-[10px] text-gray-400 px-0.5">Choose a classroom first to load subjects</p>
            )}
          </Field>

          {/* Title */}
          <Field label="Title">
            <input
              type="text"
              placeholder="Enter title"
              value={quizAssignmentDataObj.title}
              onChange={(e) => updateObj("title", e.target.value)}
              className={inputCls}
            />
          </Field>

          {/* Text */}
          <Field label={isQuiz ? "Quiz Description" : "Assignment Description"}>
            <textarea
              rows={3}
              placeholder="Write description or instructions..."
              value={quizAssignmentDataObj.text}
              onChange={(e) => updateObj("text", e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Total Marks */}
          <Field label="Total Marks">
            <input
              type="number"
              placeholder="e.g. 100"
              value={quizAssignmentDataObj.totalMarks}
              onChange={(e) => updateObj("totalMarks", e.target.value)}
              className={inputCls}
            />
          </Field>

          {/* Deadline */}
          <Field label="Deadline">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={QADate}
                onChange={(e) => setQADate(e.target.value)}
                className={inputCls}
              />
              <input
                type="time"
                value={QATime}
                onChange={(e) => setQATime(e.target.value)}
                className={inputCls}
              />
            </div>
          </Field>

          {/* Allow late submit (quiz only) */}
          {isQuiz && (
            <Field label="Allow submission after deadline">
              <div className="relative">
                <select
                  value={quizAssignmentDataObj.canSubmitAfterTime}
                  onChange={(e) => updateObj("canSubmitAfterTime", e.target.value)}
                  className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                >
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </Field>
          )}

          {/* File Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Attachment</label>
            <label
              htmlFor="assignmentQuiz"
              className="flex flex-col items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer group"
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
            <input type="file" id="assignmentQuiz" className="hidden" onChange={handleFileChange} />

            {/* New file preview */}
            {selectedFile && (
              <div className="flex items-center justify-between px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl">
                <div className="flex items-center gap-3">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-white rounded-lg border border-purple-100 flex items-center justify-center">
                      <img src={IMAGES.pdf} alt="file" className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{selectedFile.name}</p>
                    <p className="text-[10px] text-gray-400">Ready to upload</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="assignmentQuiz" className="p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors">
                    <FiEdit size={13} className="text-purple-500" />
                  </label>
                  <button onClick={handleRemoveFile} className="p-1.5 rounded-lg hover:bg-white transition-colors">
                    <IoCloseCircle size={15} className="text-red-400" />
                  </button>
                </div>
              </div>
            )}

            {/* Existing file (edit mode) */}
            {isEditTrue && !selectedFile && data?.files?.length > 0 && uploadedFileUrl && (
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-3">
                  {uploadedFileUrl && /\.(jpeg|jpg|gif|png|webp|avif|svg)(?:\?.*)?$/i.test(uploadedFileUrl) ? (
                    <img src={uploadedFileUrl} alt="preview" className="w-10 h-10 object-cover rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                      <img src={IMAGES.pdf} alt="pdf" className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-700 truncate max-w-[180px]">{data.files[0].name}</p>
                    <p className="text-[10px] text-gray-400">Existing file</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="assignmentQuiz" className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <FiEdit size={13} className="text-gray-500" />
                  </label>
                  <button onClick={handleRemoveFile} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <IoCloseCircle size={15} className="text-red-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-white">
          {isSubmitting ? (
            <div className="flex justify-center py-1"><Loader /></div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => { setopen(false); toggleBlur(); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-2.5 rounded-xl bg-[#6A00FF] hover:bg-[#5800D6] text-white text-sm font-semibold shadow-md shadow-purple-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                {isEditTrue ? "Save Changes" : `Create ${isQuiz ? "Quiz" : "Assignment"}`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Tiny reusable field wrapper ── */
const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-0.5">
      {label}
    </label>
    {children}
  </div>
);

export default CreateQuizAssignmentModal;
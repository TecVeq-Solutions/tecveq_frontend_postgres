import React, { useEffect, useRef, useState } from "react";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";

import { toast } from "react-toastify";
import { FiUploadCloud, FiEdit } from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";
import { useMutation, useQuery } from "@tanstack/react-query";
import { uploadFile } from "../../../utils/FileUpload";
import { handleProfileImageUpdate } from "../../../utils/Admin/profileImageUtils";
import { useBlur } from "../../../context/BlurContext";
import { useUser } from "../../../context/UserContext";
import { useTeacher } from "../../../context/TeacherContext";
import { createQuiz, editQuiz } from "../../../api/Teacher/Quiz";
import { createAssignment, editAssignment, } from "../../../api/Teacher/Assignments";
import useClickOutside from "../../../hooks/useClickOutlise";
import { getTeacherSubjectsOfClassroom } from "../../../api/Teacher/TeacherSubjectApi";
import MCQBuilder from "./MCQBuilder";


const CreateQuizAssignmentModal = ({
  open,
  setopen,
  isQuiz,
  isEditTrue,
  refetch,
  data
}) => {
  const { userData } = useUser();
  const { allClassrooms } = useTeacher();
  const ref = useRef(null);
  const { toggleBlur } = useBlur();

  useClickOutside(ref, () => {
    setopen(false)
    if (open) {
      toggleBlur();
    }
  });

  const [QADate, setQADate] = useState(isEditTrue && data?.dueDate ? data.dueDate.split("T")[0] : "");
  const [QATime, setQATime] = useState(isEditTrue && data?.dueDate ? data.dueDate.split("T")[1]?.slice(0, 5) : "");

  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [quizAssignmentDataObj, setQuizAssignmentDataObj] = useState({
    canSubmitAfterTime: false,
    title: isEditTrue ? data?.title : "",
    text: isEditTrue ? data?.text : "",
    dueDate: isEditTrue ? data?.dueDate : "",
    subjectID: isEditTrue ? data?.subjectID : "",
    totalMarks: isEditTrue ? data?.totalMarks : 0,
    classroomID: isEditTrue ? data?.classroomID : "",
    type: isEditTrue ? data?.type : (isQuiz ? "quiz" : "assignment"),
    files: "",
  })
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(isEditTrue && data?.files?.[0]?.url ? data.files[0].url : "");
  const [selectedClassroom, setSelectedClassroom] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [quizMode, setQuizMode] = useState(isEditTrue && data?.questions?.length > 0 ? "mcq" : "file"); // "file" or "mcq"
  const [mcqQuestions, setMcqQuestions] = useState(
    isEditTrue && data?.questions 
      ? data.questions.map(q => ({
          title: q.text,
          marks: q.marks,
          options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
        })) 
      : []
  );


  // Just updating the key parts of your component. Keep the rest of your original code structure.



  console.log(selectedClassroom, "selected classroom");
  console.log(selectedSubject, "selected subject");




  const handleCreateAssignment = async () => {
    setLoading(true);

    const hasText = !!quizAssignmentDataObj?.text?.trim();
    const hasFile = !!selectedFile?.name || !!uploadedFileUrl;
    if (!hasText && !hasFile) {
      toast.error("Please provide text or a file.");
      setLoading(false);
      return;
    }

    try {
      // 1) Use uploaded file URL from state
      let filesArr = [];
      if (uploadedFileUrl) {
        filesArr.push({ name: selectedFile?.name || data?.files?.[0]?.name || "File", url: uploadedFileUrl });
      }

      if (isEditTrue) {
        const payload = {
          ...quizAssignmentDataObj,
          dueDate: QADate && QATime
            ? new Date(`${QADate}T${QATime}`).toISOString()
            : data?.dueDate || new Date().toISOString(),
          files: filesArr,
          id: data?.id,
        };
        assignmentUpdateMutate.mutate(payload);
        return;
      }

      // 2) compute dueDate
      const dueDate = QADate && QATime
        ? new Date(`${QADate}T${QATime}`).toISOString()
        : new Date().toISOString();

      // 3) loop sequentially
      for (const classroom of selectedClassroom) {
        const classroomID = classroom.id;

        // pick the right subject for this teacher + classroom
        let subjectID = selectedSubject;
        // const teachEntry = classroom.teachers.find(
        //   t => t.teacher === userData.id
        // );
        // if (teachEntry) subjectID = teachEntry.subject;

        const payload = {
          ...quizAssignmentDataObj,
          classroomID,
          subjectID,
          files: filesArr,
          dueDate
        };

        // direct API call (so each gets its own request)
        await createAssignment(payload);
      }

      toast.success("Assignments created for all selected classrooms!");
      toggleBlur();
      setopen(false)
      await refetch();

    } catch (err) {
      console.error("Error during assignment creation:", err);
      // If you want to see exactly which classroom failed:
      // console.error(err.config.data, err.response?.status);
      toast.error("Something went wrong creating the assignments.");
    } finally {
      setLoading(false);
    }
  };





  const handleCreateQuiz = async () => {
    setLoading(true);

    const hasText = !!quizAssignmentDataObj?.text?.trim();
    const hasFile = !!selectedFile?.name || !!uploadedFileUrl;
    const hasMCQ = quizMode === "mcq" && mcqQuestions.length > 0;

    // MCQ mode skips file/text requirement
    if (!hasMCQ && !hasText && !hasFile) {
      toast.error("Please provide either text, a file, or MCQ questions before creating the quiz.");
      setLoading(false);
      return;
    }

    // Validate MCQ questions have text and at least one correct answer
    if (hasMCQ) {
      for (let i = 0; i < mcqQuestions.length; i++) {
        const q = mcqQuestions[i];
        if (!q.title?.trim()) {
          toast.error(`Question ${i + 1} is missing its text.`);
          setLoading(false);
          return;
        }
        if (!q.options.some(o => o.isCorrect)) {
          toast.error(`Question ${i + 1} must have at least one correct option.`);
          setLoading(false);
          return;
        }
        if (q.options.some(o => !o.text?.trim())) {
          toast.error(`Question ${i + 1} has an empty option. Please fill all options.`);
          setLoading(false);
          return;
        }
      }
    }

    try {
      let filesArr = [];

      if (uploadedFileUrl && quizMode === "file") {
        filesArr.push({ name: selectedFile?.name || data?.files?.[0]?.name || "File", url: uploadedFileUrl });
      }

      const dueDate = QADate && QATime
        ? new Date(`${QADate}T${QATime}`).toISOString()
        : new Date().toISOString();

      if (isEditTrue) {
        const sendingObj = {
          ...quizAssignmentDataObj,
          dueDate,
          files: filesArr,
          id: data?.id,
          ...(hasMCQ && { mcqQuestions }),
        };

        quizEditMutate.mutate(sendingObj);
      } else {
        // Loop through all selected classrooms for quiz creation
        for (const classroom of selectedClassroom) {
          const classroomID = classroom.id;
          const subjectID = selectedSubject;

          const sendingObj = {
            ...quizAssignmentDataObj,
            classroomID,
            subjectID,
            files: filesArr,
            dueDate,
            ...(hasMCQ && { mcqQuestions }),
          };

          await createQuiz(sendingObj);
        }

        toast.success("Quizzes created for all selected classrooms!");
        toggleBlur();
        setopen(false);
        await refetch();
      }
    } catch (err) {
      console.error("Error during quiz creation:", err);
      toast.error("Something went wrong while creating the quiz.");
    } finally {
      setLoading(false);
    }
  };





  const assignmentUpdateMutate = useMutation({
    mutationFn: async (dataobj) => {
      const id = dataobj?.id || data?.id;
      if (!id) {
        throw new Error("Assignment ID is missing");
      }
      const { id: _, ...payload } = dataobj;
      return await editAssignment(payload, id);
    },
    onSuccess: async (responseData) => {
      console.log("Assignment updated successfully", responseData);
      await refetch();
      toast.success("Assignment updated successfully");
      toggleBlur();
      setopen(false);
    },
    onError: (error) => {
      console.error("Assignment update error:", error);
      toast.error(error?.message || "Failed to update assignment. Please try again.");
    }
  });


  const assignmentCreateMutate = useMutation({
    mutationFn: async (data) => await createAssignment(data),
    onSuccess: async (responseData) => {
      console.log("Assignment created successfully", responseData);
      await refetch();
      toast.success("Assignment created successfully");
      toggleBlur();
      setopen(false);
    },
    onError: (error) => {
      console.error("Assignment creation error:", error);
      toast.error(error?.message || "Failed to create assignment. Please try again.");
    }
  });


  const quizEditMutate = useMutation({
    mutationFn: async (dataobj) => {
      const id = dataobj?.id || data?.id;
      if (!id) {
        throw new Error("Quiz ID is missing");
      }
      const { id: _, ...payload } = dataobj;
      return await editQuiz(payload, id);
    },
    onSuccess: async (responseData) => {
      console.log("Quiz updated successfully", responseData);
      await refetch();
      toast.success("Quiz updated successfully");
      toggleBlur();
      setopen(false);
    },
    onError: (error) => {
      console.error("Quiz update error:", error);
      toast.error(error?.message || "Failed to update quiz. Please try again.");
    }
  });

  const quizCreateMutate = useMutation({
    mutationFn: async (data) => await createQuiz(data),
    onSuccess: async (responseData) => {
      console.log("Quiz created successfully", responseData);
      await refetch();
      toast.success("Quiz created successfully");
      toggleBlur();
      setopen(false);
    },
    onError: (error) => {
      console.error("Quiz creation error:", error);
      toast.error(error?.message || "Failed to create quiz. Please try again.");
    }
  });


  const {
    data: teacherSubjectOfClassroom,
    isSuccess: teacherIsSuccess,
    isPending: teacherSubjectPending
  } = useQuery({
    queryKey: ["teacherSubjectsOfClassrooms", selectedClassroom.map(c => c.id)],
    queryFn: async () => {
      const classroomIDs = selectedClassroom.map(c => c.id);
      return await getTeacherSubjectsOfClassroom({ classroomIDs });
    },
    enabled: selectedClassroom.length > 0,
  });






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

    // Start Cloudinary upload immediately for all file types
    await handleProfileImageUpdate(file, (url) => {
      console.log("Uploaded File URL:", url);
      setUploadedFileUrl(url);
    }, setLoading);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedFileUrl("");
  };




  return (
    <div
      className={`fixed z-10 mt-10 bg-white max-h-[85vh] overflow-y-auto custom-scrollbar  p-8 w-[90%] ml-[5%] md:w-[600px] px-5 sm:px-16 text-black rounded-xl md:ml-96 ${open ? "" : "hidden"
        }`}

      ref={ref}

    >
      <div className="flex gap-2">
        <div className="flex flex-col w-full gap-4">
          <div className="flex items-center justify-between">
            <div className="flex justify-center flex-1 w-[fit] gap-2 items-center">
              <p className="text-xl sm:text-2xl font-medium sm:font-semibold cursor-text">
                Create new {isQuiz ? "Quiz" : "Assignment"}
              </p>
            </div>
            <div className="flex items-center gap-2 cursor-pointer">
              <img
                src={IMAGES.CloseIcon}
                className="w-[15px] h-[15px]"
                onClick={(e) => {
                  e.stopPropagation();
                  setopen(false);
                  toggleBlur()
                }}
              />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "4px" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "#4B5563" }}>Select Classroom</p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  // padding: "4px 16px",
                  borderRadius: "8px",
                  width: "100%",
                  alignItems: "center",
                  // border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                }}
              >
                <div style={{ position: "relative", width: "100%" }}>
                  <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      backgroundColor: "#fff",
                      cursor: "pointer",
                      fontSize: "14px",
                      color: "#1f2937",
                    }}
                  >
                    {selectedClassroom.length > 0
                      ? selectedClassroom.map(item => item.name).join(", ")
                      : "Select Classroom"}
                  </div>

                  {dropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        maxHeight: "200px",
                        overflowY: "auto",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        marginTop: "4px",
                        zIndex: 10,
                      }}
                    >
                      {allClassrooms?.map(item => {
                        const isChecked = selectedClassroom.some(selected => selected.id === item.id);
                        return (
                          <label
                            key={item.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "8px 12px",
                              cursor: "pointer",
                              fontSize: "14px",
                              backgroundColor: isChecked ? "#f0f9ff" : "#fff",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const exists = selectedClassroom.some(c => c.id === item.id);
                                if (exists) {
                                  setSelectedClassroom(prev =>
                                    prev.filter(c => c.id !== item.id)
                                  );
                                } else {
                                  setSelectedClassroom(prev => [...prev, item]);
                                }
                              }}
                              style={{ marginRight: "8px" }}
                            />
                            {item.name}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>


          <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1 gap-1">
              <p className="text-xs font-semibold text-grey_700">Select Subject</p>
              <div className="flex justify-between border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="text-sm outline-none text-custom-gray-3 w-full"
                >
                  <option value="">Select Subject</option>
                  {teacherSubjectOfClassroom?.subjects?.map((item) => (
                    <option key={item.subjectId} value={item.subjectId}>
                      {item.subjectName}
                    </option>
                  ))}
                </select>

              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1 gap-1">
              <p className="text-xs font-semibold text-grey_700">Title</p>
              <div className="flex justify-between border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                <input
                  className="text-sm outline-none text-custom-gray-3 w-full"
                  placeholder="Enter title"
                  value={quizAssignmentDataObj.title}
                  onChange={(e) => setQuizAssignmentDataObj({ ...quizAssignmentDataObj, title: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1 gap-1">
              <p className="text-xs font-semibold text-grey_700">{isQuiz ? "Quiz" : "Assignment"} Type</p>
              <div className="flex justify-between border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                <select
                  className="text-sm outline-none text-custom-gray-3 w-full"
                  value={quizAssignmentDataObj.type}
                  onChange={(e) => setQuizAssignmentDataObj({ ...quizAssignmentDataObj, type: e.target.value })}
                >
                  {isQuiz ? (
                    <>
                      <option value="quiz">Standard Quiz</option>
                      <option value="surprise_quiz">Surprise Quiz</option>
                      <option value="class_test">Class Test</option>
                    </>
                  ) : (
                    <>
                      <option value="assignment">Standard Assignment</option>
                      <option value="homework">Homework</option>
                      <option value="project">Project / Portfolio</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1 gap-1">
              <p className="text-xs font-semibold text-grey_700">{isQuiz ? "Text Quiz" : "Text Assignment"}</p>
              <div className="flex justify-between border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                <textarea
                  className="text-sm outline-none text-custom-gray-3 w-full"
                  placeholder="Enter title"
                  value={quizAssignmentDataObj.text}
                  onChange={(e) => setQuizAssignmentDataObj({ ...quizAssignmentDataObj, text: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1 gap-1">
              <p className="text-xs font-semibold text-grey_700">Total Makrs</p>
              <div className="flex justify-between border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                <input
                  className="text-sm outline-none text-custom-gray-3 w-full"
                  placeholder="Enter marks"
                  value={quizAssignmentDataObj.totalMarks}
                  onChange={(e) => setQuizAssignmentDataObj({ ...quizAssignmentDataObj, totalMarks: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 gap-1">
            <p className="text-xs font-semibold text-grey_700">Deadline</p>
            <div className="flex items-center gap-3 ">
              <div className="flex flex-col flex-1 gap-1 ">
                <div className="flex items-center flex-1 justify-between gap-3 px-3 py-1 border-[1.5px] rounded-lg border-grey/30">
                  <input
                    id="date"
                    type="date"
                    className="text-sm outline-none text-custom-gray-3 w-full"
                    placeholder="Enter date"
                    value={QADate}
                    onChange={(e) => setQADate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col flex-1 gap-1">
                <div className="flex flex-1 items-center justify-between gap-3 px-3 py-1 border-[1.5px] rounded-lg border-grey/30">
                  <input
                    type="time"
                    className="text-sm outline-none text-custom-gray-3 w-full"
                    placeholder="Enter time"
                    value={QATime}
                    onChange={(e) => setQATime(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          {isQuiz &&
            <div className="flex items-center gap-3">
              <div className="flex flex-col flex-1 gap-1">
                <p className="text-xs font-semibold text-grey_700">Can Submit after deadline</p>
                <div className="flex justify-between border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                  <select
                    value={quizAssignmentDataObj.canSubmitAfterTime}
                    className="text-sm outline-none text-custom-gray-3 w-full"
                    onChange={(e) => { setQuizAssignmentDataObj({ ...quizAssignmentDataObj, canSubmitAfterTime: e.target.value }) }} >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </div>
              </div>
            </div>
          }
          {isQuiz &&
            <div className="flex items-center gap-3">
              <div className="flex flex-col flex-1 gap-1">
                <p className="text-xs font-semibold text-grey_700">Quiz Mode</p>
                <div className="flex justify-between border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                  <select
                    value={quizMode}
                    className="text-sm outline-none text-custom-gray-3 w-full"
                    onChange={(e) => setQuizMode(e.target.value)} >
                    <option value="file">File Upload</option>
                    <option value="mcq">Online MCQ Builder</option>
                  </select>
                </div>
              </div>
            </div>
          }

          {(!isQuiz || quizMode === "file") ? (
          <div className="flex flex-1 border-2 rounded-lg border-[#00000010] py-6 px-16">
            <div className="flex flex-col items-center justify-center flex-1 gap-2">
              {/* Upload Button */}
              <label htmlFor="assignmentQuiz">
                <div className="flex p-4 rounded-lg shadow-sm border border-[#00000010] cursor-pointer">
                  <FiUploadCloud />
                </div>
              </label>

              {/* Hidden Input */}
              <input
                type="file"
                id="assignmentQuiz"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Upload Instructions */}
              <div className="flex">
                <p className="flex flex-wrap items-center justify-center text-sm text-center">
                  <span className="text-[#0B1053] font-medium">Click to upload </span>
                  <span>or drag and drop Files</span>
                  <span> PNG, JPG, Word or PDF</span>
                </p>
              </div>

              {/* Preview Section */}
              {selectedFile && (
                <div className="mt-2 text-center">
                  {previewUrl ? (
                    <div className="relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <label htmlFor="assignmentQuiz" className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-100">
                        <FiEdit size={14} className="text-[#6A00FF]" />
                      </label>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">{selectedFile?.name}</p>
                  )}
                  <p
                    onClick={handleRemoveFile}
                    className="text-red-500 text-xs mt-1 cursor-pointer hover:underline"
                  >
                    Remove File
                  </p>
                </div>
              )}

              {/* Existing File for Edit (if no new file selected) */}
              {isEditTrue && !selectedFile && data?.files?.length > 0 && uploadedFileUrl && (
                <div className="flex justify-between px-2 py-2 border rounded-lg w-60 border-black/20">
                  <div className="flex items-center gap-2">
                    <img src={IMAGES.pdf} alt="pdf icon" className="w-8 h-8" />
                    <div className="text-xs truncate">
                      <p className="truncate w-32">{data.files[0].name}</p>
                      <p>Existing File</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="assignmentQuiz" className="cursor-pointer hover:text-[#6A00FF]">
                      <FiEdit size={16} />
                    </label>
                    <p onClick={handleRemoveFile} className="cursor-pointer text-red-500 hover:text-red-700">
                      <IoCloseCircle size={16} />
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          ) : (
            <div className="border border-gray-100 rounded-xl p-4 max-h-96 overflow-y-auto w-full custom-scrollbar">
               <MCQBuilder questions={mcqQuestions} setQuestions={setMcqQuestions} />
            </div>
          )}
          {(loading || quizCreateMutate.isPending || quizEditMutate.isPending || assignmentCreateMutate.isPending || assignmentUpdateMutate.isPending) && <div><Loader /> </div>}
          {
            (!loading && !quizCreateMutate.isPending && !quizEditMutate.isPending && !assignmentCreateMutate.isPending && !assignmentUpdateMutate.isPending) &&
            <div className="flex items-center gap-3">
              <div
                onClick={() => {
                  if (loading) return; // Prevent submission while uploading
                  isQuiz ? handleCreateQuiz() : handleCreateAssignment()
                }}
                className={`flex items-center justify-center w-full py-2 text-center rounded-md cursor-pointer ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#6A00FF]"}`}
              >
                <p className="text-sm text-white">{isEditTrue ? "Update" : "Create"}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div >
  );
};

export default CreateQuizAssignmentModal;

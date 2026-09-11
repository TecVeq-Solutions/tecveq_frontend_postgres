import React, { useEffect, useRef, useState } from "react";
import Loader from "../../../utils/Loader";
import { toast } from "react-toastify";
import { FiUploadCloud } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useMutation, useQuery } from "@tanstack/react-query";
import { handleProfileImageUpdate } from "../../../utils/Admin/profileImageUtils";
import { useBlur } from "../../../context/BlurContext";
import { useTeacher } from "../../../context/TeacherContext";
import { createMaterial, updateMaterial } from "../../../api/Teacher/LearningMaterials";
import useClickOutside from "../../../hooks/useClickOutlise";
import { getTeacherSubjectsOfClassroom } from "../../../api/Teacher/TeacherSubjectApi";
import { BookOpen, ChevronDown } from "lucide-react";

const CreateLearningMaterialModal = ({ open, setopen, isEditTrue, refetch, data }) => {
  const { allClassrooms } = useTeacher();
  const ref = useRef(null);
  const { toggleBlur } = useBlur();

  useClickOutside(ref, () => { setopen(false); if (open) toggleBlur(); });

  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(isEditTrue && data?.fileUrl ? data.fileUrl : "");

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState(isEditTrue && data?.videoUrl ? data.videoUrl : "");
  const [videoLoading, setVideoLoading] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  const [materialData, setMaterialData] = useState({
    title: "",
    chapter: "",
    description: "",
    materialType: "PDF",
    videoUrl: "",
    status: "Draft",
    classId: "",
    subjectId: ""
  });

  const updateObj = (key, value) => setMaterialData((p) => ({ ...p, [key]: value }));

  useEffect(() => {
    if (open) {
      if (isEditTrue && data) {
        setUploadedFileUrl(data?.fileUrl || "");
        setUploadedVideoUrl(data?.videoUrl || "");
        setMaterialData({
          title: data?.title || "",
          chapter: data?.chapter || "",
          description: data?.description || "",
          materialType: data?.materialType || "PDF",
          videoUrl: data?.videoUrl || "",
          status: data?.status || "Draft",
          classId: data?.classId || "",
          subjectId: data?.subjectId || ""
        });
        
        if (data?.classroom) setSelectedClassroom([data.classroom]);
        else setSelectedClassroom([]);
        
        setSelectedSubject(data?.subjectId || "");
      } else {
        setUploadedFileUrl("");
        setUploadedVideoUrl("");
        setMaterialData({
          title: "",
          chapter: "",
          description: "",
          materialType: "PDF",
          videoUrl: "",
          status: "Draft",
          classId: "",
          subjectId: ""
        });
        setSelectedClassroom([]);
        setSelectedSubject("");
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setSelectedVideo(null);
      setVideoLoading(false);
      setLoading(false);
      setDropdownOpen(false);
    }
  }, [open, isEditTrue, data]);

  const { data: teacherSubjectOfClassroom } = useQuery({
    queryKey: ["teacherSubjectsOfClassrooms", selectedClassroom.map((c) => c.id)],
    queryFn: async () => await getTeacherSubjectsOfClassroom({ classroomIDs: selectedClassroom.map((c) => c.id) }),
    enabled: selectedClassroom.length > 0,
  });

  const updateMutate = useMutation({
    mutationFn: async (payload) => await updateMaterial(data?.id, payload),
    onSuccess: async () => { await refetch(); toast.success("Material updated"); toggleBlur(); setopen(false); },
    onError: (e) => toast.error(e?.message || "Failed to update material"),
  });

  const createMutate = useMutation({
    mutationFn: async (payload) => await createMaterial(payload),
    onSuccess: async () => { await refetch(); toast.success("Material created"); toggleBlur(); setopen(false); },
    onError: (e) => toast.error(e?.message || "Failed to create material"),
  });

  const isSubmitting = loading || createMutate?.isPending || updateMutate?.isPending;

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

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedVideo(file);
    await handleProfileImageUpdate(file, (url) => setUploadedVideoUrl(url), setVideoLoading, 'video');
  };

  const handleRemoveFile = () => { setSelectedFile(null); setPreviewUrl(null); setUploadedFileUrl(""); };
  const handleRemoveVideo = () => { setSelectedVideo(null); setUploadedVideoUrl(""); };

  const handleSubmit = async () => {
    setLoading(true);
    if (!materialData?.title?.trim()) {
      toast.error("Please provide a title."); setLoading(false); return;
    }
    if (selectedClassroom.length === 0 || !selectedSubject) {
      toast.error("Please select a classroom and subject."); setLoading(false); return;
    }

    try {
      const payload = {
        ...materialData,
        fileUrl: uploadedFileUrl,
        videoUrl: uploadedVideoUrl
      };

      if (isEditTrue) { 
        updateMutate.mutate(payload); 
        return; 
      }
      
      for (const classroom of selectedClassroom) {
        await createMaterial({ ...payload, classId: classroom.id, subjectId: selectedSubject });
      }
      
      toast.success("Learning Material created!"); 
      toggleBlur(); 
      setopen(false); 
      await refetch();
    } catch { 
      toast.error("Something went wrong."); 
    } finally { 
      setLoading(false); 
    }
  };

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 pt-20">
      <div
        ref={ref}
        className="relative bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between px-3 sm:px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-blue-50`}>
              <BookOpen size={17} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">
                {isEditTrue ? "Edit" : "Create"} Learning Material
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Share resources with your class
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

        <div className="flex flex-col gap-5 px-3 sm:px-6 py-5 overflow-y-auto custom-scrollbar">
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
                <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </div>
              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg max-h-48 overflow-auto py-2">
                  {allClassrooms?.length > 0 ? (
                    allClassrooms.map((cls) => (
                      <label key={cls.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                          checked={selectedClassroom.some((c) => c.id === cls.id)}
                          onChange={() => {
                            setSelectedClassroom((prev) =>
                              prev.some((c) => c.id === cls.id)
                                ? prev.filter((c) => c.id !== cls.id)
                                : [...prev, cls]
                            );
                            setDropdownOpen(false);
                          }}
                        />
                        <span className="text-sm text-gray-700">{cls.name}</span>
                      </label>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">No classrooms found.</div>
                  )}
                </div>
              )}
            </div>
          </Field>

          <Field label="Subject">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className={inputCls}
              disabled={selectedClassroom.length === 0}
            >
              <option value="" disabled>Select Subject</option>
              {teacherSubjectOfClassroom?.subjects?.length > 0 &&
                Array.from(new Set(teacherSubjectOfClassroom.subjects.map((sub) => sub.subjectId))).map((subjectId) => {
                  const subject = teacherSubjectOfClassroom.subjects.find((sub) => sub.subjectId === subjectId);
                  return <option key={subjectId} value={subjectId}>{subject.subjectName}</option>;
                })}
            </select>
          </Field>

          <Field label="Chapter (Optional)">
            <input
              type="text"
              placeholder="E.g., chp1"
              value={materialData.chapter}
              onChange={(e) => updateObj("chapter", e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Title">
            <input
              type="text"
              placeholder="E.g., Intro to Algebra"
              value={materialData.title}
              onChange={(e) => updateObj("title", e.target.value)}
              className={inputCls}
            />
          </Field>

          <Field label="Description">
            <textarea
              rows="3"
              placeholder="Briefly describe the material..."
              value={materialData.description}
              onChange={(e) => updateObj("description", e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Material Type">
              <select
                value={materialData.materialType}
                onChange={(e) => updateObj("materialType", e.target.value)}
                className={inputCls}
              >
                <option value="PDF">PDF Document</option>
                <option value="PowerPoint">PowerPoint</option>
                <option value="Word">Word Document</option>
                <option value="Image">Image</option>
                <option value="Link">External Link</option>
              </select>
            </Field>

            <Field label="Status">
              <select
                value={materialData.status}
                onChange={(e) => updateObj("status", e.target.value)}
                className={inputCls}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </Field>
          </div>

          <Field label={materialData.materialType === "Link" ? "External URL" : "Upload File"}>
            {materialData.materialType === "Link" ? (
              <input
                type="text"
                placeholder="https://..."
                value={materialData.fileUrl || ""}
                onChange={(e) => setUploadedFileUrl(e.target.value)}
                className={inputCls}
              />
            ) : (
              <div className="w-full">
                <input
                  type="file"
                  id="materialFile"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="materialFile"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-purple-300 transition-all group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiUploadCloud size={18} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                    <p className="mt-2 text-[11px] text-gray-500">
                      <span className="text-purple-600">Click to upload</span> or drag and drop
                    </p>
                  </div>
                </label>

                {(selectedFile || uploadedFileUrl) && (
                  <div className="mt-3 flex items-center justify-between p-2.5 bg-green-50/50 border border-green-100 rounded-xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {previewUrl ? (
                        <img src={previewUrl} alt="preview" className="w-8 h-8 object-cover rounded-lg" />
                      ) : (
                        <div className="w-8 h-8 bg-green-100 text-green-600 flex items-center justify-center rounded-lg">
                          <FiUploadCloud size={14} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-gray-700 truncate">
                          {selectedFile ? selectedFile.name : "Uploaded file"}
                        </p>
                        {loading && <p className="text-[10px] text-purple-600 font-medium">Uploading to Cloudinary...</p>}
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-1.5 hover:bg-green-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <IoClose size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </Field>

          <Field label="Upload Video (Optional)">
            <div className="w-full">
              <input
                type="file"
                id="materialVideo"
                accept="video/*"
                className="hidden"
                onChange={handleVideoChange}
              />
              <label
                htmlFor="materialVideo"
                className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-purple-300 transition-all group"
              >
                <div className="flex flex-col items-center justify-center pt-4 pb-4">
                  <FiUploadCloud size={16} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                  <p className="mt-1.5 text-[11px] text-gray-500">
                    <span className="text-purple-600">Click to upload video</span>
                  </p>
                </div>
              </label>

              {(selectedVideo || uploadedVideoUrl) && (
                <div className="mt-3 flex items-center justify-between p-2.5 bg-green-50/50 border border-green-100 rounded-xl">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 bg-green-100 text-green-600 flex items-center justify-center rounded-lg">
                      <FiUploadCloud size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-gray-700 truncate">
                        {selectedVideo ? selectedVideo.name : "Uploaded video"}
                      </p>
                      {videoLoading && <p className="text-[10px] text-purple-600 font-medium">Uploading video...</p>}
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveVideo}
                    className="p-1.5 hover:bg-green-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <IoClose size={14} />
                  </button>
                </div>
              )}
            </div>
          </Field>
        </div>

        <div className="px-3 sm:px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={() => { setopen(false); toggleBlur(); }}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loading || videoLoading}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all shadow-md
              ${isSubmitting || loading || videoLoading
                ? "bg-purple-400 shadow-none cursor-not-allowed"
                : "bg-[#6A00FF] hover:bg-[#5800D6] shadow-purple-200 active:scale-95"
              }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : (
              isEditTrue ? "Update Material" : "Create Material"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-1">
      {label}
    </label>
    {children}
  </div>
);

export default CreateLearningMaterialModal;

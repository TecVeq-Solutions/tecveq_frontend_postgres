import React, { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FiEdit2, FiCamera, FiPhone, FiMail, FiUser, FiAlignLeft } from "react-icons/fi";
import { IoClose, IoCalendarOutline } from "react-icons/io5";
import { BsCake } from "react-icons/bs";
import { RiGraduationCapLine } from "react-icons/ri";
import { FiLock } from "react-icons/fi";
import { GoDownload } from "react-icons/go";

import profile from "../../assets/images/profilepic.png";
import IMAGES from "../../assets/images";
import Loader from "../../utils/Loader";

import { useUser } from "../../context/UserContext";
import { useMutation } from "@tanstack/react-query";
import { updateTeacher } from "../../api/Teacher/TeacherApi";
import { handleProfileImageUpdate } from "../../utils/Admin/profileImageUtils";
import useClickOutside from "../../hooks/useClickOutlise";

const CustomInput = ({
  label,
  value,
  status,
  icon,
  name,
  valuesObj,
  setValuesObj,
  isEmail,
  type = "text"
}) => (
  <div className="mb-4 w-full">
    <label className="block text-[10px] font-semibold text-slate-400 mb-2 ml-1 uppercase tracking-[2px]">
      {label}
    </label>
    <div
      className={`flex items-center gap-3 w-full border-[1.5px] transition-all duration-300 rounded-2xl px-4 py-3.5
        ${status && !isEmail
          ? "border-[#149B9A] bg-white shadow-[0_0_0_4px_rgba(20,155,154,0.08)]"
          : "border-slate-100 bg-slate-50"
        }
        ${isEmail ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      <span
        className={`text-base flex-shrink-0 ${status && !isEmail ? "text-[#149B9A]" : "text-slate-300"
          }`}
      >
        {icon}
      </span>
      <input
        type={type}
        value={value || ""}
        readOnly={!status || isEmail}
        disabled={isEmail}
        className="flex-1 bg-transparent outline-none text-[14px] font-medium text-slate-700 placeholder:text-slate-300 disabled:cursor-not-allowed w-full min-w-0"
        onChange={(e) =>
          setValuesObj({ ...valuesObj, [name]: e.target.value })
        }
      />
      {isEmail && <FiLock className="text-slate-300 flex-shrink-0 text-sm" />}
    </div>
  </div>
);

const ProfileDetails = ({ onClose }) => {
  const { userData, setUserData } = useUser();
  const [allowedEdit, setAllowedEdit] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(userData.cv || null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const [profilePic, setProfilePic] = useState(userData.profilePic || "");

  const modalRef = useRef(null);

  useClickOutside(modalRef, () => {
    if (!allowedEdit) onClose();
  });

  const [userDataObj, setUserDataOjb] = useState({
    bio: userData.bio || "",
    dob: userData.dob || "",
    userType: "teacher",
    name: userData.name || "",
    email: userData.email || "",
    experience: userData.experience || "",
    phoneNumber: userData.phoneNumber || "",
    qualification: userData.qualification || "",
    profilePic: userData.profilePic || "",
  });

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      await handleProfileImageUpdate(file, (uploadedUrl) => {
        setProfilePic(uploadedUrl);
      }, setLoading);
    }
  };

  const updateuserMutation = useMutation({
    mutationFn: async (data) => {
      const result = await updateTeacher(data);
      return result;
    },
    onSuccess: (data) => {
      setUserData({ ...userData, ...data });
      toast.success("Profile updated successfully!");
      onClose();
    },
    onError: (error) => {
      console.error(error);
      // The global axios interceptor will handle specific error messages,
      // so we intentionally omit a local toast.error here to avoid duplicates.
    }
  });

  const handleSaveDetails = () => {
    const updatedData = { ...userDataObj, profilePic: profilePic, cv: selectedPdf };
    updateuserMutation.mutate(updatedData);
  };

  const handleCancel = () => {
    setAllowedEdit(false);
    setPreviewUrl(null);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" 
        onClick={() => !allowedEdit && onClose()}
      />

      <div
        ref={modalRef}
        className="relative bg-white w-full max-w-[440px] rounded-[28px] sm:rounded-[32px] shadow-[0_30px_80px_-10px_rgba(0,0,0,0.35)] overflow-hidden"
        style={{ maxHeight: "95vh", display: "flex", flexDirection: "column" }}
      >
        {/* ── Gradient Header ── */}
        <div
          className="relative px-6 sm:px-7 pt-6 pb-20 flex-shrink-0 overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #0B1053 0%, #0d1a6e 45%, #149B9A 100%)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-14 -right-14 w-48 h-48 rounded-full"
            style={{ background: "rgba(20,155,154,0.18)" }}
          />
          <div
            className="absolute bottom-4 -left-10 w-36 h-36 rounded-full"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#149B9A] mb-1">
                Account
              </p>
              <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">
                Profile Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.18)",
              }}
            >
              <IoClose size={20} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto pt-2 flex-1 custom-scrollbar pb-6">
          {/* ── Avatar Section ── */}
          <div className="flex flex-col items-center px-3 sm:px-7 pb-2">
            {/* Avatar ring */}
            <div
              className={`p-[3px] rounded-full ${loading ? "animate-pulse" : ""}`}
              style={{
                background:
                  "linear-gradient(135deg, #149B9A, #0B1053, #149B9A)",
                boxShadow: "0 8px 32px rgba(20,155,154,0.35)",
              }}
            >
              <div className="bg-white p-[3px] rounded-full relative">
                <img
                  src={previewUrl || profilePic || profile}
                  alt="Profile"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover block"
                />
                {allowedEdit && (
                  <label
                    className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      background:
                        "linear-gradient(135deg, #149B9A, #0B1053)",
                      border: "2px solid #fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    <FiCamera size={14} className="text-white" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleProfileChange}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Name & role */}
            <h3 className="mt-4 text-[20px] sm:text-[22px] font-bold text-slate-800 tracking-tight text-center">
              {userDataObj.name || "Teacher Name"}
            </h3>
            <div
              className="mt-2 inline-flex items-center   sm:gap-2 px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[1.8px]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(20,155,154,0.1), rgba(11,16,83,0.07))",
                border: "1px solid rgba(20,155,154,0.25)",
                color: "#0B1053",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "#149B9A" }}
              />
              Teacher
            </div>

            {/* Edit link */}
            {!allowedEdit && (
              <button
                onClick={() => setAllowedEdit(true)}
                className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#149B9A] hover:opacity-70 transition-opacity"
              >
                <FiEdit2 size={13} />
                Edit Information
              </button>
            )}
          </div>

          <div className="px-3 sm:px-7 pt-4 pb-4">
            <CustomInput
              label="Full Name"
              name="name"
              value={userDataObj.name}
              status={allowedEdit}
              valuesObj={userDataObj}
              setValuesObj={setUserDataOjb}
              icon={<FiUser />}
            />
            <CustomInput
              label="Bio"
              name="bio"
              value={userDataObj.bio}
              status={allowedEdit}
              valuesObj={userDataObj}
              setValuesObj={setUserDataOjb}
              icon={<FiAlignLeft />}
            />
            <CustomInput
              label="Email Address"
              name="email"
              value={userDataObj.email}
              status={false} // Email cannot be edited natively
              valuesObj={userDataObj}
              setValuesObj={setUserDataOjb}
              icon={<FiMail />}
              isEmail
            />
            <CustomInput
              label="Phone Number"
              name="phoneNumber"
              value={userDataObj.phoneNumber}
              status={allowedEdit}
              valuesObj={userDataObj}
              setValuesObj={setUserDataOjb}
              icon={<FiPhone />}
            />
            <CustomInput
              label="Qualification"
              name="qualification"
              value={userDataObj.qualification}
              status={allowedEdit}
              valuesObj={userDataObj}
              setValuesObj={setUserDataOjb}
              icon={<RiGraduationCapLine />}
            />
            <CustomInput
              label="Experience"
              name="experience"
              value={userDataObj.experience}
              status={allowedEdit}
              valuesObj={userDataObj}
              setValuesObj={setUserDataOjb}
              icon={<IoCalendarOutline />}
            />
            <CustomInput
              label="Date of Birth"
              name="dob"
              type="date"
              value={userDataObj.dob}
              status={allowedEdit}
              valuesObj={userDataObj}
              setValuesObj={setUserDataOjb}
              icon={<BsCake />}
            />

            {/* Resume / CV Field */}
            <div className="mb-4 w-full">
              <label className="block text-[10px] font-semibold text-slate-400 mb-2 ml-1 uppercase tracking-[2px]">
                Resume / CV
              </label>
              <div className={`flex items-center gap-3 w-full border-[1.5px] transition-all duration-300 rounded-2xl p-3 ${allowedEdit ? "border-[#149B9A] bg-white shadow-[0_0_0_4px_rgba(20,155,154,0.08)]" : "border-slate-100 bg-slate-50"}`}>
                <div className="flex bg-slate-100 p-2 rounded-xl text-slate-500">
                  {IMAGES?.pdf ? <img src={IMAGES.pdf} className="w-6 h-6" alt="pdf" /> : <FiAlignLeft className="w-6 h-6" />}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[14px] font-medium text-slate-700 truncate">{selectedPdf?.name || (typeof selectedPdf === 'string' ? "Resume_Uploaded.pdf" : "Resume.pdf")}</p>
                  {selectedPdf?.size && <p className="text-[12px] text-slate-400">{(selectedPdf.size / 1024).toFixed(0) + " KB"}</p>}
                </div>
                {allowedEdit && (
                  <label htmlFor="cvUpload" className="cursor-pointer p-2 bg-[#0B1053] hover:bg-[#0d1a6e] text-white rounded-xl transition-colors">
                    <GoDownload size={18} />
                    <input type="file" id="cvUpload" onChange={(e) => setSelectedPdf(e.target.files[0])} hidden accept=".pdf,.doc,.docx" />
                  </label>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Action Footer ── */}
        {allowedEdit && (
          <div className="flex-shrink-0 px-6 sm:px-7 py-5 bg-slate-50/80 border-t border-slate-100 flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-2 sm:py-3.5 bg-white border-[1.5px] border-slate-200 text-slate-600 rounded-2xl text-[14px] font-semibold hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDetails}
              disabled={loading || updateuserMutation.isPending}
              className={`flex-1 py-3.5 text-white rounded-2xl text-[14px] font-semibold flex items-center justify-center transition-all ${loading || updateuserMutation.isPending ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
              style={{
                background:
                  "linear-gradient(135deg, #0B1053 0%, #149B9A 100%)",
                boxShadow: "0 6px 20px rgba(20,155,154,0.3)",
              }}
            >
              {updateuserMutation.isPending ? (
                <Loader color="white" />
              ) : loading ? (
                "Uploading..."
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails;

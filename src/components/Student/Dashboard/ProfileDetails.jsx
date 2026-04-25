import React, { useRef, useState } from "react";
import Loader from "../../../utils/Loader";
import { toast } from "react-toastify";
import { FiEdit2, FiCamera, FiPhone, FiMail, FiLock, FiUser, FiSave, FiHash } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { FaGraduationCap } from "react-icons/fa6";
import { GoPencil, GoPerson } from "react-icons/go";
import { MdPhone } from "react-icons/md";
import profile from "../../../assets/images/profilepic.png";
import { useUser } from "../../../context/UserContext";
import { updateStudent } from "../../../api/Student/StudentApis";
import IMAGES from "../../../assets/images";
import useClickOutside from "../../../hooks/useClickOutlise";
import { handleProfileImageUpdate } from "../../../utils/Admin/profileImageUtils";

/* ─── Reusable Input Card ─────────────────────────────────────────────── */
const CustomInput = ({
  label,
  value,
  status,
  icon,
  name,
  valuesObj,
  setValuesObj,
  isEmail,
}) => (
  <div className="mb-4 w-full">
    <label className="block text-[10px] font-semibold text-slate-400 mb-2 ml-1 uppercase tracking-[2px]">
      {label}
    </label>
    <div
      className={`flex items-center gap-3 w-full border-[1.5px] transition-all duration-300 rounded-2xl px-4 py-3.5
        ${status && !isEmail
          ? "border-[#007EEA] bg-white shadow-[0_0_0_4px_rgba(0,126,234,0.08)]"
          : "border-slate-100 bg-slate-50"
        }
        ${isEmail ? "opacity-60 cursor-not-allowed" : ""}
      `}
    >
      <span
        className={`text-base flex-shrink-0 ${status && !isEmail ? "text-[#007EEA]" : "text-slate-300"
          }`}
      >
        {icon}
      </span>
      <input
        type="text"
        value={value}
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

/* ─── Main Component ──────────────────────────────────────────────────── */
const ProfileDetails = ({ onclose }) => {
  const { userData, setUserData } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userDataObj, setUserDataObj] = useState({
    name: userData?.name || "",
    email: userData?.email || "",
    phoneNumber: userData?.phoneNumber || "",
    bio: userData?.bio || "",
    profilePic: userData?.profilePic || "",
    levelName: userData?.levelName || "",
    guardianName: userData?.guardianName || "",
    guardianEmail: userData?.guardianEmail || "",
    guardianPhoneNumber: userData?.guardianPhoneNumber || "",
    rollNo: userData?.rollNo || "",
  });

  const modalRef = useRef(null);
  useClickOutside(modalRef, () => {
    onclose();
  });

  React.useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      await handleProfileImageUpdate(
        file,
        (uploadedUrl) => {
          setUserDataObj((prev) => ({ ...prev, profilePic: uploadedUrl }));
        },
        setLoading
      );
    }
  };

  const handleSaveDetails = async () => {
    setLoading(true);
    const data = {
      name: userDataObj.name,
      email: userDataObj.email,
      bio: userDataObj.bio,
      phoneNumber: userDataObj.phoneNumber,
      guardianName: userDataObj.guardianName,
      guardianEmail: userDataObj.guardianEmail,
      guardianPhoneNumber: userDataObj.guardianPhoneNumber,
      className: userDataObj.levelName,
      profilePic: userDataObj.profilePic,
    };
    const response = await updateStudent(data);
    if (response === "error") {
      toast.error("Something went wrong!");
    } else {
      toast.success("Profile updated successfully!");
      await setUserData(response);
      onclose();
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setPreviewUrl(null);
  };

  const initials = (userData?.name || "U").charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

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
              "linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 45%, #007EEA 100%)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-14 -right-14 w-48 h-48 rounded-full"
            style={{ background: "rgba(0,126,234,0.18)" }}
          />
          <div
            className="absolute bottom-4 -left-10 w-36 h-36 rounded-full"
            style={{ background: "rgba(255,255,255,0.04)" }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[3px] uppercase text-[#007EEA] mb-1">
                Account
              </p>
              <h2 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">
                My Profile
              </h2>
            </div>
            <button
              type="button"
              onClick={onclose}
              className="relative z-50 w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
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
        <div className="overflow-y-auto pt-2 flex-1 custom-scrollbar">
          {/* ── Avatar Section ── */}
          <div className="flex flex-col items-center px-3 sm:px-7 pb-2">
            {/* Avatar ring */}
            <div
              className={`p-[3px] rounded-full ${loading ? "animate-pulse" : ""}`}
              style={{
                background:
                  "linear-gradient(135deg, #007EEA, #0a0a1a, #007EEA)",
                boxShadow: "0 8px 32px rgba(0,126,234,0.35)",
              }}
            >
              <div className="bg-white p-[3px] rounded-full relative">
                <img
                  src={previewUrl || userDataObj.profilePic || profile}
                  alt="Profile"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover block"
                />
                {isEditing && (
                  <label
                    className="absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                    style={{
                      background:
                        "linear-gradient(135deg, #007EEA, #0a0a1a)",
                      border: "2px solid #fff",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                    }}
                  >
                    <FiCamera size={14} className="text-white" />
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Name & role */}
            <h3 className="mt-4 text-[20px] sm:text-[22px] font-bold text-slate-800 tracking-tight text-center">
              {userDataObj.name || "Student"}
            </h3>
            <div
              className="mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-[1.8px]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,126,234,0.1), rgba(10,10,26,0.07))",
                border: "1px solid rgba(0,126,234,0.25)",
                color: "#0a0a1a",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "#007EEA" }}
              />
              Student
            </div>

            {/* Edit link */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-[#007EEA] hover:opacity-70 transition-opacity"
              >
                <FiEdit2 size={13} />
                Edit Information
              </button>
            )}
          </div>

          {/* ── Status badge ── */}
          <div
            className="mx-3 sm:mx-7 mt-4 mb-1 px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-[12px] font-medium"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,126,234,0.08), rgba(10,10,26,0.04))",
              border: "1px solid rgba(0,126,234,0.18)",
              color: "#007EEA",
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse"
              style={{ background: "#007EEA" }}
            />
            Account active &nbsp;·&nbsp; {userData?.levelName || "Student"}
          </div>

          {/* ── Bio (only when editing) ── */}
          {isEditing && (
            <div className="px-3 sm:px-7 pt-4">
              <CustomInput
                label="Bio"
                name="bio"
                value={userDataObj.bio}
                status={isEditing}
                valuesObj={userDataObj}
                setValuesObj={setUserDataObj}
                icon={<GoPencil />}
              />
            </div>
          )}

          {/* ── Personal Info Fields ── */}
          <div className="px-3 sm:px-7 pt-4 pb-2">
            <p className="text-[10px] font-semibold text-slate-400 mb-3 ml-1 uppercase tracking-[2px]">Personal Info</p>
            <CustomInput
              label="Full Name"
              name="name"
              value={userDataObj.name}
              status={isEditing}
              valuesObj={userDataObj}
              setValuesObj={setUserDataObj}
              icon={<FiUser />}
            />
            <CustomInput
              label="Roll No."
              name="rollNo"
              value={userDataObj.rollNo}
              status={false}
              valuesObj={userDataObj}
              setValuesObj={setUserDataObj}
              icon={<FiHash />}
              isEmail
            />
            <CustomInput
              label="Email Address"
              name="email"
              value={userDataObj.email}
              status={false}
              valuesObj={userDataObj}
              setValuesObj={setUserDataObj}
              icon={<FiMail />}
              isEmail
            />
            <CustomInput
              label="Phone Number"
              name="phoneNumber"
              value={userDataObj.phoneNumber}
              status={isEditing}
              valuesObj={userDataObj}
              setValuesObj={setUserDataObj}
              icon={<FiPhone />}
            />
            <CustomInput
              label="Level / Class"
              name="levelName"
              value={userDataObj.levelName}
              status={isEditing}
              valuesObj={userDataObj}
              setValuesObj={setUserDataObj}
              icon={<FaGraduationCap />}
            />
          </div>

          {/* ── Guardian Info Fields ── */}
          <div className="px-3 sm:px-7 pt-2 pb-4">
            <p className="text-[10px] font-semibold text-slate-400 mb-3 ml-1 uppercase tracking-[2px]">Guardian Info</p>
            <CustomInput
              label="Parent Name"
              name="guardianName"
              value={userDataObj.guardianName}
              status={isEditing}
              valuesObj={userDataObj}
              setValuesObj={setUserDataObj}
              icon={<FiUser />}
            />
            <CustomInput
              label="Parent Email"
              name="guardianEmail"
              value={userDataObj.guardianEmail}
              status={isEditing}
              valuesObj={userDataObj}
              setValuesObj={setUserDataObj}
              icon={<FiMail />}
            />
            <CustomInput
              label="Parent Phone"
              name="guardianPhoneNumber"
              value={userDataObj.guardianPhoneNumber}
              status={isEditing}
              valuesObj={userDataObj}
              setValuesObj={setUserDataObj}
              icon={<FiPhone />}
            />
          </div>
        </div>

        {/* ── Action Footer ── */}
        {isEditing && (
          <div className="flex-shrink-0 px-6 sm:px-7 py-5 bg-slate-50/80 border-t border-slate-100 flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 py-3.5 bg-white border-[1.5px] border-slate-200 text-slate-600 rounded-2xl text-[14px] font-semibold hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDetails}
              disabled={loading}
              className={`flex-1 py-3.5 text-white rounded-2xl text-[14px] font-semibold flex items-center justify-center gap-2 transition-all ${loading ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5"}`}
              style={{
                background:
                  "linear-gradient(135deg, #0a0a1a 0%, #007EEA 100%)",
                boxShadow: "0 6px 20px rgba(0,126,234,0.3)",
              }}
            >
              {loading ? (
                <Loader color="white" />
              ) : (
                <>
                  <FiSave size={16} /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileDetails;
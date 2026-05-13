import React, { useRef, useState } from "react";
import SuperAdminNavbar from "../../components/SuperAdmin/SuperAdminNavbar";
import {
    IoPersonOutline,
    IoMailOutline,
    IoShieldOutline,
    IoKeyOutline,
    IoSaveOutline,
    IoCameraOutline,
    IoSparklesOutline,
    IoCheckmarkCircleOutline,
    IoLockClosedOutline,
    IoEyeOutline,
    IoEyeOffOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";
import axios from "axios";
import { BACKEND_URL } from "../../constants/api";

const Profile = () => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("tcauser")) || {});
    const [name, setName] = useState(user.name || "");
    const [profilePic, setProfilePic] = useState(user.profilePic || "");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const fileInputRef = useRef(null);

    const getAuthHeaders = () => {
        const u = JSON.parse(localStorage.getItem("tcauser"));
        return { Authorization: `Bearer ${u?.token || ""}` };
    };

    // --- Image Upload ---
    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, PNG, or WEBP images are allowed.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be smaller than 5MB.");
            return;
        }

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await axios.post(`${BACKEND_URL}/media/`, formData, {
                headers: {
                    ...getAuthHeaders(),
                    "Content-Type": "multipart/form-data",
                },
            });

            const imageUrl = res.data?.url || res.data?.fileUrl || res.data;
            if (!imageUrl) throw new Error("No URL returned from upload");

            // Save immediately to profile
            await axios.put(
                `${BACKEND_URL}/user/update`,
                { profilePic: imageUrl },
                { headers: getAuthHeaders() }
            );

            setProfilePic(imageUrl);
            const updated = { ...user, profilePic: imageUrl };
            localStorage.setItem("tcauser", JSON.stringify(updated));
            setUser(updated);
            toast.success("Profile picture updated!");
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to upload image.");
        } finally {
            setUploadingImage(false);
            e.target.value = "";
        }
    };

    // --- Save Profile Info ---
    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        if (newPassword || confirmPassword) {
            if (newPassword.length < 6) {
                toast.error("Password must be at least 6 characters.");
                return;
            }
            if (newPassword !== confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }
        }

        setSavingProfile(true);
        try {
            // Update name
            if (name.trim() && name.trim() !== user.name) {
                await axios.put(
                    `${BACKEND_URL}/user/update`,
                    { name: name.trim() },
                    { headers: getAuthHeaders() }
                );
                const updated = { ...user, name: name.trim() };
                localStorage.setItem("tcauser", JSON.stringify(updated));
                setUser(updated);
            }

            // Update password
            if (newPassword) {
                await axios.put(
                    `${BACKEND_URL}/user/update-password`,
                    { password: newPassword },
                    { headers: getAuthHeaders() }
                );
                setNewPassword("");
                setConfirmPassword("");
            }

            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.message || "Failed to update profile.");
        } finally {
            setSavingProfile(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] font-poppins">
            <SuperAdminNavbar heading="Admin Profile" />

            <main className="mx-auto max-w-5xl p-3 sm:p-6 lg:p-8">
                {/* Hero Header */}
                <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-[#080f4f] p-4 sm:p-8 text-white shadow-2xl shadow-indigo-950/20">
                    <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
                    <div className="absolute -bottom-28 left-10 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
                    <div className="absolute right-14 top-10 hidden h-24 w-24 rounded-full border border-white/10 lg:block" />
                    <div className="absolute right-32 bottom-10 hidden h-14 w-14 rounded-full border border-white/10 lg:block" />

                    <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-100">
                                <IoSparklesOutline className="text-cyan-300" />
                                Super Admin Control Panel
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                                Profile Settings
                            </h1>
                            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-300">
                                Manage your account details and keep your admin credentials secure.
                            </p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest text-white ring-1 ring-white/10">
                            <IoShieldOutline className="text-cyan-300" size={18} />
                            Protected Account
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Profile Card */}
                    <div className="lg:col-span-4">
                        <div className="relative overflow-hidden rounded-[2rem] bg-white p-4 sm:p-6 shadow-sm ring-1 ring-slate-100">
                            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-indigo-100 blur-3xl" />
                            <div className="absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-cyan-100 blur-3xl" />

                            <div className="relative flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="relative group mb-5">
                                    <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-cyan-400 blur-xl opacity-30 group-hover:opacity-50 transition" />

                                    <div className="relative h-24 w-24 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-[#080f4f] via-indigo-700 to-cyan-500 flex items-center justify-center text-4xl font-black text-white ring-4 ring-white shadow-2xl shadow-indigo-900/20">
                                        {profilePic ? (
                                            <img
                                                src={profilePic}
                                                alt="Profile"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            user.name?.[0]?.toUpperCase() || "A"
                                        )}
                                        {uploadingImage && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-[2.5rem]">
                                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Hidden file input */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />

                                    <button
                                        type="button"
                                        onClick={handleImageClick}
                                        disabled={uploadingImage}
                                        title="Change profile picture"
                                        className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-white text-[#080f4f] flex items-center justify-center shadow-xl ring-1 ring-slate-100 transition hover:scale-110 hover:bg-cyan-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <IoCameraOutline size={19} />
                                    </button>
                                </div>

                                <h2 className="text-2xl font-black text-slate-900">
                                    {user.name || "Super Admin"}
                                </h2>

                                <p className="mt-1 text-xs font-black text-indigo-600 uppercase tracking-[0.18em]">
                                    Platform Controller
                                </p>

                                <div className="mt-5 grid w-full grid-cols-1 gap-3">
                                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-left ring-1 ring-slate-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Email
                                        </p>
                                        <p className="mt-1 truncate text-sm font-bold text-slate-700">
                                            {user.email || "admin@example.com"}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-left ring-1 ring-emerald-100">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                            Account Status
                                        </p>
                                        <p className="mt-1 flex items-center gap-2 text-sm font-black text-emerald-700">
                                            <IoCheckmarkCircleOutline />
                                            Active
                                        </p>
                                    </div>
                                </div>

                                <p className="mt-4 text-xs text-slate-400 font-medium">
                                    Click the camera icon to change your photo
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Form Card */}
                    <div className="lg:col-span-8">
                        <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-100">
                            <div className="border-b border-slate-100 bg-gradient-to-r from-white via-indigo-50/50 to-cyan-50/40 px-4 sm:px-8 py-6">
                                <h3 className="text-xl font-black text-slate-900">
                                    Account Information
                                </h3>
                                <p className="mt-1 text-sm font-medium text-slate-500">
                                    Update your profile information below.
                                </p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="p-4 sm:p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Name */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Full Name
                                        </label>
                                        <div className="relative group">
                                            <IoPersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition" />
                                            <input
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Your full name"
                                                className="w-full bg-slate-50 rounded-2xl py-4 pl-12 pr-6 text-sm font-semibold text-slate-700 outline-none border border-transparent focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition"
                                            />
                                        </div>
                                    </div>

                                    {/* Email (read-only) */}
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                readOnly
                                                value={user.email || ""}
                                                className="w-full bg-slate-50 rounded-2xl py-4 pl-12 pr-10 text-sm font-semibold text-slate-500 outline-none border border-transparent cursor-not-allowed opacity-80"
                                            />
                                            <IoLockClosedOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        </div>
                                    </div>
                                </div>

                                {/* Password Section */}
                                <div className="rounded-[1.5rem] bg-slate-50 p-5 sm:p-6 ring-1 ring-slate-100">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center ring-1 ring-indigo-100">
                                            <IoKeyOutline size={22} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black text-slate-900">
                                                Change Password
                                            </h3>
                                            <p className="text-xs font-medium text-slate-400 mt-0.5">
                                                Leave blank if you do not want to update your password.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                                New Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showNewPw ? "text" : "password"}
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className="w-full bg-white rounded-2xl py-4 px-6 pr-12 text-sm font-semibold text-slate-700 outline-none border border-transparent focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100 transition"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPw(!showNewPw)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showNewPw ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                                                Confirm Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showConfirmPw ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="••••••••"
                                                    className={`w-full bg-white rounded-2xl py-4 px-6 pr-12 text-sm font-semibold text-slate-700 outline-none border transition focus:ring-4 focus:ring-indigo-100 ${
                                                        confirmPassword && confirmPassword !== newPassword
                                                            ? "border-rose-300 focus:border-rose-300"
                                                            : "border-transparent focus:border-indigo-300"
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showConfirmPw ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
                                                </button>
                                            </div>
                                            {confirmPassword && confirmPassword !== newPassword && (
                                                <p className="text-xs text-rose-500 font-semibold mt-1">Passwords do not match</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                                    <p className="text-xs font-semibold text-slate-400">
                                        Your email address is read-only for security reasons.
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={savingProfile}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#080f4f] px-8 py-4 text-sm font-black text-white shadow-xl shadow-indigo-900/20 transition hover:-translate-y-0.5 hover:bg-indigo-800 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
                                    >
                                        <IoSaveOutline size={20} />
                                        {savingProfile ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
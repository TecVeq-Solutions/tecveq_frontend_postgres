import React, { useRef, useState } from 'react'
import Loader from '../../../utils/Loader';
import { toast } from 'react-toastify';
import { LuAsterisk } from "react-icons/lu";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation } from '@tanstack/react-query';
import { updateUser } from '../../../api/Admin/UsersApi';
import useClickOutside from '../../../hooks/useClickOutlise';
import { useAdmin } from '../../../context/AdminContext';

/* ─────────────────────────────────────────────
    Reusable Attractive Field Component
───────────────────────────────────────────── */
const InputField = ({ label, req, val, name, setDataObj, type = "text", autoComplete = "off" }) => {
    return (
        <div className="flex flex-col gap-1.5 mb-4">
            <div className="text-[0.8rem] font-semibold text-slate-600 flex items-center gap-1 ml-1">
                {label}
                {req && <LuAsterisk className='text-red-500' size={10} />}
            </div>
            <input
                type={type}
                autoComplete={autoComplete}
                placeholder={`Enter ${label.toLowerCase()}`}
                value={val || ""}
                onChange={(e) => {
                    if (setDataObj) {
                        setDataObj((prev) => ({ ...prev, [name]: e.target.value }));
                    }
                }}
                className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-[0.9rem] text-slate-800 outline-none w-full transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 shadow-sm"
            />
        </div>
    )
}

const EditUserModal = ({ closeModal, refetch, data }) => {
    const ref = useRef(null);
    const { allLevels } = useAdmin();

    useClickOutside(ref, closeModal);

    const [userObj, setUsrObj] = useState({
        name: data.name || "",
        email: data.email || "",
        rollNo: data.rollNo || "",
        phoneNumber: data.phoneNumber || "",
        gender: data.gender || "",
        guardianPhoneNumber: data.guardianPhoneNumber || "",
        guardianEmail: data.guardianEmail || "",
        guardianName: data.guardianName || "",
        referenceNo: data.referenceNo || "",
        levelID: data.levelID || "",
        password: "",
        confirmPassword: ""
    });

    const handleUpdateUser = async () => {
        if (userObj.password !== userObj.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        mutation.mutate(userObj);
    }

    const mutation = useMutation({
        mutationFn: async (updateData) => {
            let result = await updateUser(updateData, data.id);
            await refetch();
            toast.success(`User updated successfully!`);
            return result;
        },
        onSettled: async () => {
            closeModal();
        }
    });

    if (mutation.error) return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-white/80 backdrop-blur-md">
            <div className="text-center p-8 bg-white shadow-xl rounded-2xl border border-red-100">
                <p className="text-2xl font-bold text-red-500">Error Occurred</p>
                <button onClick={closeModal} className="mt-4 text-indigo-600 font-semibold underline">Go Back</button>
            </div>
        </div>
    )

    return (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
            {/* Backdrop with Blur */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={closeModal}
            />

            {/* Panel */}
            <div
                ref={ref}
                className="w-full sm:w-[450px] h-full bg-slate-50 text-slate-800 flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-500 ease-out z-10"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-7 bg-white border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Edit Profile</h2>
                        <p className="text-sm text-slate-500 mt-1">Update {data.userType}'s information</p>
                    </div>
                    <button
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={closeModal}
                    >
                        <IoCloseSharp size={24} />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-7 custom-scrollbar">
                    <div className="space-y-8">

                        {/* Section: Account Context */}
                        <div className="flex items-center gap-3.5 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                            <div className="w-11 h-11 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
                                {data.userType?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-[0.9rem] text-slate-900">{userObj.name || "User Profile"}</p>
                                <p className="text-[0.72rem] text-indigo-600 font-bold uppercase tracking-widest">{data.userType} Account</p>
                            </div>
                            <span className="ml-auto bg-green-50 border border-green-100 text-green-600 rounded-full text-[0.65rem] px-2.5 py-0.5 font-bold">
                                Editing
                            </span>
                        </div>

                        {/* Form Section */}
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                    <p className="text-sm font-bold text-slate-800">Basic Information</p>
                                </div>
                                <InputField label="Name" val={userObj.name} name="name" setDataObj={setUsrObj} />
                                <InputField label="Email" val={userObj.email} name="email" setDataObj={setUsrObj} />

                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Phone No." val={userObj.phoneNumber} name="phoneNumber" setDataObj={setUsrObj} />
                                    <InputField label="Reference No" val={userObj.referenceNo} name="referenceNo" setDataObj={setUsrObj} />
                                </div>

                                <div className="flex flex-col gap-1.5 mb-4">
                                    <div className="text-[0.8rem] font-semibold text-slate-600 ml-1">Gender</div>
                                    <select
                                        value={userObj.gender || ""}
                                        onChange={(e) => setUsrObj({ ...userObj, gender: e.target.value })}
                                        className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-[0.9rem] text-slate-800 outline-none w-full transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm appearance-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            {/* Student Specific Fields */}
                            {data.userType === "student" && (
                                <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                        <p className="text-sm font-bold text-slate-800">Academic & Guardian Info</p>
                                    </div>
                                    <InputField label="Roll No." val={userObj.rollNo} name="rollNo" setDataObj={setUsrObj} />

                                    <div className="flex flex-col gap-1.5 mb-6">
                                        <div className="text-[0.8rem] font-semibold text-slate-600 ml-1">Enroll in</div>
                                        <select
                                            value={userObj.levelID || ""}
                                            onChange={(e) => setUsrObj({ ...userObj, levelID: e.target.value })}
                                            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-[0.9rem] text-slate-800 outline-none w-full transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
                                        >
                                            <option value="" disabled hidden>Select Level</option>
                                            {allLevels.map((item) => (
                                                <option key={item.id} value={item.id}>
                                                    {item.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-4 bg-slate-200/30 p-4 rounded-2xl">
                                        <InputField label="Guardian Name" val={userObj.guardianName} name="guardianName" setDataObj={setUsrObj} />
                                        <InputField label="Guardian Email" val={userObj.guardianEmail} name="guardianEmail" setDataObj={setUsrObj} />
                                        <InputField label="Guardian Phone No." val={userObj.guardianPhoneNumber} name="guardianPhoneNumber" setDataObj={setUsrObj} />
                                    </div>
                                </div>
                            )}

                            {/* Security Section */}
                            <div className="pt-2 border-t border-slate-200 pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-1 h-4 bg-red-400 rounded-full"></span>
                                    <p className="text-sm font-bold text-slate-800">Security (Optional)</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <InputField label="New Password" val={userObj.password} name="password" setDataObj={setUsrObj} type="password" autoComplete="new-password" />
                                    <InputField label="Confirm Password" val={userObj.confirmPassword} name="confirmPassword" setDataObj={setUsrObj} type="password" autoComplete="new-password" />
                                </div>
                                <p className="text-[0.65rem] text-slate-400 ml-1 mt-[-8px]">Leave blank if you don't want to change password.</p>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="sticky bottom-0 bg-slate-50 pt-4 pb-2">
                            {mutation.isPending ? (
                                <div className="flex justify-center py-4"><Loader /></div>
                            ) : (
                                <button
                                    onClick={handleUpdateUser}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 transform transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Save Changes
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditUserModal;
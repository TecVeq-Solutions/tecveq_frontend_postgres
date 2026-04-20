import React, { useRef, useState } from 'react';
import Loader from '../../../utils/Loader';
import { toast } from 'react-toastify';
import { FaAsterisk, FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';
import { IoCloseSharp } from "react-icons/io5";
import { default_profile } from '../../../constants/api';
import { useAdmin } from '../../../context/AdminContext';
import { registerStudent } from '../../../api/Student/StudentApis';
import { emailPattern, namePattern } from '../../../constants/pattern';
import useClickOutside from '../../../hooks/useClickOutlise';

/* ─────────────────────────────────────────────
    Sub-components
───────────────────────────────────────────── */
const Field = ({ label, required, children }) => (
    <div className="flex flex-col gap-1.5 mb-4">
        <div className="text-[0.8rem] font-semibold text-slate-600 flex items-center gap-1 ml-1">
            {label}
            {required && <FaAsterisk size={6} className="text-red-500" />}
        </div>
        {children}
    </div>
);

const CustomInput = ({ label, placeholder, type, required = false, name, defaultValue }) => (
    <Field label={label} required={required}>
        <input
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-[0.9rem] text-slate-800 outline-none w-full transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 shadow-sm"
            required={required}
            type={type}
            placeholder={placeholder}
            name={name}
            defaultValue={defaultValue}
            onChange={(e) => {
                const formData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');
                formData[name] = e.target.value;
                localStorage.setItem('addUserFormData', JSON.stringify(formData));
            }}
        />
    </Field>
);

const GenderSelect = ({ defaultValue }) => (
    <Field label="Gender" required>
        <select
            name="gender"
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-[0.9rem] text-slate-800 outline-none w-full transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm appearance-none"
            required
            defaultValue={defaultValue}
            onChange={(e) => {
                const formData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');
                formData['gender'] = e.target.value;
                localStorage.setItem('addUserFormData', JSON.stringify(formData));
            }}
        >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
        </select>
    </Field>
);

const LevelSelectable = ({ alllevels, defaultValue }) => (
    <Field label="Enroll In" required>
        <select
            name="levelID"
            defaultValue={defaultValue}
            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-[0.9rem] text-slate-800 outline-none w-full transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm"
            onChange={(e) => {
                const formData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');
                formData['levelID'] = e.target.value;
                localStorage.setItem('addUserFormData', JSON.stringify(formData));
            }}
        >
            <option value="">Select a Level</option>
            {alllevels?.map((item) => (
                <option key={item.id} value={JSON.stringify(item)}>{item.name}</option>
            ))}
        </select>
    </Field>
);

/* ─────────────────────────────────────────────
    Main component
───────────────────────────────────────────── */
const AddUserModal = ({ closeModal, refetch }) => {
    const { allLevels } = useAdmin();
    const [role, setRole] = useState(() => {
        const formData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');
        return formData.role || "student";
    });
    const [loading, setLoading] = useState(false);
    const initialFormData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');

    const modalRef = useRef(null);
    useClickOutside(modalRef, closeModal);

    const roleIcon = {
        student: <FaUserGraduate className="text-lg" />,
        teacher: <FaChalkboardTeacher className="text-lg" />
    };
    const roleLabel = { student: 'Student', teacher: 'Teacher' };

    const handleRoleChange = (r) => {
        setRole(r);
        const formData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');
        formData['role'] = r;
        localStorage.setItem('addUserFormData', JSON.stringify(formData));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const elements = e.target.elements;
        try {
            let dataBody = {};
            const name = elements.name.value;
            const email = elements.email.value;
            const password = elements.password.value;
            const confirmPassword = elements.confirmPassword.value;

            if (!namePattern.test(name)) return toast.error("Name cannot have digits or special characters.");
            if (!emailPattern.test(email)) return toast.error("Invalid Email!");
            if (password.length < 6) return toast.error("Password must be at least 6 characters.");
            if (confirmPassword !== password) return toast.error("Passwords do not match!");

            if (role === "student") {
                const levelDataRaw = elements.levelID.value;
                if (!levelDataRaw) return toast.error("Please select a level.");
                const levelData = JSON.parse(levelDataRaw);

                dataBody = {
                    userType: role, name, email,
                    rollNo: elements.rollNo.value, referenceNo: elements.referenceNo.value,
                    gender: elements.gender.value, bio: elements.bio.value,
                    phoneNumber: elements.phoneNumber.value, levelID: levelData.id,
                    isAccepted: true, guardianName: elements.guardianName.value,
                    guardianEmail: elements.guardianEmail.value,
                    guardianPhoneNumber: elements.guardianPhoneNumber.value,
                    password, profilePic: default_profile,
                };
            } else {
                dataBody = {
                    userType: role, name, email, bio: elements.bio.value,
                    phoneNumber: elements.phoneNumber.value, gender: elements.gender.value,
                    referenceNo: elements.referenceNo.value, isAccepted: true,
                    password, profilePic: default_profile,
                };
            }

            const response = await registerStudent(dataBody);
            if (response?.id) {
                toast.success("User added successfully!");
                localStorage.removeItem('addUserFormData');
                await refetch();
                closeModal();
            } else throw new Error("Failed to register user.");
        } catch (error) {
            toast.error(error.message || "Cannot add the user!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
            {/* Backdrop with Blur */}
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                onClick={closeModal}
            />

            {/* Panel */}
            <div
                ref={modalRef}
                className="w-full sm:w-[450px] h-full bg-slate-50 text-slate-800 flex flex-col shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-500 ease-out z-10"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-7 bg-white border-b border-slate-200">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h2>
                        <p className="text-sm text-slate-500 mt-1">Setup a new portal user</p>
                    </div>
                    <button
                        className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={closeModal}
                    >
                        <IoCloseSharp size={24} />
                    </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-7 custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Account Type Tabs */}
                        <div>
                            <p className="text-[0.7rem] font-bold uppercase tracking-widest text-indigo-600 mb-3 ml-1">Select Role</p>
                            <div className="flex p-1.5 bg-slate-200/50 rounded-2xl gap-2">
                                {['student', 'teacher'].map(r => (
                                    <button
                                        key={r} type="button"
                                        onClick={() => handleRoleChange(r)}
                                        className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all ${role === r
                                            ? 'bg-white text-indigo-600 shadow-md transform scale-[1.02]'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {roleIcon[r]} {roleLabel[r]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Section: Personal Info */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                    <p className="text-sm font-bold text-slate-800">Personal Information</p>
                                </div>
                                <CustomInput label="Full Name" type="text" placeholder="John Doe" required name="name" defaultValue={initialFormData.name} />
                                <CustomInput label="Email Address" type="email" placeholder="john@example.com" required name="email" defaultValue={initialFormData.email} />
                                <div className="grid grid-cols-2 gap-4">
                                    <GenderSelect defaultValue={initialFormData.gender} />
                                    <CustomInput label="Phone Number" type="text" placeholder="+1..." required name="phoneNumber" defaultValue={initialFormData.phoneNumber} />
                                </div>
                                <CustomInput label="Short Bio" type="text" placeholder="A brief description..." name="bio" defaultValue={initialFormData.bio} />
                            </div>

                            {/* Section: Academic/Professional */}
                            {role === "student" ? (
                                <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                        <p className="text-sm font-bold text-slate-800">Academic Details</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <CustomInput label="Roll Number" type="text" placeholder="Roll No" required name="rollNo" defaultValue={initialFormData.rollNo} />
                                        <CustomInput label="Reference" type="text" placeholder="Ref No" name="referenceNo" defaultValue={initialFormData.referenceNo} />
                                    </div>
                                    <LevelSelectable alllevels={allLevels} defaultValue={initialFormData.levelID} />

                                    <div className="mt-6 border-t border-slate-200 pt-6">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                            <p className="text-sm font-bold text-slate-800">Guardian Details</p>
                                        </div>
                                        <CustomInput label="Guardian Name" type="text" placeholder="Full Name" required name="guardianName" defaultValue={initialFormData.guardianName} />
                                        <CustomInput label="Guardian Email" type="email" placeholder="Email" required name="guardianEmail" defaultValue={initialFormData.guardianEmail} />
                                        <CustomInput label="Guardian Phone" type="text" placeholder="Phone" required name="guardianPhoneNumber" defaultValue={initialFormData.guardianPhoneNumber} />
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-2">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                        <p className="text-sm font-bold text-slate-800">Professional Details</p>
                                    </div>
                                    <CustomInput label="Reference Number" type="text" placeholder="EMP-123" name="referenceNo" defaultValue={initialFormData.referenceNo} />
                                </div>
                            )}

                            {/* Section: Security */}
                            <div className="pt-2 border-t border-slate-200 pt-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                                    <p className="text-sm font-bold text-slate-800">Security & Password</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <CustomInput label="Password" type="password" placeholder="••••••••" required name="password" defaultValue={initialFormData.password} />
                                    <CustomInput label="Confirm" type="password" placeholder="••••••••" required name="confirmPassword" defaultValue={initialFormData.confirmPassword} />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="sticky bottom-0 bg-slate-50 pt-4 pb-2">
                            {loading ? (
                                <div className="flex justify-center py-4"><Loader /></div>
                            ) : (
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-200 transform transition-all active:scale-[0.98]"
                                >
                                    Confirm & Create {roleLabel[role]}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUserModal;
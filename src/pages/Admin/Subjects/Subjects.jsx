import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import SubjectModal from "../../../components/Admin/Subjects/SubjectModal";

import { toast } from "react-toastify";
import { BiSearch } from "react-icons/bi";
import { HiOutlineBookOpen, HiOutlineAcademicCap, HiPlus } from "react-icons/hi";
import { MdOutlineDelete, MdOutlineEdit } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { useAdmin } from "../../../context/AdminContext";
import { deleteSubject } from "../../../api/Admin/SubjectsApi";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const PALETTE = [
    { accent: "#5B5EF4", light: "#EEEEFF", text: "#3D40CC", dot: "#5B5EF4", cardBg: "#F8F8FF" },
    { accent: "#10B981", light: "#ECFDF5", text: "#065F46", dot: "#10B981", cardBg: "#F0FDF9" },
    { accent: "#F59E0B", light: "#FFFBEB", text: "#92400E", dot: "#F59E0B", cardBg: "#FFFDF0" },
    { accent: "#F43F5E", light: "#FFF1F2", text: "#BE123C", dot: "#F43F5E", cardBg: "#FFF5F6" },
    { accent: "#8B5CF6", light: "#F5F3FF", text: "#6D28D9", dot: "#8B5CF6", cardBg: "#FAF8FF" },
    { accent: "#06B6D4", light: "#ECFEFF", text: "#155E75", dot: "#06B6D4", cardBg: "#F0FDFF" },
];

// ─── SubjectCard ──────────────────────────────────────────────────────────────
const SubjectCard = ({ subject, colorPalette, onEdit, onDelete }) => {
    const [hovered, setHovered] = useState(false);
    const c = colorPalette;

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group flex items-center justify-between gap-[10px] p-[14px_16px] rounded-[14px] border transition-all duration-[0.18s] ease-in-out cursor-default relative overflow-hidden"
            style={{
                background: hovered ? c.cardBg : "#FFFFFF",
                borderColor: hovered ? `${c.accent}55` : "#E4E7F0",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.08)" : "none",
            }}
        >
            {/* Left accent bar */}
            <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-[2px_0_0_2px] transition-opacity duration-[0.18s] ease-in-out"
                style={{
                    background: c.accent,
                    opacity: hovered ? 1 : 0,
                }}
            />

            {/* Card Left */}
            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0"
                    style={{ background: c.light }}
                >
                    <HiOutlineBookOpen size={19} color={c.accent} />
                </div>
                <div className="min-w-0">
                    <p className="m-0 font-semibold text-sm text-[#0D1117] whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px] font-['Sora']">
                        {subject.name}
                    </p>
                    <span
                        className="inline-block mt-1 text-[11px] font-semibold px-[9px] py-[2px] rounded-[20px] tracking-[0.2px]"
                        style={{ background: c.light, color: c.text }}
                    >
                        {subject.levelName}
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-[5px] shrink-0">
                <ActionBtn
                    onClick={() => onEdit(subject)}
                    hoverBg="#EEF0FF"
                    hoverBorder="#9B9EF8"
                    hoverColor="#5B5EF4"
                    icon={<MdOutlineEdit size={14} />}
                />
                <ActionBtn
                    onClick={() => onDelete(subject.id)}
                    hoverBg="#FFF1F2"
                    hoverBorder="#FCA5A5"
                    hoverColor="#F43F5E"
                    icon={<MdOutlineDelete size={14} />}
                />
            </div>
        </div>
    );
};

// ─── ActionBtn ────────────────────────────────────────────────────────────────
const ActionBtn = ({ onClick, icon, hoverBg, hoverBorder, hoverColor }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-8 h-8 rounded-[9px] border bg-[#F7F8FC] flex items-center justify-center cursor-pointer transition-all duration-[0.15s] ease-in-out"
            style={{
                borderColor: hovered ? hoverBorder : "#E4E7F0",
                background: hovered ? hoverBg : "#F7F8FC",
                color: hovered ? hoverColor : "#8B95B0",
            }}
        >
            {icon}
        </button>
    );
};

// ─── LevelGroup ───────────────────────────────────────────────────────────────
const LevelGroup = ({ levelName, subjects, onEdit, onDelete, colorIndex }) => {
    const c = PALETTE[colorIndex % PALETTE.length];
    return (
        <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-3.5">
                <div
                    className="w-[9px] h-[9px] rounded-full shrink-0"
                    style={{ background: c.dot }}
                />
                <span className="font-['Sora'] text-xs font-bold text-[#5A6480] uppercase tracking-[0.9px]">
                    {levelName}
                </span>
                <span
                    className="text-[11px] font-bold px-2.5 py-[3px] rounded-[20px]"
                    style={{ background: c.light, color: c.text }}
                >
                    {subjects.length} subject{subjects.length !== 1 ? "s" : ""}
                </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2.5">
                {subjects.map((subject) => (
                    <SubjectCard
                        key={subject.id}
                        subject={subject}
                        colorPalette={c}
                        onEdit={onEdit}
                        onDelete={() => onDelete(subject.id, subject.name)}
                    />
                ))}
            </div>
        </div>
    );
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
const StatCard = ({ iconBg, iconColor, Icon, label, value }) => (
    <div className="bg-white border border-[#E4E7F0] rounded-[14px] p-[16px_18px] flex items-center gap-3.5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div
            className="w-[42px] h-[42px] rounded-xl flex items-center justify-center shrink-0"
            style={{ background: iconBg }}
        >
            <Icon size={20} color={iconColor} />
        </div>
        <div>
            <p className="m-0 text-[11px] text-[#8B95B0] font-semibold uppercase tracking-[0.6px]">
                {label}
            </p>
            <p className="m-0 text-[26px] font-bold text-[#0D1117] font-['Sora'] leading-[1.1]">
                {value}
            </p>
        </div>
    </div>
);

// ─── DeleteConfirmationModal ──────────────────────────────────────────────────
const DeleteConfirmationModal = ({ isOpen, onCancel, onConfirm, subjectName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />

            {/* Modal Content */}
            <div className="relative bg-white w-full  max-w-[400px] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 sm:p-8 overflow-hidden">
                {/* Warning Icon Header */}
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-[#FFF1F2] flex items-center justify-center text-[#F43F5E]">
                        <MdOutlineDelete size={32} />
                    </div>
                </div>

                <h3 className="text-xl font-bold text-[#0D1117] text-center font-['Sora'] mb-2">
                    Delete Subject?
                </h3>

                <p className="text-sm text-[#5A6480] text-center leading-relaxed mb-8">
                    Are you sure you want to delete <span className="font-bold text-[#0D1117]">"{subjectName}"</span>? <br />
                    All related assignments, quizzes, and classes will be removed permanently.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className="w-full py-3.5 rounded-xl bg-[#F43F5E] text-white font-bold text-sm transition-all hover:bg-[#E11D48] active:scale-[0.98] shadow-lg shadow-[#F43F5E]/20"
                    >
                        Yes, Delete Subject
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-3.5 rounded-xl bg-[#F7F8FC] text-[#5A6480] font-bold text-sm transition-all hover:bg-[#EEF0FF] hover:text-[#5B5EF4] active:scale-[0.98]"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Subjects = () => {
    const [editData, setEditData] = useState({});
    const [editMenu, setEditMenu] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [createSubjectModal, setCreateSubjectModal] = useState(false);

    const { isBlurred, toggleBlur } = useBlur();
    const { allSubjects, subjectsRefetch, subjectsIsPending, allLevels, levelsRefetch } = useAdmin();

    const onAddSubject = () => {
        setCreateSubjectModal(!createSubjectModal);
        toggleBlur();
    };

    const onEditSubject = (data) => {
        setEditMenu(true);
        setEditData(data);
        toggleBlur();
    };

    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" });

    const subjectDellMutate = useMutation({
        mutationFn: async (id) => await deleteSubject(id),
        onSuccess: async () => {
            await subjectsRefetch();
            toast.success("Subject deleted successfully");
            setDeleteModal({ open: false, id: null, name: "" });
            if (isBlurred) toggleBlur();
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.message || error.response?.data || "Failed to delete subject";
            toast.error(errorMsg);
            setDeleteModal({ open: false, id: null, name: "" });
            if (isBlurred) toggleBlur();
        }
    });

    const handleDeleteSubject = (id, name) => {
        setDeleteModal({ open: true, id, name });
        toggleBlur();
    };

    const confirmDelete = () => {
        subjectDellMutate.mutate(deleteModal.id);
    };

    const cancelDelete = () => {
        setDeleteModal({ open: false, id: null, name: "" });
        toggleBlur();
    };

    useEffect(() => {
        subjectsRefetch();
        levelsRefetch();
    }, []);

    const filteredSubjects = searchText
        ? allSubjects?.filter(
            (s) =>
                s.name.toLowerCase().includes(searchText.toLowerCase()) ||
                s.levelName.toLowerCase().includes(searchText.toLowerCase())
        )
        : allSubjects;

    const grouped = {};
    filteredSubjects?.forEach((subject) => {
        if (!grouped[subject.levelName]) grouped[subject.levelName] = [];
        grouped[subject.levelName].push(subject);
    });
    const levelKeys = Object.keys(grouped);
    const totalSubjects = filteredSubjects?.length || 0;
    const totalLevels = levelKeys.length;

    if (subjectsIsPending) {
        return (
            <div className="flex flex-1">
                <Loader />
            </div>
        );
    }

    return (
        <>
            {/* Google Font */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');`}</style>

            <div className="flex flex-1 bg-[#F3F4F6] font-['DM_Sans',sans-serif] min-h-screen">
                <div className="flex-1">
                    <div className=" min-h-screen  px-3  lg:px-10 lg:ml-80 box-border">
                        <Navbar heading={"Subjects"} />

                        <div
                            className="transition-all duration-200"
                            style={{ filter: isBlurred ? "blur(4px)" : "none" }}
                        >
                            {/* Page Header */}
                            <div className="mb-6 mt-1">
                                <p className="m-0 text-[13px] text-[#8B95B0]">
                                    Manage subjects across all class levels
                                </p>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mb-6">
                                <StatCard
                                    iconBg="#EEEEFF"
                                    iconColor="#5B5EF4"
                                    Icon={HiOutlineBookOpen}
                                    label="Total Subjects"
                                    value={totalSubjects}
                                />
                                <StatCard
                                    iconBg="#ECFDF5"
                                    iconColor="#10B981"
                                    Icon={HiOutlineAcademicCap}
                                    label="Levels"
                                    value={totalLevels}
                                />
                            </div>

                            {/* Search + Add */}
                            <div className="flex items-center justify-between gap-3 flex-wrap mb-7">
                                {/* Search */}
                                <div className="flex items-center gap-[9px] bg-white border border-[#E4E7F0] rounded-[10px] p-[9px_14px] flex-1 min-w-[200px] max-w-[360px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150">
                                    <BiSearch size={16} color="#8B95B0" className="shrink-0" />
                                    <input
                                        type="text"
                                        value={searchText}
                                        placeholder="Search subjects or levels…"
                                        onChange={(e) => setSearchText(e.target.value)}
                                        className="border-none outline-none bg-transparent text-sm text-[#0D1117] w-full font-inherit"
                                    />
                                </div>

                                {/* Add Button */}
                                <AddButton onClick={onAddSubject} />
                            </div>

                            {/* Content */}
                            <div className="pb-10">
                                {totalSubjects === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-5 gap-3">
                                        <div className="w-[68px] h-[68px] rounded-[20px] bg-[#EEEEFF] flex items-center justify-center">
                                            <HiOutlineBookOpen size={28} color="#5B5EF4" />
                                        </div>
                                        <p className="m-0 text-base font-semibold text-[#0D1117] font-['Sora']">
                                            {searchText ? "No results found" : "No subjects yet"}
                                        </p>
                                        <p className="m-0 text-sm text-[#8B95B0]">
                                            {searchText ? "Try a different search term" : "Click 'Add Subject' to get started"}
                                        </p>
                                    </div>
                                ) : (
                                    levelKeys.map((levelName, idx) => (
                                        <LevelGroup
                                            key={levelName}
                                            levelName={levelName}
                                            subjects={grouped[levelName]}
                                            onEdit={onEditSubject}
                                            onDelete={handleDeleteSubject}
                                            colorIndex={idx}
                                        />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <SubjectModal
                allLevels={allLevels}
                refetch={subjectsRefetch}
                open={createSubjectModal}
                setopen={setCreateSubjectModal}
            />

            {/* Edit Modal */}
            {editMenu && (
                <SubjectModal
                    allLevels={allLevels}
                    isEditTrue={true}
                    subjectData={editData}
                    refetch={subjectsRefetch}
                    open={editMenu}
                    setopen={setEditMenu}
                />
            )}

            {/* Custom Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.open}
                subjectName={deleteModal.name}
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
            />
        </>
    );
};

// ─── AddButton (separate to handle hover state cleanly) ───────────────────────
const AddButton = ({ onClick }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="flex items-center gap-2 text-white border-none rounded-[10px] p-[10px_20px] text-sm font-semibold cursor-pointer shrink-0 transition-all duration-[0.15s] ease-in-out font-inherit tracking-[0.1px]"
            style={{
                background: hovered ? "#3D40CC" : "#5B5EF4",
                boxShadow: hovered
                    ? "0 6px 20px rgba(91,94,244,0.5)"
                    : "0 4px 14px rgba(91,94,244,0.35)",
                transform: hovered ? "translateY(-1px)" : "translateY(0)",
            }}
        >
            <HiPlus size={18} />
            Add Subject
        </button>
    );
};

export default Subjects;
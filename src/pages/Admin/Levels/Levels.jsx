import React, { useEffect, useState, useMemo } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import LevelModal from "../../../components/Admin/Levels/LevelModal";

import { toast } from "react-toastify";
import { BiSearch } from "react-icons/bi";
import { HiOutlineAcademicCap, HiPlus } from "react-icons/hi";
import { MdOutlineDelete, MdOutlineEdit } from "react-icons/md";
import { TbStack2 } from "react-icons/tb";
import { useMutation } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { useAdmin } from "../../../context/AdminContext";
import { deleteLevel } from "../../../api/Admin/LevelsApi";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const PALETTE = [
    { accent: "#5B5EF4", light: "#EEEEFF", text: "#3D40CC", dot: "#5B5EF4", cardBg: "#F8F8FF" },
    { accent: "#10B981", light: "#ECFDF5", text: "#065F46", dot: "#10B981", cardBg: "#F0FDF9" },
    { accent: "#F59E0B", light: "#FFFBEB", text: "#92400E", dot: "#F59E0B", cardBg: "#FFFDF0" },
    { accent: "#F43F5E", light: "#FFF1F2", text: "#BE123C", dot: "#F43F5E", cardBg: "#FFF5F6" },
    { accent: "#8B5CF6", light: "#F5F3FF", text: "#6D28D9", dot: "#8B5CF6", cardBg: "#FAF8FF" },
    { accent: "#06B6D4", light: "#ECFEFF", text: "#155E75", dot: "#06B6D4", cardBg: "#F0FDFF" },
];

// ─── ActionBtn ────────────────────────────────────────────────────────────────
const ActionBtn = ({ onClick, icon, hoverBg, hoverBorder, hoverColor }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
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

// ─── LevelCard ────────────────────────────────────────────────────────────────
const LevelCard = ({ level, index, onEdit, onDelete }) => {
    const [hovered, setHovered] = useState(false);
    const c = PALETTE[index % PALETTE.length];

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
            <div
                className="absolute left-0 top-0 bottom-0 w-[3px] rounded-[2px_0_0_2px] transition-opacity duration-[0.18s] ease-in-out"
                style={{ background: c.accent, opacity: hovered ? 1 : 0 }}
            />

            <div className="flex items-center gap-3 min-w-0">
                <div
                    className="w-10 h-10 rounded-[11px] flex items-center justify-center shrink-0"
                    style={{ background: c.light }}
                >
                    <HiOutlineAcademicCap size={19} color={c.accent} />
                </div>

                <div className="min-w-0">
                    <p
                        className="m-0 font-semibold text-sm text-[#0D1117] whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                        {level.name}
                    </p>

                    <span
                        className="inline-block mt-1 text-[11px] font-semibold px-[9px] py-[2px] rounded-md sm:rounded-[20px] tracking-[0.2px] font-mono break-all"
                        style={{ background: c.light, color: c.text }}
                    >
                        {level.id ?? "—"}
                    </span>
                </div>
            </div>

            <div className="flex gap-[5px] shrink-0">
                <ActionBtn
                    onClick={() => onEdit(level)}
                    hoverBg="#EEF0FF"
                    hoverBorder="#9B9EF8"
                    hoverColor="#5B5EF4"
                    icon={<MdOutlineEdit size={14} />}
                />

                <ActionBtn
                    onClick={() => onDelete(level.id, level.name)}
                    hoverBg="#FFF1F2"
                    hoverBorder="#FCA5A5"
                    hoverColor="#F43F5E"
                    icon={<MdOutlineDelete size={14} />}
                />
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

            <p
                className="m-0 text-[26px] font-bold text-[#0D1117] leading-[1.1]"
                style={{ fontFamily: "'Sora', sans-serif" }}
            >
                {value}
            </p>
        </div>
    </div>
);

// ─── DeleteConfirmationModal ──────────────────────────────────────────────────
const DeleteConfirmationModal = ({ isOpen, onCancel, onConfirm, levelName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />

            <div className="relative bg-white w-full max-w-[400px] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-6 sm:p-8 overflow-hidden">
                <div className="flex justify-center mb-5">
                    <div className="w-16 h-16 rounded-full bg-[#FFF1F2] flex items-center justify-center text-[#F43F5E]">
                        <MdOutlineDelete size={32} />
                    </div>
                </div>

                <h3
                    className="text-xl font-bold text-[#0D1117] text-center mb-2"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                >
                    Delete Level?
                </h3>

                <p className="text-sm text-[#5A6480] text-center leading-relaxed mb-8">
                    Are you sure you want to delete{" "}
                    <span className="font-bold text-[#0D1117]">"{levelName}"</span>?<br />
                    This action cannot be undone and may affect associated classes.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className="w-full py-3.5 rounded-xl bg-[#F43F5E] text-white font-bold text-sm transition-all hover:bg-[#E11D48] active:scale-[0.98] shadow-lg shadow-[#F43F5E]/20"
                    >
                        Yes, Delete Level
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

// ─── AddButton ────────────────────────────────────────────────────────────────
const AddButton = ({ onClick }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="flex items-center justify-center gap-2 text-white border-none rounded-[10px] px-5 py-[10px] text-sm font-semibold cursor-pointer shrink-0 transition-all duration-[0.15s] ease-in-out tracking-[0.1px] w-full sm:w-auto"
            style={{
                background: hovered ? "#3D40CC" : "#5B5EF4",
                boxShadow: hovered
                    ? "0 6px 20px rgba(91,94,244,0.5)"
                    : "0 4px 14px rgba(91,94,244,0.35)",
                transform: hovered ? "translateY(-1px)" : "translateY(0)",
            }}
        >
            <HiPlus size={18} />
            Add Level
        </button>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const Levels = () => {
    const [editData, setEditData] = useState({});
    const [editMenu, setEditMenu] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [createLevelModal, setCreateLevelModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: "" });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(2);

    const { isBlurred, toggleBlur } = useBlur();
    const { allLevels, levelsRefetch, levelIsPending } = useAdmin();

    useEffect(() => {
        levelsRefetch();
    }, []);

    const onAddLevel = () => {
        setCreateLevelModal(!createLevelModal);
        toggleBlur();
    };

    // LevelModal expects levelData.levelName and levelData.levelId
    const onEditLevel = (level) => {
        setEditMenu(true);
        setEditData({ levelName: level.name, levelId: level.id });
        toggleBlur();
    };

    const levelDellMutate = useMutation({
        mutationFn: async (id) => await deleteLevel(id),
        onSettled: async () => {
            await levelsRefetch();
            toast.success("Level deleted successfully");
            setDeleteModal({ open: false, id: null, name: "" });

            if (isBlurred) toggleBlur();
        },
    });

    const handleDeleteLevel = (id, name) => {
        setDeleteModal({ open: true, id, name });
        toggleBlur();
    };

    const confirmDelete = () => {
        levelDellMutate.mutate(deleteModal.id);
    };

    const cancelDelete = () => {
        setDeleteModal({ open: false, id: null, name: "" });
        toggleBlur();
    };

    const filteredLevels = useMemo(() => {
        if (!allLevels) return [];

        return allLevels.filter((lvl) =>
            lvl.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [allLevels, searchText]);

    const totalPages = Math.ceil(filteredLevels.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;

    const paginatedLevels = filteredLevels.slice(
        startIndex,
        startIndex + rowsPerPage
    );

    if (levelIsPending || levelDellMutate?.isPending) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#F3F4F6]">
                <Loader />
            </div>
        );
    }

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');
            `}</style>

            <div
                className="flex flex-1 bg-[#F3F4F6] min-h-screen"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                <div className="flex-1 min-w-0">
                    <div className="min-h-screen px-3 lg:px-10 lg:ml-80 box-border">
                        <Navbar heading={"Management Levels"} />

                        <div
                            className="transition-all duration-200"
                            style={{
                                filter: isBlurred ? "blur(4px)" : "none",
                                pointerEvents: isBlurred ? "none" : "auto",
                            }}
                        >
                            {/* Page Header */}
                            <div className="mb-6 mt-1">
                                <p className="m-0 text-[13px] text-[#8B95B0]">
                                    Manage and organize your academic levels
                                </p>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 mb-6">
                                <StatCard
                                    iconBg="#EEEEFF"
                                    iconColor="#5B5EF4"
                                    Icon={TbStack2}
                                    label="Total Levels"
                                    value={allLevels?.length ?? 0}
                                />

                                <StatCard
                                    iconBg="#ECFDF5"
                                    iconColor="#10B981"
                                    Icon={HiOutlineAcademicCap}
                                    label="Showing"
                                    value={filteredLevels.length}
                                />
                            </div>

                            {/* Search + Add */}
                            <div className="flex items-center justify-between gap-3 flex-wrap mb-7">
                                <div className="flex items-center gap-[9px] bg-white border border-[#E4E7F0] rounded-[10px] p-[9px_14px] flex-1 min-w-[200px] max-w-[360px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-150">
                                    <BiSearch size={16} color="#8B95B0" className="shrink-0" />

                                    <input
                                        type="text"
                                        value={searchText}
                                        placeholder="Search levels…"
                                        onChange={(e) => {
                                            setSearchText(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        className="border-none outline-none bg-transparent text-sm text-[#0D1117] w-full"
                                    />

                                    {searchText && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchText("");
                                                setCurrentPage(1);
                                            }}
                                            className="shrink-0 h-7 w-7 rounded-full text-[#8B95B0] hover:bg-[#F7F8FC] hover:text-[#F43F5E] transition-all text-xs font-bold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <AddButton onClick={onAddLevel} />
                            </div>

                            {/* Levels Grid */}
                            <div className="pb-5">
                                {filteredLevels.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 px-5 gap-3">
                                        <div className="w-[68px] h-[68px] rounded-[20px] bg-[#EEEEFF] flex items-center justify-center">
                                            <HiOutlineAcademicCap size={28} color="#5B5EF4" />
                                        </div>

                                        <p
                                            className="m-0 text-base font-semibold text-[#0D1117]"
                                            style={{ fontFamily: "'Sora', sans-serif" }}
                                        >
                                            {searchText ? "No results found" : "No levels yet"}
                                        </p>

                                        <p className="m-0 text-sm text-[#8B95B0] text-center">
                                            {searchText ? "Try a different search term" : "Click 'Add Level' to get started"}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
                                        {paginatedLevels.map((lvl, index) => (
                                            <LevelCard
                                                key={lvl.id}
                                                level={lvl}
                                                index={startIndex + index}
                                                onEdit={onEditLevel}
                                                onDelete={handleDeleteLevel}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pagination + Selector */}
                            {filteredLevels.length > 0 && (
                                <div className="mt-4 sm:mt-5 mb-10 relative overflow-hidden rounded-[15px] sm:rounded-[24px] border border-[#E4E7F0] bg-white shadow-[0_14px_40px_rgba(91,94,244,0.10)]">
                                    <div className="absolute -top-14 -left-14 h-36 w-36 rounded-full bg-[#EEEEFF] blur-3xl opacity-90" />
                                    <div className="absolute -bottom-14 -right-14 h-36 w-36 rounded-full bg-[#ECFDF5] blur-3xl opacity-70" />

                                    <div className="relative p-2 sm:p-5">
                                        <div className="flex lg:flex-row items-center justify-between sm:gap-4 gap-2">
                                            {/* Rows Selector */}
                                            <div className="flex flex-row items-center gap-1 sm:gap-3 w-full sm:w-auto">
                                                <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8B95B0] whitespace-nowrap">
                                                    Rows
                                                </span>

                                                <div className="relative group">
                                                    <select
                                                        value={rowsPerPage}
                                                        onChange={(e) => {
                                                            setRowsPerPage(Number(e.target.value));
                                                            setCurrentPage(1);
                                                        }}
                                                        className="appearance-none h-10 sm:h-11 min-w-[50px] sm:min-w-[88px] cursor-pointer rounded-2xl border border-[#DCDFFF] bg-gradient-to-br from-[#F7F8FF] to-white px-2 sm:pl-4 sm:pr-10 text-sm font-extrabold text-[#5B5EF4] outline-none shadow-[0_8px_20px_-14px_rgba(91,94,244,0.9)] transition-all duration-300 hover:border-[#5B5EF4]/40 focus:border-[#5B5EF4] focus:ring-4 focus:ring-[#5B5EF4]/10"
                                                    >
                                                        <option value={2}>2</option>
                                                        <option value={4}>4</option>
                                                        <option value={6}>6</option>
                                                        <option value={10}>10</option>
                                                    </select>

                                                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                                        <svg
                                                            className="h-4 w-4 text-[#5B5EF4] transition-transform duration-300 group-hover:rotate-180"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Showing Text */}
                                            <div className="hidden sm:flex flex-col items-center text-center">
                                                <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-2xl sm:rounded-full bg-[#F7F8FF] px-3 py-2 ring-1 ring-[#E4E7F0]">
                                                    <span className="text-xs font-bold text-[#8B95B0]">
                                                        Showing
                                                    </span>

                                                    <span className="text-xs font-extrabold text-[#5B5EF4]">
                                                        {startIndex + 1}
                                                    </span>

                                                    <span className="text-xs text-[#B8C0D6]">
                                                        -
                                                    </span>

                                                    <span className="text-xs font-extrabold text-[#5B5EF4]">
                                                        {Math.min(startIndex + rowsPerPage, filteredLevels.length)}
                                                    </span>

                                                    <span className="text-xs text-[#B8C0D6]">
                                                        of
                                                    </span>

                                                    <span className="text-xs font-extrabold text-[#5B5EF4]">
                                                        {filteredLevels.length}
                                                    </span>

                                                    <span className="text-xs font-bold text-[#8B95B0]">
                                                        levels
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-[11px] font-semibold text-[#8B95B0]">
                                                    Page {currentPage} of {totalPages}
                                                </p>
                                            </div>

                                            <div className=" flex items-center justify-between gap-2">
                                                <button
                                                    disabled={currentPage === 1}
                                                    onClick={() => setCurrentPage((prev) => prev - 1)}
                                                    className="group flex h-8 sm:h-11 min-w-[30px] sm:min-w-[44px] items-center justify-center rounded-2xl border border-[#DCDFFF] bg-white px-2 sm:px-3 text-xs font-extrabold text-[#5A6480] shadow-sm transition-all duration-300 hover:bg-[#F7F8FF] hover:text-[#5B5EF4] hover:border-[#5B5EF4]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#5A6480] active:scale-95 sm:min-w-[92px] sm:gap-2"
                                                >
                                                    <svg
                                                        className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15 19l-7-7 7-7"
                                                        />
                                                    </svg>
                                                    <span className="hidden sm:inline">Prev</span>
                                                </button>

                                                <div className="flex min-w-0 flex-1 items-center justify-center">
                                                    <div className="flex max-w-full items-center gap-1.5 overflow-x-auto px-1 py-1">
                                                        {Array.from({ length: totalPages }).map((_, pageIndex) => {
                                                            const pageNumber = pageIndex + 1;

                                                            return (
                                                                <button
                                                                    key={pageNumber}
                                                                    onClick={() => setCurrentPage(pageNumber)}
                                                                    className={`h-8 w-8 shrink-0 rounded-2xl text-xs font-extrabold transition-all duration-300 active:scale-95 sm:h-11 sm:w-11 ${currentPage === pageNumber
                                                                        ? "bg-gradient-to-br from-[#5B5EF4] to-[#3D40CC] text-white shadow-[0_10px_22px_-8px_rgba(91,94,244,0.75)]"
                                                                        : "bg-[#F7F8FF] text-[#5B5EF4] ring-1 ring-[#E4E7F0] hover:bg-[#EEF0FF]"
                                                                        }`}
                                                                >
                                                                    {pageNumber}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <button
                                                    disabled={currentPage === totalPages}
                                                    onClick={() => setCurrentPage((prev) => prev + 1)}
                                                    className="group flex h-8 sm:h-11 min-w-[30px] sm:min-w-[44px] items-center justify-center rounded-2xl border border-[#DCDFFF] bg-white px-2 sm:px-3 text-xs font-extrabold text-[#5A6480] shadow-sm transition-all duration-300 hover:bg-[#F7F8FF] hover:text-[#5B5EF4] hover:border-[#5B5EF4]/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#5A6480] active:scale-95 sm:min-w-[92px] sm:gap-2"
                                                >
                                                    <span className="hidden sm:inline">Next</span>
                                                    <svg
                                                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div >

            {/* Create Modal */}
            < LevelModal
                refetch={levelsRefetch}
                open={createLevelModal}
                setopen={setCreateLevelModal}
                setEditTrue={() => { }}
            />

            {/* Edit Modal */}
            {
                editMenu && (
                    <LevelModal
                        isEditTrue={true}
                        levelData={editData}
                        refetch={levelsRefetch}
                        open={editMenu}
                        setopen={setEditMenu}
                        setEditTrue={setEditMenu}
                    />
                )
            }

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={deleteModal.open}
                levelName={deleteModal.name}
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
            />
        </>
    );
};

export default Levels;
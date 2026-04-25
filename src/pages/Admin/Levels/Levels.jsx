import React, { useEffect, useState, useMemo } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import DataRow from "../../../components/Admin/Levels/DataRow";
import LevelModal from "../../../components/Admin/Levels/LevelModal";

import { toast } from "react-toastify";
import { BiSearch, BiPlus } from "react-icons/bi";
import { useMutation } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { useAdmin } from "../../../context/AdminContext";
import { deleteLevel } from "../../../api/Admin/LevelsApi";

const Levels = () => {
    const [editData, setEditData] = useState({});
    const [editMenu, setEditMenu] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);
    const [createLevelModal, setCreateLevelModal] = useState(false);

    const { isBlurred, toggleBlur } = useBlur();
    const { allLevels, levelsRefetch, levelIsPending } = useAdmin();

    const toggleLevelMenuOpen = () => {
        setIsLevelMenuOpen(!isLevelMenuOpen);
    };

    useEffect(() => {
        levelsRefetch();
    }, []);

    const onAddLevel = () => {
        setCreateLevelModal(!createLevelModal);
        toggleBlur();
    };

    const onEditLevel = (data) => {
        setEditMenu(true);
        setEditData(data);
        toggleBlur();
    };

    const levelDellMutate = useMutation({
        mutationFn: async (id) => await deleteLevel(id),
        onSettled: async () => {
            await levelsRefetch();
            return toast.success("Level deleted successfully");
        }
    });

    // Optimized filtering logic
    const filteredLevels = useMemo(() => {
        if (!allLevels) return [];
        return allLevels.filter(lvl =>
            lvl.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [allLevels, searchText]);

    return (
        levelIsPending ? (
            <div className="flex h-screen w-full items-center justify-center bg-[#F9F9F9]">
                <Loader />
            </div>
        ) : (
            <div className="flex min-h-screen w-[100%] bg-[#F4F7FE] font-poppins">
                <div className="flex flex-1 flex-col lg:ml-80 transition-all duration-300">
                    <div className="flex-grow px-4 md:px-10 pb-10">
                        {/* Header Section */}
                        <Navbar heading={"Management Levels"} />

                        <div className={`mt-8 transition-all duration-300 ${isBlurred ? "blur-md pointer-events-none" : ""}`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#2B3674]">Level List</h2>
                                    <p className="text-sm text-[#707EAE] font-medium">Manage and organize your difficulty levels</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {/* Modern Search Bar */}
                                    <div className="relative flex items-center bg-white rounded-2xl px-4 py-2.5 shadow-sm border border-transparent focus-within:border-[#6A00FF] transition-all duration-200 w-full md:w-64">
                                        <BiSearch className="text-[#8F9BBA] text-xl" />
                                        <input
                                            className="ml-2 bg-transparent outline-none text-[#2B3674] placeholder:text-[#8F9BBA] text-sm w-full"
                                            type="text"
                                            placeholder="Search levels..."
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                        />
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={onAddLevel}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-[#6A00FF] hover:bg-[#5800D4] text-white font-semibold rounded-2xl shadow-lg shadow-[#6A00FF]/20 transition-all duration-300 active:scale-95 whitespace-nowrap"
                                    >
                                        <BiPlus size={20} />
                                        <span>Add Level</span>
                                    </button>
                                </div>
                            </div>

                            {/* Table Container */}
                            <div className="bg-white rounded-[20px] shadow-sm overflow-hidden border border-white">
                                <div className="overflow-x-auto">
                                    {/* Table Header */}
                                    <DataRow
                                        index={"SR. NO"}
                                        levelName={"LEVEL NAME"}
                                        levelId={"LEVEL ID"}
                                        bgColor={"#F9F9F9"}
                                        header={true}
                                    />

                                    {/* Table Body */}
                                    <div className="max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
                                        {filteredLevels.length > 0 ? (
                                            filteredLevels.map((lvl, index) => (
                                                <div key={lvl.id} className="group transition-colors duration-200 hover:bg-[#F4F7FE]/50">
                                                    <DataRow
                                                        toggleLevelMenu={toggleLevelMenuOpen}
                                                        refetch={levelsRefetch}
                                                        index={index + 1 < 10 ? `0${index + 1}` : index + 1}
                                                        levelName={lvl.name}
                                                        levelId={lvl.id}
                                                        deleteLevel={levelDellMutate.mutate}
                                                        editLevel={(e) => onEditLevel(e)}
                                                        bgColor={"transparent"}
                                                        header={false}
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 bg-white">
                                                <div className="p-4 bg-gray-50 rounded-full mb-4">
                                                    <BiSearch size={40} className="text-gray-300" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-[#2B3674]">No levels found</h3>
                                                <p className="text-[#707EAE]">Try adjusting your search query</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modals remain functional */}
                <LevelModal
                    refetch={levelsRefetch}
                    open={createLevelModal}
                    setopen={setCreateLevelModal}
                />

                {editMenu && (
                    <LevelModal
                        isEditTrue={true}
                        levelData={editData}
                        refetch={levelsRefetch}
                        open={editMenu}
                        setopen={setEditMenu}
                    />
                )}
            </div>
        )
    );
};

export default Levels;
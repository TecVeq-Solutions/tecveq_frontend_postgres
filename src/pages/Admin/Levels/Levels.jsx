import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import DataRow from "../../../components/Admin/Levels/DataRow";
import LevelModal from "../../../components/Admin/Levels/LevelModal";

import { toast } from "react-toastify";
import { BiSearch } from "react-icons/bi";
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
        levelsRefetch()
    }, [])

    const onAddLevel = () => {
        setCreateLevelModal(!createLevelModal);
        toggleBlur();
    }

    const onEditLevel = (data) => {
        setEditMenu(true);
        setEditData(data);
        toggleBlur();
    }

    const levelDellMutate = useMutation({
        mutationFn: async (id) => await deleteLevel(id),
        onSettled: async () => {
            await levelsRefetch();
            return toast.success("Level deleted successfully");
        }
    });

    return (
        levelIsPending ? <div className="flex justify-center flex-1"> <Loader /> </div> :
            <>
                <div className="flex flex-1 bg-[#F9F9F9] font-poppins">
                    <div className="flex flex-1">
                        <div
                            className={`w-full min-h-full lg:px-10 sm:px-10 px-3 flex-grow lg:ml-72`}
                        >
                            <div className="min-h-full pb-10">
                                <Navbar heading={"Level"} />
                                <div className={`${isBlurred ? "blur" : ""}`}>
                                    <div className="py-2">
                                        <div className="flex items-center justify-between">
                                            <div className="">
                                                <p className="text-black/60"></p>
                                            </div>
                                            <div className="flex flex-col-reverse lg:flex-row gap-2">
                                                <div className="flex items-center gap-2 px-4  py-2 bg-white border border-black/10 rounded-3xl">
                                                    <BiSearch />
                                                    <input
                                                        className="outline-none "
                                                        type="text"
                                                        placeholder="Search"
                                                        value={searchText}
                                                        onChange={(e) => setSearchText(e.target.value)}
                                                    />
                                                </div>
                                                <p onClick={onAddLevel} className="flex items-center justify-center text-sm px-4 py-2 text-white cursor-pointer bg-[#6A00FF] rounded-3xl">
                                                    Add Level
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="py-2 h-[80%] overflow-auto">

                                        <DataRow
                                            index={"Sr. No"}
                                            levelName={"Level Name"}
                                            levelId={"Level ID"}
                                            bgColor={"#F9F9F9"}
                                            header={true}
                                        />

                                        {searchText == "" && allLevels?.map((lvl, index) => (
                                            <DataRow
                                                key={lvl.id}
                                                toggleLevelMenu={toggleLevelMenuOpen}
                                                refetch={levelsRefetch}
                                                index={index + 1}
                                                levelName={lvl.name}
                                                levelId={lvl.id}
                                                deleteLevel={levelDellMutate.mutate}
                                                editLevel={(e) => onEditLevel(e)}
                                                bgColor={"#FFFFFF"}
                                                header={false}
                                            />
                                        ))}

                                        {searchText && allLevels?.map((lvl, index) => {
                                            if ((lvl.name.toLocaleLowerCase()).includes(searchText.toLocaleLowerCase())) {
                                                return <DataRow
                                                    key={lvl.id}
                                                    toggleLevelMenu={toggleLevelMenuOpen}
                                                    refetch={levelsRefetch}
                                                    index={index + 1}
                                                    levelName={lvl.name}
                                                    levelId={lvl.id}
                                                    deleteLevel={levelDellMutate.mutate}
                                                    editLevel={(e) => onEditLevel(e)}
                                                    bgColor={"#FFFFFF"}
                                                    header={false}
                                                />
                                            }
                                        })}

                                        {allLevels.length == 0 && <div className="text-center py-4 text-3xl font-medium">No levels to display!</div>}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <LevelModal
                    refetch={levelsRefetch}
                    open={createLevelModal}
                    setopen={setCreateLevelModal}
                />

                {editMenu &&
                    <LevelModal
                        isEditTrue={true}
                        levelData={editData}
                        refetch={levelsRefetch}
                        open={editMenu}
                        setopen={setEditMenu}
                    />
                }

            </>
    );
}

export default Levels

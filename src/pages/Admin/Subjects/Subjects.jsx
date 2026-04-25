import React, { useEffect, useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Admin/Navbar";
import DataRow from "../../../components/Admin/Subjects/DataRow";
import SubjectModal from "../../../components/Admin/Subjects/SubjectModal";

import { toast } from "react-toastify";
import { BiSearch } from "react-icons/bi";
import { useMutation } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { useAdmin } from "../../../context/AdminContext";
import { deleteSubject } from "../../../api/Admin/SubjectsApi";

const Subjects = () => {

    const [editData, setEditData] = useState({});
    const [editMenu, setEditMenu] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [isSubjectMenuOpen, setIsSubjectMenuOpen] = useState(false);
    const [createSubjectModal, setCreateSubjectModal] = useState(false);

    const { isBlurred, toggleBlur } = useBlur();
    const { allSubjects, subjectsRefetch, subjectsIsPending, allLevels, levelsRefetch } = useAdmin();

    if (!subjectsIsPending) {
        console.log("all subjects are : ", allSubjects);
    }

    const toggleSubjectMenuOpen = () => {
        setIsSubjectMenuOpen(!isSubjectMenuOpen);
    };

    const onAddSubject = () => {
        setCreateSubjectModal(!createSubjectModal);
        toggleBlur();
    }

    const onEditSubject = (data) => {
        console.log("data on update subject is : ", data);
        setEditMenu(true);
        setEditData(data);
        toggleBlur();
    }

    const subjectDellMutate = useMutation({
        mutationFn: async (id) => await deleteSubject(id),
        onSettled: async () => {
            await subjectsRefetch();
            return toast.success("Subject deleted successfully");
        }
    });

    useEffect(() => {
        subjectsRefetch();
        levelsRefetch();
    }, [])

    return (
        subjectsIsPending ? <div className="flex flex-1"> <Loader /> </div> :
            <>
                <div className="flex flex-1 bg-[#F9F9F9] font-poppins">
                    <div className="flex flex-1">
                        <div
                            className={`w-full h-[100vh] lg:px-10 sm:px-6 px-3 flex-grow lg:ml-80`}
                        >
                            <div className="min-h-full pb-10">
                                <Navbar heading={"Subject"} />
                                <div className={`${isBlurred ? "blur" : ""}`}>
                                    <div className="py-2">
                                        <div className="flex items-center justify-between">
                                            <div className="">
                                                <p className="text-black/60"></p>
                                            </div>
                                            <div className="flex gap-2 flex-wrap md:flex space-y-5 md:space-y-0">
                                                <div className="flex w-full md:w-auto items-center gap-2 px-4 py-2 bg-white border border-black/10 rounded-3xl">
                                                    <BiSearch />
                                                    <input
                                                        type="text"
                                                        value={searchText}
                                                        placeholder="Search"
                                                        className="outline-none"
                                                        onChange={(e) => setSearchText(e.target.value)}
                                                    />
                                                </div>
                                                <p onClick={onAddSubject} className="flex items-center justify-center px-4 py-2 text-sm text-white cursor-pointer bg-[#6A00FF] rounded-3xl">
                                                    Add Subject
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="py-2 h-[80%] overflow-auto">

                                        <DataRow
                                            index={"Sr. No"}
                                            subjectName={"Subject Name"}
                                            levelName={"Level Name"}
                                            bgColor={"#F9F9F9"}
                                            header={true}
                                        />
                                        {searchText == "" && allSubjects?.map((lvl, index) => (
                                            <DataRow
                                                data={lvl}
                                                key={lvl.id}
                                                toggleSubjectMenu={toggleSubjectMenuOpen}
                                                refetch={subjectsRefetch}
                                                index={index + 1}
                                                subjectName={lvl.name}
                                                levelName={lvl.levelName}
                                                deleteSubject={subjectDellMutate.mutate}
                                                editSubject={(e) => onEditSubject(e)}
                                                bgColor={"#FFFFFF"}
                                                header={false}
                                            />
                                        ))}

                                        {searchText && allSubjects.map((lvl, index) => {
                                            if (lvl.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) || lvl.levelName.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())) {
                                                return <DataRow
                                                    data={lvl}
                                                    key={lvl.id}
                                                    toggleSubjectMenu={toggleSubjectMenuOpen}
                                                    refetch={subjectsRefetch}
                                                    index={index + 1}
                                                    subjectName={lvl.name}
                                                    levelName={lvl.levelName}
                                                    deleteSubject={subjectDellMutate.mutate}
                                                    editSubject={(e) => onEditSubject(e)}
                                                    bgColor={"#FFFFFF"}
                                                    header={false}
                                                />
                                            }
                                        })}

                                        {allSubjects.length == 0 && <div className="text-center py-4 text-3xl font-medium">No subjects to display!</div>}

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SubjectModal
                    allLevels={allLevels}
                    refetch={subjectsRefetch}
                    open={createSubjectModal}
                    setopen={setCreateSubjectModal}
                />
                {editMenu &&
                    <SubjectModal
                        allLevels={allLevels}
                        isEditTrue={true}
                        subjectData={editData}
                        refetch={subjectsRefetch}
                        open={editMenu}
                        setopen={setEditMenu}
                    />
                }
            </>
    );
}

export default Subjects

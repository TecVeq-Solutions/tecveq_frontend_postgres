import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { GoArrowRight } from "react-icons/go";
import IMAGES from "../../../assets/images";
import useClickOutside from "../../../hooks/useClickOutlise";
import { useBlur } from "../../../context/BlurContext";
import { FiUploadCloud } from "react-icons/fi";
import { IoCloseCircle } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { createAnnouncements, editAnnouncements } from "../../../api/Admin/AnnouncementsApi";
import { toast } from "react-toastify";

const CreateQuoteModal = ({
    open,
    setopen,
    refetch,
    isEditTrue,
    quoteData
}) => {


    const { isBlurred, toggleBlur } = useBlur();
    const ref = useRef(null);

    const [quoteObj, setQuoteObj] = useState({
        title: isEditTrue ? quoteData?.title : "",
        description: isEditTrue ? quoteData?.description : "",
        date: isEditTrue ? quoteData?.date?.split("T")[0] : "",
        time: isEditTrue ? quoteData?.date?.slice(11, 16) : "", // HH:MM
        type: "quote",
        visibility: isEditTrue ? quoteData?.visibility : "all",
    })

    console.log(quoteObj, "qute data sis ");

    const mutation = useMutation({
        mutationFn: async () => {
            let qtime = quoteObj.time;
            let qdate = quoteObj.date;
            let datetime = (qtime && qdate) ? qdate + "T" + qtime + ":00.000Z" : new Date().toISOString();
            toggleBlur();
            setopen(false);
            let results;
            if (isEditTrue) {
                results = await editAnnouncements({ ...quoteObj, date: datetime }, quoteData.id);
                toast.success("Quote updated successfully");
            } else {
                results = await createAnnouncements({ ...quoteObj, date: datetime });
            }
            await refetch();
            return results
        }
    });

    if (mutation.isSuccess) return toast.success("Quote added");
    if (mutation.isError) return toast.error("Quote cannot be added");

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 ${open ? "" : "hidden"}`}>
            <div
                onClick={(e) => e.stopPropagation()}
                ref={ref}
                className="bg-white p-4 sm:p-8 w-full max-w-lg sm:px-10 text-black rounded-xl max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl border border-black/20 relative"
            >
                <div className="flex gap-2">
                    <div className="flex flex-col w-full gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex justify-center flex-1 gap-2 items-center">
                                <p className="text-xl sm:text-2xl font-semibold cursor-text">
                                    {isEditTrue ? "Update Quote" : "Create new Quote"}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 cursor-pointer">
                                <img
                                    src={IMAGES.CloseIcon}
                                    className="w-[15px] h-[15px]"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleBlur();
                                        setopen(false);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col flex-1 gap-1">
                                <p className="text-xs font-semibold text-grey_700">Title</p>
                                <div className="flex justify-between border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                                    <input
                                        className="text-sm outline-none text-custom-gray-3 w-full min-w-0"
                                        placeholder="Enter title"
                                        value={quoteObj.title}
                                        onChange={(e) => { setQuoteObj({ ...quoteObj, title: e.target.value }) }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col flex-1 gap-1">
                            <p className="text-xs font-semibold text-grey_700">Schedule</p>
                            <div className="flex items-center gap-1 sm:gap-3">
                                <div className="flex flex-col flex-1 min-w-0 gap-1">
                                    <div className="flex items-center flex-1 justify-between gap-3 px-1 sm:px-3 py-1 border-[1.5px] rounded-lg border-grey/30">
                                        <input
                                            id="date"
                                            type="date"
                                            className="text-sm outline-none text-custom-gray-3 w-full min-w-0"
                                            placeholder="Enter date"
                                            value={quoteObj.date}
                                            onChange={(e) => { setQuoteObj({ ...quoteObj, date: e.target.value }) }}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col flex-1 min-w-0 gap-1">
                                    <div className="flex flex-1 items-center justify-between gap-3 px-1 sm:px-3 py-1 border-[1.5px] rounded-lg border-grey/30">
                                        <input
                                            type="time"
                                            className="text-sm outline-none text-custom-gray-3 w-full min-w-0"
                                            placeholder="Enter time"
                                            value={quoteObj.time}
                                            onChange={(e) => { setQuoteObj({ ...quoteObj, time: e.target.value }) }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col flex-1 gap-1">
                                <p className="text-xs font-semibold text-grey_700">Visibility</p>
                                <div className="flex justify-between border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                                    <select value={quoteObj.visibility}
                                        onChange={(e) => { setQuoteObj({ ...quoteObj, visibility: e.target.value }) }}
                                        className='outline-none rounded-sm border-black/20 w-full text-sm'>
                                        <option value="student">Students</option>
                                        <option value="parent">Parents</option>
                                        <option value="teacher">Teachers</option>
                                        <option value="all">All</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-grey_700">Quote</p>
                            <textarea className="outline-none border border-black/20 w-full rounded-md p-2"
                                name="quote"
                                id="quote"
                                cols="30"
                                rows="7"
                                placeholder="Quote"
                                value={quoteObj.description}
                                onChange={(e) => { setQuoteObj({ ...quoteObj, description: e.target.value }) }}
                            />
                        </div>

                        <div className="flex justify-center items-center gap-3">
                            <div className="w-32">
                                <div
                                    onClick={() => { mutation.mutate() }}
                                    className="flex items-center justify-center w-full py-2 text-center rounded-3xl cursor-pointer bg-[#0B1053]"
                                >
                                    <p className="text-sm text-white">{isEditTrue ? "Update" : "Create"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateQuoteModal

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { GoArrowRight, GoCalendar, GoClock, GoTag, GoEye } from "react-icons/go";
import IMAGES from "../../../assets/images";
import useClickOutside from "../../../hooks/useClickOutlise";
import { useBlur } from "../../../context/BlurContext";
import { FiUploadCloud, FiEdit3, FiPlusCircle } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { createAnnouncements, editAnnouncements } from "../../../api/Admin/AnnouncementsApi";
import { toast } from "react-toastify";

const CreateQuoteModal = ({ open, setopen, refetch, isEditTrue, quoteData }) => {
    const { isBlurred, toggleBlur } = useBlur();
    const ref = useRef(null);

    const [quoteObj, setQuoteObj] = useState({
        title: isEditTrue ? quoteData?.title : "",
        description: isEditTrue ? quoteData?.description : "",
        date: isEditTrue ? quoteData?.date?.split("T")[0] : "",
        time: isEditTrue ? quoteData?.date?.slice(11, 16) : "",
        type: "quote",
        visibility: isEditTrue ? quoteData?.visibility : "all",
    });

    const mutation = useMutation({
        mutationFn: async () => {
            let qtime = quoteObj.time;
            let qdate = quoteObj.date;
            let datetime = (qtime && qdate) ? qdate + "T" + qtime + ":00.000Z" : new Date().toISOString();

            let results;
            if (isEditTrue) {
                results = await editAnnouncements({ ...quoteObj, date: datetime }, quoteData.id);
                toast.success("Quote updated successfully");
            } else {
                results = await createAnnouncements({ ...quoteObj, date: datetime });
                toast.success("Quote created successfully");
            }

            toggleBlur();
            setopen(false);
            await refetch();
            return results;
        },
        onError: () => {
            toast.error("An error occurred. Please try again.");
        }
    });

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-all duration-300">
            <div
                ref={ref}
                className="bg-white w-full max-w-lg rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden transform transition-all"
            >
                {/* Header Section */}
                <div className="relative bg-slate-50 px-3 sm:px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            {isEditTrue ? <FiEdit3 size={20} /> : <FiPlusCircle size={20} />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {isEditTrue ? "Update Quote" : "Create New Quote"}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">Fill in the details below</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { toggleBlur(); setopen(false); }}
                        className="absolute right-2 top-6 text-slate-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                <div className="p-3 sm:p-6 sm:p-8 space-y-5">
                    {/* Title Input */}
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                            <GoTag className="text-indigo-500" /> Title
                        </label>
                        <input
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-slate-600 placeholder:text-slate-400"
                            placeholder="e.g. Daily Motivation"
                            value={quoteObj.title}
                            onChange={(e) => setQuoteObj({ ...quoteObj, title: e.target.value })}
                        />
                    </div>

                    {/* Schedule Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                                <GoCalendar className="text-indigo-500" /> Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-slate-600"
                                value={quoteObj.date}
                                onChange={(e) => setQuoteObj({ ...quoteObj, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                                <GoClock className="text-indigo-500" /> Time
                            </label>
                            <input
                                type="time"
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-slate-600"
                                value={quoteObj.time}
                                onChange={(e) => setQuoteObj({ ...quoteObj, time: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Visibility Select */}
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                            <GoEye className="text-indigo-500" /> Visibility Target
                        </label>
                        <select
                            value={quoteObj.visibility}
                            onChange={(e) => setQuoteObj({ ...quoteObj, visibility: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition-all text-sm text-slate-600 bg-white cursor-pointer appearance-none"
                            style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                        >
                            <option value="student">Students Only</option>
                            <option value="parent">Parents Only</option>
                            <option value="teacher">Teachers Only</option>
                            <option value="all">Everyone (All)</option>
                        </select>
                    </div>

                    {/* Quote Textarea */}
                    <div className="space-y-1.5">
                        <label className="text-[13px] font-semibold text-slate-700">The Quote Content</label>
                        <textarea
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-slate-600 placeholder:text-slate-400 resize-none"
                            rows="4"
                            placeholder="Write your inspiring quote here..."
                            value={quoteObj.description}
                            onChange={(e) => setQuoteObj({ ...quoteObj, description: e.target.value })}
                        />
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                        <button
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate()}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {mutation.isPending ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isEditTrue ? "Save Changes" : "Publish Quote"}
                                    <GoArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateQuoteModal;
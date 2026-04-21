import React, { useRef, useState } from "react";
import IMAGES from "../../../assets/images";
import useClickOutside from "../../../hooks/useClickOutlise";
import { useMutation } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { createAnnouncements, editAnnouncements } from "../../../api/Admin/AnnouncementsApi";

const CreateAnnouncementModal = ({
    open,
    setopen,
    refetch,
    announcementData,
    isEditTrue,
}) => {
    const [sendOnWhatsapp, setSendOnWhatsapp] = useState(false);
    const { toggleBlur } = useBlur();
    const ref = useRef(null);

    useClickOutside(ref, () => {
        if (open) {
            setopen(false);
            toggleBlur();
        }
    });

    const [announcemnetObj, setAnnouncementObj] = useState({
        title: isEditTrue ? announcementData?.title : "",
        description: isEditTrue ? announcementData?.description : "",
        date: isEditTrue ? announcementData?.date?.slice(0, 10) : "",
        time: isEditTrue ? announcementData?.date?.slice(11, 16) : "",
        type: "annoouncement",
        visibility: isEditTrue ? announcementData?.visibility : "all",
    });

    const mutation = useMutation({
        mutationFn: async () => {
            let anntime = announcemnetObj.time;
            let anndate = announcemnetObj.date;
            let datetime = (anntime && anndate) ? anndate + "T" + anntime + ":00.000Z" : new Date().toISOString();

            let results;
            if (isEditTrue) {
                results = await editAnnouncements({ ...announcemnetObj, date: datetime }, announcementData.id);
            } else {
                results = await createAnnouncements({ ...announcemnetObj, date: datetime }, sendOnWhatsapp);
            }
            return results;
        },
        onSuccess: async () => {
            await refetch();
            toggleBlur();
            setopen(false);
        }
    });

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-300">
            <div
                ref={ref}
                className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
            >
                {/* Header */}
                <div className="relative px-3 sm:px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800 sm:text-center">
                        {isEditTrue ? "Update Announcement" : "Create New Announcement"}
                    </h2>
                    <button
                        onClick={() => { toggleBlur(); setopen(false); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <img src={IMAGES.CloseIcon} className="w-3.5 h-3.5 opacity-60" alt="close" />
                    </button>
                </div>

                <div className="p-3 sm:p-6 md:p-8 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">

                    {/* Title Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Title</label>
                        <input
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-[#6A00FF] focus:ring-2 focus:ring-[#6A00FF]/10 transition-all placeholder:text-gray-400"
                            placeholder="Enter announcement title..."
                            value={announcemnetObj.title}
                            onChange={(e) => setAnnouncementObj({ ...announcemnetObj, title: e.target.value })}
                        />
                    </div>

                    {/* Schedule Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Date</label>
                            <input
                                type="date"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-[#6A00FF] transition-all cursor-pointer"
                                value={announcemnetObj.date}
                                onChange={(e) => setAnnouncementObj({ ...announcemnetObj, date: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Time</label>
                            <input
                                type="time"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-[#6A00FF] transition-all cursor-pointer"
                                value={announcemnetObj.time}
                                onChange={(e) => setAnnouncementObj({ ...announcemnetObj, time: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Visibility Dropdown */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Visibility</label>
                        <div className="relative">
                            <select
                                value={announcemnetObj.visibility}
                                onChange={(e) => setAnnouncementObj({ ...announcemnetObj, visibility: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-[#6A00FF] appearance-none cursor-pointer transition-all"
                            >
                                <option value="all">Everyone</option>
                                <option value="student">Students</option>
                                <option value="parent">Parents</option>
                                <option value="teacher">Teachers</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 text-xs">▼</div>
                        </div>
                    </div>

                    {/* WhatsApp Toggle (Conditional) */}
                    {announcemnetObj.visibility === 'parent' && (
                        <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl animate-in slide-in-from-top-2 duration-300">
                            <input
                                type="checkbox"
                                id="whatsapp-toggle"
                                className="w-5 h-5 accent-green-600 cursor-pointer"
                                checked={sendOnWhatsapp}
                                onChange={(e) => setSendOnWhatsapp(e.target.checked)}
                            />
                            <label htmlFor="whatsapp-toggle" className="text-sm font-medium text-green-800 cursor-pointer select-none">
                                Send instant update on WhatsApp
                            </label>
                        </div>
                    )}

                    {/* Description Textarea */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Description</label>
                        <textarea
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 outline-none focus:border-[#6A00FF] transition-all resize-none placeholder:text-gray-400"
                            rows="5"
                            placeholder="Write your announcement details here..."
                            value={announcemnetObj.description}
                            onChange={(e) => setAnnouncementObj({ ...announcemnetObj, description: e.target.value })}
                        />
                    </div>
                </div>

                {/* Footer Action Button */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
                    <button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending}
                        className={`
                            group relative overflow-hidden w-full py-3 px-2 rounded-full font-bold text-white transition-all duration-300
                            ${mutation.isPending ? 'bg-gray-400' : 'bg-[#6A00FF] hover:bg-[#5800d6] hover:shadow-lg active:scale-95'}
                        `}
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {mutation.isPending ? "Processing..." : (isEditTrue ? "Update Now" : "Create Announcement")}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateAnnouncementModal;
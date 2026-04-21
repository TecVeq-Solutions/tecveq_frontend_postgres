import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllLevels } from "../../../api/Admin/LevelsApi";
import { getMyAllClassroom } from "../../../api/Admin/classroomApi";
import { generateFees } from "../../../api/Admin/FeesApi";
import Loader from "../../../utils/Loader";
import { toast } from "react-toastify";
import { IoClose, IoCalendarOutline, IoCashOutline, IoLayersOutline, IoSchoolOutline, IoInformationCircleOutline } from "react-icons/io5";

const GenerateFeeModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        levelID: "",
        classroomID: "",
        amount: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        type: "monthly",
        dueDate: "",
        description: ""
    });

    const { data: levelsData, isLoading: levelsLoading } = useQuery({
        queryKey: ["allLevels"],
        queryFn: async () => {
            const resp = await getAllLevels();
            return resp?.data || resp;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const { data: classroomsData, isLoading: classroomsLoading } = useQuery({
        queryKey: ["allClassrooms"],
        queryFn: async () => {
            const resp = await getMyAllClassroom();
            return resp?.data || resp;
        },
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false
    });

    const mutation = useMutation({
        mutationFn: (data) => generateFees(data),
        onSuccess: () => {
            toast.success("Fees generated successfully.");
            onSuccess();
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to generate fees.");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.dueDate || !formData.type) {
            return toast.error("Please fill all required fields.");
        }
        mutation.mutate(formData);
    };

    const isDataLoading = levelsLoading || classroomsLoading;
    const filteredClassrooms = Array.isArray(classroomsData)
        ? classroomsData.filter(c => c.levelID === formData.levelID)
        : [];

    const inputStyles = "w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6A00FF] focus:bg-white outline-none transition-all text-sm text-gray-700";
    const labelStyles = "text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1";
    const iconStyles = "absolute left-3 top-[34px] text-gray-400";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-opacity">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="relative px-8 pt-8 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Generate Fee</h2>
                            <p className="text-sm text-gray-500">Assign bulk fees to students easily.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"
                        >
                            <IoClose size={20} />
                        </button>
                    </div>
                </div>

                {isDataLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <Loader />
                        <p className="text-[10px] font-black text-[#6A00FF] uppercase tracking-[0.2em] animate-pulse">Initializing Interface</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">

                        {/* Level & Classroom Group */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative flex flex-col">
                                <label className={labelStyles}><IoLayersOutline size={14} /> Level *</label>
                                <IoLayersOutline className={iconStyles} size={18} />
                                <select
                                    className={inputStyles}
                                    value={formData.levelID}
                                    onChange={(e) => setFormData({ ...formData, levelID: e.target.value, classroomID: "" })}
                                    required
                                >
                                    <option value="">Select Level</option>
                                    {Array.isArray(levelsData) && levelsData.map(level => (
                                        <option key={level.id} value={level.id}>{level.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="relative flex flex-col">
                                <label className={labelStyles}><IoSchoolOutline size={14} /> Classroom</label>
                                <IoSchoolOutline className={iconStyles} size={18} />
                                <select
                                    className={`${inputStyles} ${!formData.levelID ? 'opacity-50' : ''}`}
                                    value={formData.classroomID}
                                    onChange={(e) => setFormData({ ...formData, classroomID: e.target.value })}
                                    disabled={!formData.levelID}
                                >
                                    <option value="">All Classrooms</option>
                                    {filteredClassrooms.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Amount & Type Group */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative flex flex-col">
                                <label className={labelStyles}><IoCashOutline size={14} /> Amount</label>
                                <IoCashOutline className={iconStyles} size={18} />
                                <input
                                    type="number"
                                    className={inputStyles}
                                    placeholder="0.00"
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="relative flex flex-col">
                                <label className={labelStyles}><IoInformationCircleOutline size={14} /> Fee Type</label>
                                <IoInformationCircleOutline className={iconStyles} size={18} />
                                <select
                                    className={inputStyles}
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    required
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="six-months">Six Months</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="admission">Admission Fee</option>
                                </select>
                            </div>
                        </div>

                        {/* Month, Year & Due Date */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="relative flex flex-col col-span-1">
                                <label className={labelStyles}>Month</label>
                                <select
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6A00FF] outline-none text-sm"
                                    value={formData.month}
                                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                    disabled={formData.type === 'yearly'}
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>
                                            {new Date(0, i).toLocaleString('en', { month: 'short' })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative flex flex-col col-span-1">
                                <label className={labelStyles}>Year</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6A00FF] outline-none text-sm"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="relative flex flex-col col-span-1">
                                <label className={labelStyles}>Due Date</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6A00FF] outline-none text-sm"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className={`group relative w-full py-4 rounded-2xl bg-gradient-to-r from-[#6A00FF] to-[#8E33FF] text-white font-bold text-sm shadow-[0_10px_20px_-5px_rgba(106,0,255,0.4)] hover:shadow-[0_15px_25px_-5px_rgba(106,0,255,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center overflow-hidden ${mutation.isPending ? 'opacity-80 cursor-not-allowed' : ''}`}
                            >
                                {mutation.isPending ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        Confirm & Generate <IoCalendarOutline size={18} className="group-hover:rotate-12 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default GenerateFeeModal;
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getAllLevels } from "../../../api/Admin/LevelsApi";
import { getMyAllClassroom } from "../../../api/Admin/classroomApi";
import { generateFees } from "../../../api/Admin/FeesApi";
import Loader from "../../../utils/Loader";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";

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

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Generate New Fee</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <IoClose size={24} />
                    </button>
                </div>

                {isDataLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center space-y-4">
                        <Loader />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading Data...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase px-1">Level (Required)</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6A00FF] outline-none transition-all text-sm appearance-none bg-gray-50"
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
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase px-1">Classroom (Optional)</label>
                                <select
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6A00FF] outline-none transition-all text-sm appearance-none bg-gray-50"
                                    value={formData.classroomID}
                                    onChange={(e) => setFormData({ ...formData, classroomID: e.target.value })}
                                    disabled={!formData.levelID}
                                >
                                    <option value="">All Classrooms</option>
                                    {filteredClassrooms.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                                </select>
                            </div>
                        </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase px-1">Amount</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6A00FF] outline-none transition-all text-sm bg-gray-50"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase px-1">Fee Type</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6A00FF] outline-none transition-all text-sm appearance-none bg-gray-50"
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase px-1">Month</label>
                            <select
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6A00FF] outline-none transition-all text-sm appearance-none bg-gray-50"
                                value={formData.month}
                                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                                disabled={formData.type === 'yearly'}
                            >
                                {Array.from({ length: 12 }, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {new Date(0, i).toLocaleString('en', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase px-1">Year</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6A00FF] outline-none transition-all text-sm bg-gray-50"
                                value={formData.year}
                                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase px-1">Due Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6A00FF] outline-none transition-all text-sm bg-gray-50"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-1 pt-2">
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className={`w-full py-3 rounded-xl bg-[#6A00FF] text-white font-bold text-sm shadow-lg hover:shadow-[#6A00FF]/25 hover:bg-[#5500CC] transition-all flex items-center justify-center ${mutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {mutation.isPending ? "Generating..." : "Generate Fees Now"}
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
};

export default GenerateFeeModal;

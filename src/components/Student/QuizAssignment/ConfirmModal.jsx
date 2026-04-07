import React from "react";

const ConfirmModal = ({ isOpen, title, description, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white text-black p-6 rounded-2xl shadow-2xl border border-gray-200 flex flex-col gap-6 transform transition-all scale-100">
                <div className="flex flex-col gap-2">
                    <p className="text-xl font-bold text-gray-800 text-center">{title}</p>
                    <p className="text-sm font-medium text-gray-500 text-center leading-relaxed">
                        {description}
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors border border-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#6A00FF] hover:bg-[#5800D6] shadow-lg shadow-purple-200 transition-all active:scale-95"
                    >
                        Yes, Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

import React, { useEffect, useRef, useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiAlertTriangle, FiX } from "react-icons/fi";
import useClickOutside from "../../../hooks/useClickOutlise";

const LevelMenu = ({
  isopen,
  setIsOpen,
  deleteLevel,
  editLevel
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const ref = useRef(null);

  useClickOutside(ref, () => {
    if (!showConfirm) setIsOpen(false);
  });

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowConfirm(true);
  };

  const confirmDelete = (e) => {
    e.stopPropagation();
    deleteLevel();
    setShowConfirm(false);
    setIsOpen(false);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <>
      <div
        ref={ref}
        className={`fixed z-10 bg-white right-0 mr-32 top-80 shadow-lg border border-[#00000010] rounded-xl ${isopen ? "" : "hidden"
          }`}
      >
        <div className="flex p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 cursor-pointer hover:text-[#6A00FF] transition-colors" onClick={editLevel}>
              <FaRegEdit />
              <p>Edit</p>
            </div>
            <div className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-700 transition-colors" onClick={handleDeleteClick}>
              <RiDeleteBin6Line />
              <p>Delete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="relative p-8 flex flex-col items-center text-center">
              {/* Close Button */}
              <button
                onClick={cancelDelete}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400"
              >
                <FiX size={20} />
              </button>

              {/* Icon */}
              <div className="w-20 h-20 rounded-full bg-red/5 flex items-center justify-center mb-6">
                <div className="w-14 h-14 rounded-full bg-red/10 flex items-center justify-center text-red">
                  <FiAlertTriangle size={28} />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-[22px] font-bold text-[#2B3674] mb-3">
                Are you sure?
              </h3>
              <p className="text-[#707EAE] text-base leading-relaxed mb-8">
                Do you really want to delete this level? This action cannot be undone and may affect associated classes.
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-6 py-3.5 rounded-2xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-[#C53F3F] text-white font-semibold shadow-lg shadow-[#C53F3F]/25 hover:bg-[#A33333] transition-all active:scale-95"
                >
                  Delete Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LevelMenu;

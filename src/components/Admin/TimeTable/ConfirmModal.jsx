import React from "react";
import FilterButton from "./FilterButton";
import TransparentButton from "./TransparentButton";

const ConfirmModal = ({ isOpen, title, description, onconfirm, onclose }) => {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 cursor-default">
          <div className="w-full max-w-sm bg-white text-black p-6 rounded-xl shadow-2xl border border-black/10 flex flex-col gap-6">
            <p className="text-xl font-bold text-center">{title}</p>
            <p className="font-medium text-center">{description}</p>
            <div className="flex justify-end gap-5">
              <FilterButton
                text={"Confirm"}
                className={"px-3 py-1"}
                clickHandler={onconfirm}
              />
              <TransparentButton
                text={"Cancel"}
                clickHandler={onclose}
                className={"border-none"}
              />
            </div>
          </div>
        </div>
      )}
    </>
    );
};

export default ConfirmModal;

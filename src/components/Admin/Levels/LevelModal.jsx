import React, { useRef, useState } from "react";
import Loader from "../../../utils/Loader";
import IMAGES from "../../../assets/images";
import useClickOutside from "../../../hooks/useClickOutlise";

import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { createLevel, editLevel } from "../../../api/Admin/LevelsApi";


const LevelModal = ({ open, setopen, refetch, isEditTrue, levelData, setEditTrue }) => {

  const { toggleBlur } = useBlur();
  const [errormsg, setErrormsg] = useState(false);
  const [levelValue, setLevelValue] = useState(((isEditTrue && levelData) && levelData.levelName) || "");

  const ref = useRef(null);
  useClickOutside(ref, () => {
    setopen(false);
    if (open) {
      toggleBlur();
    }
  });


  const handleAddLevel = async () => {
    if(levelValue){
      const levelNamePattern = /^[a-zA-Z0-9\s]+$/;
      const isValidLevelName = levelNamePattern.test(levelValue);
      if(isValidLevelName){ 
        mutation.mutate(levelValue)
        setEditTrue(false);
      }else{
        toast.error("Invalid level name!. Should not have any special characters.");
      }
    }else{
      setErrormsg(true);
      setTimeout(() => {
        setErrormsg(false);
      }, 3000);
    }
  }

  const mutation = useMutation({
    mutationFn: async (levelValue) => {
      let result;
      if (isEditTrue) {
        result = await editLevel({ name: levelValue }, levelData?.levelId);
        console.log("leve updatd ", result);
      } else {
        result = await createLevel({ name: levelValue });
      }
      await refetch();
      toast.success(`Level ${isEditTrue ? "updated" : "added"} successfully!`);
      toggleBlur();
      setopen(false);
      return result;
    }
  });


  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 ${open ? "" : "hidden"}`}>
      <div
        ref={ref}
        className="bg-white p-8 sm:w-[500px] w-full max-w-lg border border-black/20 shadow-2xl text-black rounded-xl overflow-y-auto max-h-[90vh] relative"
      >
      <div className="flex flex-1 gap-2">
        <div className="flex flex-col w-full gap-4">
          <div className="flex items-center justify-between">
            <div className="flex justify-center flex-1 w-[fit] gap-2 items-center">
              <p className="text-2xl font-semibold cursor-text">
                {isEditTrue ? "Update" : "Create"} Level
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
              <p className="text-xs font-semibold text-grey_700">Level Name</p>
              <div className="flex flex-col border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                <input
                  className="w-full text-sm outline-none text-custom-gray-3"
                  placeholder="Enter level name"
                  value={levelValue}
                  onChange={(e) => setLevelValue(e.target.value)}
                />
              </div>
                {errormsg && <p className="text-maroon text-sm self-center">Level Name is required!</p>}
            </div>
          </div>

          {mutation.isPending && <div><Loader /></div>}

          {!mutation.isPending && <div className="flex items-center gap-3 w-full justify-center">
            <div
              onClick={() => {
                handleAddLevel();
              }}
              className="flex items-center justify-center w-1/2 py-2 text-center rounded-3xl cursor-pointer bg-[#6A00FF]"
            >
              <p className="text-sm text-white">{isEditTrue? "Update": "Create"}</p>
            </div>
          </div>}
        </div>
      </div>
    </div>
  </div>
);
};

export default LevelModal;

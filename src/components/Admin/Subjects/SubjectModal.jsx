import React, { useEffect, useRef, useState } from "react";
import IMAGES from "../../../assets/images";
import useClickOutside from "../../../hooks/useClickOutlise";
import { useGetSettings } from "../../../api/Admin/SettingsApi";

import { toast } from "react-toastify";
import { useMutation } from "@tanstack/react-query";
import { useBlur } from "../../../context/BlurContext";
import { createSubject, editSubject } from "../../../api/Admin/SubjectsApi";
import Loader from "../../../utils/Loader";

const SubjectModal = ({ open, setopen, refetch, isEditTrue, subjectData, allLevels }) => {

  const { toggleBlur } = useBlur();

  const [subjectValue, setSubjectValue] = useState("");
  const [levelValue, setLevelValue] = useState("");
  const [creditHours, setCreditHours] = useState(3);
  const { settings } = useGetSettings();
  const isUniversity = settings?.institutionType === 'university';
  const [errormsg, setErrormsg] = useState(false);

  const ref = useRef(null);
  useClickOutside(ref, () => {
    setopen(false);
    if (open) {
      toggleBlur();
    }
  });

  const handleAddSubject = async () => {
    if (subjectValue && levelValue) {
      const subjectNamePattern = /^[a-zA-Z0-9\s]+$/;
      const isValidSubjectName = subjectNamePattern.test(subjectValue);
      if (isValidSubjectName) {
        mutation.mutate(subjectValue)
      } else {
        toast.error("Invalid subject name!. Should not have any special characters.");
      }
    } else {
      setErrormsg(true);
      setTimeout(() => {
        setErrormsg(false);
      }, 3000);
    }
  }

  const mutation = useMutation({
    mutationFn: async (subjectValue) => {
      let result;
      const payload = { 
        name: subjectValue, 
        levelID: levelValue,
        creditHours: parseFloat(creditHours) || 3
      };
      
      if (isEditTrue) {
        result = await editSubject(payload, subjectData?.data.id);
      } else {
        result = await createSubject(payload);
      }
      await refetch();
      toast.success(`Subject ${isEditTrue ? "updated" : "added"} successfully!`);
      return result;
    }, onSettled: (data, error) => {
      if (error) {
        toast.error("Subject already exists or error occurred!");
      } else {
        setSubjectValue("");
        setLevelValue("");
        setopen(false);
        toggleBlur();
      }
    }
  });

  useEffect(() => {
    if (isEditTrue && subjectData) {
      const matchingLevel = allLevels?.find(item => item.name === subjectData.levelName);
      setLevelValue(matchingLevel?.id || "");
      setSubjectValue(subjectData?.subjectName || "");
      setCreditHours(subjectData?.data?.creditHours || 3);
    } else {
      setSubjectValue("");
      setLevelValue("");
      setCreditHours(3);
    }
  }, [isEditTrue, subjectData, allLevels, open]);

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 ${open ? "" : "hidden"}`}>
      <div
        ref={ref}
        className="bg-white p-8 w-full max-w-lg border border-black/20 shadow-2xl text-black rounded-xl overflow-y-auto max-h-[90vh] relative"
      >
      <div className="flex flex-1 gap-2">
        <div className="flex flex-col w-full gap-4">
          <div className="flex items-center justify-between">
            <div className="flex justify-center flex-1 w-[fit] gap-2 items-center">
              <p className="text-2xl font-semibold cursor-text">
                {isEditTrue ? "Update" : "Create"} Subject
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
                alt="close"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1 gap-1">
              <p className="text-xs font-semibold text-grey_700">Subject Name</p>
              <div className="flex flex-col border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                <input
                  className="w-full text-sm outline-none text-custom-gray-3 py-2"
                  placeholder="Enter subject name"
                  value={subjectValue}
                  onChange={(e) => setSubjectValue(e.target.value)}
                />
              </div>
              {errormsg && !subjectValue && <p className="text-red-500 text-xs">Subject Name is required!</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col flex-1 gap-1">
              <p className="text-xs font-semibold text-grey_700">Select Level</p>
              <div className="flex flex-col border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                <select
                  value={levelValue}
                  onChange={(e) => setLevelValue(e.target.value)}
                  className="w-full text-sm outline-none text-custom-gray-3 py-2 bg-transparent"
                >
                  <option value="">Select Level</option>
                  {allLevels?.map((item) => (
                    <option key={item?.id} value={item?.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              {errormsg && !levelValue && <p className="text-red-500 text-xs">Level is required!</p>}
            </div>
          </div>

          {isUniversity && (
            <div className="flex items-center gap-3">
              <div className="flex flex-col flex-1 gap-1">
                <p className="text-xs font-semibold text-grey_700">Credit Hours</p>
                <div className="flex flex-col border-[1px] py-1 px-4 rounded-lg w-full items-center border-grey/50">
                  <input
                    type="number"
                    step="0.5"
                    className="w-full text-sm outline-none text-custom-gray-3 py-2"
                    placeholder="Enter credit hours (e.g. 3.0)"
                    value={creditHours}
                    onChange={(e) => setCreditHours(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {mutation.isPending && <div> <Loader /> </div>}

          {!mutation.isPending && (
            <div className="flex items-center gap-3 w-full justify-center mt-4">
              <div
                onClick={handleAddSubject}
                className="flex items-center justify-center w-full py-3 text-center rounded-xl cursor-pointer bg-[#6A00FF] hover:bg-[#5a00d6] transition-colors"
              >
                <p className="text-sm text-white font-bold">{isEditTrue ? "Update Subject" : "Create Subject"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default SubjectModal;

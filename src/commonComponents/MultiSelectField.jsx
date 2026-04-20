import { useEffect, useState } from "react";
import IMAGES from "../../src/assets/images";

const MultiSelectField = ({ options, placeholder, onChange, onSelect }) => {

  const [selectedOptions, setSelectedOptions] = useState([]);
  const allSelected = selectedOptions.length === options.length;
  const someSelected = selectedOptions.length > 0 && !allSelected;

  const handleCheckboxChange = (option) => {
    setSelectedOptions((prevSelected) => {
      const updatedSelection = prevSelected.includes(option)
        ? prevSelected.filter((item) => item !== option)
        : [...prevSelected, option];

      // Trigger the parent onSelect immediately
      onSelect(updatedSelection);
      return updatedSelection;
    });
  };

  const handleSelectAllChange = () => {
    if (allSelected) {
      setSelectedOptions([]);
      onSelect([]);
    } else {
      setSelectedOptions(options);
      onSelect(options);
    }
  };

  useEffect(() => {
    onChange(selectedOptions);
  }, [selectedOptions]);

  return (
    <>
      <div className="w-full">
        <p className="text-xs font-semibold text-grey_700">{placeholder}</p>
        <div className="mb-4 flex items-center p-2 w-full justify-end">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={handleSelectAllChange}
            className="form-checkbox w-3.5 h-3.5 mt-1"
            indeterminate={someSelected.toString()} // Optional: For visual indication of partial selection
          />
          <span className="ml-2  font-medium text-sm h-fit">Select All 🗂️</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2">
          {options.map((option) => (
            <div 
              key={option.id} 
              className="flex items-center gap-4 p-3 bg-gray-50/80 hover:bg-white hover:shadow-lg hover:border-blue-300 rounded-2xl transition-all border border-transparent group cursor-pointer"
              onClick={() => handleCheckboxChange(option)}
            >
              <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedOptions.includes(option)}
                  onChange={() => handleCheckboxChange(option)}
                  className="form-checkbox w-4 h-4 text-[#6A00FF] rounded-lg border-gray-300 focus:ring-[#6A00FF] cursor-pointer transition-all"
                />
              </div>
              
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white shadow-md bg-gray-200">
                  <img
                    src={option.profilePic || IMAGES?.ProfilePic}
                    alt={option.name || "Student"}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    onError={(e) => { e.target.src = IMAGES?.ProfilePic }}
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-bold text-gray-900 leading-snug break-words">
                    {option.name || "No Name"}
                  </span>
                  {option?.qualification && (
                    <span className="text-[10px] text-gray-500 font-medium mt-1">
                      {option.qualification}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default MultiSelectField

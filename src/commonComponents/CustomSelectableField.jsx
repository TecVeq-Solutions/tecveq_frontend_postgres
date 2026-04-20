const CustomSelectableField = ({ label, options, setSelectedOption, selectedOption }) => {
  return (
    <div className="flex flex-col gap-1 py-1">
      <label className="text-xs font-medium text-gray-500 tracking-wide uppercase">
        {label}
      </label>
      <div className="relative">
        <select
          value={typeof selectedOption === "object" ? JSON.stringify(selectedOption) : selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
          className="w-full appearance-none bg-gray-50 border border-gray-200 text-grey_700 text-sm rounded-lg px-3 py-2 pr-9 outline-none focus:border-maroon focus:ring-1 focus:ring-maroon_10 transition cursor-pointer"
        >
          <option value="">Select</option>
          {options?.map((item) => (
            <option key={item.id} value={JSON.stringify(item)}>
              {item.name}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  );
};

export default CustomSelectableField;
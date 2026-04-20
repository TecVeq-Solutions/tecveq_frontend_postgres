const CustomMultiSelectableField = ({
  label,
  options = [],
  selectedOption = [],
  setSelectedOption,
  loading = false,
}) => {
  const toggleSelection = (value) => {
    if (selectedOption.includes(value)) {
      setSelectedOption(selectedOption.filter((v) => v !== value));
    } else {
      setSelectedOption([...selectedOption, value]);
    }
  };

  return (
    <div className="flex flex-col gap-1 py-1">
      <label className="text-xs font-medium text-gray-500 tracking-wide uppercase">
        {label}
      </label>
      <div className="border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
        <div className="max-h-36 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
            <p className="text-center text-sm text-gray-400 py-3">Loading...</p>
          ) : options.length > 0 ? (
            options.map((item) => {
              const checked = selectedOption.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer text-sm transition
                    ${checked ? "bg-maroon_10 text-maroon font-medium" : "text-grey_700 hover:bg-gray-100"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelection(item.id)}
                    className="accent-maroon w-3.5 h-3.5"
                  />
                  {item.name}
                </label>
              );
            })
          ) : (
            <p className="text-center text-sm text-gray-400 py-3">No options available</p>
          )}
        </div>
        {selectedOption.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-gray-200 bg-white">
            {options
              .filter((o) => selectedOption.includes(o.id))
              .map((o) => (
                <span
                  key={o.id}
                  className="inline-flex items-center gap-1 text-xs bg-maroon_10 text-maroon px-2 py-0.5 rounded-full"
                >
                  {o.name}
                  <button
                    onClick={() => toggleSelection(o.id)}
                    className="hover:text-blue-900 leading-none"
                  >×</button>
                </span>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomMultiSelectableField;
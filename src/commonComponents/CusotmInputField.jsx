export const CusotmInputField = ({ valuesObj, value, type, name, status, title, setValue }) => {
    return (
        <div className="my-1 text-sm flex w-full">
            <div className="flex flex-col gap-2 flex-1 w-full">
                <div className="bg-white ">
                    {title}
                </div>
                <div
                    className={`flex px-2 py-1 w-full flex-1 border justify-between rounded-md items-center border-grey/70 ${status ? "text-black" : "text-grey/70"
                        }`}
                >
                    <input
                        type={type}
                        value={value}
                        placeholder={`Enter ${name}`}
                        className="flex flex-1 w-full py-1 outline-none text-black"
                        min={type === "date" ? new Date().toISOString().split("T")[0] : undefined}
                        onChange={(e) => setValue({ ...valuesObj, [name]: e.target.value })}

                    />
                </div>
            </div>
        </div>
    );
};

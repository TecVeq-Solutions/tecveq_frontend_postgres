import React, { useEffect, useState } from 'react';
import { useGetSettings, useUpdateSettings } from '../../../api/Admin/SettingsApi';
import { Link, useNavigate } from 'react-router-dom';

const AttandenceSetting = () => {

    const [isEnableHeadSetting, setIsEnableHeadSetting] = useState(false);
    
    const { settings, isLoading: isGetLoading } = useGetSettings();
    const { updateSettings, isLoading: isUpdateLoading } = useUpdateSettings();

    const handleCheckboxChange = () => {
        const newValue = !isEnableHeadSetting;
        setIsEnableHeadSetting(newValue);
        updateSettings({ enableHeadAttendance: newValue });
    };

    useEffect(() => {
        if (!isGetLoading && settings) {
            setIsEnableHeadSetting(settings.enableHeadAttendance || false);
        }
    }, [settings, isGetLoading]);





    return (
        <>
            <div className='lg:ml-72 p-8 w-full'>
                <div className='flex flex-col w-full justify-end items-end'>
                    <Link to="/admin/add-csv-file">
                        <button
                            className="px-6 py-2 rounded-lg bg-[#6A00FF] text-white"
                        >
                            Import CSV
                        </button>
                    </Link>



                </div>
                {/* <div className='w-full'>
                    <span className='text-2xl font-bold'>Attendance Settings</span>
                </div>
                <div className='w-full shadow-sm rounded-2xl shadow-grey_700 flex flex-row items-center p-6 mt-6 justify-between'>
                    <span className='text-lg font-semibold'>
                        Head Attendance {isEnableHeadSetting ? "enabled" : "disabled"}
                    </span>
                    <span className='h-6'>
                        <input
                            type="checkbox"
                            className='w-5 h-5'
                            onChange={handleCheckboxChange} // Handle change
                            checked={isEnableHeadSetting} // Bind checkbox to state
                        />
                    </span>
                </div> */}
            </div >
        </>
    );
};

export default AttandenceSetting;

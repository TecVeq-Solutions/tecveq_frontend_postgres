import React, { useEffect, useState } from 'react';
import { useAddHeadSettings, useGetHeadSettings, useUpdateHeadSettings } from '../../../api/Admin/SettingsApi';
import { Link, useNavigate } from 'react-router-dom';

const AttandenceSetting = () => {

    const [isEnableHeadSetting, setIsEnableHeadSetting] = useState(false); // State for checkbox
    const [settingId, setSettingId] = useState(null); // State to store ID

    // Fetch head settings
    const { headSettings, isLoading: isGetHeadSettingLoading } = useGetHeadSettings();

    // Mutations for add and update
    const { addHeadSettings, isLoading: isAddHeadSettingLoading } = useAddHeadSettings();
    const { updateHeadSettings, isLoading: isUpdateHeadSettingLoading } = useUpdateHeadSettings();

    // Handle checkbox change
    const handleCheckboxChange = () => {
        const newValue = !isEnableHeadSetting; // Toggle value
        setIsEnableHeadSetting(newValue);

        if (settingId) {
            // If setting exists, update it
            updateHeadSettings({ settingId, enableHeadAttendance: newValue });
        } else {
            // Otherwise, add a new setting
            addHeadSettings({ enableHeadAttendance: newValue });
        }
    };

    // Sync API data to component state
    useEffect(() => {
        if (!isGetHeadSettingLoading && headSettings) {
            setIsEnableHeadSetting(headSettings?.attendenceSetting?.enableHeadAttendance || false); // Set checkbox state
            setSettingId(headSettings?.id || null); // Store setting ID if present
        }
    }, [headSettings, isGetHeadSettingLoading]); // Watch for changes





    return (
        <>
            <div className='w-full p-0 sm:p-4'>
                <div className='flex flex-col w-full justify-end items-end mb-8'>
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

import { Circle } from 'rc-progress'
import React from 'react'
import { useAdmin } from '../../../context/AdminContext';
import { useGetSettings } from '../../../api/Admin/SettingsApi';

const TotalUsers = () => {

    const { adminUsersData } = useAdmin();
    const { settings } = useGetSettings();
    const isUniversity = settings?.institutionType === 'university';

    const UsersCard = ({ title, value }) => {
        return (
            <div className=" -z:40 px-4 md:px-10 sm:flex-1 flex-1 w-full py-4 md:py-7 shadow-md rounded-md flex flex-col justify-center items-center bg-white gap-2 md:gap-3">

                <div className='h-full md:h-full w-full md:w-full flex-1 flex justify-center items-center'>
                    <Circle percent={value< 100 ? value : (value/1000)*100}
                        strokeColor="#6A00FF"
                        strokeWidth={9}
                        trailColor='#EAECF0'
                        trailWidth={9}
                    />
                    <div className='absolute flex flex-col items-center'>
                        <span className='text-sm md:text-xs'>{title}</span>
                        <span className='text-[10px] font-medium md:text-lg'>{value}</span>
                    </div>
                </div>
                <p className='text-xs md:text-sm font-semibold text-center'>
                    {title}
                </p>
            </div>
        )
    }

    return (
        <div className='flex flex-1'>
            <div className='flex flex-col gap-4 flex-1'>
                <p className='text-xl font-medium'>Total Users</p>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-2'>
                    <UsersCard value={adminUsersData.allStudents.length} title={"Students"} />
                    <UsersCard value={adminUsersData.allTeachers.length} title={"Teachers"} />
                    {!isUniversity && <UsersCard value={adminUsersData.allParents.length} title={"Parents"} />}
                    <UsersCard value={adminUsersData.allUsers.length} title={"Total Users"} />
                </div>
            </div>
        </div>
    )
}

export default TotalUsers

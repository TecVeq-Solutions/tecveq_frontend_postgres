import React from 'react'
import AddCSVFileComponent from '../../../components/Admin/AddCSVFile/AddCSVFile'
import Navbar from '../../../components/Admin/Navbar'
import { useBlur } from '../../../context/BlurContext'

const AddCSVFile = () => {
    const { isBlurred } = useBlur();

    return (
        <div className='flex min-h-screen w-full bg-[#F3F4F6] font-poppins'>
            <div className={`flex-grow w-full px-3 sm:px-6 lg:px-10 pb-10 lg:ml-80 transition-all duration-300`}>
                <Navbar heading={"Import CSV"} />
                <div className={`mt-4 sm:mt-6 transition-all duration-300 ${isBlurred ? "blur-sm" : ""}`}>
                    <AddCSVFileComponent />
                </div>
            </div>
        </div>
    )
}

export default AddCSVFile

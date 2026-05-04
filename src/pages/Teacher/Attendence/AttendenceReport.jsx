import React from 'react'
import Navbar from '../../../components/Teacher/Navbar'
import AttendenceReportComp from '../../../components/Teacher/Attendence/AttendenceReportComp'

const AttendenceReport = () => {
    return (
        <div className='px-4 md:px-10 bg-[#f9f9f9]/50 lg:ml-72 xl:ml-80 w-full min-h-screen pb-10 overflow-x-hidden' >
            <div className='max-w-[1400px] '>
                <Navbar heading="Attendance Report" />
                <div className="mt-8 px-4">
                    <AttendenceReportComp />
                </div>
            </div>
        </div>
    )
}

export default AttendenceReport

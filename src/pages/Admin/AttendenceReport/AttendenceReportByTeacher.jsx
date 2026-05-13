import React from 'react'
import Navbar from '../../../components/Admin/Navbar'
import AttendenceReportByTeacherComp from '../../../components/Admin/AttendenceReport/AttendenceReportByTeacherComp'

const AttendenceReportByTeacher = () => {
    return (
        <div className='px-3 sm:px-4 md:px-10 bg-[#f9f9f9]/50 lg:ml-72 xl:ml-80 w-full min-h-screen pb-10 overflow-x-hidden' >
            <div className='max-w-[1400px]  '>
                <Navbar heading={"Attendance Report by Teacher"} />
                <div className="mt-8">
                    <AttendenceReportByTeacherComp />
                </div>
            </div>
        </div>
    )
}

export default AttendenceReportByTeacher

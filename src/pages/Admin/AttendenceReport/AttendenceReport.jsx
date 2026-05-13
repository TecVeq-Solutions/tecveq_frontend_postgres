import React from 'react'
import Navbar from '../../../components/Admin/Navbar'
import AttendenceReportComp from '../../../components/Admin/AttendenceReport/AttendenceReportComp'

const AttendenceReport = () => {
    return (
        <>
            <div className='px-3 sm:px-4 md:px-10 admin-attendence  bg-[#f9f9f9]/50 lg:ml-80 h-[100vh] pb-10' >
                <div className='mr-10'>
                    <Navbar heading={"Attendence Report"} />

                </div>
                <AttendenceReportComp />

            </div>
        </>
    )
}

export default AttendenceReport

import React from 'react'
import Navbar from '../../../components/Admin/Navbar'
import AttendenceReportComp from '../../../components/Admin/AttendenceReport/AttendenceReportComp'

const AttendenceReport = () => {
    return (
        <>
            <div className='px-4 md:px-10 lg:ml-72 w-full min-h-full pb-10' >
                <div className='mr-10'>
                    <Navbar heading={"Attendence Report"} />

                </div>
                <AttendenceReportComp />

            </div>
        </>
    )
}

export default AttendenceReport

import React from 'react';
import Navbar from '../../../components/Student/Dashboard/Navbar';
import AttendenceReportComp from '../../../components/Student/Attendence/AttendenceReportComp';

const StudentAttendenceReport = () => {
    return (
        <div className="flex flex-1 min-h-screen font-poppins px-3 sm:px-4 md:px-10" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f9f9f9 100%)" }}>
            <div className="flex flex-1 lg:ml-72 xl:ml-80 w-full min-h-screen pb-10 overflow-x-hidden">
                <div className="w-full max-w-[1400px]">
                    <div className="pt-1">
                        <Navbar heading="Attendance Report" />
                        <div className="mt-8 px-0 sm:px-4">
                            <AttendenceReportComp />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendenceReport;

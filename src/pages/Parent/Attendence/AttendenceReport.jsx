import React from 'react';
import Navbar from '../../../components/Parent/Dashboard/Navbar';
import AttendenceReportComp from '../../../components/Parent/Attendence/AttendenceReportComp';

const ParentAttendenceReport = () => {
    return (
        <div className="flex flex-1 min-h-screen font-poppins px-3 sm:px-4 md:px-10" style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f9f9f9 100%)" }}>
            <div className="flex flex-1 lg:ml-72 xl:ml-80 w-full min-h-screen pb-10 overflow-x-hidden">
                <div className="w-full max-w-[1400px]">
                    <div className="pt-1">
                        <Navbar heading="Child Attendance Report" />
                        <div className="mt-8 px-0 sm:px-4">
                            <div className="flex flex-col space-y-2 mb-8">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Attendance</h1>
                                <p className="text-gray-500 font-medium">Monitor and track your children's attendance records across all subjects</p>
                            </div>
                            <AttendenceReportComp />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentAttendenceReport;

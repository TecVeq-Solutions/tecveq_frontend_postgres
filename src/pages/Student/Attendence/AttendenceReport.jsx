import React from 'react';
import Navbar from '../../../components/Student/Dashboard/Navbar';
import AttendenceReportComp from '../../../components/Student/Attendence/AttendenceReportComp';

const StudentAttendenceReport = () => {
    return (
        <div className="flex flex-col flex-1 overflow-hidden h-screen bg-[#F8F9FA]">
            <Navbar heading="Personal Attendance Report" />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col space-y-2 mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Attendance History</h1>
                        <p className="text-gray-500 font-medium">Track your academic presence and consistency across all subjects</p>
                    </div>
                    <AttendenceReportComp />
                </div>
            </main>
        </div>
    );
};

export default StudentAttendenceReport;

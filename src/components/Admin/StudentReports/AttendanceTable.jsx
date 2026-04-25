import moment from 'moment/moment';
import React from 'react'

const AttendanceTable = ({ data }) => {
    return (
        <div className="flex flex-1 w-full overflow-hidden">
            <div className="flex flex-col flex-1 gap-2 w-full overflow-x-auto">
                <div className="flex flex-1 min-w-[500px]">
                    <table className="flex flex-col flex-1 bg-white rounded-lg table-fixed w-full">
                        <thead className="flex gap-5 px-2 py-3 rounded-tl-lg rounded-tr-lg border-t-[#0B1053] bg-[#dbddf8]">
                            <tr className="flex flex-1">
                                <td className="flex-[1] flex justify-center md:text-[15px] text-[13px]">Sr No.</td>
                                <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Status</td>
                                <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Date</td>
                                <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Time</td>
                            </tr>
                        </thead>

                        <tbody className="flex flex-col">
                            {data?.map((item, index) => {
                                if (item?.matchedAttendance?.length !== 0) {
                                    return item.matchedAttendance.map((att) => {
                                        return (
                                            <tr key={JSON.stringify(att)} className="flex flex-1 text-xs border-t border-t-black/10">
                                                <td className="flex-[1] py-2 lg:py-3 flex justify-center">{index + 1}</td>
                                                <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                                                    {att?.late ? "Late" : (att?.isPresent ? "Present" : "Absent")}
                                                </td>
                                                <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                                                    {moment(item.startTime).format("Do MMM YYYY")}
                                                </td>
                                                <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                                                    {moment(item.startTime).format("hh:mm a")} - {moment(item.endTime).format("hh:mm a")}
                                                </td>
                                            </tr>
                                        );
                                    })
                                }
                                return null;
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AttendanceTable

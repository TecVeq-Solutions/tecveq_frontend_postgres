import moment from 'moment/moment';
import React from 'react'

const AttendanceTable = ({ data }) => {
    return (
        <div className="flex flex-1">
            <div className="flex flex-col flex-1 gap-2">
                <div className="flex flex-1">
                    <table className="flex flex-col flex-1 bg-white rounded-lg table-fixed">
                        <thead className="flex gap-5 px-2 py-3 rounded-tl-lg rounded-tr-lg border-t-[#0B1053]  bg-[#afb3f7]">
                            <tr className="flex flex-1">
                                
                                <td className="flex-[1] flex justify-center md:text-[15px] text-[13px]">Sr No.</td>
                                <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Status</td>
                                <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Date</td>
                                <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Time</td>
                            </tr>
                        </thead>

                        <tbody className="flex flex-col">
                            {data?.map((item, index) => {
                                if (Array.isArray(item?.matchedAttendance)) {
                                    return item.matchedAttendance.map((att, attIndex) => {
                                        if (!att) return null;
                                        const status = att.late ? "Late" : (att.isPresent ? "Present" : "Absent");
                                        const dateDisplay = moment(item.startTime).format("Do MMM YYYY");
                                        const timeDisplay = `${moment(item.startTime).format("hh:mm a")} - ${moment(item.endTime).format("hh:mm a")}`;

                                        return (
                                            <tr key={`${index}-${attIndex}`} className="flex flex-1 text-xs border-t border-t-black/10">
                                                <td className="flex-[1] py-2 lg:py-3 flex justify-center">{index + 1}</td>
                                                <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                                                    {status}
                                                </td>
                                                <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                                                    {dateDisplay}
                                                </td>
                                                <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                                                    {timeDisplay}
                                                </td>
                                            </tr>
                                        );
                                    });
                                } else if (item?.matchedAttendance) {
                                    // Handle single object case if it ever happens or was mapped as such
                                    const att = item.matchedAttendance;
                                    const status = att.late ? "Late" : (att.isPresent ? "Present" : "Absent");
                                    const dateDisplay = moment(item.startTime).format("Do MMM YYYY");
                                    const timeDisplay = `${moment(item.startTime).format("hh:mm a")} - ${moment(item.endTime).format("hh:mm a")}`;

                                    return (
                                        <tr key={index} className="flex flex-1 text-xs border-t border-t-black/10">
                                            <td className="flex-[1] py-2 lg:py-3 flex justify-center">{index + 1}</td>
                                            <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                                                {status}
                                            </td>
                                            <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                                                {dateDisplay}
                                            </td>
                                            <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                                                {timeDisplay}
                                            </td>
                                        </tr>
                                    );
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

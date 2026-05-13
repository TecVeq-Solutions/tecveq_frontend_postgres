import moment from 'moment/moment';
import React from 'react'
import { Doughnut } from 'react-chartjs-2';

const AttendanceTable = ({ data }) => {

    const thClass = "flex justify-center items-center text-center md:text-[15px] text-[11px] font-medium min-w-0 break-words";
    const tdClass = "flex justify-center items-center text-center px-[2px] md:px-[4px] text-[10px] md:text-[14px] py-2 lg:py-3 border-l border-l-black/10 min-w-0 break-words leading-tight";

    return (
        <div className="flex flex-1">
            <div className="flex flex-col flex-1 gap-2">
                <div className="flex flex-1 overflow-x-auto">
                    <table className="flex flex-col flex-1 bg-white rounded-lg w-full">
                        <thead className="flex gap-5 px-2 py-3 rounded-tl-lg rounded-tr-lg border-t-[#0B1053] bg-[#afb3f7]">
                            <tr className="flex flex-1 w-full">
                                <td className={`flex-[1] ${thClass}`}>Sr No.</td>
                                <td className={`flex-[3] ${thClass}`}>Status</td>
                                <td className={`flex-[3] ${thClass}`}>Date</td>
                                <td className={`flex-[3] ${thClass}`}>Time</td>
                            </tr>
                        </thead>

                        <tbody className="flex flex-col w-full">
                            {(() => {
                                const processedData = [];
                                const seenDates = new Map();
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);

                                (data || []).forEach(item => {
                                    const itemDate = new Date(item.startTime || item.date);
                                    itemDate.setHours(0, 0, 0, 0);

                                    // Filter out future absent records
                                    const status = item?.isPresent ? (item?.late ? "Late" : "Present") : "Absent";
                                    if (itemDate > today && status === 'Absent') return;

                                    const dateKey = itemDate.toDateString();
                                    const existing = seenDates.get(dateKey);

                                    const isPlaceholder = (time) => {
                                        if (!time) return true;
                                        const d = new Date(time);
                                        return d.getHours() === 5 && d.getMinutes() === 0;
                                    };

                                    const currentIsPlaceholder = isPlaceholder(item.startTime);

                                    if (!existing || (isPlaceholder(existing.startTime) && !currentIsPlaceholder)) {
                                        seenDates.set(dateKey, item);
                                    }
                                });

                                return Array.from(seenDates.values())
                                    .sort((a, b) => new Date(b.startTime || b.date) - new Date(a.startTime || a.date))
                                    .map((item, index) => {
                                        const status = item?.isPresent ? (item?.late ? "Late" : "Present") : "Absent";
                                        const dateDisplay = moment(item.startTime || item.date).format("Do MMM YYYY");
                                        const timeDisplay = item.startTime ? `${moment(item.startTime).format("hh:mm a")} - ${moment(item.endTime).format("hh:mm a")}` : "N/A";

                                        return (
                                            <tr key={index} className="flex flex-1 w-full border-t border-t-black/10 items-stretch hover:bg-gray-50 transition-colors">
                                                <td className="flex-[1] py-2 lg:py-3 flex justify-center items-center text-[10px] md:text-[14px] min-w-0 font-medium">
                                                    {index + 1}
                                                </td>
                                                <td className={`flex-[3] ${tdClass}`}>
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] md:text-xs font-bold uppercase ${
                                                        status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 
                                                        status === 'Late' ? 'bg-amber-100 text-amber-700' : 
                                                        'bg-rose-100 text-rose-700'
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </td>
                                                <td className={`flex-[3] ${tdClass}`}>
                                                    {dateDisplay}
                                                </td>
                                                <td className={`flex-[3] ${tdClass}`}>
                                                    {timeDisplay}
                                                </td>
                                            </tr>
                                        );
                                    });
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default AttendanceTable

import moment from 'moment';
import React from 'react'
import { Doughnut } from 'react-chartjs-2';

const AttendanceTable = ({ data }) => {

    const chartData = [
        {
            label: "Present",
            value: 0,
        },
        {
            label: "Absent",
            value: 0,
        },
        {
            label: "Leave",
            value: 0,
        },
    ];

    //console.log("data in table attendance is : ", data);
    return (
        <div className="flex w-full md:flex-1 overflow-hidden">
            <div className="flex flex-col w-full md:flex-1 gap-2 overflow-x-auto">
                <div className="flex flex-1 flex-col w-full border-t-[#0B1053] bg-[#c3c6f6] min-w-[500px]">
                    <div className='flex py-3'>
                        <td className="flex-[1] flex justify-center md:text-[15px] text-[13px]">Sr No.</td>
                        <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Status</td>
                        <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Date</td>
                        <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Time</td>
                        <td className="flex-[3] flex justify-center md:text-[15px] text-[13px]">Class</td>
                    </div>
                    <div className='flex w-full md:flex-1'>

                        <table className="flex flex-col flex-1 bg-white rounded-lg table-fixed">
                            <tbody className="flex flex-col">
                                {data?.classData?.map((item, index) => {
                                    if(item.teacherStatus === "present"){
                                        chartData[0].value = chartData[0].value + 1
                                    }
                                    if(item.teacherStatus === "absent"){
                                        chartData[1].value = chartData[1].value + 1
                                    }
                                    if(item.teacherStatus === "leave"){
                                        chartData[2].value = chartData[2].value + 1
                                    }
                                    return (
                                        <tr key={index} className="flex flex-1 text-xs border-t border-t-black/10">
                                            <td className="flex-[1] py-2 lg:py-3 flex justify-center">{index + 1}</td>
                                            <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center uppercase">
                                                {item.teacherStatus}
                                            </td>
                                            <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                                                {moment.utc(item.startTime).format("Do MMM YYYY")}
                                            </td>
                                            <td className="flex-[3] py-2 lg:py-3 border-l border-l-black/10 flex justify-center">
                                                {moment.utc(item.startTime).format("hh:mm A")} - {moment.utc(item.endTime).format("hh:mm A")}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {(!data?.classData || data.classData.length === 0) && <div className='justify-center flex py-2 text-xl'>No data to display</div>}

                            </tbody>

                        </table>

                        <div className="flex items-center justify-center  bg-white ">

                            <div className="flex flex-col gap-2 w-full">
                                <div className=" hidden md:flex  md:w-[200px] md:h-[200px]">
                                    {data.classData.length == 0 ?
                                        <></> :
                                        <Doughnut
                                            data={{
                                                datasets: [
                                                    {
                                                        label: "Count",
                                                        data: chartData.map((data) => data.value),
                                                        backgroundColor: ["#11AF03", "#C53F3F", "#EAECF0"],
                                                        borderColor: ["#11AF03", "#C53F3F", "#EAECF0"],
                                                    },
                                                ],
                                                labels: chartData.map((data) => data.label),
                                            }}
                                        />
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AttendanceTable

// // import React from 'react'
// // import IMAGES from '../../../assets/images'

// // const SystemOverview = () => {
// //   return (
// //     <div>
// //         <img src={IMAGES.graph} alt="" className='w-full h-full' />

// //     </div>
// //   )
// // }

// // export default SystemOverview
// import React, { useEffect, useState } from 'react';
// // import CanvasJSReact from '@canvasjs/react-charts';
// import IMAGES from '../../../assets/images';

// // import CanvasJSReact from '@canvasjs/react-charts';
// // //var CanvasJSReact = require('@canvasjs/react-charts');

// // var CanvasJS = CanvasJSReact.CanvasJS;
// // var CanvasJSChart = CanvasJSReact.CanvasJSChart;
// const SystemOverview = () => {

// // const [CanvasJSChart, setCanvasJSChart] = useState(null);

// // useEffect(() => {
// //   const loadCanvasJS = async () => {
// //     // Dynamically import the library
// //     const module = await import('@canvasjs/react-charts');
// //     setCanvasJSChart(module.CanvasJSChart);
// //   };

// //   loadCanvasJS();
// // }, []);

//   const options = {
//     backgroundColor: "transparent",
//     animationEnabled: true,
//     toolTip: {
//       shared: true,
//     },
//     axisX: {
//       titleFontColor: "#00000090",
//       fontFamily:"verdana",
//       labelFontColor: "#00000080",
//       tickThickness: 0,
//       title:"Month",
//       lineColor: "#00000020"
//     },
//     axisY: {
//       interval: 200,
//       titleFontColor: "#00000090",
//       labelFontColor: "#00000080",
//       title:"Active users",
//       fontFamily:"verdana",
//       gridColor: "#00000020",
//       lineThickness: 0,
//     },
//     legend: {
//       padding: 120,
//       horizontalAlign: "right",
//       verticalAlign: "top"
//     },
//     data: [
//       {
//         type: "spline",
//         showInLegend: true,
//         name: "students",
//         dataPoints: [
//           { y: 310, label: "Jan" },
//           { y: 410, label: "Feb" },
//           { y: 510, label: "Mar" },
//           { y: 610, label: "Apr" },
//           { y: 710, label: "May" },
//           { y: 810, label: "Jun" },
//           { y: 920, label: "Jul" },
//           { y: 400, label: "Aug" },
//           { y: 500, label: "Sept" },
//           { y: 600, label: "Oct" },
//           { y: 800, label: "Nov" },
//           { y: 1000, label: "Dec" },
//         ],
//       },
//       {
//         type: "spline",
//         showInLegend: true,
//         name: "parents",
//         dataPoints: [
//           { y: 210, label: "Jan" },
//           { y: 410, label: "Feb" },
//           { y: 510, label: "Mar" },
//           { y: 610, label: "Apr" },
//           { y: 810, label: "May" },
//           { y: 910, label: "Jun" },
//           { y: 920, label: "Jul" },
//           { y: 200, label: "Aug" },
//           { y: 400, label: "Sept" },
//           { y: 600, label: "Oct" },
//           { y: 800, label: "Nov" },
//           { y: 1000, label: "Dec" },
//         ],
//       },
//     ],
//   };

//   // if (!CanvasJSChart) return <div>Loading...</div>;

//   return (
//     <div className='px-4 py-8 bg-white border border-black/20 rounded-lg'>
//       {/* <CanvasJSChart options={options} /> */}
//       <div>
//         <img src={IMAGES.graph} alt="" className='w-full h-full' />
//       </div>
//     </div>
//   );
// };

// export default SystemOverview;


import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../../../constants/api';
import { useGetSettings } from '../../../api/Admin/SettingsApi';

const SystemOverview = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useGetSettings();
  const isUniversity = settings?.institutionType === 'university';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/stats/system-overview`, { withCredentials: true });
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else {
          console.error('API did not return an array:', response.data);
          setData([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast.error('Failed to load system overview data');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[300px] bg-white border border-black/20 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] p-4 bg-white border border-black/20 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="Students" stroke="#8884d8" activeDot={{ r: 8 }} />
          {!isUniversity && <Line type="monotone" dataKey="Parents" stroke="#82ca9d" />}
          <Line type="monotone" dataKey="Teachers" stroke="#ffc658" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SystemOverview;

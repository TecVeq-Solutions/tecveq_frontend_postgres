import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BACKEND_URL } from '../../../constants/api';

const SERIES = [
  { key: 'Students', color: '#8884d8', dash: '' },
  { key: 'Parents', color: '#2AB07F', dash: '5 3' },
  { key: 'Teachers', color: '#E9A50A', dash: '2 2' },
];

const PILL_COLORS = {
  Students: { bg: '#EEF0FF', border: '#8884d8', text: '#4B47A8' },
  Parents: { bg: '#EAFAF2', border: '#2AB07F', text: '#0C6B42' },
  Teachers: { bg: '#FEF8E7', border: '#E9A50A', text: '#8A5F04' },
};

const MetricCard = ({ label, value, badge, up }) => (
  <div className="flex flex-col gap-1 bg-black/5 rounded-lg px-4 py-3">
    <p className="text-xs text-black/40 m-0">{label}</p>
    <p className="text-xl font-medium text-black/80 m-0">
      {value.toLocaleString()}
      <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${up ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
        {badge}
      </span>
    </p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-black/10 rounded-lg px-3 py-2 shadow-sm text-sm">
      <p className="font-medium text-black/70 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="m-0">
          {p.name}: <span className="font-medium">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

const SystemOverview = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hidden, setHidden] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/stats/system-overview`, { withCredentials: true });
        setData(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        toast.error('Failed to load system overview data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totals = SERIES.reduce((acc, { key }) => {
    acc[key] = data.reduce((sum, d) => sum + (d[key] || 0), 0);
    return acc;
  }, {});

  const toggleSeries = (key) =>
    setHidden(prev => ({ ...prev, [key]: !prev[key] }));

  if (loading) return (
    <div className="flex items-center justify-center w-full min-h-[340px] bg-white border border-black/10 rounded-xl">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-400 border-t-transparent" />
    </div>
  );

  return (
    <div className="w-full bg-white border border-black/10 rounded-xl p-2 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[15px] font-medium text-black/80 m-0">System Overview</p>
          <p className="text-xs text-black/40 mt-0.5 m-0">Monthly active users — 2024</p>
        </div>
        <div className="flex gap-1.5">
          {SERIES.map(({ key }) => {
            const c = PILL_COLORS[key];
            return (
              <button
                key={key}
                onClick={() => toggleSeries(key)}
                style={{ background: c.bg, borderColor: c.border, color: c.text, opacity: hidden[key] ? 0.35 : 1 }}
                className="text-[11px] font-medium px-2.5 py-1 rounded-full border transition-opacity"
              >
                {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <MetricCard label="Total Students" value={totals.Students || 7370} badge="+12%" up />
        <MetricCard label="Total Parents" value={totals.Parents || 6860} badge="+8%" up />
        <MetricCard label="Total Teachers" value={totals.Teachers || 4540} badge="-3%" up={false} />
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-3">
        {SERIES.map(({ key, color }) => (
          <span key={key} className="flex items-center gap-1.5 text-xs text-black/50">
            <span style={{ background: color }} className="w-2 h-2 rounded-full inline-block" />
            {key}
          </span>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v} tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {SERIES.map(({ key, color, dash }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              strokeWidth={2}
              strokeDasharray={dash}
              dot={{ r: 3, fill: color, stroke: '#fff', strokeWidth: 1.5 }}
              activeDot={{ r: 6 }}
              hide={!!hidden[key]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SystemOverview;
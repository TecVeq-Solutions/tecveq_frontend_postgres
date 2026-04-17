import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trophy, 
  ArrowRight, 
  TrendingUp, 
  BookOpen, 
  Award,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../constants/api';
import { useUser } from '../../context/UserContext';

const PerformanceSummary = ({ studentId }) => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchSummary();
    }
  }, [studentId]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const [reportRes, attRes] = await Promise.all([
         axios.get(`${BACKEND_URL}/gradebook/report/${studentId}`),
         axios.get(`${BACKEND_URL}/classroom/attendence/student-all-subjects-attendence/${studentId}`).catch(() => ({ data: [] }))
      ]);
      setReportData(reportRes.data);
      setAttendanceData(attRes.data);
    } catch (error) {
      console.error('Failed to fetch performance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[200px]">
       <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );

  if (!reportData || !reportData.subjects || reportData.subjects.length === 0) return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[200px] text-center">
       <div className="bg-gray-50 p-4 rounded-2xl mb-4">
          <BookOpen className="w-8 h-8 text-gray-300" />
       </div>
       <p className="text-gray-400 font-bold text-sm">No academic data available yet.</p>
    </div>
  );

  const { userData } = useUser();
  const { overall, subjects } = reportData;

  // Calculate dynamic yields
  const totalCredits = subjects.reduce((sum, s) => sum + (s.credits || 0), 0);
  
  let attendancePercentage = 100;
  if (attendanceData && attendanceData.length > 0) {
     const present = attendanceData.find(d => d.label === 'Present')?.value || 0;
     const absent = attendanceData.find(d => d.label === 'Absent')?.value || 0;
     const total = present + absent;
     if (total > 0) {
        attendancePercentage = Math.round((present / total) * 100);
     }
  }

  const handleViewFullReport = () => {
    if (userData?.userType === 'parent') {
      navigate(`/parent/report-card/${studentId}`);
    } else {
      navigate('/report-card');
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-lg shadow-gray-100/50 border border-indigo-50/50 flex flex-col h-full group hover:border-indigo-100 transition-all font-poppins">
      <div className="flex items-center justify-between mb-8">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Academic Status</h3>
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Latest Performance Overview</p>
        </div>
        <div className={`px-4 py-2 rounded-2xl text-white font-black text-lg bg-gradient-to-br transition-all group-hover:scale-110 ${
          overall.grade === 'F' ? 'from-rose-500 to-rose-600 shadow-rose-100' : 'from-indigo-500 to-indigo-600 shadow-indigo-100'
        }`}>
          {overall.grade}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
         <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 group-hover:bg-white transition-colors">
            {reportData.institutionType === 'university' ? (
              <>
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Credit Hours</span>
                 <span className="text-2xl font-black text-indigo-600">{totalCredits}</span>
              </>
            ) : (
              <>
                 <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Percentage</span>
                 <span className="text-2xl font-black text-indigo-600">{overall.percentage}%</span>
              </>
            )}
         </div>
         <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 group-hover:bg-white transition-colors">
            {reportData.institutionType === 'university' ? (
              <>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">CGPA (Total)</span>
                <span className="text-2xl font-black text-emerald-600">{overall.cgpa || '0.00'}</span>
              </>
            ) : (
              <>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Attendance/Behavior</span>
                <span className="text-2xl font-black text-emerald-600">
                   {attendancePercentage}%
                </span>
              </>
            )}
         </div>
      </div>

      <div className="space-y-3 mb-8">
         {subjects.slice(0, 3).map((sub, idx) => (
           <div key={idx} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl group-hover:bg-white transition-colors">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-sm shadow-indigo-100" />
                 <span className="text-xs font-black text-gray-700">{sub.name}</span>
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                sub.stats.grade === 'F' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
              }`}>
                {sub.stats.grade}
              </span>
           </div>
         ))}
      </div>

      <button 
        onClick={handleViewFullReport}
        className="mt-auto w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-gray-200 hover:shadow-indigo-100"
      >
        View Full Report
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default PerformanceSummary;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardCheck, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../../constants/api';

const TeacherGradingWidget = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/exam`);
      // Show only active or recent exams (e.g. within last 30 days)
      setExams(res.data.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch exams for widget:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex items-center justify-center min-h-[250px]">
       <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
    </div>
  );

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-lg shadow-gray-100/50 border border-indigo-50/50 flex flex-col h-full group hover:border-indigo-100 transition-all font-poppins">
      <div className="flex items-center justify-between mb-8">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <ClipboardCheck className="w-5 h-5 text-indigo-500" />
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Grading Status</h3>
           </div>
           <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Evaluation Control Center</p>
        </div>
      </div>

      <div className="space-y-4 mb-8">
         {exams.length === 0 ? (
           <div className="text-center py-10 opacity-30">
              <AlertCircle className="w-10 h-10 mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">No Active Exams</p>
           </div>
         ) : exams.map((exam) => (
           <div key={exam.id} className={`p-5 rounded-3xl border transition-all ${exam.isLocked ? 'bg-amber-50/30 border-amber-100' : 'bg-gray-50 border-gray-100 group-hover:bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                 <span className={`text-[10px] font-black uppercase tracking-widest ${exam.isLocked ? 'text-amber-600' : 'text-indigo-500'}`}>
                    {exam.term} {exam.year}
                 </span>
                 {exam.isLocked ? (
                   <div className="flex items-center gap-1 text-[8px] font-black text-amber-600 uppercase tracking-widest">
                      <CheckCircle2 className="w-3 h-3" /> Locked
                   </div>
                 ) : (
                   <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                      <Clock className="w-3 h-3" /> Entry Active
                   </div>
                 )}
              </div>
              <h4 className="text-sm font-black text-gray-800 leading-tight mb-4">{exam.title}</h4>
              <button 
                onClick={() => navigate(`/teacher/exams/marks/${exam.id}`)}
                className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  exam.isLocked ? 'bg-white text-gray-400 border border-gray-100' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:scale-105'
                }`}
              >
                {exam.isLocked ? 'View Results' : 'Enter Marks'}
                <ArrowRight className="w-3 h-3" />
              </button>
           </div>
         ))}
      </div>

      <button 
        onClick={() => navigate('/teacher/exams')}
        className="mt-auto w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 transition-all active:scale-95 shadow-xl shadow-gray-100 hover:shadow-indigo-100"
      >
        All Examinations
        <BookOpen className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default TeacherGradingWidget;

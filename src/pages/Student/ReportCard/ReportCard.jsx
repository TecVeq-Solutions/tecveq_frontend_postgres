import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Award, 
  TrendingUp, 
  BookOpen, 
  Download, 
  Loader2,
  Star,
  BarChart3,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Layers,
  Target,
  Medal,
  Users,
  UserX,
  Target as TargetIcon
} from 'lucide-react';
import { useUser } from '../../../context/UserContext';
import { BACKEND_URL } from '../../../constants/api';

const GRADE_COLORS = {
  'A+': { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'A':  { bg: 'bg-emerald-400', light: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200' },
  'B':  { bg: 'bg-blue-500',    light: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  'C':  { bg: 'bg-yellow-500',  light: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200' },
  'D':  { bg: 'bg-orange-500',  light: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200' },
  'F':  { bg: 'bg-red-500',     light: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  'A':  { bg: 'bg-amber-500',    light: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' }, // Absent
};

const getGradeStyle = (grade) => GRADE_COLORS[grade] || { bg: 'bg-gray-400', light: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' };

const ReportCard = () => {
  const { studentId: paramId } = useParams();
  const { userData } = useUser();
  const studentId = paramId || userData?.id;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSubjects, setExpandedSubjects] = useState({});

  useEffect(() => {
    if (studentId && studentId !== 'undefined') {
      fetchReport();
    }
  }, [studentId]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/gradebook/report/${studentId}`);
      setReport(response.data);
    } catch (error) {
      toast.error('Failed to load report card');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (id) => setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen ml-80 bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-gray-400 font-bold text-xs tracking-widest uppercase">Analyzing Performance Matrix...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-screen ml-80 bg-gray-50">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No Report Generated Yet</p>
        </div>
      </div>
    );
  }

  const overallGradeStyle = getGradeStyle(report.overall?.grade);

  return (
    <div className="min-h-screen bg-gray-50/50 ml-80 print:ml-0 font-poppins">
      <div className="max-w-6xl mx-auto p-8 space-y-10">
        
        {/* Profile & Overall Rank Header */}
        <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50">
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-12 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48 blur-3xl" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-y-32 -translate-x-32 blur-2xl" />
             
             <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
               <div className="flex items-center gap-8">
                 <div className="w-24 h-24 rounded-3xl bg-white/10 border-2 border-white/20 flex items-center justify-center text-4xl font-black backdrop-blur-md shadow-2xl">
                    {report.studentName?.charAt(0)}
                 </div>
                 <div>
                   <div className="flex items-center gap-2 mb-2">
                     <Award className="w-4 h-4 text-amber-400 fill-amber-400" />
                     <span className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.4em]">Official Academic Transcript</span>
                   </div>
                   <h1 className="text-4xl font-black tracking-tight">{report.studentName}</h1>
                   <div className="flex items-center gap-6 mt-4 text-indigo-100/70 text-sm font-bold uppercase tracking-widest">
                     <span>Roll: {report.rollNo}</span>
                     <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full opacity-40" />
                     <span>{report.level} Authority</span>
                   </div>
                 </div>
               </div>

               <div className="flex items-center gap-6 self-end lg:self-center">
                  <div className="bg-white/10 border border-white/20 rounded-[32px] px-8 py-6 text-center backdrop-blur-md">
                     <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Class Position</p>
                     <p className="text-3xl font-black text-white">{report.overall?.rank || 'N/A'}</p>
                  </div>
                  <div className={`${overallGradeStyle.bg} border-2 border-white/30 rounded-[32px] px-10 py-6 text-center shadow-2xl`}>
                     <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mb-1">Overall Outcome</p>
                     <p className="text-5xl font-black text-white">{report.overall?.grade}</p>
                     <p className="text-white/80 text-xs font-black mt-1 tracking-widest">{report.overall?.percentage}% AVG</p>
                  </div>
               </div>
             </div>
          </div>

          <div className="px-12 py-8 bg-gray-50/50 flex items-center justify-between border-t border-gray-100">
             <div className="flex-1 max-w-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Performance Trajectory</span>
                  <span className="text-xs font-black text-gray-600">{report.overall?.percentage}% Matrix</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                   <div className={`h-full ${overallGradeStyle.bg} rounded-full transition-all duration-1000`} style={{ width: `${report.overall?.percentage}%` }} />
                </div>
             </div>
             <button onClick={() => window.print()} className="print:hidden ml-10 flex items-center gap-3 px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl text-gray-900 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-sm">
                <Download className="w-4 h-4" /> Export Report
             </button>
          </div>
        </div>

        {/* Competitive Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4"><Medal className="w-6 h-6" /></div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Class Position</p>
              <h4 className="text-3xl font-black text-gray-900 mt-1">{report.overall?.rank?.split(' / ')[0]}<span className="text-base text-gray-300 ml-1">/{report.overall?.rank?.split(' / ')[1]}</span></h4>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><TargetIcon className="w-6 h-6" /></div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">GPA / CGPA</p>
              <h4 className="text-3xl font-black text-gray-900 mt-1">{report.overall?.cgpa || '0.00'}</h4>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4"><Users className="w-6 h-6" /></div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Evaluated Items</p>
              <h4 className="text-3xl font-black text-gray-900 mt-1">{report.subjects?.length} <span className="text-xs text-gray-400 font-bold">Subjects</span></h4>
           </div>
           <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mb-4"><Star className="w-6 h-6" /></div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Honors</p>
              <h4 className="text-xl font-black text-gray-900 mt-2">{report.overall?.percentage >= 90 ? 'High Merit' : report.overall?.percentage >= 70 ? 'Merit' : 'Pass'}</h4>
           </div>
        </div>

        {/* Subject Breakdown */}
        <div className="space-y-6">
           <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Domain Performance Analysis
           </h2>
           
           <div className="grid grid-cols-1 gap-4">
              {report.subjects.map(subj => {
                 const gradeStyle = getGradeStyle(subj.grade);
                 const isHighest = subj.total === subj.highestInClass && subj.total > 0;
                 return (
                   <div key={subj.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all">
                      <div className="p-8 flex items-center justify-between cursor-pointer" onClick={() => toggleSubject(subj.id)}>
                         <div className="flex items-center gap-8">
                            <div className={`w-20 h-20 rounded-3xl ${gradeStyle.light} ${gradeStyle.text} border-2 ${gradeStyle.border} flex items-center justify-center text-2xl font-black shadow-inner`}>
                               {subj.grade}
                            </div>
                            <div>
                               <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-black text-gray-900">{subj.name}</h3>
                                  {isHighest && (
                                     <span className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-200">
                                        <Trophy className="w-3 h-3" /> Highest in Class
                                     </span>
                                  )}
                               </div>
                               <div className="flex items-center gap-6 mt-2 text-xs font-bold text-gray-400">
                                  <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Score: <span className="text-gray-900">{Math.round(subj.total)}%</span></span>
                                  <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> GPA: <span className="text-gray-900">{subj.points}</span></span>
                                  <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Class Highest: <span className="text-gray-900">{subj.highestInClass}%</span></span>
                               </div>
                            </div>
                         </div>

                         <div className="flex items-center gap-6">
                            <div className="hidden md:flex flex-col items-end">
                               <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Subject Mastery</p>
                               <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${gradeStyle.bg} rounded-full`} style={{ width: `${subj.total}%` }} />
                               </div>
                            </div>
                            <button className="p-3 bg-gray-50 rounded-2xl hover:bg-indigo-50 transition-all">
                               {expandedSubjects[subj.id] ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                            </button>
                         </div>
                      </div>

                      {expandedSubjects[subj.id] && (
                        <div className="bg-gray-50/50 border-t border-gray-100 p-8 pt-0 animate-in slide-in-from-top-4 duration-300">
                           <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 pt-8 pb-4">
                              {[
                                { label: 'Assgn', val: subj.stats?.assignments, w: report.weights?.assignmentWeight, color: 'bg-blue-500' },
                                { label: 'Proj', val: subj.stats?.projects, w: report.weights?.projectWeight, color: 'bg-emerald-500' },
                                { label: 'Quiz', val: subj.stats?.quizzes, w: report.weights?.quizWeight, color: 'bg-violet-500' },
                                { label: 'C.Test', val: subj.stats?.classTests, w: report.weights?.classTestWeight, color: 'bg-pink-500' },
                                { label: 'Exams', val: subj.stats?.exams, w: report.weights?.examWeight, color: 'bg-indigo-600' }
                              ].filter(c => c.w > 0).map(c => (
                                <div key={c.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                                   <div className={`absolute top-0 right-0 w-12 h-12 ${c.color} opacity-[0.03] rounded-bl-full`} />
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{c.label}</p>
                                   <p className="text-2xl font-black text-gray-900">{c.val}%</p>
                                   <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                                      <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.val}%` }} />
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      )}
                   </div>
                 );
              })}
           </div>
        </div>

        {/* Grading Metrics Policy */}
        <div className="bg-[#0D1268] rounded-[40px] p-12 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-md">
                 <h3 className="text-2xl font-black tracking-tight mb-4">Academic Policy & Weighting</h3>
                 <p className="text-indigo-200 text-xs font-medium leading-relaxed opacity-80">
                    This evaluation is based on a multi-dimensional matrix. Your final grade aggregates Classroom Tests, Projects, Periodic Quizzes, and Sum-term Examinations according to the verified weighting policy of your academic year.
                 </p>
              </div>
              <div className="flex gap-4">
                 {[
                   { l: 'Assigned', v: report.weights?.assignmentWeight + report.weights?.projectWeight + report.weights?.quizWeight + report.weights?.classTestWeight + report.weights?.examWeight + (report.weights?.firstTermWeight || 0) + (report.weights?.midTermWeight || 0) + (report.weights?.finalTermWeight || 0), pct: '100%' },
                   { l: 'Verified', v: 'Yes', pct: 'LIVE' }
                 ].map((p, i) => (
                    <div key={i} className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm border border-white/10 min-w-[140px] text-center">
                       <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-1">{p.l}</p>
                       <p className="text-2xl font-black text-white">{p.pct}</p>
                    </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ReportCard;

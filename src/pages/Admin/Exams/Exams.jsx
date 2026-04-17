import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Trophy, 
  Calendar, 
  Plus, 
  ArrowRight, 
  Loader2,
  Settings,
  FileText,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  BarChart3,
  X,
  CheckCircle2,
  Clock,
  Send,
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useUser } from '../../../context/UserContext';
import { BACKEND_URL } from '../../../constants/api';

const Exams = () => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [monitoringExam, setMonitoringExam] = useState(null); 
  
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    term: 'First Term',
    year: new Date().getFullYear(),
    weight: 100,
    levelID: ''
  });
  const [levels, setLevels] = useState([]);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const examRes = await axios.get(`${BACKEND_URL}/exam`);
      setExams(examRes.data);
      const levelRes = await axios.get(`${BACKEND_URL}/level`);
      setLevels(levelRes.data);
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, levelID: formData.levelID || null };
      await axios.post(`${BACKEND_URL}/exam`, payload);
      toast.success('Examination scheduled');
      setShowCreateModal(false);
      fetchExams();
    } catch (error) {
      toast.error('Failed to create examination');
    }
  };

  const isAdmin = userData?.userType === 'admin' || userData?.userType === 'super_admin';

  const handleUpdateStatus = async (examId, status) => {
    try {
      await axios.put(`${BACKEND_URL}/exam/status/${examId}`, { status });
      toast.success(`Session status: ${status}`);
      fetchExams();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleLock = async (examId) => {
     try {
        await axios.put(`${BACKEND_URL}/exam/lock/${examId}`);
        toast.success('Access status toggled');
        fetchExams();
     } catch (error) {
        toast.error('Failed to toggle lock');
     }
  };

  const handleTogglePublish = async (examId) => {
    try {
       await axios.put(`${BACKEND_URL}/exam/publish/${examId}`);
       toast.success('Publication status changed');
       fetchExams();
    } catch (error) {
       toast.error('Failed to toggle results');
    }
  };

  const openMonitor = async (examId) => {
    try {
       const res = await axios.get(`${BACKEND_URL}/exam/stats/${examId}`);
       setMonitoringExam(res.data);
    } catch (error) {
       toast.error('Failed to load monitor');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-transparent ml-80 font-poppins">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Evaluation Centre
          </h1>
          <p className="text-gray-500 mt-2 font-medium italic">Academic Integrity & Performance Analytics Dashboard</p>
        </div>
        
        {isAdmin && (
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/admin/exams/grading')}
              className="flex items-center gap-2 bg-white border border-gray-100 text-gray-700 px-6 py-3.5 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all shadow-xl shadow-gray-200/50"
            >
              <Settings className="w-5 h-5 text-gray-400" />
              Weighting Policies
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              New Milestone
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 gap-4">
           <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
           <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Synchronizing Sessions...</p>
        </div>
      ) : exams.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
           <Calendar className="w-16 h-16 text-indigo-100 mb-6" />
           <h3 className="text-2xl font-black text-gray-900">No Milestones Found</h3>
           <p className="text-gray-500 mt-2 max-w-sm">Use "New Milestone" to schedule the next academic evaluation.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {exams.map((exam) => (
             <ExamCard 
                key={exam.id} 
                exam={exam} 
                onToggleLock={() => handleToggleLock(exam.id)} 
                onTogglePublish={() => handleTogglePublish(exam.id)}
                onUpdateStatus={(s) => handleUpdateStatus(exam.id, s)}
                onMonitor={() => openMonitor(exam.id)}
                isAdmin={isAdmin} 
             />
           ))}
        </div>
      )}

      {/* Monitoring Modal */}
      {monitoringExam && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
           <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-5">
              <div className="bg-gradient-to-br from-indigo-700 to-violet-900 p-8 text-white flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-black tracking-tight">{monitoringExam.examTitle}</h2>
                    <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Status Coverage: {monitoringExam.level}</p>
                 </div>
                 <button onClick={() => setMonitoringExam(null)} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 overflow-y-auto space-y-6">
                 {monitoringExam.stats.map(stat => {
                    const progress = stat.totalStudents > 0 ? (stat.gradedStudents / stat.totalStudents) * 100 : 0;
                    return (
                      <div key={stat.classroomID} className="bg-gray-50/50 p-5 rounded-3xl border border-gray-100">
                         <div className="flex justify-between items-center mb-4">
                            <div>
                               <p className="font-black text-gray-900 text-lg">{stat.className}</p>
                               <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Students: {stat.totalStudents}</span>
                            </div>
                            {stat.isComplete ? <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div> : <div className="bg-amber-100 text-amber-600 p-2 rounded-xl"><Clock className="w-6 h-6 border-none" /></div>}
                         </div>
                         <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                               <span className={stat.isComplete ? 'text-emerald-500' : 'text-gray-400'}>Submission</span>
                               <span className={stat.isComplete ? 'text-emerald-500' : 'text-indigo-500'}>{Math.round(progress)}%</span>
                            </div>
                            <div className="h-3 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${stat.isComplete ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${progress}%` }} /></div>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
        </div>
      )}

      {/* Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4">
           <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="bg-indigo-600 p-8 text-white"><h2 className="text-2xl font-black italic">Schedule Session</h2></div>
              <form onSubmit={handleCreate} className="p-8 space-y-5">
                 <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Title</label><input type="text" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all font-bold" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Start</label><input type="date" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all font-bold" required value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">End</label><input type="date" className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all font-bold" required value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} /></div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Term</label><select className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all font-bold" value={formData.term} onChange={(e) => setFormData({...formData, term: e.target.value})}><option>First Term</option><option>Mid Term</option><option>Final Term</option></select></div>
                    <div className="space-y-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Authority</label><select className="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 focus:border-indigo-500 outline-none transition-all font-bold" value={formData.levelID} onChange={(e) => setFormData({...formData, levelID: e.target.value})}><option value="">Global</option>{levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                 </div>
                 <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 bg-gray-100 text-gray-600 px-6 py-4 rounded-2xl font-black">Cancel</button><button type="submit" className="flex-1 bg-indigo-600 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100">Schedule</button></div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const ExamCard = ({ exam, onToggleLock, onTogglePublish, onUpdateStatus, onMonitor, isAdmin }) => {
  const navigate = useNavigate();
  const { userData } = useUser();
  const basePath = userData?.userType === 'teacher' ? '/teacher' : '/admin';

  const statusColors = {
     'Draft': 'bg-gray-100 text-gray-500',
     'Submitted': 'bg-blue-100 text-blue-600',
     'Verified': 'bg-emerald-100 text-emerald-600'
  };

  const statusIcons = {
     'Draft': <Clock className="w-3 h-3" />,
     'Submitted': <Send className="w-3 h-3" />,
     'Verified': <ShieldCheck className="w-3 h-3" />
  };

  return (
    <div className={`bg-white rounded-[40px] p-10 shadow-xl border-2 transition-all group relative overflow-hidden flex flex-col h-full ${exam.isLocked ? 'border-amber-100' : 'border-white hover:border-indigo-100'}`}>
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full transition-all duration-700 opacity-20 ${exam.isLocked ? 'bg-amber-500' : 'bg-indigo-500'} group-hover:scale-150`} />
      
      <div className="relative flex-1">
        <div className="flex justify-between items-start mb-8">
           <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-all ${exam.isLocked ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'}`}>
              <FileText className="w-8 h-8" />
           </div>
           
           <div className="flex flex-col items-end gap-2">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${statusColors[exam.status || 'Draft']}`}>
                 {statusIcons[exam.status || 'Draft']}
                 {exam.status || 'Draft'}
              </span>
              
              {isAdmin && (
                 <div className="flex gap-2">
                    <button onClick={onMonitor} className="p-2.5 bg-white border border-gray-100 text-gray-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm" title="Monitor"><BarChart3 className="w-4 h-4" /></button>
                    <button onClick={onTogglePublish} className={`p-2.5 border rounded-xl transition-all shadow-sm ${exam.isPublished ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-600 hover:text-white' : 'bg-white border-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'}`} title={exam.isPublished ? "Result Published" : "Publish Results"}>
                       {exam.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button onClick={onToggleLock} className={`p-2.5 border rounded-xl transition-all shadow-sm ${exam.isLocked ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-500 hover:text-white' : 'bg-white border-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600'}`} title={exam.isLocked ? "Locked" : "Unlocked"}>
                       {exam.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                 </div>
              )}
           </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
           <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${exam.isLocked ? 'text-amber-500' : 'text-indigo-500'}`}>
              {exam.term} • {exam.level?.name || 'GLOBAL'}
           </span>
        </div>
        
        <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-[1.2] mb-4">{exam.title}</h3>
        
        {isAdmin && exam.status === 'Submitted' && (
           <button 
             onClick={() => onUpdateStatus('Verified')}
             className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-600 hover:text-white transition-all mb-4"
           >
              <ClipboardCheck className="w-4 h-4" />
              Approve Results
           </button>
        )}
      </div>

      <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-300" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{moment(exam.startDate).format('MMM Do')} - {moment(exam.endDate).format('MMM Do')}</span>
         </div>
         <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-3 py-1 rounded-lg">WEIGHT: {exam.weight}%</span>
      </div>

      <div className="mt-8">
        <button 
          onClick={() => navigate(`${basePath}/exams/marks/${exam.id}`)}
          className={`w-full h-16 flex items-center justify-center gap-3 rounded-[24px] font-black transition-all shadow-lg text-sm uppercase tracking-widest ${exam.isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 group-hover:shadow-indigo-200'}`}
        >
           {exam.isLocked ? 'View Registry' : 'Enter Evaluations'}
           <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" />
        </button>
      </div>
    </div>
  );
};

export default Exams;

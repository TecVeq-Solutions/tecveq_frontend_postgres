import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronRight,
  Loader2,
  Send,
  History,
  Info,
  X
} from 'lucide-react';
import moment from 'moment';
import { BACKEND_URL } from '../../../constants/api';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/leave`);
      setLeaves(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leave history');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate || !formData.reason) {
        return toast.warning('Please fill all required fields');
    }
    setSubmitting(true);
    try {
      await axios.post(`${BACKEND_URL}/leave/apply`, formData);
      toast.success('Leave application submitted');
      setShowApplyModal(false);
      setFormData({ startDate: '', endDate: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved': return { color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: <CheckCircle className="w-4 h-4" /> };
      case 'rejected': return { color: 'bg-rose-50 text-rose-600 border-rose-100', icon: <XCircle className="w-4 h-4" /> };
      default: return { color: 'bg-indigo-50 text-indigo-600 border-indigo-100', icon: <Clock className="w-4 h-4" /> };
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-gray-50/30 ml-80 font-poppins">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                <Calendar className="w-6 h-6" />
             </div>
             Leave Center
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-lg leading-relaxed">Request time off and track your application status.</p>
        </div>
        <button 
          onClick={() => setShowApplyModal(true)}
          className="group flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[20px] transition-all shadow-xl shadow-indigo-100 active:scale-95 font-black text-xs uppercase tracking-widest"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Apply for Leave
        </button>
      </div>

      <div className="mb-8 flex items-center gap-3">
         <History className="w-5 h-5 text-gray-300" />
         <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Recent Applications</h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest">Retrieving Timeline...</p>
        </div>
      ) : leaves.length === 0 ? (
        <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-2xl shadow-gray-200/50 flex flex-col items-center max-w-2xl mx-auto border-dashed">
          <div className="bg-indigo-50 w-24 h-24 rounded-full mb-8 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-indigo-500" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">Your History is Empty</h3>
          <p className="text-gray-400 mt-3 max-w-xs font-medium leading-relaxed">You haven't submitted any leave applications yet. Use the "Apply" button above to start.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {leaves.map((leave) => {
            const status = getStatusConfig(leave.status);
            return (
              <div 
                key={leave.id} 
                className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/50 border border-transparent hover:border-indigo-100 hover:translate-x-2 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="flex flex-wrap items-start gap-6">
                    <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-inner">
                      <Calendar className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-gray-900 flex items-center gap-3">
                        {moment(leave.startDate).format('MMM DD')} 
                        <ChevronRight className="w-4 h-4 text-gray-300 stroke-[3]" /> 
                        {moment(leave.endDate).format('MMM DD, YYYY')}
                      </h4>
                      <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 mt-3 group-hover:bg-white transition-colors">
                        <p className="text-sm text-gray-500 font-bold italic leading-relaxed">"{leave.reason}"</p>
                      </div>
                      <div className="flex items-center gap-3 mt-4">
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 border border-gray-100">
                            <Clock className="w-3 h-3" />
                            {moment(leave.createdAt).fromNow()}
                         </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${status.color}`}>
                      {status.icon}
                      {leave.status}
                    </div>
                    
                    {leave.status === 'pending' && (
                      <button 
                        onClick={async () => {
                           if(window.confirm('Are you sure you want to cancel this request?')) {
                               try {
                                   await axios.delete(`${BACKEND_URL}/leave/${leave.id}`);
                                   toast.success('Leave cancelled');
                                   fetchLeaves();
                               } catch (err) {
                                   toast.error('Failed to cancel');
                               }
                           }
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 px-4 py-2 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-indigo-600 p-10 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Apply for Leave</h2>
                <p className="text-indigo-200 font-medium mt-2">Submit your request for administrative review.</p>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all shadow-inner"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Period Start</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="date" 
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-500 transition-all text-sm font-black text-gray-700"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Period End</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                      type="date" 
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-500 transition-all text-sm font-black text-gray-700"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Detailed Reason</label>
                  <span className="text-[10px] font-black text-gray-200 uppercase tracking-widest">{formData.reason.length}/500</span>
                </div>
                <textarea 
                  name="reason"
                  rows="5"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Provide a clear explanation for your request..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-3xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:bg-white focus:border-indigo-500 transition-all text-sm font-bold text-gray-600 placeholder:text-gray-200 leading-relaxed overflow-hidden"
                  required
                ></textarea>
              </div>

              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex items-start gap-4">
                 <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 text-indigo-500" />
                 </div>
                 <p className="text-[11px] font-bold text-indigo-900 leading-relaxed uppercase tracking-wider">
                    Administrative Review typically takes 24-48 hours. Ensure your reason is concise and contains necessary details.
                 </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white h-16 rounded-[24px] transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;


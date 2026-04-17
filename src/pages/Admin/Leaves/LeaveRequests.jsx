import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Filter,
  User,
  Calendar,
  ChevronRight,
  Loader2,
  Trash2,
  AlertCircle,
  FileText,
  Check,
  X,
  Inbox
} from 'lucide-react';
import moment from 'moment';
import { BACKEND_URL } from '../../../constants/api';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/leave`);
      setLeaves(response.data);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      setProcessingId(leaveId);
      await axios.put(`${BACKEND_URL}/leave/status/${leaveId}`, { status });
      toast.success(`Leave request ${status}`);
      fetchLeaves();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (leaveId) => {
    if (window.confirm('Delete this record permanently?')) {
      try {
        await axios.delete(`${BACKEND_URL}/leave/${leaveId}`);
        toast.success('Record deleted');
        fetchLeaves();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesFilter = filter === 'all' || leave.status === filter;
    const matchesSearch = leave.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          leave.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50 ml-80 font-poppins">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Calendar className="w-10 h-10 text-indigo-600" />
            Leave Approvals
          </h1>
          <p className="text-gray-500 mt-2 font-medium text-lg">Manage and review student academic leave applications.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
          {['pending', 'approved', 'rejected', 'all'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                filter === f 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="Pending Review" count={stats.pending} color="indigo" icon={<Clock className="w-6 h-6" />} />
        <StatCard label="Approved History" count={stats.approved} color="emerald" icon={<CheckCircle className="w-6 h-6" />} />
        <StatCard label="Rejected Requests" count={stats.rejected} color="rose" icon={<XCircle className="w-6 h-6" />} />
      </div>

      <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100 w-full md:w-1/2 focus-within:ring-4 focus-within:ring-indigo-100 focus-within:border-indigo-500 transition-all">
            <Search className="w-6 h-6 text-gray-300" />
            <input 
              type="text" 
              placeholder="Filter by student name or reason..." 
              className="bg-transparent border-none outline-none text-base font-bold text-gray-700 w-full placeholder:text-gray-200 placeholder:font-black placeholder:uppercase placeholder:text-xs tracking-widest"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
             Total Found: {filteredLeaves.length} Records
          </div>
        </div>

        <div className="overflow-x-auto overflow-y-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-[#FAFBFF]">
              <tr>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Applicant</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Duration & Period</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Application Reason</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Current Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                   <td colSpan="5" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
                        <p className="font-black text-gray-400 text-xs tracking-[0.3em] uppercase">Retrieving Applications...</p>
                      </div>
                   </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                   <td colSpan="5" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center gap-6 opacity-30">
                        <Inbox className="w-20 h-20 text-gray-300" />
                        <p className="font-black text-gray-400 text-sm tracking-[0.3em] uppercase">Workspace Clear (No Requests)</p>
                      </div>
                   </td>
                </tr>
              ) : filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-indigo-50/20 transition-all group">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-100 group-hover:rotate-6 transition-transform relative">
                        {leave.student?.profilePic ? (
                          <img src={leave.student.profilePic} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <span className="text-xl">{leave.student?.name?.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <div className="text-base font-black text-gray-900 leading-none">{leave.student?.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 bg-gray-100 w-fit px-2 py-0.5 rounded-md">ID: {leave.student?.rollNo || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 whitespace-nowrap">
                          {moment(leave.startDate).format('MMM DD')} — {moment(leave.endDate).format('MMM DD, YYYY')}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                          {moment(leave.endDate).diff(moment(leave.startDate), 'days') + 1} Academic Days
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7 max-w-xs">
                    <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 text-xs font-bold text-gray-500 leading-relaxed italic group-hover:bg-white transition-colors">
                      "{leave.reason}"
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all ${
                      leave.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm' :
                      leave.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      'bg-indigo-50 text-indigo-600 border-indigo-100'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="px-10 py-7 text-right whitespace-nowrap">
                    {leave.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                        <button 
                          onClick={() => handleStatusUpdate(leave.id, 'approved')}
                          disabled={processingId === leave.id}
                          className="h-12 px-6 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:scale-110 transition-all shadow-lg shadow-emerald-100 flex items-center gap-2 group/btn"
                        >
                          {processingId === leave.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                          Approve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate(leave.id, 'rejected')}
                          disabled={processingId === leave.id}
                          className="h-12 px-6 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 hover:scale-110 transition-all shadow-lg shadow-rose-100 flex items-center gap-2"
                        >
                          {processingId === leave.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 stroke-[3]" />}
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button 
                         onClick={() => handleDelete(leave.id)}
                         className="p-4 text-gray-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, count, color, icon }) => {
  const themes = {
    indigo: 'from-indigo-500 to-indigo-700 shadow-indigo-100 text-white',
    emerald: 'from-emerald-500 to-emerald-700 shadow-emerald-100 text-white',
    rose: 'from-rose-500 to-rose-700 shadow-rose-100 text-white'
  };
  
  return (
    <div className={`p-8 rounded-[32px] bg-gradient-to-br ${themes[color]} flex items-center justify-between shadow-2xl transform hover:scale-[1.02] transition-all cursor-default`}>
      <div>
        <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">{label}</div>
        <div className="text-4xl font-black mt-2 tracking-tighter">{count}</div>
      </div>
      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
        {icon}
      </div>
    </div>
  );
};

export default LeaveRequests;

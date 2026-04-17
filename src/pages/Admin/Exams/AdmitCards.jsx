import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Printer, 
  Search, 
  ArrowLeft,
  Loader2,
  Calendar,
  Building,
  User as UserIcon,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { BACKEND_URL } from '../../../constants/api';
import IMAGES from '../../../assets/images';

const AdmitCards = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
    fetchStudents();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/exam`);
      setExams(response.data);
    } catch (error) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Assuming endpoint to get all students or we can fetch classrooms and extract students
      const response = await axios.get(`${BACKEND_URL}/admin/users/students`);
      if (response.data && Array.isArray(response.data.users)) {
         setStudents(response.data.users);
      } else if (Array.isArray(response.data)) {
         setStudents(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const activeExam = exams.find(e => e.id === selectedExam);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (student.rollNo && student.rollNo.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
     return <div className="p-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:ml-80 font-poppins print:p-0 print:m-0 print:bg-white print:w-full">
       <div className="max-w-7xl mx-auto print:max-w-full">
          {/* Controls - Hidden during print */}
          <div className="print:hidden mb-10 space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <button 
                     onClick={() => navigate(-1)} 
                     className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                   >
                     <ArrowLeft className="w-5 h-5" />
                   </button>
                   <div>
                     <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admit Cards</h1>
                     <p className="text-gray-500 text-sm font-medium mt-1">Generate and print examination admit cards</p>
                   </div>
                </div>
                
                <button 
                  onClick={handlePrint}
                  disabled={!selectedExam || filteredStudents.length === 0}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="w-5 h-5" />
                  Print Selected ({selectedExam ? filteredStudents.slice(0, 10).length : 0})
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Examination Session</label>
                   <select 
                     value={selectedExam}
                     onChange={(e) => setSelectedExam(e.target.value)}
                     className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-gray-700 appearance-none"
                   >
                      <option value="">Select Examination...</option>
                      {exams.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Search Student</label>
                   <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Search by name or roll number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-12 pr-5 py-3 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-gray-700 placeholder:font-medium placeholder:text-gray-400"
                      />
                   </div>
                </div>
             </div>
          </div>

          {/* Render Warning */}
          {(!selectedExam || students.length === 0) && (
             <div className="print:hidden py-20 text-center opacity-40 flex flex-col items-center justify-center bg-white rounded-[40px] border-2 border-dashed border-gray-200">
                <Building className="w-16 h-16 text-gray-400 mb-4" />
                <p className="font-black text-gray-500 tracking-widest uppercase text-sm">Select an examination to preview admit cards</p>
             </div>
          )}

          {/* Printable Admit Cards container */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 print:block print:w-[210mm] print:mx-auto">
             {selectedExam && filteredStudents.length > 0 && filteredStudents.slice(0, 50).map((student, idx) => (
               <div key={student.id} className="bg-white border-2 border-gray-800 rounded-3xl p-8 relative overflow-hidden shadow-lg print:break-inside-avoid print:shadow-none print:border-black print:mb-8 print:w-full print:page-break-inside-avoid" style={{ breakInside: 'avoid' }}>
                  {/* Watermark Logo */}
                  <div className="absolute inset-0 opacity-5 flex items-center justify-center pointer-events-none">
                     <img src={IMAGES.Logo} alt="background" className="w-[80%] h-[80%] object-contain" />
                  </div>

                  <div className="relative z-10">
                     {/* Header */}
                     <div className="flex items-center justify-between border-b-2 border-gray-800 pb-6 mb-6">
                        <div className="flex items-center gap-4">
                           <img src={IMAGES.Logo} alt="Logo" className="w-14 h-14" />
                           <div>
                              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Tecveq Institute</h2>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{activeExam?.title}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="inline-block bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] px-4 py-2 rounded-lg">
                              Admit Card
                           </div>
                           <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Valid for {activeExam?.year}</p>
                        </div>
                     </div>

                     {/* Details */}
                     <div className="flex gap-8 items-start mb-8">
                        {/* Photo Box */}
                        <div className="w-28 h-32 border-2 border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 overflow-hidden flex-shrink-0">
                           {student.profilePic ? (
                              <img src={student.profilePic} alt="student" className="w-full h-full object-cover" />
                           ) : (
                              <UserIcon className="w-10 h-10 text-gray-300" />
                           )}
                        </div>

                        <div className="flex-1 space-y-4">
                           <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Candidate Name</p>
                              <p className="text-lg font-black text-gray-900">{student.name}</p>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Roll Number</p>
                                 <p className="text-base font-black text-gray-800">{student.rollNo || 'N/A'}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Session Dates</p>
                                 <p className="text-sm font-bold text-gray-800">
                                   {moment(activeExam?.startDate).format('DD MMM')} - {moment(activeExam?.endDate).format('DD MMM, YY')}
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Rules / Footer */}
                     <div className="border-t-2 border-gray-100 pt-6 flex items-end justify-between">
                        <div className="w-2/3">
                           <p className="text-[9px] font-black text-gray-900 uppercase tracking-widest mb-2">Examination Rules</p>
                           <ul className="text-[8px] font-bold text-gray-500 uppercase flex flex-col gap-1 tracking-wider list-disc pl-3">
                              <li>Bring this card to all examination sessions.</li>
                              <li>Electronic devices are strictly prohibited.</li>
                              <li>Arrive 15 minutes prior to the scheduled time.</li>
                           </ul>
                        </div>
                        <div className="text-center w-32 pb-1">
                           <div className="border-b border-gray-400 w-full mb-1"></div>
                           <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest">Authority Auth</p>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
          </div>

          {selectedExam && filteredStudents.length > 50 && (
             <div className="print:hidden mt-8 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">
               Showing first 50 results. Use the search field to filter.
             </div>
          )}
       </div>
    </div>
  );
};

export default AdmitCards;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Save, 
  Users, 
  BookOpen, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Filter,
  Layers,
  Check,
  UserX,
  Send,
  ShieldCheck
} from 'lucide-react';
import { BACKEND_URL } from '../../../constants/api';
import { useUser } from '../../../context/UserContext';

const EnterMarks = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser();
  
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Data State
  const [assignedPortalData, setAssignedPortalData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [availableClassrooms, setAvailableClassrooms] = useState([]);
  const [gradeCriteria, setGradeCriteria] = useState([]);
  
  // Selection State
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClassrooms, setSelectedClassrooms] = useState([]); // Array of IDs
  const [allStudents, setAllStudents] = useState([]); // { student: object, className: string }
  const [marksData, setMarksData] = useState({}); // { studentId: { marks, total, remarks, isAbsent } }

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [examRes, portalRes, criteriaRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/exam`),
        axios.get(`${BACKEND_URL}/exam/portal-data?examinationID=${examId}`),
        axios.get(`${BACKEND_URL}/grade-criteria`)
      ]);
      
      const currentExam = examRes.data.find(e => e.id === examId);
      setExam(currentExam);
      setGradeCriteria(criteriaRes.data);

      const rawData = portalRes.data;
      if (Array.isArray(rawData)) {
        setAssignedPortalData(rawData);
        
        const uniqueSubjMap = {};
        if (rawData.length > 0 && rawData[0]?.classroom) {
          rawData.forEach(item => { if (item.subject) uniqueSubjMap[item.subject.id] = item.subject; });
        } else {
          rawData.forEach(cls => {
            const clsSubjects = []; 
            cls.teachers?.forEach(t => { if(t.subject) clsSubjects.push(t.subject); });
            if (cls.level?.subjects) cls.level.subjects.forEach(s => clsSubjects.push(s));
            clsSubjects.forEach(s => { uniqueSubjMap[s.id] = s; });
          });
        }
        setSubjects(Object.values(uniqueSubjMap));
      }
    } catch (error) {
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject) {
      const clsMap = {};
      if (assignedPortalData.length > 0 && assignedPortalData[0]?.classroom) {
        assignedPortalData.forEach(item => { if (item.subjectID === selectedSubject) clsMap[item.classroom.id] = item.classroom; });
      } else {
        assignedPortalData.forEach(cls => {
          let hasSubject = cls.teachers?.some(t => t.subjectID === selectedSubject) || cls.level?.subjects?.some(s => s.id === selectedSubject);
          if (hasSubject) clsMap[cls.id] = cls;
        });
      }
      setAvailableClassrooms(Object.values(clsMap));
      setSelectedClassrooms([]);
      setAllStudents([]);
    }
  }, [selectedSubject, assignedPortalData]);

  const toggleClassroom = (clsId) => {
    setSelectedClassrooms(prev => prev.includes(clsId) ? prev.filter(id => id !== clsId) : [...prev, clsId]);
  };

  const selectAllClassrooms = () => {
    setSelectedClassrooms(selectedClassrooms.length === availableClassrooms.length ? [] : availableClassrooms.map(c => c.id));
  };

  useEffect(() => {
    if (selectedClassrooms.length > 0) fetchConsolidatedData();
    else setAllStudents([]);
  }, [selectedClassrooms]);

  const fetchConsolidatedData = async () => {
    setFetchingData(true);
    try {
      const consolidatedStudents = [];
      selectedClassrooms.forEach(clsId => {
        const cls = availableClassrooms.find(c => c.id === clsId);
        if (cls?.students) cls.students.forEach(s => consolidatedStudents.push({ ...s, className: cls.name }));
      });
      setAllStudents(consolidatedStudents);

      const queryStr = selectedClassrooms.map(id => `classroomID=${id}`).join('&');
      const res = await axios.get(`${BACKEND_URL}/exam/results-by-subject?examinationID=${examId}&subjectID=${selectedSubject}&${queryStr}`);
      
      const existingMarks = {};
      consolidatedStudents.forEach(s => {
        const found = res.data.find(r => r.studentID === s.id);
        existingMarks[s.id] = {
          marks: found ? found.marksObtained : '',
          total: found ? found.totalMarks : 100,
          remarks: found ? found.remarks || '' : '',
          isAbsent: found ? found.isAbsent : false
        };
      });
      setMarksData(existingMarks);
    } catch (error) { toast.error('Failed to sync existing data'); }
    finally { setFetchingData(false); }
  };

  const handleMarkChange = (studentId, field, value) => {
    setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  };

  const calculateGrade = (percentage, isAbsent) => {
    if (isAbsent) return 'A';
    if (isNaN(percentage) || !isFinite(percentage)) return '--';
    const sorted = [...gradeCriteria].sort((a, b) => b.minPercentage - a.minPercentage);
    const match = sorted.find(c => Math.round(percentage) >= Math.round(c.minPercentage));
    return match ? match.grade : (gradeCriteria.length > 0 ? 'F' : '--');
  };

  const handleSave = async () => {
    if (exam?.isLocked && userData?.userType !== 'admin' && userData?.userType !== 'super_admin') return toast.error('This examination is locked.');
    setSaving(true);
    try {
      const results = Object.keys(marksData).map(studentId => ({
        subjectID: selectedSubject,
        studentID: studentId,
        marksObtained: marksData[studentId].isAbsent ? 0 : (parseFloat(marksData[studentId].marks) || 0),
        totalMarks: parseFloat(marksData[studentId].total) || 100,
        remarks: marksData[studentId].remarks,
        isAbsent: marksData[studentId].isAbsent
      }));

      await axios.post(`${BACKEND_URL}/exam/results`, { examinationID: examId, results });
      toast.success('Marks synchronized successfully');
    } catch (error) { toast.error('Failed to save marks'); }
    finally { setSaving(false); }
  };

  const isAdmin = userData?.userType === 'admin' || userData?.userType === 'super_admin';

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50 ml-80 font-poppins">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-indigo-600 shadow-sm transition-all"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{exam?.title} <span className="text-indigo-500">Portal</span></h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Academic Quality & Integrity Gateway</p>
          </div>
        </div>
        
        <div className="flex gap-3">
           {exam?.status === 'Draft' && !isAdmin && (
             <button className="flex items-center gap-2 px-6 py-3 bg-white border border-indigo-100 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">
                <Send className="w-4 h-4" />
                Submit for Moderation
             </button>
           )}
           {isAdmin && exam?.status === 'Submitted' && (
             <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">
                <ShieldCheck className="w-4 h-4" />
                Verify & Lock Results
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
         <div className="lg:col-span-1 bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block ml-1">Domain Subject</label>
            <div className="relative group">
               <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
               <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-gray-700 appearance-none cursor-pointer">
                  <option value="">Select Subject...</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
               </select>
            </div>
         </div>

         <div className="lg:col-span-2 bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3 px-1">
               <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Classrooms</label>
               {availableClassrooms.length > 0 && <button onClick={selectAllClassrooms} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">{selectedClassrooms.length === availableClassrooms.length ? 'Deselect All' : 'Select All'}</button>}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
               {selectedSubject ? (availableClassrooms.length > 0 ? (availableClassrooms.map(cls => (
                     <button key={cls.id} onClick={() => toggleClassroom(cls.id)} className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all font-black text-xs ${selectedClassrooms.includes(cls.id) ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}>
                       <div className={`w-5 h-5 rounded-md flex items-center justify-center border-2 ${selectedClassrooms.includes(cls.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-gray-200 bg-white'}`}>{selectedClassrooms.includes(cls.id) && <Check className="w-3 h-3" />}</div>
                       {cls.name}
                     </button>
                   ))) : <div className="py-2 px-1 text-gray-300 font-bold italic text-xs">No assignments for this subject</div>) : <div className="py-2 px-1 text-gray-300 font-bold italic text-xs">Waiting for subject...</div>}
            </div>
         </div>

         <div className="lg:col-span-1">
            <button onClick={handleSave} disabled={saving || fetchingData || allStudents.length === 0} className="w-full h-full flex items-center justify-center gap-3 bg-indigo-600 text-white rounded-[28px] font-black hover:bg-indigo-700 shadow-indigo-100 hover:shadow-xl transition-all disabled:opacity-50 uppercase tracking-widest text-sm py-4 lg:py-0">
              {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              Publish Updates
            </button>
         </div>
      </div>

      {fetchingData ? (
        <div className="py-32 text-center">
           <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-500 mb-6" />
           <p className="font-black text-gray-400 uppercase tracking-widest text-sm">Aggregating Marksheet Data...</p>
        </div>
      ) : allStudents.length > 0 ? (
        <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-100/50">
           <table className="w-full text-left">
              <thead className="bg-[#FAFBFF]">
                 <tr>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Details</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Outcome Status</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Marks Obtained</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Base Total</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Outcome</th>
                    <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Observations</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {selectedClassrooms.map(clsId => {
                    const cls = availableClassrooms.find(c => c.id === clsId);
                    const studentsInCls = allStudents.filter(s => s.className === cls.name);
                    return (
                      <React.Fragment key={clsId}>
                         <tr className="bg-indigo-50/20"><td colSpan="6" className="px-10 py-3 text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Classroom Unit: {cls.name}</td></tr>
                         {studentsInCls.map(student => {
                            const percentage = (parseFloat(marksData[student.id]?.marks) / parseFloat(marksData[student.id]?.total)) * 100;
                            const grade = calculateGrade(percentage, marksData[student.id]?.isAbsent);
                            const isAbsent = marksData[student.id]?.isAbsent;
                            return (
                              <tr key={student.id} className={`hover:bg-indigo-50/10 transition-all group ${isAbsent ? 'bg-amber-50/20' : ''}`}>
                                <td className="px-10 py-6">
                                   <div className="flex items-center gap-5">
                                      <div className={`w-12 h-12 rounded-xl text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-100 ${isAbsent ? 'bg-amber-400' : 'bg-gradient-to-br from-indigo-500 to-violet-600'}`}>
                                         {student.name.charAt(0)}
                                      </div>
                                      <div>
                                         <p className={`font-black text-sm ${isAbsent ? 'text-amber-700' : 'text-gray-900'}`}>{student.name}</p>
                                         <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">ID: {student.rollNo}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <button 
                                     onClick={() => handleMarkChange(student.id, 'isAbsent', !isAbsent)}
                                     title={isAbsent ? "Mark as Present" : "Mark as Absent"}
                                     className={`p-3 rounded-xl border-2 transition-all ${isAbsent ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-gray-50 border-transparent text-gray-300 hover:text-amber-500 hover:bg-amber-50'}`}
                                   >
                                      <UserX className="w-5 h-5" />
                                   </button>
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <input type="number" disabled={exam?.isLocked || isAbsent} className={`w-20 bg-gray-50 border-2 border-transparent rounded-xl px-2 py-3 font-black text-sm text-center focus:border-indigo-500 outline-none transition-all ${isAbsent ? 'opacity-20' : 'opacity-100'}`} value={isAbsent ? 0 : marksData[student.id]?.marks} onChange={(e) => handleMarkChange(student.id, 'marks', e.target.value)} />
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <input type="number" disabled={isAbsent} className={`w-20 bg-gray-50 border-2 border-transparent rounded-xl px-2 py-3 font-bold text-sm text-center text-gray-400 focus:border-indigo-500 outline-none transition-all ${isAbsent ? 'opacity-20' : 'opacity-100'}`} value={marksData[student.id]?.total} onChange={(e) => handleMarkChange(student.id, 'total', e.target.value)} />
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black border-2 transition-all ${
                                     isAbsent ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                     grade === 'F' ? 'bg-red-50 text-red-600 border-red-100' :
                                     grade === '--' ? 'bg-gray-50 text-gray-400 border-gray-100' :
                                     'bg-emerald-50 text-emerald-600 border-emerald-100'
                                   }`}>
                                      {grade}
                                   </span>
                                </td>
                                <td className="px-10 py-6">
                                   <input type="text" placeholder="Remarks..." className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 text-[10px] font-bold outline-none focus:border-indigo-500" value={marksData[student.id]?.remarks} onChange={(e) => handleMarkChange(student.id, 'remarks', e.target.value)} />
                                </td>
                              </tr>
                            );
                         })}
                      </React.Fragment>
                    );
                 })}
              </tbody>
           </table>
        </div>
      ) : <div className="py-32 text-center bg-white rounded-[40px] border border-dashed border-gray-200 opacity-40"><Filter className="w-20 h-20 text-gray-300 mx-auto mb-6" /><p className="font-black text-gray-400 uppercase tracking-[0.25em] text-xs">Filter Subject & Classrooms for Evaluation</p></div>}
    </div>
  );
};

export default EnterMarks;

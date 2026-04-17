import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Calculator, 
  ShieldCheck,
  Percent,
  Layers,
  Info,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../../../constants/api';

import { useGetSettings } from '../../../api/Admin/SettingsApi';

const GradingSystem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [criteria, setCriteria] = useState([]);
  const { settings, isLoading: isSettingsLoading } = useGetSettings();
  const [weights, setWeights] = useState({
    assignmentWeight: 15,
    quizWeight: 10,
    examWeight: 75,
    firstTermWeight: 10,
    midTermWeight: 15,
    finalTermWeight: 50,
    projectWeight: 0,
    classTestWeight: 0
  });

  const isUniversity = settings?.institutionType === 'university';

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [levelsRes, weightsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/level`),
        axios.get(`${BACKEND_URL}/gradebook/grading-system`)
      ]);
      setLevels(levelsRes.data);
      if (weightsRes.data) setWeights(weightsRes.data);
      fetchCriteria(selectedLevel);
    } catch (error) {
      toast.error('Failed to load grading configurations');
    } finally {
      setLoading(false);
    }
  };

  const fetchCriteria = async (levelId) => {
    try {
      const res = await axios.get(`${BACKEND_URL}/grade-criteria?levelID=${levelId}`);
      setCriteria(res.data);
    } catch (error) {
      toast.error('Failed to load criteria');
    }
  };

  useEffect(() => {
    if (!loading) fetchCriteria(selectedLevel);
  }, [selectedLevel]);

  const handleLevelChange = (levelId) => {
    setSelectedLevel(levelId);
  };

  const addRow = () => {
    setCriteria([...criteria, { grade: '', minPercentage: 0, maxPercentage: 100, isNew: true }]);
  };

  const removeRow = async (index, id) => {
    if (id) {
      try {
        await axios.delete(`${BACKEND_URL}/grade-criteria/${id}`);
        toast.info('Criterion removed');
      } catch (error) {
        toast.error('Failed to delete');
        return;
      }
    }
    const newCriteria = criteria.filter((_, i) => i !== index);
    setCriteria(newCriteria);
  };

  const updateRow = (index, field, value) => {
    const newCriteria = [...criteria];
    newCriteria[index][field] = value;
    setCriteria(newCriteria);
  };

  const saveWeights = async () => {
    try {
      setSaving(true);
      await axios.post(`${BACKEND_URL}/gradebook/grading-system`, {
        ...weights,
        levelID: selectedLevel || null
      });
      toast.success('Weights updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save weights');
    } finally {
      setSaving(false);
    }
  };

  const saveCriteria = async () => {
    try {
      setSaving(true);
      await Promise.all(criteria.map(c => 
        axios.post(`${BACKEND_URL}/grade-criteria/upsert`, {
          ...c,
          gradePoints: parseFloat(c.gradePoints) || 0,
          levelID: selectedLevel || null
        })
      ));
      toast.success('Grading rules updated');
      fetchCriteria(selectedLevel);
    } catch (error) {
      toast.error('Failed to save some criteria');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500" /></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50/50 ml-80">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Grading Configuration</h1>
            <p className="text-gray-400 font-medium text-sm">Define how results are calculated and standards for excellence.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
           <Layers className="w-4 h-4 ml-3 text-gray-400" />
           <select 
             className="bg-transparent border-none focus:ring-0 font-bold text-gray-700 text-sm py-2 pr-8"
             value={selectedLevel}
             onChange={(e) => handleLevelChange(e.target.value)}
           >
              <option value="">Global (Default)</option>
              {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
           </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Weights Column */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full -translate-y-16 translate-x-16 group-hover:bg-indigo-50 transition-colors duration-500" />
               <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                        <Calculator className="w-5 h-5" />
                     </div>
                     <h2 className="font-black text-gray-900">Component Weights</h2>
                  </div>
                  
                  <p className="text-xs text-gray-400 font-medium leading-relaxed mb-8">Set the percentage each component contributes to the final term grade. Total must equal 100%.</p>

                  <div className="space-y-6">
                      {(isUniversity 
                        ? ['assignmentWeight', 'projectWeight', 'quizWeight', 'firstTermWeight', 'midTermWeight', 'finalTermWeight']
                        : ['assignmentWeight', 'quizWeight', 'classTestWeight', 'examWeight']
                      ).map((key) => (
                        <div key={key} className="space-y-2">
                           <div className="flex justify-between items-center px-1">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                {key.replace('Weight', '').replace(/([A-Z])/g, ' $1').trim()}s
                              </label>
                              <span className="text-xs font-black text-indigo-600">{weights[key] || 0}%</span>
                           </div>
                           <div className="relative flex items-center">
                              <input 
                                type="range"
                                min="0"
                                max="100"
                                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                value={weights[key] || 0}
                                onChange={(e) => setWeights({...weights, [key]: parseInt(e.target.value)})}
                              />
                           </div>
                        </div>
                      ))}
                  </div>

                  <div className="mt-10 pt-6 border-t border-gray-50 flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase">Total Sum</span>
                        <span className={`text-xl font-black ${
                          ((isUniversity 
                            ? (weights.assignmentWeight + weights.projectWeight + weights.quizWeight + weights.firstTermWeight + weights.midTermWeight + weights.finalTermWeight)
                            : (weights.assignmentWeight + weights.quizWeight + weights.classTestWeight + weights.examWeight)) === 100) 
                            ? 'text-emerald-500' 
                            : 'text-red-500'
                        }`}>
                           {(isUniversity 
                            ? (weights.assignmentWeight + weights.projectWeight + weights.quizWeight + weights.firstTermWeight + weights.midTermWeight + weights.finalTermWeight)
                            : (weights.assignmentWeight + weights.quizWeight + weights.classTestWeight + weights.examWeight)) || 0}%
                        </span>
                     </div>
                     <button 
                       onClick={saveWeights}
                       disabled={((isUniversity 
                        ? (weights.assignmentWeight + weights.projectWeight + weights.quizWeight + weights.firstTermWeight + weights.midTermWeight + weights.finalTermWeight)
                        : (weights.assignmentWeight + weights.quizWeight + weights.classTestWeight + weights.examWeight)) !== 100) || saving}
                       className="bg-gray-950 text-white p-4 rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-20 flex items-center gap-2"
                     >
                        <Save className="w-5 h-5" />
                        Save
                     </button>
                  </div>
               </div>
            </div>

            <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-100">
               <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-indigo-200" />
                  <h3 className="font-bold">Pro Tip</h3>
               </div>
               <p className="text-sm text-indigo-50 text-indigo-100/80 leading-relaxed italic">
                  Level-specific configurations override global settings. Use global settings for school-wide standards.
               </p>
            </div>
         </div>

         {/* Grade Criteria Column */}
         <div className="lg:col-span-2">
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm h-full flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <ShieldCheck className="w-5 h-5" />
                     </div>
                     <h2 className="font-black text-gray-900">Grading Boundaries</h2>
                  </div>
                  <button 
                    onClick={addRow}
                    className="flex items-center gap-2 text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all"
                  >
                     <Plus className="w-4 h-4" />
                     Add New Range
                  </button>
               </div>

               <div className="flex-1 overflow-x-auto">
                  <table className="w-full">
                     <thead>
                        <tr className="text-left border-b border-gray-50">
                           <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Grade</th>
                           <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">GP (4.0)</th>
                           <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Min %</th>
                           <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Max %</th>
                           <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">Remarks</th>
                           <th className="pb-4 text-right"></th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {criteria.map((rule, idx) => (
                          <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                             <td className="py-4 px-4">
                                <input 
                                  type="text" 
                                  className="w-16 bg-gray-50 border-none rounded-lg px-3 py-2 font-black text-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                  value={rule.grade}
                                  placeholder="A+"
                                  onChange={(e) => updateRow(idx, 'grade', e.target.value)}
                                />
                             </td>
                             <td className="py-4 px-4">
                                <input 
                                  type="number" 
                                  step="0.1"
                                  className="w-20 bg-emerald-50/30 border-none rounded-lg px-3 py-2 font-black text-emerald-600 focus:ring-2 focus:ring-emerald-100"
                                  value={rule.gradePoints || 0}
                                  placeholder="4.0"
                                  onChange={(e) => updateRow(idx, 'gradePoints', parseFloat(e.target.value))}
                                />
                             </td>
                             <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                   <input 
                                     type="number" 
                                     className="w-20 bg-gray-100/50 border-none rounded-lg px-3 py-2 font-bold text-gray-700"
                                     value={rule.minPercentage}
                                     onChange={(e) => updateRow(idx, 'minPercentage', parseFloat(e.target.value))}
                                   />
                                   <Percent className="w-3 h-3 text-gray-300" />
                                </div>
                             </td>
                             <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                   <input 
                                     type="number" 
                                     className="w-20 bg-gray-100/50 border-none rounded-lg px-3 py-2 font-bold text-gray-700"
                                     value={rule.maxPercentage}
                                     onChange={(e) => updateRow(idx, 'maxPercentage', parseFloat(e.target.value))}
                                   />
                                   <Percent className="w-3 h-3 text-gray-300" />
                                </div>
                             </td>
                             <td className="py-4 px-4">
                                <input 
                                  type="text" 
                                  className="w-full bg-transparent border-none rounded-lg px-3 py-2 text-xs font-medium text-gray-400 placeholder:text-gray-200"
                                  placeholder="e.g. Excellent performance"
                                  value={rule.remarks || ''}
                                  onChange={(e) => updateRow(idx, 'remarks', e.target.value)}
                                />
                             </td>
                             <td className="py-4 px-4 text-right">
                                <button 
                                  onClick={() => removeRow(idx, rule.id)}
                                  className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                >
                                   <Trash2 className="w-4 h-4" />
                                </button>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
                  
                  {criteria.length === 0 && (
                    <div className="py-20 text-center text-gray-300 font-bold italic">
                       No custom grading boundaries defined for this level.
                    </div>
                  )}
               </div>

               <div className="mt-8 pt-6 border-t border-gray-50">
                  <button 
                    onClick={saveCriteria}
                    disabled={saving || criteria.length === 0}
                    className="w-full bg-emerald-600 text-white rounded-2xl py-4 font-black shadow-lg shadow-emerald-50 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                  >
                     {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                     Save Grading Standards
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default GradingSystem;

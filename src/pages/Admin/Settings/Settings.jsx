import React from 'react';
import { 
  Building2, 
  School, 
  GraduationCap, 
  Settings2, 
  ShieldCheck, 
  BellRing, 
  Database,
  Loader2
} from 'lucide-react';
import { useGetSettings, useUpdateSettings } from '../../../api/Admin/SettingsApi';
import AttandenceSetting from '../../../components/Admin/AttandenceSetting/AttandenceSetting';

const SettingsPage = () => {
  const { settings, isLoading } = useGetSettings();
  const { updateSettings } = useUpdateSettings();

  const handleModeChange = (mode) => {
    updateSettings({ institutionType: mode });
  };

  if (isLoading) {
    return (
      <div className="p-20 text-center ml-72">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto ml-72 min-h-screen bg-gray-50/30">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-indigo-500" />
          Global Settings
        </h1>
        <p className="text-gray-400 font-medium mt-1">Configure your institution's core properties and grading architecture.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Institution Type Selection */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">Institution Mode</h3>
              <p className="text-sm text-gray-400">Choose your academic structure</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleModeChange('school')}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${
                settings?.institutionType === 'school'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100'
                  : 'border-gray-50 bg-gray-50/30 hover:border-indigo-100'
              }`}
            >
              <div className={`p-4 rounded-2xl ${settings?.institutionType === 'school' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-400'}`}>
                <School className="w-8 h-8" />
              </div>
              <div className="text-center">
                <span className={`block font-bold ${settings?.institutionType === 'school' ? 'text-indigo-900' : 'text-gray-600'}`}>School</span>
                <span className="text-[10px] text-gray-400 font-medium">Standard Grading (100%)</span>
              </div>
            </button>

            <button
              onClick={() => handleModeChange('university')}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 ${
                settings?.institutionType === 'university'
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100'
                  : 'border-gray-50 bg-gray-50/30 hover:border-indigo-100'
              }`}
            >
              <div className={`p-4 rounded-2xl ${settings?.institutionType === 'university' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-400'}`}>
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="text-center">
                <span className={`block font-bold ${settings?.institutionType === 'university' ? 'text-indigo-900' : 'text-gray-600'}`}>University</span>
                <span className="text-[10px] text-gray-400 font-medium">GPA & CGPA System</span>
              </div>
            </button>
          </div>
          
          <div className="mt-8 p-4 bg-orange-50 rounded-2xl border border-orange-100 flex gap-3">
             <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
             <p className="text-xs text-orange-800 font-medium leading-relaxed">
               Changing the mode will update the examination structure globally. University mode implements First, Mid, and Final term weightages.
             </p>
          </div>
        </div>

        {/* Existing Attendance Shortcut or other settings context */}
        <div className="flex flex-col gap-6">
           <AttandenceSetting />
           
           <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm opacity-50 select-none">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded-2xl text-gray-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 italic">Advanced Maintenance</h3>
                </div>
              </div>
              <p className="text-sm text-gray-400">Database cleanup tools and archival services coming soon.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

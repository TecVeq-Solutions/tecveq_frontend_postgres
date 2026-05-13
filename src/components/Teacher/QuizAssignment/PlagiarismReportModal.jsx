import React from 'react';
import { IoClose } from 'react-icons/io5';
import { AiOutlineWarning, AiOutlineCheckCircle, AiOutlineInfoCircle } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';

const PlagiarismReportModal = ({ isOpen, onClose, data }) => {
  const isDataAvailable = !!data;
  const isGlobal = !!data?.results;
  const analysis = data?.analysis || {};
  const studentName = data?.studentName;
  const title = data?.assignmentTitle || data?.quizTitle || (isGlobal ? "Global Plagiarism Scan" : "Submission Analysis");

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPercentageColor = (score) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <AnimatePresence>
      {isOpen && isDataAvailable && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3 sm:p-6 border-b flex justify-between items-center bg-gradient-to-r from-[#0B1053] to-[#1a237e] text-white">
              <div>
                <h2 className="text-2xl font-black tracking-tight">{isGlobal ? "Class-wide Integrity Report" : "Detailed AI & Plagiarism Scan"}</h2>
                <p className="text-sm opacity-90 font-medium">
                  {isGlobal ? "Global comparison across all student submissions" : `${studentName} • ${title}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 active:scale-90"
              >
                <IoClose size={28} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-8 space-y-8 scroll-smooth">
              {/* Overall Risk Banner */}
              {analysis?.overallRisk && (
                <div className={`px-3 sm:px-6 py-4 rounded-2xl border flex items-center justify-between ${getRiskColor(analysis.overallRisk)}`}>
                  <div className="flex items-center gap-4">
                    <AiOutlineWarning size={32} className={analysis.overallRisk.toLowerCase() === 'high' ? 'animate-pulse' : ''} />
                    <div>
                      <h4 className="font-bold text-lg leading-tight">Overall Risk: {analysis.overallRisk}</h4>
                      <p className="text-sm opacity-90">Based on combined AI and plagiarism indicators.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Overview Summary */}
              {(analysis?.summary || data?.aiSummary || data?.message) && (
                <div className="bg-indigo-50/50 border border-indigo-100 p-3 sm:p-5 rounded-2xl flex gap-4">
                  <div className="hidden sm:block bg-indigo-600 p-2 rounded-lg h-fit mt-1 self-start">
                    <AiOutlineInfoCircle className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-indigo-900 mb-1">Executive Summary</h4>
                    <p className="text-indigo-800 text-sm leading-relaxed antialiased">
                      {isGlobal ? (data.aiSummary || data.message) : analysis.summary}
                    </p>
                  </div>
                </div>
              )}

              {!isGlobal ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* AI Detection Card */}
                  {analysis?.aiDetection && (
                    <div className="group bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all rounded-2xl p-6 space-y-5">
                      <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-gray-900 text-lg">AI Content</h3>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${getRiskColor(analysis.aiDetection?.confidence)}`}>
                          {analysis.aiDetection?.confidence || 'N/A'}
                        </div>
                      </div>
                      <div className="flex items-end gap-3">
                        <div className={`text-5xl font-black leading-none tracking-tighter ${getPercentageColor(analysis.aiDetection?.score)}`}>
                          {analysis.aiDetection?.score || 0}%
                        </div>
                        <div className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-widest">
                          Probability
                        </div>
                      </div>
                      {analysis.aiDetection?.reasoning && (
                        <div className="pt-4 border-t border-gray-50 text-sm text-gray-600 leading-relaxed italic">
                          "{analysis.aiDetection.reasoning}"
                        </div>
                      )}
                    </div>
                  )}

                  {/* Plagiarism Card */}
                  {analysis?.plagiarism && (
                    <div className="group bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all rounded-2xl p-6 space-y-5">
                      <div className="flex justify-between items-center">
                        <h3 className="font-extrabold text-gray-900 text-lg">Plagiarism</h3>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border-2 ${getRiskColor(analysis?.overallRisk)}`}>
                          Verdict
                        </div>
                      </div>
                      <div className="flex items-end gap-3">
                        <div className={`text-5xl font-black leading-none tracking-tighter ${getPercentageColor(analysis.plagiarism?.score)}`}>
                          {analysis.plagiarism?.score || 0}%
                        </div>
                        <div className="text-xs text-gray-500 font-bold mb-1 uppercase tracking-widest">
                          Match Scan
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-50 text-sm text-gray-700 leading-tight">
                        <p className="font-bold text-gray-900 mb-1">Result:</p>
                        <p className="text-gray-600 font-medium">{analysis.plagiarism?.verdict || 'No data'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Suspicious Pairs (Single or Global) */}
              {((analysis?.plagiarism?.suspiciousPairs?.length > 0) || (data?.results?.length > 0)) && (
                <div className="space-y-4">
                  <h3 className="font-black text-gray-900 text-xl flex items-center gap-3">
                    <AiOutlineWarning className="text-red-600" size={24} />
                    {isGlobal ? `Identified Suspicious Pairs (${data.results.length})` : "Significant Similarity Sources"}
                  </h3>
                  <div className="grid gap-4">
                    {(isGlobal ? data.results : analysis.plagiarism.suspiciousPairs).map((pair, idx) => (
                      <div key={idx} className="group bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm rounded-2xl p-5 flex justify-between items-center transition-all">
                        <div className="flex-1 mr-6">
                          <p className="font-bold text-gray-900 text-lg">
                            {isGlobal ? `${pair?.studentA?.name || 'Student A'} ↔ ${pair?.studentB?.name || 'Student B'}` : `Compared with: ${pair?.comparedWith}`}
                          </p>
                          <p className="text-sm text-gray-600 mt-2 font-medium leading-relaxed">{pair?.reasoning}</p>
                          {isGlobal && pair?.type === "identical_file" && (
                            <span className="mt-3 inline-flex items-center px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-md">
                              Identical Files Detected
                            </span>
                          )}
                        </div>
                        <div className="text-center shrink-0">
                          <div className={`text-3xl font-black tracking-tighter ${getPercentageColor(pair?.similarity)}`}>
                            {pair?.similarity || 0}%
                          </div>
                          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Similarity</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Suspicious Patterns Found */}
              {((!isGlobal && analysis?.plagiarism?.suspiciousPairs?.length === 0) || (isGlobal && data?.results?.length === 0)) && (
                <div className="flex items-center gap-4 text-green-700 bg-green-50/50 border border-green-100 p-3 sm:p-6 rounded-2xl font-bold animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <div className="bg-green-600 p-2 rounded-full text-black shadow-sm shadow-green-200">
                    <AiOutlineCheckCircle size={28} />
                  </div>
                  <div>
                    <h5 className="text-lg">Clean Sweep</h5>
                    <p className="text-sm font-medium opacity-80">No suspicious overlaps detected within the group.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-6 border-t bg-gray-50/50 flex justify-end gap-4">
              {!isGlobal && data?.fileUrl && (
                <a
                  href={data.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 sm:px-8 py-3 border-2 border-[#0B1053] text-[#0B1053] font-bold rounded-2xl hover:bg-[#0B1053] hover:text-white transform transition-all duration-200 active:scale-95 text-sm uppercase tracking-wider"
                >
                  View Original Submission
                </a>
              )}
              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#0B1053] text-white font-extrabold rounded-2xl hover:bg-[#1a237e] shadow-lg shadow-indigo-100 transform transition-all duration-200 active:scale-95 text-sm uppercase tracking-wider"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};



export default PlagiarismReportModal;




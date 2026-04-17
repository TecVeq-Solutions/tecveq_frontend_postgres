import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

const MCQBuilder = ({ questions, setQuestions }) => {
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { title: '', marks: 1, options: [{ text: '', isCorrect: true }, { text: '', isCorrect: false }] }
    ]);
  };

  const removeQuestion = (qIndex) => {
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const updateQuestion = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push({ text: '', isCorrect: false });
    setQuestions(updated);
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].options = updated[qIndex].options.filter((_, idx) => idx !== optIndex);
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex][field] = value;
    setQuestions(updated);
  };

  const setCorrectOption = (qIndex, correctOptIndex) => {
    const updated = [...questions];
    updated[qIndex].options.forEach((opt, idx) => {
      opt.isCorrect = idx === correctOptIndex;
    });
    setQuestions(updated);
  };

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
          <div className="absolute top-4 right-4">
            <button 
              type="button"
              onClick={() => removeQuestion(qIndex)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-4 mb-4">
             <div className="flex-1 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Question {qIndex + 1}</label>
                <input 
                  type="text" 
                  value={q.title}
                  onChange={(e) => updateQuestion(qIndex, 'title', e.target.value)}
                  placeholder="Enter your question here..."
                  className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 font-medium focus:ring-2 focus:ring-indigo-100 outline-none"
                />
             </div>
             <div className="w-24 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Marks</label>
                <input 
                  type="number" 
                  min="1"
                  value={q.marks}
                  onChange={(e) => updateQuestion(qIndex, 'marks', parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-50 border-none rounded-lg px-4 py-3 font-black text-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-center"
                />
             </div>
          </div>

          <div className="pl-6 border-l-2 border-indigo-50 space-y-3">
             {q.options.map((opt, optIndex) => (
                <div key={optIndex} className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => setCorrectOption(qIndex, optIndex)}
                    className={`transition-colors flex-shrink-0 ${opt.isCorrect ? 'text-emerald-500' : 'text-gray-300 hover:text-emerald-300'}`}
                  >
                    {opt.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <input 
                    type="text"
                    value={opt.text}
                    onChange={(e) => updateOption(qIndex, optIndex, 'text', e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                    className={`flex-1 border-none bg-gray-50 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-100 outline-none ${opt.isCorrect ? 'font-bold text-gray-900 border-l-4 border-emerald-500' : 'text-gray-600'}`}
                  />
                  {q.options.length > 2 && (
                    <button 
                      type="button"
                      onClick={() => removeOption(qIndex, optIndex)}
                      className="text-gray-300 hover:text-red-400 p-1 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
             ))}
             
             <button 
               type="button"
               onClick={() => addOption(qIndex)}
               className="text-xs font-bold text-indigo-500 flex items-center gap-1 hover:text-indigo-600 pt-2"
             >
               <Plus className="w-3 h-3" /> Add Option
             </button>
          </div>
        </div>
      ))}
      
      <button 
        type="button"
        onClick={addQuestion}
        className="w-full border-2 border-dashed border-gray-200 rounded-xl py-4 flex items-center justify-center gap-2 text-gray-500 font-bold hover:bg-gray-50 hover:text-indigo-600 transition-all"
      >
        <Plus className="w-5 h-5" />
        Add New Question
      </button>
    </div>
  );
};

export default MCQBuilder;

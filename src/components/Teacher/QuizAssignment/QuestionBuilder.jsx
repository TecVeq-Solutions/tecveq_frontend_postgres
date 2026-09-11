import React, { useState } from "react";
import { Plus, Trash2, Circle, Upload } from "lucide-react";
import { IoCheckmarkCircle } from "react-icons/io5";
import ImportCSVModal from "./ImportCSVModal";

export default function QuestionBuilder({ questions, setQuestions }) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now().toString(),
      text: "",
      marks: 1,
      questionType: type,
      options: type === "mcq" ? [{ id: "1", text: "", isCorrect: true }, { id: "2", text: "", isCorrect: false }] : [],
      acceptedAnswers: type === "true_false" ? ["True"] : type === "fill_blank" ? [""] : []
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index, key, value) => {
    const updated = [...questions];
    updated[index][key] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
  };

  const addOption = (qIndex) => {
    const updated = [...questions];
    if (!updated[qIndex].options) updated[qIndex].options = [];
    updated[qIndex].options.push({ id: Date.now().toString(), text: "", isCorrect: false });
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, text) => {
    const updated = [...questions];
    if (updated[qIndex].options && updated[qIndex].options[optIndex]) {
      updated[qIndex].options[optIndex].text = text;
      setQuestions(updated);
    }
  };

  const removeOption = (qIndex, optIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options) {
      updated[qIndex].options.splice(optIndex, 1);
      setQuestions(updated);
    }
  };

  const setCorrectOption = (qIndex, optIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options) {
      updated[qIndex].options.forEach((opt, idx) => {
        opt.isCorrect = idx === optIndex;
      });
      setQuestions(updated);
    }
  };

  const handleImportCSV = (importedQuestions) => {
    setQuestions([...questions, ...importedQuestions]);
  };

  const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-50 transition-all";

  return (
    <div className="flex flex-col gap-4 mt-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Questions</label>
      </div>

      {questions.map((q, qIndex) => (
        <div key={q.id} className="p-4 bg-gray-50/50 border border-gray-200 rounded-xl flex flex-col gap-3 relative group">
          <button 
            onClick={() => removeQuestion(qIndex)}
            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 size={16} />
          </button>
          
          <div className="flex gap-3 pr-8">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Question text..."
                value={q.text}
                onChange={(e) => updateQuestion(qIndex, "text", e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="w-24 shrink-0">
              <input
                type="number"
                min="1"
                placeholder="Marks"
                value={q.marks}
                onChange={(e) => updateQuestion(qIndex, "marks", parseInt(e.target.value) || 1)}
                className={inputCls}
              />
            </div>
          </div>

          {q.questionType === "mcq" && (
            <div className="flex flex-col gap-2 pl-4 border-l-2 border-purple-100 mt-2">
              {(q.options || []).map((opt, optIndex) => (
                <div key={opt.id || optIndex} className="flex items-center gap-2">
                  <button 
                    onClick={() => setCorrectOption(qIndex, optIndex)}
                    className={opt.isCorrect ? "text-purple-600" : "text-gray-300 hover:text-purple-400"}
                  >
                    {opt.isCorrect ? <IoCheckmarkCircle size={20} /> : <Circle size={18} />}
                  </button>
                  <input
                    type="text"
                    placeholder={`Option ${optIndex + 1}`}
                    value={opt.text}
                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-purple-400"
                  />
                  {(q.options || []).length > 2 && (
                    <button onClick={() => removeOption(qIndex, optIndex)} className="text-gray-400 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button 
                onClick={() => addOption(qIndex)}
                className="self-start text-xs text-purple-600 font-medium flex items-center gap-1 mt-1 hover:text-purple-700"
              >
                <Plus size={12} /> Add Option
              </button>
            </div>
          )}

          {q.questionType === "true_false" && (
            <div className="flex items-center gap-4 pl-4 border-l-2 border-purple-100 mt-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name={`tf-${q.id || qIndex}`} 
                  checked={(q.acceptedAnswers || [])[0] === "True"} 
                  onChange={() => updateQuestion(qIndex, "acceptedAnswers", ["True"])}
                  className="accent-purple-600"
                />
                True is correct
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input 
                  type="radio" 
                  name={`tf-${q.id || qIndex}`} 
                  checked={(q.acceptedAnswers || [])[0] === "False"} 
                  onChange={() => updateQuestion(qIndex, "acceptedAnswers", ["False"])}
                  className="accent-purple-600"
                />
                False is correct
              </label>
            </div>
          )}

          {q.questionType === "fill_blank" && (
            <div className="pl-4 border-l-2 border-purple-100 mt-2">
              <input
                type="text"
                placeholder="Accepted answers (comma separated)"
                value={(q.acceptedAnswers || []).join(", ")}
                onChange={(e) => updateQuestion(qIndex, "acceptedAnswers", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-purple-400"
              />
              <p className="text-[10px] text-gray-400 mt-1">Students must type one of these exactly (case-insensitive).</p>
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-2 mt-2">
        <button onClick={() => addQuestion('mcq')} className="flex-1 py-2 border border-dashed border-purple-200 rounded-xl text-purple-600 text-xs font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-1">
          <Plus size={14} /> Add MCQ
        </button>
        <button onClick={() => addQuestion('true_false')} className="flex-1 py-2 border border-dashed border-purple-200 rounded-xl text-purple-600 text-xs font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-1">
          <Plus size={14} /> Add True/False
        </button>
        <button onClick={() => addQuestion('fill_blank')} className="flex-1 py-2 border border-dashed border-purple-200 rounded-xl text-purple-600 text-xs font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-1">
          <Plus size={14} /> Add Fill-in-Blank
        </button>
        <button onClick={() => setIsImportModalOpen(true)} className="flex-1 py-2 border border-dashed border-purple-200 rounded-xl text-purple-600 text-xs font-medium hover:bg-purple-50 transition-colors flex items-center justify-center gap-1">
          <Upload size={14} /> Import MCQs via CSV
        </button>
      </div>

      <ImportCSVModal 
        open={isImportModalOpen} 
        setOpen={setIsImportModalOpen} 
        onImport={handleImportCSV} 
      />
    </div>
  );
}

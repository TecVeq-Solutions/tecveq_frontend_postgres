import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Circle, ChevronRight, ChevronLeft, Send, X, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import useClickOutside from '../../../hooks/useClickOutlise';
import Loader from '../../../utils/Loader';

const TakeQuizModal = ({ isOpen, onClose, quiz, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]); // [{ questionID, selectedOptID }]
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const modalRef = useRef(null);
  useClickOutside(modalRef, () => {
    if (!isSubmitting) onClose();
  });

  if (!isOpen || !quiz) return null;

  const questions = quiz.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectOption = (optID) => {
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionID === currentQuestion.id);
    
    if (existingIndex > -1) {
      newAnswers[existingIndex].selectedOptID = optID;
    } else {
      newAnswers.push({ questionID: currentQuestion.id, selectedOptID: optID });
    }
    setAnswers(newAnswers);
  };

  const selectedOptionID = answers.find(a => a.questionID === currentQuestion?.id)?.selectedOptID;

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.length < questions.length) {
      if (!window.confirm("You haven't answered all questions. Submit anyway?")) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onComplete(answers);
      onClose();
    } catch (error) {
      toast.error("Failed to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((answers.length) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-poppins">
      <div 
        ref={modalRef}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
      >
        {/* Header */}
        <div className="bg-[#6A00FF] p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">{quiz.title}</h2>
            <div className="flex items-center gap-3 mt-1 opacity-80 text-xs font-bold">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {new Date(quiz.dueDate).toLocaleDateString()}</span>
              <span>•</span>
              <span>{questions.length} Questions</span>
              <span>•</span>
              <span>{quiz.totalMarks} Marks</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-gray-100">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Area */}
        <div className="p-8 min-h-[400px]">
          {currentQuestion ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Question {currentQuestionIndex + 1} of {questions.length}</span>
                <h3 className="text-xl font-bold text-gray-900 leading-snug">
                  {currentQuestion.text}
                </h3>
              </div>

              <div className="space-y-3">
                {currentQuestion.options?.map((opt) => {
                  const isSelected = selectedOptionID === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left group
                        ${isSelected 
                          ? 'border-[#6A00FF] bg-[#6A00FF]/5 ring-1 ring-[#6A00FF]' 
                          : 'border-gray-100 hover:border-indigo-100 hover:bg-gray-50'}`}
                    >
                      <div className={`transition-colors ${isSelected ? 'text-[#6A00FF]' : 'text-gray-300 group-hover:text-indigo-200'}`}>
                        {isSelected ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </div>
                      <span className={`font-semibold text-base ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                <Send className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Ready to Submit?</h3>
              <p className="text-gray-500 font-medium">You've reached the end of the quiz.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex items-center justify-between border-t border-gray-100">
          <button
            onClick={handleBack}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all
              ${currentQuestionIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <div className="flex gap-3">
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-[#6A00FF] text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-[#5800D6] shadow-lg shadow-[#6A00FF]/20 transition-all"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-emerald-500 text-white px-10 py-3 rounded-2xl font-black text-sm hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader /> : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuizModal;

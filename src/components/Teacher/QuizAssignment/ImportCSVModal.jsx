import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { IoClose } from "react-icons/io5";
import { Download, UploadCloud, AlertCircle } from "lucide-react";

export default function ImportCSVModal({ open, setOpen, onImport }) {
  const [file, setFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [questionsPreview, setQuestionsPreview] = useState([]);
  const fileInputRef = useRef(null);

  if (!open) return null;

  const resetState = () => {
    setFile(null);
    setValidationErrors([]);
    setQuestionsPreview([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => {
    resetState();
    setOpen(false);
  };

  const downloadTemplate = () => {
    const templateData = [
      ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_option", "marks", "explanation"],
      ["What is HTML?", "Programming Language", "Markup Language", "Database", "Operating System", "B", "1", "HTML is a markup language."],
      ["Which CSS property changes text color?", "font-size", "color", "background", "margin", "B", "1", "The color property changes text color."],
      ["What does JS stand for?", "JavaScript", "JavaStyle", "JavaSource", "JSON", "A", "1", "JS stands for JavaScript."]
    ];
    
    const csvContent = templateData.map(e => e.map(item => `"${item}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "mcq_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationErrors([]);
      setQuestionsPreview([]);
    }
  };

  const validateAndParse = () => {
    if (!file) {
      setValidationErrors(["Please choose a CSV file first."]);
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const { data, meta } = results;
        
        // 1. Check required columns
        const requiredColumns = ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_option", "marks"];
        const missingColumns = requiredColumns.filter(col => !meta.fields.includes(col));
        
        if (missingColumns.length > 0) {
          setValidationErrors([`Missing required columns: ${missingColumns.join(", ")}`]);
          return;
        }

        if (data.length === 0) {
          setValidationErrors(["The CSV file is empty."]);
          return;
        }

        const errors = [];
        const validQuestions = [];

        data.forEach((row, index) => {
          const rowNum = index + 2; // +1 for header, +1 for 0-index
          const text = row.question_text?.trim();
          const optA = row.option_a?.trim();
          const optB = row.option_b?.trim();
          const optC = row.option_c?.trim();
          const optD = row.option_d?.trim();
          const correct = row.correct_option?.trim().toUpperCase();
          const marks = Number(row.marks);
          const explanation = row.explanation?.trim() || "";

          let rowErrors = [];

          if (!text) rowErrors.push("Question text is empty.");
          if (!optA) rowErrors.push("Option A is empty.");
          if (!optB) rowErrors.push("Option B is empty.");
          if (!optC) rowErrors.push("Option C is empty.");
          if (!optD) rowErrors.push("Option D is empty.");
          
          if (!["A", "B", "C", "D"].includes(correct)) {
            rowErrors.push(`Invalid correct_option "${row.correct_option}". Allowed values: A, B, C, D.`);
          }
          
          if (isNaN(marks) || marks <= 0) {
            rowErrors.push("Marks must be a valid positive number.");
          }

          if (rowErrors.length > 0) {
            errors.push(`Row ${rowNum}:\n` + rowErrors.join("\n"));
          } else {
            validQuestions.push({
              id: Date.now().toString() + Math.random().toString().slice(2, 6),
              text: text,
              marks: marks,
              questionType: "mcq",
              explanation: explanation,
              options: [
                { id: "a", text: optA, isCorrect: correct === "A" },
                { id: "b", text: optB, isCorrect: correct === "B" },
                { id: "c", text: optC, isCorrect: correct === "C" },
                { id: "d", text: optD, isCorrect: correct === "D" },
              ],
              acceptedAnswers: []
            });
          }
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
        } else {
          setQuestionsPreview(validQuestions);
        }
      },
      error: (error) => {
        setValidationErrors([`Failed to parse CSV: ${error.message}`]);
      }
    });
  };

  const handleImport = () => {
    onImport(questionsPreview);
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-10">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Import MCQs via CSV</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
            <IoClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          {questionsPreview.length === 0 ? (
            <>
              {/* Instructions and Template */}
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-purple-800 mb-2">Instructions</h3>
                <ol className="list-decimal pl-5 text-sm text-purple-700/80 space-y-1 mb-4">
                  <li>Download the CSV template.</li>
                  <li>Fill in your questions. Do not change the column headers.</li>
                  <li>Upload the CSV file below.</li>
                </ol>
                <button 
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-600 text-sm font-medium rounded-lg hover:bg-purple-50 transition-colors shadow-sm"
                >
                  <Download size={16} /> Download CSV Template
                </button>
              </div>

              {/* Upload Area */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Upload File</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="file" 
                    accept=".csv"
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <UploadCloud size={16} className="text-gray-500" />
                    Choose CSV File
                  </button>
                  <span className="text-sm text-gray-500">
                    {file ? file.name : "No file chosen"}
                  </span>
                </div>
              </div>

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                    <AlertCircle size={18} />
                    <span>Validation Errors Found</span>
                  </div>
                  <div className="text-sm text-red-500/90 whitespace-pre-wrap flex flex-col gap-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {validationErrors.map((err, i) => (
                      <div key={i} className="bg-white/50 p-2 rounded-lg border border-red-100/50">
                        {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Preview */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-green-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  {questionsPreview.length} valid questions found
                </h3>
              </div>
              
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 z-10">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-600">No.</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Question</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Options</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Correct</th>
                        <th className="px-4 py-3 font-semibold text-gray-600">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {questionsPreview.map((q, i) => {
                        const correctIndex = q.options.findIndex(o => o.isCorrect);
                        const correctLetter = ["A", "B", "C", "D"][correctIndex] || "";
                        
                        return (
                          <tr key={i} className="hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-gray-500 align-top">{i + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-800 align-top">
                              {q.text}
                              {q.explanation && <p className="text-xs text-gray-400 mt-1 font-normal">Expl: {q.explanation}</p>}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <ul className="text-xs text-gray-600 space-y-1">
                                {q.options.map((opt, optIndex) => (
                                  <li key={optIndex} className={opt.isCorrect ? "font-semibold text-purple-600" : ""}>
                                    {["A", "B", "C", "D"][optIndex]}. {opt.text}
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="px-4 py-3 text-purple-600 font-bold align-top">{correctLetter}</td>
                            <td className="px-4 py-3 text-gray-600 align-top">{q.marks}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 shrink-0 bg-gray-50/50 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          
          {questionsPreview.length === 0 ? (
            <button
              onClick={validateAndParse}
              disabled={!file}
              className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-md shadow-purple-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload / Continue
            </button>
          ) : (
            <button
              onClick={handleImport}
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-md shadow-green-200 transition-all"
            >
              Import {questionsPreview.length} Questions
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

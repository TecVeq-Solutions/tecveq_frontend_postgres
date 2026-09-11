import React, { useState } from "react";
import { Book, FileText, Video, Link, ExternalLink, Download } from "lucide-react";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";
import { getStudentMaterials } from "../../../api/Teacher/LearningMaterials"; // same API definitions can be reused
import Loader from "../../../utils/Loader";

const LearningMaterialsTable = ({ subjectId, classId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const { data, isPending, isSuccess } = useQuery({
    queryKey: ["studentMaterials", subjectId, classId],
    queryFn: () => getStudentMaterials(subjectId, classId),
    enabled: !!subjectId && !!classId,
  });

  const materials = Array.isArray(data) ? data : data?.data || [];
  
  const totalPages = Math.ceil(materials.length / rowsPerPage) || 1;
  const paginatedMaterials = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return materials.slice(startIndex, startIndex + rowsPerPage);
  }, [materials, currentPage, rowsPerPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const getIcon = (type) => {
    switch (type) {
      case "Video": return <Video size={16} className="text-red-500" />;
      case "PDF": return <FileText size={16} className="text-red-600" />;
      case "Word": return <FileText size={16} className="text-blue-600" />;
      case "PowerPoint": return <Book size={16} className="text-orange-500" />;
      case "Link": return <Link size={16} className="text-purple-500" />;
      default: return <FileText size={16} className="text-gray-500" />;
    }
  };

  if (isPending) {
    return <div className="flex justify-center py-6"><Loader /></div>;
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="col-span-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">#</div>
        <div className="col-span-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title</div>
        <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</div>
        <div className="col-span-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</div>
        <div className="col-span-2 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Action</div>
      </div>

      {/* Table Body */}
      {materials.length > 0 ? (
        <div className="divide-y divide-gray-50">
          {paginatedMaterials.map((material, index) => (
            <div key={material.id} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 px-3 sm:px-4 md:px-5 py-5 md:py-4 items-start md:items-center hover:bg-gray-50/70 transition-colors">
              <div className="hidden md:flex md:col-span-1 items-center">
                <span className="text-xs font-medium text-gray-400">
                  {(currentPage - 1) * rowsPerPage + index + 1}
                </span>
              </div>
              
              <div className="w-full md:col-span-5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                  {getIcon(material.materialType)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 truncate">{material.title}</p>
                  <p className="text-[11px] text-gray-400 truncate mt-0.5">{material.description || "No description"}</p>
                </div>
              </div>

              <div className="w-full flex md:col-span-2 items-center">
                <span className="text-[12px] font-medium text-gray-600 bg-gray-100 px-2 rounded-md py-0.5">
                  {material.materialType}
                </span>
              </div>

              <div className="w-full flex md:col-span-2 items-center">
                <span className="text-xs text-gray-600">
                  {moment(material.createdAt).format("MMM DD, YYYY")}
                </span>
              </div>

              <div className="w-full flex md:col-span-2 items-center md:justify-center gap-2 pt-2 md:pt-0 border-t md:border-0 border-gray-100">
                {material.videoUrl && (
                  <a
                    href={material.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <ExternalLink size={14} /> Watch
                  </a>
                )}
                {material.fileUrl && (
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Download size={14} /> Download
                  </a>
                )}
                {!material.videoUrl && !material.fileUrl && (
                  <span className="text-xs text-gray-400">Unavailable</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Book size={24} className="text-gray-300 mb-2" />
          <h3 className="text-sm font-semibold text-gray-800">No Learning Materials</h3>
          <p className="text-xs text-gray-400 mt-1">Your teacher hasn't published any materials for this subject yet.</p>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, materials.length)} of {materials.length}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningMaterialsTable;

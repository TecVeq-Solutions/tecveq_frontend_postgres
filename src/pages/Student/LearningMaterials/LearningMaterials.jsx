import React, { useState } from "react";
import Navbar from "../../../components/Student/Dashboard/Navbar";
import { useBlur } from "../../../context/BlurContext";
import { useSidebar } from "../../../context/SidebarContext";
import { Book, FileText, Video, Link, ExternalLink, Download, BookOpen } from "lucide-react";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { getStudentMaterials } from "../../../api/Teacher/LearningMaterials";
import moment from "moment";
import Loader from "../../../utils/Loader";

const LearningMaterials = () => {
  const { isSidebarOpen } = useSidebar();
  const { isBlurred } = useBlur();

  // Fetch all learning materials for this student
  const { data, isPending, isSuccess } = useQuery({
    queryKey: ["allStudentMaterials"],
    queryFn: () => getStudentMaterials(null, null), // fetch all
  });

  const allMaterials = Array.isArray(data) ? data : data?.data || [];

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Pagination logic
  const totalItems = allMaterials.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;

  const paginatedMaterials = React.useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return allMaterials.slice(startIndex, endIndex);
  }, [allMaterials, currentPage, rowsPerPage]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

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

  return (
    <div
      className="flex flex-1 min-h-screen font-poppins"
      style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f9f9f9 100%)",
      }}
    >
      <div className="flex flex-1">
        <div className="w-full lg:px-20 sm:px-10 px-3 flex-grow ml-0 lg:ml-72">
          <div className="pt-1">
            <Navbar heading={"Learning Materials"} />

            <div
              className={`${isBlurred ? "blur" : ""} relative ${isSidebarOpen ? "-z-10" : "z-auto"
                } lg:z-auto`}
            >
              {/* Header Banner */}
              <div
                className="mt-6 mb-6 rounded-2xl px-3 sm:px-6 py-3 sm:py-5 flex items-center gap-4"
                style={{
                  background: "linear-gradient(135deg, #0B1053 0%, #1a227e 60%, #283593 100%)",
                }}
              >
                <div className="bg-white/20 rounded-xl p-3">
                  <BookOpen className="text-white" size={28} />
                </div>

                <div>
                  <h2 className="text-white font-bold text-xl leading-tight">
                    My Learning Materials
                  </h2>
                  <p className="text-blue-200 text-sm mt-0.5">
                    {allMaterials.length} material{allMaterials.length !== 1 ? "s" : ""} shared by teachers
                  </p>
                </div>
              </div>

              {/* Main Content */}
              {isPending ? (
                <div className="flex justify-center py-20"><Loader /></div>
              ) : (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-blue-100/70 shadow-sm overflow-hidden mb-10">
                  {/* Table Header */}
                  <div
                    className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 text-xs font-semibold text-[#0B1053] tracking-wide uppercase"
                    style={{
                      background: "rgba(11,16,83,0.05)",
                      borderBottom: "1px solid rgba(11,16,83,0.1)",
                    }}
                  >
                    <div className="col-span-1 text-center">#</div>
                    <div className="col-span-3 text-left">Title</div>
                    <div className="col-span-2 text-left">Subject</div>
                    <div className="col-span-2 text-center">Type</div>
                    <div className="col-span-2 text-center">Date</div>
                    <div className="col-span-2 text-center">Action</div>
                  </div>

                  {/* Materials List */}
                  {allMaterials.length > 0 ? (
                    <>
                      <div className="divide-y divide-blue-50/50 p-3">
                        {paginatedMaterials.map((material, index) => {
                          const rowIndex = (currentPage - 1) * rowsPerPage + index + 1;
                          return (
                            <div key={material.id} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 px-3 py-4 items-start md:items-center hover:bg-blue-50/30 transition-colors rounded-xl md:rounded-none">
                              <div className="hidden md:flex md:col-span-1 items-center justify-center">
                                <span className="text-sm font-semibold text-[#0B1053]/40">{rowIndex}</span>
                              </div>
                              
                              <div className="w-full md:col-span-3 flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100/50">
                                  {getIcon(material.materialType)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[15px] font-bold text-[#0B1053] truncate">
                                    {material.chapter && <span className="text-blue-600 mr-1">{material.chapter} -</span>}
                                    {material.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {material.teacher?.profilePic ? (
                                      <img src={material.teacher.profilePic} className="w-4 h-4 rounded-full" alt="teacher" />
                                    ) : (
                                      <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                                    )}
                                    <p className="text-[11px] text-[#0B1053]/60 truncate">
                                      {material.teacher?.name || "Teacher"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="w-full flex md:col-span-2 items-center">
                                <span className="text-sm font-semibold text-[#0B1053]/80">
                                  {material.subject?.name || "Subject"}
                                </span>
                              </div>

                              <div className="w-full flex md:col-span-2 items-center md:justify-center">
                                <span className="text-[11px] font-bold tracking-wide text-[#0B1053] bg-blue-100/50 px-2.5 py-1 rounded-md border border-blue-200">
                                  {material.materialType}
                                </span>
                              </div>

                              <div className="w-full flex md:col-span-2 items-center md:justify-center">
                                <span className="text-sm font-medium text-[#0B1053]/70">
                                  {moment(material.createdAt).format("MMM DD, YYYY")}
                                </span>
                              </div>

                              <div className="w-full flex md:col-span-2 items-center md:justify-center gap-2 pt-3 md:pt-0 border-t md:border-0 border-blue-100/30">
                                {material.videoUrl && (
                                  <a
                                    href={material.videoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-600 hover:bg-blue-100 rounded-lg text-[13px] font-bold transition-colors border border-blue-200/50"
                                  >
                                    <ExternalLink size={14} /> Watch
                                  </a>
                                )}
                                {material.fileUrl && (
                                  <a
                                    href={material.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100/50 text-[#0B1053] hover:bg-blue-100 rounded-lg text-[13px] font-bold transition-colors border border-blue-200/50"
                                  >
                                    <Download size={14} /> View
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination + Selector */}
                      <div className="mt-4 sm:mt-6 mb-4 flex flex-row items-center justify-between sm:gap-4 gap-4 rounded-[15px] sm:rounded-3xl border border-blue-100 bg-white/80 backdrop-blur-md px-1 sm:px-6 py-4 shadow-[0_8px_30px_rgba(11,16,83,0.05)] mx-3">
                        {/* Rows selector */}
                        <div className="flex flex-row items-center gap-1 sm:gap-3 w-full lg:w-auto justify-center lg:justify-start">
                          <span className="text-sm font-semibold text-[#0B1053]/70">Rows per page</span>
                          <div className="relative">
                            <select
                              value={rowsPerPage}
                              onChange={(e) => {
                                setRowsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                              }}
                              className="appearance-none min-w-[50px] sm:min-w-[92px] cursor-pointer rounded-2xl border border-blue-200 bg-gradient-to-br from-white to-blue-50 px-2 sm:pl-4 sm:pr-10 py-2.5 text-sm font-bold text-[#0B1053] outline-none shadow-[0_4px_14px_rgba(11,16,83,0.05)] hover:border-[#0B1053]/50 focus:border-[#0B1053] transition-all duration-200"
                            >
                              {[2, 4, 6, 10].map((item) => (
                                <option key={item} value={item}>{item}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                              <svg className="w-4 h-4 text-[#0B1053]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* Showing info */}
                        <div className="hidden sm:flex flex-col items-center text-center">
                          <p className="text-sm font-semibold text-[#0B1053]">
                            Showing <span className="text-blue-600">{startItem}</span> to{" "}
                            <span className="text-blue-600">{endItem}</span> of{" "}
                            <span className="text-blue-600">{totalItems}</span> Materials
                          </p>
                        </div>

                        {/* Pagination buttons */}
                        <div className="flex items-center gap-2 w-full lg:w-auto justify-center lg:justify-end">
                          <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="group flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 sm:py-2.5 py-1.5 rounded-2xl text-sm font-bold border border-blue-200 bg-white text-[#0B1053] shadow-[0_3px_12px_rgba(11,16,83,0.05)] hover:bg-blue-50 hover:text-blue-800 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#0B1053] active:scale-95 transition-all duration-200"
                          >
                            <IoChevronBackOutline className="sm:hidden inline" size={18} />
                            <span className="hidden sm:inline">Previous</span>
                          </button>
                          <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="group flex items-center justify-center gap-1 sm:gap-2 px-1.5 sm:px-4 sm:py-2.5 py-1.5 rounded-2xl text-sm font-bold border border-blue-200 bg-white text-[#0B1053] shadow-[0_3px_12px_rgba(11,16,83,0.05)] hover:bg-blue-50 hover:text-blue-800 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-[#0B1053] active:scale-95 transition-all duration-200"
                          >
                            <span className="hidden sm:inline">Next</span>
                            <IoChevronForwardOutline className="sm:hidden inline" size={18} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="bg-purple-100 rounded-full p-6">
                        <BookOpen size={48} className="text-purple-400" />
                      </div>
                      <p className="font-semibold text-xl text-[#0B1053]/60">No materials yet</p>
                      <p className="text-[#0B1053]/40 text-sm">Your teachers haven't posted any learning materials.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningMaterials;

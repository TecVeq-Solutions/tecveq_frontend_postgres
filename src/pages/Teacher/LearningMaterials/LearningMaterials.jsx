import React, { useState } from "react";
import Loader from "../../../utils/Loader";
import Navbar from "../../../components/Teacher/Navbar";
import { FaEye } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import { BiDesktop } from "react-icons/bi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useBlur } from "../../../context/BlurContext";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getTeacherMaterials, deleteMaterial, publishMaterial } from "../../../api/Teacher/LearningMaterials";
import { BookOpen, Plus, FileText, ChevronLeft, ChevronRight, Search } from "lucide-react";
import moment from "moment";
import CreateLearningMaterialModal from "../../../components/Teacher/LearningMaterials/CreateLearningMaterialModal";

const LearningMaterials = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const { toggleBlur } = useBlur();

  const { data, isPending, isSuccess, refetch } = useQuery({
    queryKey: ["teacherMaterials", currentPage, rowsPerPage],
    queryFn: () => getTeacherMaterials(currentPage, rowsPerPage),
    staleTime: 1000 * 60 * 5,
  });

  const materialDelMutate = useMutation({
    mutationFn: async (id) => await deleteMaterial(id),
    onSettled: async () => {
      await refetch();
      toast.success("Material deleted successfully");
    },
  });

  const publishMutate = useMutation({
    mutationFn: async ({ id, status }) => await publishMaterial(id, status),
    onSettled: async () => {
      await refetch();
      toast.success("Material status updated");
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      materialDelMutate.mutate(id);
    }
  };

  const handlePublishToggle = (material) => {
    const newStatus = material.status === "Draft" ? "Published" : "Draft";
    publishMutate.mutate({ id: material.id, status: newStatus });
  };

  const handlePresent = (material) => {
    navigate(`/teacher/presentation/${material.id}`, { state: material });
  };

  /* ── Derived stats ── */
  const totalMaterials = data?.stats?.totalMaterials || 0;
  const publishedMaterials = data?.stats?.publishedMaterials || 0;
  const draftMaterials = data?.stats?.draftMaterials || 0;

  // Pagination logic
  const totalItems = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const paginatedMaterials = data?.data || [];

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  if (isPending && !data) {
    return (
      <div className="flex flex-col flex-1 bg-[#F9F9F9] lg:ml-80">
        <Navbar heading="Learning Materials" />
        <div className="flex flex-1 items-center justify-center py-24">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#F9F9F9] font-poppins lg:ml-80 transition-all duration-300">
        <div className="w-full min-w-0 overflow-x-hidden">
          <Navbar heading="Learning Materials" />

          <div className="px-3 sm:px-6 lg:px-12 py-6 space-y-6">
            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-800 leading-tight">
                  Learning Materials
                </h1>
                <p className="text-xs text-gray-400 mt-0.5">
                  Manage and present your class resources
                </p>
              </div>

              <button
                onClick={() => {
                  setCreateModalOpen(true);
                  toggleBlur();
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6A00FF] hover:bg-[#5800D6] text-white text-sm font-semibold rounded-xl shadow-md shadow-purple-200 transition-all active:scale-95"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>Create new</span>
              </button>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <StatCard
                icon={<FileText size={16} className="text-purple-600" />}
                bg="bg-purple-50"
                label="Total Materials"
                value={totalMaterials}
              />
              <StatCard
                icon={<BookOpen size={16} className="text-emerald-600" />}
                bg="bg-emerald-50"
                label="Published"
                value={publishedMaterials}
              />
              <StatCard
                icon={<BookOpen size={16} className="text-blue-600" />}
                bg="bg-blue-50"
                label="Drafts"
                value={draftMaterials}
                className="sm:col-span-2 lg:col-span-1"
              />
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
                {["#", "Title", "Type", "Subject", "Class", "Status", "Actions"].map((h, i) => (
                  <div
                    key={h}
                    className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest
                      ${i === 0 ? "col-span-1" : ""}
                      ${i === 1 ? "col-span-3" : ""}
                      ${i === 2 ? "col-span-1" : ""}
                      ${i === 3 ? "col-span-2" : ""}
                      ${i === 4 ? "col-span-2" : ""}
                      ${i === 5 ? "col-span-1 text-center" : ""}
                      ${i === 6 ? "col-span-2 text-center" : ""}
                    `}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {/* Table Rows */}
              {isSuccess && data?.data?.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-50">
                    {paginatedMaterials.map((material, index) => {
                      return (
                        <div
                          key={material.id}
                          className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-2 px-3 sm:px-4 md:px-5 py-5 md:py-4 items-start md:items-center hover:bg-gray-50/70 transition-colors border-b md:border-b-0 last:border-b-0"
                        >
                          <div className="hidden md:flex md:col-span-1 items-center">
                            <span className="text-xs font-medium text-gray-400">
                              {(currentPage - 1) * rowsPerPage + index + 1}
                            </span>
                          </div>

                          <div className="w-full md:col-span-3 flex items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold md:font-semibold text-gray-800 truncate">
                                {material.chapter && (
                                  <span className="text-purple-600 font-bold mr-1">{material.chapter} -</span>
                                )}
                                {material.title}
                              </p>
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                {moment(material.createdAt).format("MMM DD, YYYY")}
                              </p>
                            </div>
                          </div>

                          <div className="w-full flex md:col-span-1 items-center justify-between md:justify-start">
                            <span className="text-[12px] font-medium text-gray-600 bg-gray-100 px-2 rounded-md py-0.5">
                              {material.materialType}
                            </span>
                          </div>

                          <div className="w-full flex md:col-span-2 items-center justify-between md:justify-start">
                            <span className="text-xs text-gray-600 truncate">{material.subject?.name}</span>
                          </div>

                          <div className="w-full flex md:col-span-2 items-center justify-between md:justify-start">
                            <span className="text-xs text-gray-600 truncate">{material.classroom?.name}</span>
                          </div>

                          <div className="w-full flex md:col-span-1 items-center justify-between md:justify-center">
                            <button onClick={() => handlePublishToggle(material)} className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${material.status === 'Published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`}>
                              {material.status}
                            </button>
                          </div>

                          <div className="w-full flex md:col-span-2 items-center md:justify-center gap-1.5 pt-2 md:pt-0 border-t md:border-0 border-gray-100">
                            <ActionBtn
                              title="Smart LCD Mode"
                              color="bg-purple-100 text-purple-600 hover:bg-purple-200"
                              onClick={() => handlePresent(material)}
                            >
                              <BiDesktop size={14} />
                            </ActionBtn>

                            {material.fileUrl && (
                              <ActionBtn
                                title="View Document"
                                color="bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                                onClick={() => window.open(material.fileUrl, "_blank")}
                              >
                                <FaEye size={14} />
                              </ActionBtn>
                            )}

                            <ActionBtn
                              title="Edit"
                              color="bg-blue-50 text-blue-600 hover:bg-blue-100"
                              onClick={() => {
                                setSelectedMaterial(material);
                                setIsEdit(true);
                                toggleBlur();
                              }}
                            >
                              <MdEdit size={14} />
                            </ActionBtn>

                            <ActionBtn
                              title="Delete"
                              color="bg-red-50 text-red-500 hover:bg-red-100"
                              onClick={() => handleDelete(material.id)}
                            >
                              <MdDelete size={14} />
                            </ActionBtn>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </>

              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-3">
                    <BookOpen size={24} className="text-gray-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    No Materials Found
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                    Create a new learning material to share with your class.
                  </p>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-white">
                  <span className="text-xs text-gray-500">
                    Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems} items
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-medium text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {createModalOpen && (
        <CreateLearningMaterialModal
          open={createModalOpen}
          setopen={setCreateModalOpen}
          refetch={refetch}
        />
      )}

      {isEdit && selectedMaterial && (
        <CreateLearningMaterialModal
          data={selectedMaterial}
          isEditTrue={true}
          open={isEdit}
          setopen={setIsEdit}
          refetch={refetch}
        />
      )}
    </>
  );
};

const StatCard = ({ icon, bg, label, value, className = "" }) => (
  <div
    className={`bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3 ${className}`}
  >
    <div
      className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}
    >
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-lg font-semibold text-gray-800 leading-tight">
        {value}
      </p>
    </div>
  </div>
);

const ActionBtn = ({ onClick, color, title, children }) => (
  <button
    onClick={onClick}
    title={title}
    className={`w-7 h-7 flex items-center justify-center rounded-lg ${color} transition-colors`}
  >
    {children}
  </button>
);

export default LearningMaterials;

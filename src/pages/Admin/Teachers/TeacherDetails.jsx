import React, { useState } from "react";
import IMAGES from "../../../assets/images";
import Navbar from "../../../components/Admin/Navbar";
import FeedbackCard from "../../../components/Admin/Teachers/FeedbackCard";
import AttendanceTable from "../../../components/Admin/Teachers/AttendanceTable";
import SystemOverView from "../../../components/Admin/StudentReports/SystemOverview";

import { LuPhone } from "react-icons/lu";
import { useLocation } from "react-router-dom";
import { IoMailOutline } from "react-icons/io5";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserFeedback,
  acceptFeedback,
  rejectFeedback,
  deleteFeedback,
} from "../../../api/Admin/FeedbackApi";
import { toast } from "react-toastify";
import ConfirmModal from "../../../components/Admin/TimeTable/ConfirmModal";

const TeacherDetails = () => {
  const location = useLocation();
  const [reportActive, setReportActive] = useState(true);
  const [feedbackActive, setFeedbackActive] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);

  const teacherId = location?.state?.teacher?.id;

  const { data: feedbackData = [], isPending } = useQuery({
    queryKey: ["feedback", teacherId],
    queryFn: () => getUserFeedback(teacherId),
    enabled: !!teacherId,
  });

  const queryClient = useQueryClient();

  if (!location.state || !location.state.teacher) {
    return (
      <div className="flex flex-1 bg-[#F6F5F2] font-poppins h-screen">
        <div className="flex flex-1 items-center justify-center lg:ml-72">
          <div className="text-center bg-white rounded-2xl shadow-sm border border-[#E5E3DC] p-10">
            <div className="w-16 h-16 bg-[#EEF0FF] rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <p className="text-xl font-semibold text-[#0B1053] mb-2">Data Lost on Refresh</p>
            <p className="text-sm text-gray-400 mb-6">Please go back and reopen the teacher profile.</p>
            <button
              onClick={() => window.history.back()}
              className="bg-[#0B1053] text-white px-8 py-2.5 rounded-full text-sm font-medium hover:bg-[#0d1466] transition-colors"
            >
              Go Back to Teachers List
            </button>
          </div>
        </div>
      </div>
    );
  }

  const acceptMutation = useMutation({
    mutationFn: acceptFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries(["feedback", teacherId]);
      toast.success("Feedback accepted");
    },
    onError: () => {
      toast.error("Failed to accept feedback");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: rejectFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries(["feedback", teacherId]);
      toast.success("Feedback rejected");
    },
    onError: () => {
      toast.error("Failed to reject feedback");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries(["feedback", teacherId]);
      toast.success("Feedback deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete feedback");
    },
  });

  const handleAccept = (feedbackID) => acceptMutation.mutate(feedbackID);

  const handleReject = (feedbackID) => {
    setSelectedFeedbackId(feedbackID);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedFeedbackId) {
      deleteMutation.mutate(selectedFeedbackId);
      setIsDeleteModalOpen(false);
      setSelectedFeedbackId(null);
    }
  };

  const handleDelete = (feedbackID) => {
    setSelectedFeedbackId(feedbackID);
    setIsDeleteModalOpen(true);
  };

  const onReportClick = () => {
    setReportActive(true);
    setFeedbackActive(false);
  };

  const onFeedbackClick = () => {
    setReportActive(false);
    setFeedbackActive(true);
  };

  const teacher = location.state.teacher;

  // Generate initials from teacher name
  const getInitials = (name = "") =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="flex flex-1 bg-[#F6F5F2] font-poppins min-h-screen">
      <div className="flex flex-1">
        <div className="flex-grow w-full lg:ml-80">

          {/* ── Top Navbar ── */}
          <Navbar heading={"Teacher Reports"} />

          {/* ── Hero / Profile Banner ── */}
          <div className="bg-[#0B1053] relative px-6 pt-6 pb-14">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-24 h-24 rounded-full bg-white/5 translate-y-1/3 pointer-events-none" />

            <div className="flex flex-col items-center gap-3 relative z-10">
              {/* Avatar */}
              <div className="relative">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-white/20 overflow-hidden flex items-center justify-center bg-[#4A52B8] text-white text-3xl font-bold"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {teacher.profilePic ? (
                    <img
                      src={teacher.profilePic}
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(teacher.name)}</span>
                  )}
                </div>
                {/* Online dot */}
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#0B1053]" />
              </div>

              {/* Name */}
              <p className="text-white text-xl sm:text-2xl font-semibold tracking-tight">
                {teacher.name}
              </p>

              {/* Role badge */}
              <span className="bg-white/10 text-white/80 text-[10px] tracking-widest uppercase px-4 py-1 rounded-full border border-white/15">
                Teacher
              </span>

              {/* Contact chips */}
              <div className="flex flex-wrap gap-2 justify-center mt-1">
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/75 text-xs px-4 py-1.5 rounded-full">
                  <LuPhone size={11} />
                  <span>{teacher.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/75 text-xs px-4 py-1.5 rounded-full">
                  <IoMailOutline size={11} />
                  <span>{teacher.email}</span>
                </div>
              </div>
            </div>

            {/* Bottom curve */}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-[#F6F5F2] rounded-t-3xl" />
          </div>

          {/* ── Stats Row ── */}
          <div className="px-4 sm:px-8 -mt-1">
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Attendance", value: "83%", sub: "10/12 days", badge: "Present", badgeColor: "bg-green-50 text-green-700" },
                { label: "Classes", value: "24", sub: "This month" },
                { label: "Avg Rating", value: "4.8", sub: "From feedback" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E5E3DC] p-4">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-semibold text-[#0B1053]">{stat.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{stat.sub}</p>
                  {stat.badge && (
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1 font-medium ${stat.badgeColor}`}>
                      {stat.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 border-b border-[#E5E3DC] mb-6">
              <button
                onClick={onReportClick}
                className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${reportActive
                  ? "border-[#0B1053] text-[#0B1053]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
              >
                Report
              </button>
              <button
                onClick={onFeedbackClick}
                className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${!reportActive
                  ? "border-[#0B1053] text-[#0B1053]"
                  : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
              >
                Feedback
              </button>
            </div>

            {/* ── Report Tab ── */}
            {reportActive && (
              <div className="flex flex-col gap-6 pb-10">
                {/* Attendance */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">
                    Attendance Log
                  </p>
                  <div className="bg-white rounded-2xl border border-[#E5E3DC] overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0EEE8]">
                      <span className="text-sm font-medium text-[#1a1a2e]">Attendance Record</span>
                      <span className="text-xs text-gray-400">10 / 12 Present</span>
                    </div>
                    <AttendanceTable data={location?.state?.attendence} />
                  </div>
                </div>

                {/* System Usage */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-3">
                    System Usage Report
                  </p>
                  <div className="bg-white rounded-2xl border border-[#E5E3DC] overflow-hidden">
                    <SystemOverView />
                  </div>
                </div>
              </div>
            )}

            {/* ── Feedback Tab ── */}
            {!reportActive && (
              <div className="pb-12 animate-in fade-in duration-700">
                {/* Header Section with subtle accent */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                    Student Feedback
                  </p>
                </div>

                {isPending ? (
                  /* Premium Loading State */
                  <div className="flex flex-col items-center justify-center py-16 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-10 h-10 border-4 border-blue-100 rounded-full"></div>
                      <div className="w-10 h-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
                      Fetching student insights...
                    </p>
                  </div>
                ) : feedbackData?.feedbacks?.length > 0 ? (
                  /* Modern Grid Layout */
                  <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
                    {feedbackData.feedbacks.map((feedback, index) => (
                      <div
                        key={index}
                        className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/5"
                      >
                        <FeedbackCard
                          feedback={feedback}
                          onAccept={handleAccept}
                          onReject={handleReject}
                          onDelete={handleDelete}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Elegant Empty State */
                  <div className="relative overflow-hidden bg-white rounded-[2rem] border border-gray-100 p-12 text-center shadow-sm">
                    {/* Subtle Background Pattern/Glow */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>

                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-inner">
                        <span className="text-3xl grayscale-[0.5]">💬</span>
                      </div>

                      <h3 className="text-xl font-semibold text-[#0B1053] tracking-tight">
                        Quiet for now
                      </h3>
                      <p className="text-gray-400 mt-2 max-w-[260px] mx-auto leading-relaxed">
                        There are no student feedbacks recorded for this profile yet.
                      </p>

                      <button className="mt-6 px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                        Refresh Data
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Feedback"
        description="Are you sure you want to delete this feedback?"
        onconfirm={handleConfirmDelete}
        onclose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

export default TeacherDetails;
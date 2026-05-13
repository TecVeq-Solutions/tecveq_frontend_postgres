import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    IoCloseOutline,
    IoCheckmarkCircleOutline,
    IoCloseCircleOutline,
    IoAlertCircleOutline,
    IoDocumentTextOutline,
    IoChatbubbleOutline
} from 'react-icons/io5';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';
import { toast } from 'react-toastify';

const ApproveRejectModal = ({ isOpen, onClose, leaveRequest, onSuccess }) => {
    const [status, setStatus] = useState(null);
    const [comment, setComment] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAction = async () => {
        if (!status) return;
        if (status === 'rejected' && !rejectionReason.trim()) {
            toast.error('Please provide a rejection reason');
            return;
        }

        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const config = { headers: { Authorization: `Bearer ${user?.token}` } };

            await axios.put(`${BACKEND_URL}/leave/process/${leaveRequest.id}`, {
                status,
                comment,
                rejectionReason: status === 'rejected' ? rejectionReason : null
            }, config);

            toast.success(`Leave request ${status} successfully`);
            onSuccess();
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process request');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const requesterName = leaveRequest?.student?.name || leaveRequest?.teacher?.name || 'User';
    const getInitials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??';

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

                .arm-root { font-family: 'DM Sans', sans-serif; }
                .arm-title { font-family: 'Syne', sans-serif; }

                .arm-overlay {
                    background: rgba(8, 10, 40, 0.75);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }

                .arm-card {
                    background: #ffffff;
                    border-radius: 2rem;
                    box-shadow:
                        0 0 0 1px rgba(99,102,241,0.08),
                        0 32px 80px -12px rgba(8,10,60,0.28),
                        0 8px 24px -4px rgba(8,10,60,0.12);
                }

                .arm-header {
                    background: linear-gradient(135deg, #13106b 0%, #1e1a8a 50%, #1a3070 100%);
                    position: relative;
                    overflow: hidden;
                }
                .arm-header::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
                    pointer-events: none;
                }

                .arm-orb-a {
                    position: absolute; width: 180px; height: 180px;
                    border-radius: 50%; filter: blur(50px);
                    background: radial-gradient(circle, rgba(139,92,246,0.35), transparent);
                    top: -60px; right: -40px; pointer-events: none;
                }
                .arm-orb-b {
                    position: absolute; width: 140px; height: 140px;
                    border-radius: 50%; filter: blur(40px);
                    background: radial-gradient(circle, rgba(34,211,238,0.25), transparent);
                    bottom: -50px; left: 20px; pointer-events: none;
                }

                .arm-close-btn {
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 14px;
                    padding: 8px;
                    color: white;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                .arm-close-btn:hover {
                    background: white;
                    color: #13106b;
                    transform: rotate(90deg);
                }

                .arm-summary {
                    background: linear-gradient(135deg, #f0f0ff 0%, #fdf8ff 50%, #f0f8ff 100%);
                    border: 1px solid #ddd8ff;
                    border-radius: 1.5rem;
               
                }

                .arm-avatar {
                    width: 52px; height: 52px; border-radius: 16px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    display: flex; align-items: center; justify-content: center;
                    font-family: 'Syne', sans-serif;
                    font-weight: 800; font-size: 17px; color: white;
                    box-shadow: 0 8px 20px -4px rgba(99,102,241,0.4);
                    flex-shrink: 0;
                }

                .arm-reason-box {
                    background: white;
                    border-radius: 1rem;
                    padding: 0.875rem 1rem;
                    border: 1px solid #ede9fe;
                    margin-top: 0.75rem;
                }

                /* Action cards */
                .arm-action-card {
                    border-radius: 1.75rem;
                    padding: 1.5rem 1.25rem;
                    cursor: pointer;
                    transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.75rem;
                    border: 1.5px solid transparent;
                }
                .arm-action-card:active { transform: scale(0.97); }

                .arm-approve {
                    background: #f0fdf4;
                    border-color: #bbf7d0;
                }
                .arm-approve:hover {
                    background: #dcfce7;
                    border-color: #4ade80;
                    box-shadow: 0 16px 40px -8px rgba(34,197,94,0.22);
                    transform: translateY(-3px);
                }

                .arm-reject {
                    background: #fff1f2;
                    border-color: #fecdd3;
                }
                .arm-reject:hover {
                    background: #ffe4e6;
                    border-color: #fb7185;
                    box-shadow: 0 16px 40px -8px rgba(239,68,68,0.22);
                    transform: translateY(-3px);
                }

                .arm-action-icon {
                    width: 64px; height: 64px;
                    border-radius: 20px;
                    display: flex; align-items: center; justify-content: center;
                    background: white;
                    box-shadow: 0 4px 14px -2px rgba(0,0,0,0.08);
                    transition: transform 0.2s ease;
                }
                .arm-action-card:hover .arm-action-icon {
                    transform: scale(1.1);
                }

                .arm-action-shine {
                    position: absolute;
                    width: 100px; height: 100px;
                    border-radius: 50%;
                    top: -30px; right: -20px;
                    filter: blur(30px);
                    pointer-events: none;
                    transition: opacity 0.25s ease;
                }
                .arm-approve .arm-action-shine { background: rgba(74,222,128,0.3); }
                .arm-reject .arm-action-shine { background: rgba(251,113,133,0.3); }

                /* Status pill */
                .arm-status-pill {
                    display: flex; align-items: center; gap: 0.75rem;
                    border-radius: 1rem; padding: 0.875rem 1rem;
                }
                .arm-status-approved { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
                .arm-status-rejected { background: #fff1f2; border: 1px solid #fecdd3; color: #be123c; }

                .arm-status-icon {
                    width: 42px; height: 42px;
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    background: white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
                    flex-shrink: 0;
                }

                .arm-change-btn {
                    margin-left: auto;
                    background: white;
                    border: 1px solid rgba(0,0,0,0.08);
                    border-radius: 8px;
                    padding: 5px 12px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    color: inherit;
                    opacity: 0.75;
                }
                .arm-change-btn:hover { opacity: 1; background: rgba(0,0,0,0.04); }

                /* Textarea */
                .arm-textarea {
                    width: 100%;
                    border-radius: 1rem;
                    padding: 1rem;
                    font-size: 0.875rem;
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 400;
                    color: #374151;
                    background: #f9f9fc;
                    border: 1.5px solid #e5e7eb;
                    outline: none;
                    resize: none;
                    transition: all 0.2s ease;
                }
                .arm-textarea::placeholder { color: #9ca3af; }
                .arm-textarea:focus {
                    background: white;
                    border-color: #6366f1;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
                }
                .arm-textarea.reject:focus {
                    border-color: #f43f5e;
                    box-shadow: 0 0 0 3px rgba(244,63,94,0.1);
                }

                /* Buttons */
                .arm-btn-back {
                    flex: 1;
                    padding: 0.875rem;
                    border-radius: 14px;
                    background: #f1f2f8;
                    border: none;
                    font-family: 'Syne', sans-serif;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: #64748b;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                .arm-btn-back:hover { background: #e2e4ef; }
                .arm-btn-back:disabled { opacity: 0.5; cursor: not-allowed; }

                .arm-btn-confirm {
                    flex: 1;
                    padding: 0.875rem;
                    border-radius: 14px;
                    border: none;
                    font-family: 'Syne', sans-serif;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: white;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    position: relative;
                    overflow: hidden;
                }
                .arm-btn-confirm:hover { transform: translateY(-1px); }
                .arm-btn-confirm:active { transform: scale(0.97); }
                .arm-btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

                .arm-btn-approve-confirm {
                    background: linear-gradient(135deg, #16a34a, #15803d);
                    box-shadow: 0 8px 20px -4px rgba(22,163,74,0.45);
                }
                .arm-btn-approve-confirm:hover {
                    box-shadow: 0 12px 28px -4px rgba(22,163,74,0.55);
                }
                .arm-btn-reject-confirm {
                    background: linear-gradient(135deg, #e11d48, #be123c);
                    box-shadow: 0 8px 20px -4px rgba(225,29,72,0.45);
                }
                .arm-btn-reject-confirm:hover {
                    box-shadow: 0 12px 28px -4px rgba(225,29,72,0.55);
                }

                .arm-label {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.18em;
                    text-transform: uppercase;
                    color: #94a3b8;
                    margin-bottom: 8px;
                    margin-left: 4px;
                }

                @keyframes arm-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.55; transform: scale(0.75); }
                }
                .arm-pulse { animation: arm-pulse 2.2s ease-in-out infinite; }
            `}</style>

            <AnimatePresence>
                <div className="arm-root fixed inset-0 z-[1000] flex items-center justify-center p-4 arm-overlay">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 28 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 24 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                        className="arm-card w-full max-w-lg overflow-hidden"
                    >
                        {/* ── Header ── */}
                        <div className="arm-header px-3 sm:px-6 py-5 sm:px-7 sm:py-6">
                            <div className="arm-orb-a" />
                            <div className="arm-orb-b" />

                            <div className="relative flex items-start justify-between gap-4">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-200 mb-3"
                                        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 arm-pulse" />
                                        Leave Action
                                    </div>
                                    <h3 className="arm-title text-2xl font-semibold text-white tracking-tight leading-snug">
                                        Process Request
                                    </h3>
                                    <p className="mt-1 text-xs font-light text-indigo-200">
                                        Review carefully before taking action
                                    </p>
                                </div>

                                <button onClick={onClose} className="arm-close-btn">
                                    <IoCloseOutline size={22} />
                                </button>
                            </div>
                        </div>

                        {/* ── Body ── */}
                        <div className="p-3 sm:p-5 sm:p-7 space-y-5">

                            {/* Summary Card */}
                            <div className="arm-summary p-[0.8rem] sm:p-[1.25rem]">
                                <div className="flex items-start gap-4">
                                    <div className=" hidden sm:arm-avatar">{getInitials(requesterName)}</div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <p className="arm-title text-base font-bold text-slate-900 truncate">
                                                {requesterName}
                                            </p>
                                            <span className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-600"
                                                style={{ background: '#eef2ff', border: '1px solid #c7d2fe' }}>
                                                {leaveRequest?.leaveType}
                                            </span>
                                        </div>

                                        <div className="arm-reason-box">
                                            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1.5">
                                                <IoDocumentTextOutline size={12} /> Reason
                                            </p>
                                            <p className="text-sm text-slate-600 font-light italic leading-relaxed">
                                                "{leaveRequest?.reason}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ── Step 1: Choose Action ── */}
                            <AnimatePresence mode="wait">
                                {!status ? (
                                    <motion.div
                                        key="choose"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">
                                            Select an action
                                        </p>

                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Approve */}
                                            <button onClick={() => setStatus('approved')} className="arm-action-card arm-approve">
                                                <div className="arm-action-shine" />
                                                <div className="arm-action-icon" style={{ color: '#16a34a' }}>
                                                    <IoCheckmarkCircleOutline size={34} />
                                                </div>
                                                <span className="arm-title text-sm font-bold text-emerald-700 uppercase ">
                                                    Approve
                                                </span>
                                                <span className="text-xs text-emerald-600 font-light text-center leading-snug">
                                                    Grant this leave request
                                                </span>
                                            </button>

                                            {/* Reject */}
                                            <button onClick={() => setStatus('rejected')} className="arm-action-card arm-reject">
                                                <div className="arm-action-shine" />
                                                <div className="arm-action-icon" style={{ color: '#e11d48' }}>
                                                    <IoCloseCircleOutline size={34} />
                                                </div>
                                                <span className="arm-title text-sm font-bold text-rose-700 uppercase tracking-wide">
                                                    Reject
                                                </span>
                                                <span className="text-xs text-rose-600 font-light text-center leading-snug">
                                                    Decline with a reason
                                                </span>
                                            </button>
                                        </div>
                                    </motion.div>

                                ) : (
                                    /* ── Step 2: Fill Details ── */
                                    <motion.div
                                        key="details"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.22 }}
                                        className="space-y-4"
                                    >
                                        {/* Status pill */}
                                        <div className={`arm-status-pill ${status === 'approved' ? 'arm-status-approved' : 'arm-status-rejected'}`}>
                                            <div className="arm-status-icon" style={{ color: status === 'approved' ? '#16a34a' : '#e11d48' }}>
                                                {status === 'approved'
                                                    ? <IoCheckmarkCircleOutline size={22} />
                                                    : <IoCloseCircleOutline size={22} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold capitalize">{status} Selected</p>
                                                <p className="text-xs font-light opacity-70">You are {status === 'approved' ? 'granting' : 'declining'} this request</p>
                                            </div>
                                            <button onClick={() => setStatus(null)} className="arm-change-btn">
                                                Change
                                            </button>
                                        </div>

                                        {/* Textarea */}
                                        <div>
                                            <p className="arm-label">
                                                {status === 'approved'
                                                    ? <><IoChatbubbleOutline size={13} /> Comment (optional)</>
                                                    : <><IoAlertCircleOutline size={13} /> Rejection Reason (required)</>}
                                            </p>
                                            <textarea
                                                value={status === 'approved' ? comment : rejectionReason}
                                                onChange={(e) => status === 'approved'
                                                    ? setComment(e.target.value)
                                                    : setRejectionReason(e.target.value)}
                                                placeholder={status === 'approved'
                                                    ? 'Add an optional comment for the student...'
                                                    : 'Why is this request being rejected?'}
                                                rows={4}
                                                className={`arm-textarea ${status === 'rejected' ? 'reject' : ''}`}
                                            />
                                        </div>

                                        {/* Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setStatus(null)}
                                                disabled={loading}
                                                className="arm-btn-back"
                                            >
                                                ← Back
                                            </button>
                                            <button
                                                onClick={handleAction}
                                                disabled={loading}
                                                className={`arm-btn-confirm ${status === 'approved'
                                                    ? 'arm-btn-approve-confirm'
                                                    : 'arm-btn-reject-confirm'}`}
                                            >
                                                {loading
                                                    ? 'Processing...'
                                                    : `Confirm ${status === 'approved' ? 'Approval' : 'Rejection'}`}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        </>
    );
};

export default ApproveRejectModal;
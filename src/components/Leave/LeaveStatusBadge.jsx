import React from 'react';

const LeaveStatusBadge = ({ status }) => {
    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-amber-50 text-amber-700 ring-amber-100';
            case 'approved':
                return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
            case 'rejected':
                return 'bg-rose-50 text-rose-700 ring-rose-100';
            case 'cancelled':
                return 'bg-slate-50 text-slate-500 ring-slate-100';
            default:
                return 'bg-slate-50 text-slate-500 ring-slate-100';
        }
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ring-1 ${getStatusStyles(status)}`}>
            {status}
        </span>
    );
};

export default LeaveStatusBadge;

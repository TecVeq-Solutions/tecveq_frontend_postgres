import React, { useEffect, useState } from 'react';
import {
    IoCardOutline,
    IoCalendarOutline,
    IoShieldCheckmarkOutline,
    IoLayersOutline,
    IoAlertCircleOutline,
    IoCheckmarkCircleOutline,
    IoTimeOutline,
    IoHourglassOutline,
    IoSparklesOutline,
    IoTrendingUpOutline,
} from 'react-icons/io5';

const SubscriptionStatus = ({ data, stats }) => {
    if (!data) return null;

    const { subscription, isExpired } = data;
    const expiresAt = new Date(subscription?.expiresAt);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiresAt - today) / (1000 * 60 * 60 * 24));

    const isWarning = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
    const isOverdue = daysUntilExpiry <= 0 || isExpired;

    const studentsCount = stats?.allStudents?.length || 0;
    const teachersCount = stats?.allTeachers?.length || 0;
    const classroomsCount = typeof stats?.allClassrooms === 'number' ? stats.allClassrooms : (stats?.allClassrooms?.length || 0);

    const studentLimit = subscription?.studentLimit || 0;
    const teacherLimit = subscription?.teacherLimit || 0;
    const classLimit = subscription?.classLimit || 0;

    const totalUsed = studentsCount + teachersCount + classroomsCount;
    const totalLimit = studentLimit + teacherLimit + classLimit;
    const totalPercentage = totalLimit > 0 ? Math.min((totalUsed / totalLimit) * 100, 100) : 0;

    const CountUp = ({ value, duration = 900, formatter }) => {
        const [count, setCount] = useState(0);

        useEffect(() => {
            let start;
            let animationFrame;

            const animate = (timestamp) => {
                if (!start) start = timestamp;
                const progress = Math.min((timestamp - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);

                setCount(Math.round(eased * value));

                if (progress < 1) {
                    animationFrame = requestAnimationFrame(animate);
                }
            };

            animationFrame = requestAnimationFrame(animate);

            return () => cancelAnimationFrame(animationFrame);
        }, [value, duration]);

        return formatter ? formatter(count) : count;
    };

    const StatusBadge = () => {
        if (isOverdue) {
            return (
                <span
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: '#b91c1c', background: '#fef2f2', border: '0.5px solid #fecaca' }}
                >
                    <IoAlertCircleOutline size={12} />
                    Expired
                </span>
            );
        }

        if (isWarning) {
            return (
                <span
                    className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ color: '#b45309', background: '#fffbeb', border: '0.5px solid #fde68a' }}
                >
                    <IoTimeOutline size={12} />
                    Expiring
                </span>
            );
        }

        return (
            <span
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ color: '#15803d', background: '#f0fdf4', border: '0.5px solid #bbf7d0' }}
            >
                <IoCheckmarkCircleOutline size={12} />
                Active
            </span>
        );
    };

    const MetricCard = ({ title, value, subtitle, icon: Icon, accent, badge, color }) => {
        return (
            <div
                className="relative bg-white rounded-2xl overflow-hidden cursor-default transition-all duration-200 hover:-translate-y-0.5"
                style={{
                    border: '0.5px solid #e5e7eb',
                }}
            >
                {/* Top color stripe */}
                <div className="h-[2px] w-full" style={{ background: color }} />

                {/* Card body */}
                <div className="px-4 pt-4 pb-2.5">
                    {/* Icon + Label + Badge */}
                    <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                                style={{ background: accent.bg, border: `0.5px solid ${accent.border}` }}
                            >
                                <Icon size={16} color={color} />
                            </div>
                            <span
                                className="text-[11px] font-bold tracking-widest uppercase"
                                style={{ color: '#6b7280', letterSpacing: '0.06em' }}
                            >
                                {title}
                            </span>
                        </div>
                        {badge}
                    </div>

                    {/* Value */}
                    <div
                        className="text-xl font-semibold leading-none mb-2.5 tracking-tight text-gray-900"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                        {value}
                    </div>

                    {/* Subtitle */}
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                        {subtitle}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative space-y-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {/* Header Stripe */}
            <div className="flex items-center gap-2.5 mb-1">
                <div className="flex gap-[3px] items-center">
                    <div className="w-1 h-[18px] rounded-full bg-indigo-500" />
                    <div className="w-1 h-3 rounded-full bg-indigo-300" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Subscription Status</h2>
            </div>

            {isOverdue && (
                <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold"
                    style={{ color: '#b91c1c', background: '#fef2f2', border: '0.5px solid #fecaca' }}
                >
                    <IoAlertCircleOutline size={18} className="flex-shrink-0" />
                    Your payment is overdue. Please clear your dues to avoid account blocking.
                </div>
            )}

            {isWarning && !isOverdue && (
                <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold"
                    style={{ color: '#b45309', background: '#fffbeb', border: '0.5px solid #fde68a' }}
                >
                    <IoTimeOutline size={18} className="flex-shrink-0" />
                    Your subscription expires in {daysUntilExpiry} days. Please renew soon.
                </div>
            )}

            {/* Top 4 Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    title="Account Status"
                    icon={IoShieldCheckmarkOutline}
                    color="#6366f1"
                    value={subscription?.packageName || 'Professional Plan'}
                    badge={<StatusBadge />}
                    accent={{ bg: '#f0fdf4', border: '#bbf7d0' }}
                    subtitle={
                        <>
                            <IoSparklesOutline size={13} className="text-indigo-400" />
                            Premium plan enabled
                        </>
                    }
                />

                <MetricCard
                    title="Monthly Fee"
                    icon={IoCardOutline}
                    color="#10b981"
                    value={
                        <>
                            Rs.{' '}
                            <CountUp
                                value={subscription?.monthlyFee || 0}
                                formatter={(v) => v.toLocaleString()}
                            />
                        </>
                    }
                    badge={null}
                    accent={{ bg: '#ecfdf5', border: '#a7f3d0' }}
                    subtitle={
                        <>
                            <IoCheckmarkCircleOutline size={13} className="text-emerald-500" />
                            Auto-billing • Per month
                        </>
                    }
                />

                <MetricCard
                    title="Expiry Date"
                    icon={IoCalendarOutline}
                    color="#f59e0b"
                    value={expiresAt.toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                    })}
                    badge={null}
                    accent={{ bg: '#fff7ed', border: '#fed7aa' }}
                    subtitle={
                        <span
                            className={`flex items-center gap-1.5 ${isOverdue
                                    ? 'text-rose-500'
                                    : isWarning
                                        ? 'text-amber-500'
                                        : 'text-gray-400'
                                }`}
                        >
                            <IoHourglassOutline size={13} />
                            {isOverdue ? 'Expired' : `${daysUntilExpiry} days remaining`}
                        </span>
                    }
                />

                <MetricCard
                    title="Live Usage"
                    icon={IoTrendingUpOutline}
                    color="#8b5cf6"
                    value={
                        <>
                            <CountUp value={Math.round(totalPercentage)} />%
                        </>
                    }
                    badge={
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-50 border border-violet-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-violet-600">Live</span>
                        </div>
                    }
                    accent={{ bg: '#f5f3ff', border: '#ddd6fe' }}
                    subtitle={
                        <>
                            <IoLayersOutline size={13} className="text-violet-400" />
                            {totalUsed} / {totalLimit || '∞'} resources active
                        </>
                    }
                />
            </div>
        </div>
    );
};

export default SubscriptionStatus;
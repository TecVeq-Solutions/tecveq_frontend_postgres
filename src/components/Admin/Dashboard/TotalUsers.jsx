import React, { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'
import { useAdmin } from '../../../context/AdminContext'

Chart.register(...registerables)

const getLast7MonthsNames = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const result = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        result.push(months[d.getMonth()])
    }
    return result
}

const MONTHS = getLast7MonthsNames()

// ─── Icons ─────────────────────────────────────────────────────
const StudentIcon = ({ color }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)
const TeacherIcon = ({ color }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
)
const ParentIcon = ({ color }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
)
const TotalIcon = ({ color }) => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
)
const UpArrow = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <polyline points="18 15 12 9 6 15" />
    </svg>
)
const DownArrow = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
)

// ─── Card Config ───────────────────────────────────────────────
const CARD_CONFIG = [
    {
        key: 'students',
        label: 'Total Students',
        color: '#3b82f6',
        iconBg: '#dbeafe',
        iconBorder: '#93c5fd',
        Icon: StudentIcon,
        chartType: 'line',
    },
    {
        key: 'teachers',
        label: 'Total Teachers',
        color: '#a855f7',
        iconBg: '#f3e8ff',
        iconBorder: '#d8b4fe',
        Icon: TeacherIcon,
        chartType: 'bar',
    },
    {
        key: 'parents',
        label: 'Total Parents',
        color: '#f59e0b',
        iconBg: '#fef3c7',
        iconBorder: '#fcd34d',
        Icon: ParentIcon,
        chartType: 'bar',
    },
    {
        key: 'total',
        label: 'Total Users',
        color: '#10b981',
        iconBg: '#d1fae5',
        iconBorder: '#6ee7b7',
        Icon: TotalIcon,
        chartType: 'area',
    },
]

// ─── Tooltip Style ─────────────────────────────────────────────
const tooltipStyle = {
    backgroundColor: '#111827',
    titleColor: '#f9fafb',
    bodyColor: '#9ca3af',
    padding: 10,
    cornerRadius: 10,
    displayColors: false,
}

// ─── Chart Hook ────────────────────────────────────────────────
const useChart = (type, data, color) => {
    const canvasRef = useRef(null)
    const chartRef = useRef(null)

    useEffect(() => {
        if (!canvasRef.current || !data?.length) return
        const ctx = canvasRef.current.getContext('2d')

        if (type === 'bar') {
            const max = Math.max(...data)
            chartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: MONTHS,
                    datasets: [{
                        data,
                        backgroundColor: data.map(v => (max === 0 || v !== max) ? color + '44' : color),
                        borderRadius: 4,
                        borderSkipped: false,
                        barPercentage: 0.55,
                        categoryPercentage: 0.65,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: tooltipStyle },
                    scales: {
                        x: { display: false, grid: { display: false } },
                        y: { display: false, grid: { display: false }, beginAtZero: true },
                    },
                    animation: { duration: 900, easing: 'easeInOutQuart' },
                },
            })
        } else {
            const grad = ctx.createLinearGradient(0, 0, 0, 88)
            grad.addColorStop(0, color + (type === 'area' ? '40' : '28'))
            grad.addColorStop(1, color + '00')

            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: MONTHS,
                    datasets: [{
                        data,
                        borderColor: color,
                        backgroundColor: grad,
                        fill: true,
                        borderWidth: 2,
                        tension: 0.42,
                        pointRadius: 0,
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: color,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: tooltipStyle },
                    scales: {
                        x: { display: false, grid: { display: false } },
                        y: { display: false, grid: { display: false }, beginAtZero: true },
                    },
                    animation: { duration: 900, easing: 'easeInOutQuart' },
                },
            })
        }

        return () => { chartRef.current?.destroy() }
    }, [data, color, type])

    return canvasRef
}

// ─── Single Card ───────────────────────────────────────────────
const StatCard = ({ config, value, trendData, trendStr, isUp }) => {
    const { label, color, iconBg, iconBorder, Icon, chartType } = config
    const canvasRef = useChart(chartType, trendData, color)

    return (
        <div
            className="relative bg-white rounded-2xl overflow-hidden cursor-default transition-all duration-200 hover:-translate-y-0.5"
            style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                border: '0.5px solid #e5e7eb',
            }}
        >
            {/* Top color stripe */}
            <div className="h-[2px] w-full" style={{ background: color }} />

            {/* Card body */}
            <div className="px-4 pt-4 pb-2.5">
                {/* Icon + Label */}
                <div className="flex items-center gap-2 mb-3.5">
                    <div
                        className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0"
                        style={{ background: iconBg, border: `0.5px solid ${iconBorder}` }}
                    >
                        <Icon color={color} />
                    </div>
                    <span
                        className="text-[11px] font-bold tracking-widest uppercase"
                        style={{ color: '#6b7280', letterSpacing: '0.06em' }}
                    >
                        {label}
                    </span>
                </div>

                {/* Value */}
                <div
                    className="text-[28px] font-extrabold leading-none mb-2.5 tracking-tight text-gray-900"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                    {value.toLocaleString()}
                </div>

                {/* Trend */}
                <div className="flex items-center gap-2">
                    <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                            color: isUp ? '#15803d' : '#b91c1c',
                            background: isUp ? '#f0fdf4' : '#fef2f2',
                            border: `0.5px solid ${isUp ? '#bbf7d0' : '#fecaca'}`,
                        }}
                    >
                        {isUp ? <UpArrow /> : <DownArrow />}
                        {trendStr}
                    </span>
                    <span className="text-[11px] text-gray-400 font-medium">vs last month</span>
                </div>
            </div>

            {/* Divider */}
            <div className="mx-4 h-px bg-gray-100" />

            {/* Chart */}
            <div style={{ height: 88 }}>
                <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label={`${label} trend chart`}
                    style={{ display: 'block', width: '100%', height: '100%' }}
                />
            </div>
        </div>
    )
}

// ─── Main Component ────────────────────────────────────────────
const TotalUsers = () => {
    const { adminUsersData } = useAdmin()

    const getTrendInfo = (usersArray) => {
        const trend = [0, 0, 0, 0, 0, 0, 0]
        const now = new Date()

        usersArray.forEach(user => {
            const dateStr = user.createdAt || user.created_at
            const date = dateStr ? new Date(dateStr) : new Date()
            const monthDiff =
                (now.getFullYear() - date.getFullYear()) * 12 + now.getMonth() - date.getMonth()
            if (monthDiff >= 0 && monthDiff < 7) trend[6 - monthDiff]++
        })

        const currentMonth = trend[6]
        const lastMonth = trend[5]
        let percentChange = 0
        let isUp = true

        if (lastMonth === 0) {
            percentChange = currentMonth > 0 ? 100 : 0
            isUp = currentMonth >= 0
        } else {
            percentChange = ((currentMonth - lastMonth) / lastMonth) * 100
            isUp = percentChange >= 0
        }

        return {
            trend,
            percentStr: Math.abs(percentChange).toFixed(1) + '%',
            isUp,
        }
    }

    const students = adminUsersData.allStudents?.length || 0
    const teachers = adminUsersData.allTeachers?.length || 0
    const parents = adminUsersData.allParents?.length || 0
    const total = adminUsersData.allUsers?.length || 0

    const studentInfo = getTrendInfo(adminUsersData.allStudents || [])
    const teacherInfo = getTrendInfo(adminUsersData.allTeachers || [])
    const parentInfo = getTrendInfo(adminUsersData.allParents || [])
    const totalInfo = getTrendInfo(adminUsersData.allUsers || [])

    const trendData = {
        students: studentInfo.trend,
        teachers: teacherInfo.trend,
        parents: parentInfo.trend,
        total: totalInfo.trend,
    }

    const trendStats = {
        students: { str: studentInfo.percentStr, up: studentInfo.isUp },
        teachers: { str: teacherInfo.percentStr, up: teacherInfo.isUp },
        parents: { str: parentInfo.percentStr, up: parentInfo.isUp },
        total: { str: totalInfo.percentStr, up: totalInfo.isUp },
    }

    const values = [students, teachers, parents, total]
    const trendKeys = ['students', 'teachers', 'parents', 'total']

    return (
        <div className="flex flex-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="flex flex-col gap-5 flex-1">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="flex gap-[3px] items-center">
                            <div className="w-1 h-[18px] rounded-full bg-violet-500" />
                            <div className="w-1 h-3 rounded-full bg-violet-300" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Total Users</h2>
                    </div>
                    <div
                        className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ color: '#059669', background: '#ecfdf5', border: '0.5px solid #a7f3d0' }}
                    >
                        <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"
                            style={{ animation: 'pulse 1.8s infinite' }}
                        />
                        Live Data
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {CARD_CONFIG.map((config, i) => {
                        const tKey = trendKeys[i]
                        return (
                            <StatCard
                                key={config.key}
                                config={config}
                                value={values[i]}
                                trendData={trendData[tKey]}
                                trendStr={trendStats[tKey].str}
                                isUp={trendStats[tKey].up}
                            />
                        )
                    })}
                </div>

            </div>
        </div>
    )
}

export default TotalUsers
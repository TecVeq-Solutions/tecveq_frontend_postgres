import React, { useEffect, useRef } from "react";

const CARD_CONFIG = {
    Assignment: {
        accent: "#D85A30",
        bg: "#FAECE7",
        text: "#993C1D",
        gradient: "from-[#FAECE7] to-white",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
        ),
    },
    Quiz: {
        accent: "#185FA5",
        bg: "#E6F1FB",
        text: "#0C447C",
        gradient: "from-[#E6F1FB] to-white",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
    },
    Attendence: {
        accent: "#0F6E56",
        bg: "#E1F5EE",
        text: "#085041",
        gradient: "from-[#E1F5EE] to-white",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round" className="w-[15px] h-[15px]">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <path d="M9 16l2 2 4-4" />
            </svg>
        ),
    },
};

const CIRCUMFERENCE = 2 * Math.PI * 46;

const Card = ({ data, type, grade, percentage }) => {
    const config = CARD_CONFIG[data] || CARD_CONFIG["Quiz"];
    const pct = parseFloat(percentage) || 0;
    const ringRef = useRef(null);
    const countRef = useRef(null);

    useEffect(() => {
        const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;
        const ring = ringRef.current;
        const label = countRef.current;
        if (!ring || !label) return;

        // Small delay so animation triggers after mount
        const timeout = setTimeout(() => {
            ring.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)";
            ring.style.strokeDashoffset = offset;

            let cur = 0;
            const step = () => {
                cur = Math.min(cur + 1.5, pct);
                if (label) label.textContent = Math.round(cur) + "%";
                if (cur < pct) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }, 100);

        return () => clearTimeout(timeout);
    }, [pct]);

    return (
        <div
            className="flex-1 min-w-[300px] sm:min-w-[150px] relative overflow-hidden rounded-[20px] border border-[#00000015] 
                 bg-white flex flex-col items-center gap-3 pt-6 pb-5 px-4 
                 hover:-translate-y-1 transition-transform duration-300 cursor-pointer"
            style={{ boxShadow: "0 2px 16px 0 rgba(0,0,0,0.06)" }}
        >
            {/* Top color bar */}
            <div
                className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px]"
                style={{ background: config.accent }}
            />

            {/* Icon badge */}
            <div
                className="w-7 h-7 rounded-lg flex items-center justify-center -mb-1"
                style={{ background: config.bg, color: config.accent }}
            >
                {config.icon}
            </div>

            {/* Ring */}
            <div className="relative w-[110px] h-[110px]">
                <svg
                    viewBox="0 0 110 110"
                    className="w-[110px] h-[110px]"
                    style={{ transform: "rotate(-90deg)" }}
                >
                    {/* Background track */}
                    <circle
                        cx="55" cy="55" r="46"
                        fill="none"
                        stroke="#F0EEF8"
                        strokeWidth={8}
                    />
                    {/* Progress arc */}
                    <circle
                        ref={ringRef}
                        cx="55" cy="55" r="46"
                        fill="none"
                        stroke={config.accent}
                        strokeWidth={8}
                        strokeLinecap="round"
                        strokeDasharray={CIRCUMFERENCE}
                        strokeDashoffset={CIRCUMFERENCE}
                    />
                </svg>

                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-[2px]">
                    <span
                        ref={countRef}
                        className="text-[20px] font-bold leading-none"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                        0%
                    </span>
                    <span className="text-[10px] font-medium text-gray-400">
                        {type === "Marks" ? "Marks" : "Average"}
                    </span>
                    {grade && (
                        <span
                            className="text-[11px] font-semibold px-[6px] py-[1px] rounded-md mt-[2px]"
                            style={{ background: config.bg, color: config.text }}
                        >
                            {grade}
                        </span>
                    )}
                </div>
            </div>

            {/* Title */}
            <p
                className="text-[13px] font-semibold text-center text-gray-800"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
                {data}
            </p>
        </div>
    );
};

export default Card;

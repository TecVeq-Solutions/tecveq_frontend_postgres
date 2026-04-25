import React from 'react'
import IMAGES from '../../../assets/images'

const GRADIENT_POOL = [
    "from-indigo-500 to-purple-600",
    "from-pink-500 to-rose-500",
    "from-teal-500 to-cyan-500",
    "from-amber-500 to-orange-500",
];

const Card = ({ active, onpress, data, delay = 0 }) => {
    // Pick a consistent gradient based on name initial
    const gradientIndex = (data.name?.charCodeAt(0) || 0) % GRADIENT_POOL.length;
    const gradient = GRADIENT_POOL[gradientIndex];

    return (
        <div
            onClick={onpress}
            style={{ animationDelay: `${delay * 80}ms` }}
            className={`
                group relative flex flex-col items-center gap-4
                px-10 py-10 rounded-2xl cursor-pointer
                border transition-all duration-300 ease-out
                animate-fadeUp
                ${active
                    ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_0_2px_#6366F1,0_0_30px_rgba(99,102,241,0.25)]'
                    : 'bg-white/[0.06] border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.35)]'
                }
            `}
        >
            {/* Subtle inner glow on active */}
            {active && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/5 pointer-events-none" />
            )}

            {/* Avatar */}
            <div className="relative">
                {data.profilePic ? (
                    <img
                        src={data.profilePic}
                        alt={data.name}
                        className={`w-20 h-20 rounded-full object-cover border-3 transition-all duration-300
                            ${active
                                ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                                : 'border-white/10 group-hover:border-indigo-500/40'
                            }`}
                    />
                ) : (
                    <div className={`
                        w-20 h-20 rounded-full flex items-center justify-center
                        text-white text-2xl font-extrabold
                        bg-gradient-to-br ${gradient}
                        transition-all duration-300
                        ${active
                            ? 'shadow-[0_0_20px_rgba(99,102,241,0.5)] ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent'
                            : 'group-hover:shadow-lg'
                        }
                    `}>
                        {data.name?.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Online dot */}
                <span className={`
                    absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-[#060D2E]
                    transition-all duration-300
                    ${active ? 'bg-emerald-400 scale-100' : 'bg-white/20 scale-75'}
                `} />
            </div>

            {/* Name */}
            <div className="text-center">
                <p className={`font-bold text-base transition-colors duration-200
                    ${active ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                    {data.name}
                </p>
            </div>

            {/* Selected pill */}
            <div className={`
                text-xs font-semibold px-4 py-1.5 rounded-full transition-all duration-300
                ${active
                    ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40'
                    : 'bg-white/5 text-white/30 border border-white/10 group-hover:bg-indigo-500/15 group-hover:text-white/50'
                }
            `}>
                {active ? '✓ Selected' : 'Select Profile'}
            </div>
        </div>
    );
};

export default Card;
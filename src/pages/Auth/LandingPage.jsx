import React from 'react';
import IMAGES from '../../assets/images';
import { Link } from 'react-router-dom';

/*
  ─── tailwind.config.js → theme.extend ───────────────────────────
  keyframes: {
    'lp-float': {
      '0%':      { transform:'translateY(0) scale(1)', opacity:'0' },
      '10%,90%': { opacity:'1' },
      '100%':    { transform:'translateY(-120px) scale(0.3)', opacity:'0' },
    },
    'lp-orb': {
      '0%':   { transform:'translate(0,0) scale(1)' },
      '100%': { transform:'translate(28px,-28px) scale(1.13)' },
    },
    'lp-pulse': {
      '0%,100%': { transform:'scale(1)',    opacity:'1' },
      '50%':     { transform:'scale(.75)',  opacity:'.5' },
    },
    'lp-down': {
      from: { opacity:'0', transform:'translateY(-20px)' },
      to:   { opacity:'1', transform:'translateY(0)' },
    },
    'lp-up': {
      from: { opacity:'0', transform:'translateY(22px)' },
      to:   { opacity:'1', transform:'translateY(0)' },
    },
    'lp-in': { from:{ opacity:'0' }, to:{ opacity:'1' } },
  },
  animation: {
    'lp-float': 'lp-float linear infinite',
    'lp-orb':   'lp-orb 9s ease-in-out infinite alternate',
    'lp-pulse': 'lp-pulse 2s ease-in-out infinite',
    'lp-down':  'lp-down 0.75s cubic-bezier(0.34,1.56,0.64,1) both',
    'lp-up':    'lp-up   0.9s  cubic-bezier(0.34,1.56,0.64,1) both',
    'lp-in':    'lp-in   1s    ease both',
  },
  ─────────────────────────────────────────────────────────────────
*/

const roles = [
  {
    num: '01', label: 'Admin', hint: 'Full system access', icon: '🛡️',
    to: '/admin/login',
    topBar: 'from-indigo-500 to-violet-500',
    iconBg: 'bg-indigo-50 border border-indigo-200',
  },
  {
    num: '02', label: 'Teacher', hint: 'Manage classes', icon: '📚',
    to: '/admin/login',
    topBar: 'from-emerald-500 to-cyan-500',
    iconBg: 'bg-emerald-50 border border-emerald-200',
  },
  {
    num: '03', label: 'Student', hint: 'View your progress', icon: '🎓',
    to: '/login',
    topBar: 'from-amber-500 to-orange-500',
    iconBg: 'bg-amber-50 border border-amber-200',
  },
  {
    num: '04', label: 'Parent', hint: 'Track your child', icon: '👨‍👩‍👧',
    to: '/login',
    topBar: 'from-rose-500 to-pink-500',
    iconBg: 'bg-rose-50 border border-rose-200',
  },
];

const PARTICLES = [
  { color: 'bg-blue-300/60', top: '15%', left: '13%', dur: '6s', delay: '0s' },
  { color: 'bg-violet-300/50', top: '26%', left: '80%', dur: '8s', delay: '-2s' },
  { color: 'bg-blue-300/40', top: '62%', left: '7%', dur: '7s', delay: '-4s' },
  { color: 'bg-white/50', top: '72%', left: '87%', dur: '9s', delay: '-1s' },
  { color: 'bg-violet-300/60', top: '38%', left: '93%', dur: '5s', delay: '-3s' },
  { color: 'bg-blue-300/40', top: '82%', left: '36%', dur: '7s', delay: '-5s' },
];

const LandingPage = () => {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Outfit:wght@300;400;500;600&display=swap');

        .lp-cinzel { font-family: 'Cinzel', serif; }
        .lp-outfit { font-family: 'Outfit', sans-serif; }

        @keyframes lp-float {
          0%       { transform: translateY(0) scale(1);     opacity: 0; }
          10%, 90% { opacity: 1; }
          100%     { transform: translateY(-120px) scale(0.3); opacity: 0; }
        }
        @keyframes lp-orb {
          0%   { transform: translate(0,0) scale(1); }
          100% { transform: translate(28px,-28px) scale(1.13); }
        }
        @keyframes lp-pulse {
          0%,100% { transform:scale(1);   opacity:1; }
          50%     { transform:scale(.75); opacity:.5; }
        }
        @keyframes lp-down {
          from { opacity:0; transform:translateY(-20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes lp-up {
          from { opacity:0; transform:translateY(22px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes lp-in { from{opacity:0} to{opacity:1} }

        .anim-float { animation: lp-float linear infinite; }
        .anim-orb   { animation: lp-orb ease-in-out infinite alternate; }
        .anim-pulse { animation: lp-pulse 2s ease-in-out infinite; }
        .anim-down  { animation: lp-down 0.75s cubic-bezier(.34,1.56,.64,1) both; }
        .anim-up    { animation: lp-up   0.9s  cubic-bezier(.34,1.56,.64,1) both; }
        .anim-in    { animation: lp-in   1s    ease both; }

        /* Grid texture */
        .lp-grid {
          background-image:
            linear-gradient(rgba(99,120,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,120,255,0.045) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 0%, transparent 100%);
        }

        /* ── Card styles ── */
        .lp-card {
          background: #ffffff;
          border: 1.5px solid rgba(255,255,255,0.9);
          box-shadow: 0 4px 24px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.8) inset;
          transition:
            transform    0.4s cubic-bezier(0.34,1.56,0.64,1),
            box-shadow   0.35s ease,
            border-color 0.3s ease;
        }
        .lp-card:hover {
          transform: translateY(-9px) scale(1.03);
          box-shadow: 0 28px 64px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.95), 0 1px 0 rgba(255,255,255,0.8) inset;
          border-color: #ffffff;
        }
        .lp-card:active { transform: translateY(-4px) scale(1.01); }

        /* shimmer */
        .lp-card .lp-shimmer { opacity:0; transition:opacity .3s ease; }
        .lp-card:hover .lp-shimmer { opacity:1; }

        /* icon */
        .lp-card .lp-icon { transition: transform .4s cubic-bezier(.34,1.56,.64,1); }
        .lp-card:hover .lp-icon { transform: scale(1.15) rotate(-6deg); }

        /* arrow */
        .lp-card .lp-arr { transition: all .3s ease; }
        .lp-card:hover .lp-arr {
          background: rgba(0,0,0,0.10);
          color: rgba(0,0,0,0.7);
          transform: translate(2px,-2px);
        }
      `}</style>

      {/* ══ Root ══ */}
      <div
        className="lp-outfit relative min-h-screen flex items-center justify-center px-3 sm:px-5 py-10 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 110% 65% at 50% -5%, #1a2590 0%, transparent 60%),' +
            'radial-gradient(ellipse 65% 55% at 5% 100%, #0d1460 0%, transparent 55%),' +
            'radial-gradient(ellipse 55% 50% at 95% 85%, #180b5a 0%, transparent 55%),' +
            '#070c3f',
        }}
      >
        {/* Grid texture */}
        <div className="absolute inset-0 lp-grid pointer-events-none" />

        {/* Ambient orbs */}
        <div className="anim-orb absolute rounded-full pointer-events-none"
          style={{ width: 420, height: 420, background: 'rgba(79,70,229,0.13)', top: -90, left: -70, filter: 'blur(100px)', animationDuration: '9s' }} />
        <div className="anim-orb absolute rounded-full pointer-events-none"
          style={{ width: 320, height: 320, background: 'rgba(56,124,252,0.10)', bottom: -70, right: -50, filter: 'blur(100px)', animationDuration: '12s', animationDelay: '-4s' }} />
        <div className="anim-orb absolute rounded-full pointer-events-none"
          style={{ width: 220, height: 220, background: 'rgba(139,92,246,0.09)', top: '42%', left: '42%', filter: 'blur(100px)', animationDuration: '7s', animationDelay: '-2s' }} />

        {/* Floating particles */}
        {PARTICLES.map((p, i) => (
          <div key={i} className={`anim-float absolute w-[2px] h-[2px] rounded-full pointer-events-none ${p.color}`}
            style={{ top: p.top, left: p.left, animationDuration: p.dur, animationDelay: p.delay }} />
        ))}

        {/* ══ Content ══ */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-[1150px]">

          {/* Live badge */}
          <div className="anim-down flex items-center gap-2 rounded-full px-4 py-[7px] mb-[22px]"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.13)' }}>
            <span className="anim-pulse w-[7px] h-[7px] rounded-full bg-blue-400"
              style={{ boxShadow: '0 0 10px #60a5fa, 0 0 22px rgba(96,165,250,.45)' }} />
            <span className="text-[11px] tracking-[0.13em] uppercase" style={{ color: 'rgba(255,255,255,0.6)' }}>
              School Management System
            </span>
          </div>

          {/* Logo */}
          <div className="anim-down mb-3" style={{ animationDelay: '0.07s' }}>
            <img src={IMAGES.logo} alt="Logo" className="h-12 w-auto object-contain" />
          </div>

          {/* Headline */}
          <h1 className="lp-cinzel anim-down text-center text-white font-bold leading-[1.2] mb-2"
            style={{ fontSize: 'clamp(21px,4vw,34px)', animationDelay: '0.12s' }}>
            Welcome to{' '}
            <span style={{
              background: 'linear-gradient(135deg,#93c5fd,#a78bfa,#f0abfc)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>EduPortal</span>
          </h1>

          {/* Tagline */}
          <p className="anim-in text-[11.5px] font-light tracking-[0.18em] uppercase text-center"
            style={{ color: 'rgba(255,255,255,0.35)', animationDelay: '0.2s' }}>
            Empowering Education · Inspiring Futures
          </p>

          {/* Vertical divider */}
          <div className="anim-in w-px h-0 sm:h-[38px]  mx-auto my-3 sm:my-[22px]"
            style={{ background: 'linear-gradient(180deg,transparent,rgba(148,163,184,.3),transparent)', animationDelay: '0.3s' }} />

          {/* Hint */}
          <p className="anim-in text-[10.5px] sm:text-[14px]  mb-[2rem] tracking-[0.22em] uppercase text-center mb-4"
            style={{ color: 'rgba(255,255,255,0.22)', animationDelay: '0.4s' }}>
            Choose your role to continue
          </p>

          {/* ══ Cards ══ */}
          <div className="anim-up grid grid-cols-2 lg:grid-cols-4 gap-[10px] sm:gap-[14px] w-full" style={{ animationDelay: '0.38s' }}>
            {roles.map((role) => (
              <Link key={role.label} to={role.to}
                className="lp-card group relative flex flex-col items-center gap-[9px] rounded-[22px]  px-2 sm:px-4 pt-[28px] pb-[28px] overflow-hidden no-underline">

                {/* Coloured top accent bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-[22px] bg-gradient-to-r ${role.topBar}`} />

                {/* Hover shimmer */}
                <div className="lp-shimmer absolute inset-0 rounded-[22px] pointer-events-none"
                  style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.45) 0%,transparent 55%)' }} />

                {/* Number */}
                <span className="absolute top-[14px] left-[14px] text-[9px] font-semibold tracking-[0.06em]"
                  style={{ color: 'rgba(0,0,0,0.2)' }}>
                  {role.num}
                </span>

                {/* Arrow */}
                <div className="lp-arr absolute top-[13px] right-[13px] w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
                  style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.3)' }}>
                  ↗
                </div>

                {/* Icon */}
                <div className={`lp-icon mt-1 w-[54px] h-[54px] rounded-2xl flex items-center justify-center text-[24px] ${role.iconBg}`}>
                  {role.icon}
                </div>

                {/* Label */}
                <span className="text-[15.5px] sm:text-[18px] font-semibold tracking-[0.01em]" style={{ color: '#0f1530' }}>
                  {role.label}
                </span>

                {/* Hint */}
                <span className="text-[11px] sm:text-[13px] font-normal" style={{ color: 'rgba(15,21,48,0.42)' }}>
                  {role.hint}
                </span>
              </Link>
            ))}
          </div>

          {/* Footer */}
          <div className="anim-in flex items-center gap-[14px] mt-[26px]" style={{ animationDelay: '0.9s' }}>
            {['Privacy Policy', 'Help Center', '© 2026'].map((txt, i) => (
              <React.Fragment key={txt}>
                {i > 0 && <div className="w-[3px] h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />}
                <span className="text-[10.5px] sm:text-[14px] font-light tracking-[0.07em]" style={{ color: 'rgba(255,255,255,0.22)' }}>
                  {txt}
                </span>
              </React.Fragment>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default LandingPage;
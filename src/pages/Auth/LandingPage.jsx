import React, { useEffect, useRef } from 'react';
import IMAGES from '../../assets/images';
import { Link } from 'react-router-dom';
import { PiShieldCheck, PiChalkboardTeacher, PiStudent, PiUsersThree, PiArrowUpRight } from 'react-icons/pi';

/*
  ─────────────────────────────────────────────────────────────────
  tailwind.config.js mein yeh extend add karein:

  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      keyframes: {
        'lp-float': {
          '0%':      { transform: 'translateY(0) scale(1)', opacity: '0' },
          '10%,90%': { opacity: '1' },
          '100%':    { transform: 'translateY(-130px) scale(0.2)', opacity: '0' },
        },
        'lp-orb1': {
          '0%':   { transform: 'translate(0,0) scale(1)' },
          '100%': { transform: 'translate(30px,-30px) scale(1.1)' },
        },
        'lp-orb2': {
          '0%':   { transform: 'translate(0,0) scale(1)' },
          '100%': { transform: 'translate(-20px,20px) scale(1.15)' },
        },
        'lp-orb3': {
          '0%':   { transform: 'translate(0,0)' },
          '100%': { transform: 'translate(15px,-25px)' },
        },
        'lp-pulse': {
          '0%,100%': { transform: 'scale(1)', opacity: '1' },
          '50%':     { transform: 'scale(0.7)', opacity: '0.5' },
        },
        'lp-grad': {
          '0%':   { backgroundPosition: '0% 50%' },
          '50%':  { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'lp-twinkle': {
          '0%,100%': { opacity: '0.1' },
          '50%':     { opacity: '1' },
        },
        'lp-down': {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'lp-up': {
          from: { opacity: '0', transform: 'translateY(22px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'lp-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'lp-ripple': {
          to: { width: '300px', height: '300px', opacity: '0' },
        },
      },
      animation: {
        'lp-float':   'lp-float linear infinite',
        'lp-orb1':    'lp-orb1 11s ease-in-out infinite alternate',
        'lp-orb2':    'lp-orb2 14s ease-in-out infinite alternate',
        'lp-orb3':    'lp-orb3 8s ease-in-out infinite alternate',
        'lp-pulse':   'lp-pulse 2s ease-in-out infinite',
        'lp-grad':    'lp-grad 5s ease infinite',
        'lp-twinkle': 'lp-twinkle linear infinite',
        'lp-down':    'lp-down 0.7s cubic-bezier(0.34,1.56,0.64,1) both',
        'lp-up':      'lp-up 0.9s cubic-bezier(0.34,1.56,0.64,1) both',
        'lp-in':      'lp-in 1s ease both',
        'lp-ripple':  'lp-ripple 0.6s ease-out forwards',
      },
    },
  },
  ─────────────────────────────────────────────────────────────────
*/

const roles = [
  {
    num: '01', label: 'Admin', hint: 'Full system access',
    icon: PiShieldCheck,
    to: '/admin/login',
    bar: 'from-indigo-500 to-violet-500',
    iconGrad: 'from-indigo-500 to-violet-600',
    iconShadow: 'rgba(99,102,241,0.45)',
    cardAccent: 'before:from-indigo-400/10 before:to-violet-400/5',
    glowColor: 'rgba(99,102,241,0.25),rgba(139,92,246,0.18)',
    badgeBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    delay: '[animation-delay:0.38s]',
  },
  {
    num: '02', label: 'Teacher', hint: 'Manage classes',
    icon: PiChalkboardTeacher,
    to: '/admin/login',
    bar: 'from-emerald-500 to-cyan-500',
    iconGrad: 'from-emerald-500 to-cyan-500',
    iconShadow: 'rgba(16,185,129,0.45)',
    cardAccent: 'before:from-emerald-400/10 before:to-cyan-400/5',
    glowColor: 'rgba(16,185,129,0.22),rgba(6,182,212,0.15)',
    badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    delay: '[animation-delay:0.45s]',
  },
  {
    num: '03', label: 'Student', hint: 'View your progress',
    icon: PiStudent,
    to: '/login',
    bar: 'from-amber-500 to-orange-500',
    iconGrad: 'from-amber-500 to-orange-500',
    iconShadow: 'rgba(245,158,11,0.45)',
    cardAccent: 'before:from-amber-400/10 before:to-orange-400/5',
    glowColor: 'rgba(245,158,11,0.22),rgba(249,115,22,0.15)',
    badgeBg: 'bg-amber-50 text-amber-600 border-amber-100',
    delay: '[animation-delay:0.52s]',
  },
  {
    num: '04', label: 'Parent', hint: 'Track your child',
    icon: PiUsersThree,
    to: '/login',
    bar: 'from-rose-500 to-pink-500',
    iconGrad: 'from-rose-500 to-pink-500',
    iconShadow: 'rgba(244,63,94,0.45)',
    cardAccent: 'before:from-rose-400/10 before:to-pink-400/5',
    glowColor: 'rgba(244,63,94,0.22),rgba(236,72,153,0.15)',
    badgeBg: 'bg-rose-50 text-rose-600 border-rose-100',
    delay: '[animation-delay:0.59s]',
  },
];

const PARTICLES = [
  { tw: 'bg-blue-300/60', top: 'top-[15%]', left: 'left-[13%]', dur: '[animation-duration:6s]', delay: '[animation-delay:0s]' },
  { tw: 'bg-violet-300/50', top: 'top-[26%]', left: 'left-[80%]', dur: '[animation-duration:8s]', delay: '[animation-delay:-2s]' },
  { tw: 'bg-blue-300/40', top: 'top-[62%]', left: 'left-[7%]', dur: '[animation-duration:7s]', delay: '[animation-delay:-4s]' },
  { tw: 'bg-white/50', top: 'top-[72%]', left: 'left-[87%]', dur: '[animation-duration:9s]', delay: '[animation-delay:-1s]' },
  { tw: 'bg-violet-300/60', top: 'top-[38%]', left: 'left-[93%]', dur: '[animation-duration:5s]', delay: '[animation-delay:-3s]' },
  { tw: 'bg-blue-300/40', top: 'top-[82%]', left: 'left-[36%]', dur: '[animation-duration:7s]', delay: '[animation-delay:-5s]' },
  { tw: 'bg-fuchsia-300/50', top: 'top-[50%]', left: 'left-[55%]', dur: '[animation-duration:6.5s]', delay: '[animation-delay:-2.5s]' },
  { tw: 'bg-blue-200/50', top: 'top-[10%]', left: 'left-[60%]', dur: '[animation-duration:8s]', delay: '[animation-delay:-1.5s]' },
];

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  size: Math.random() * 2 + 0.5,
  top: Math.random() * 100,
  left: Math.random() * 100,
  dur: 2 + Math.random() * 5,
  delay: -Math.random() * 5,
}));

const LandingPage = () => {
  const spotlightRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      if (spotlightRef.current) {
        spotlightRef.current.style.left = e.clientX + 'px';
        spotlightRef.current.style.top = e.clientY + 'px';
      }
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const handleCardClick = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position:absolute;left:${x}px;top:${y}px;
      width:0;height:0;border-radius:50%;
      background:rgba(99,102,241,0.15);
      transform:translate(-50%,-50%);
      animation:lp-ripple 0.6s ease-out forwards;
      pointer-events:none;z-index:5;
    `;
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Outfit:wght@300;400;500;600;700&display=swap');

        @keyframes lp-ripple { to { width:300px; height:300px; opacity:0; } }

        .lp-grid {
          background-image:
            linear-gradient(rgba(100,130,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,130,255,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black, transparent);
          -webkit-mask-image: radial-gradient(ellipse 90% 90% at 50% 50%, black, transparent);
        }

        .lp-grad-text {
          background: linear-gradient(135deg, #93c5fd 0%, #a78bfa 40%, #f0abfc 80%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          background-size: 200% auto;
          animation: lp-grad 5s ease infinite;
        }

        /* ── Card child transitions ── */
        .lp-card .lp-shimmer       { opacity: 0; transition: opacity 0.35s ease; }
        .lp-card:hover .lp-shimmer { opacity: 1; }

        .lp-card .lp-glow          { opacity: 0; transition: opacity 0.4s ease; }
        .lp-card:hover .lp-glow    { opacity: 1; }

        .lp-card .lp-icon-wrap     { transition: transform 0.45s cubic-bezier(.34,1.56,.64,1), box-shadow 0.35s ease; }
        .lp-card:hover .lp-icon-wrap {
          transform: scale(1.12) translateY(-4px);
        }

        .lp-card .lp-arr           { transition: all 0.3s ease; }
        .lp-card:hover .lp-arr     { background: rgba(0,0,0,0.10); color: rgba(0,0,0,0.65); transform: translate(2px,-2px); }

        .lp-card .lp-hint          { transition: color 0.3s ease; }
        .lp-card:hover .lp-hint    { color: rgba(15,21,48,0.60); }

        /* animated underline */
        .lp-label-wrap             { position: relative; display: inline-block; }
        .lp-label-wrap::after      {
          content: ''; position: absolute; bottom: -3px; left: 50%;
          transform: translateX(-50%);
          width: 0; height: 2px;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          border-radius: 2px;
          transition: width 0.35s ease;
        }
        .lp-card:hover .lp-label-wrap::after { width: 100%; }

        /* card bottom stripe reveal */
        .lp-card .lp-bottom-stripe {
          position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          opacity: 0; transition: opacity 0.35s ease;
          border-radius: 0 0 22px 22px;
        }
        .lp-card:hover .lp-bottom-stripe { opacity: 1; }
      `}</style>

      {/* ══ Root ══ */}
      <div
        className="font-outfit relative min-h-screen flex items-center justify-center px-3 sm:px-5 py-10 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 120% 70% at 50% -10%,#1e2db0 0%,transparent 60%),' +
            'radial-gradient(ellipse 60% 60% at 0% 100%,#0d1460 0%,transparent 55%),' +
            'radial-gradient(ellipse 50% 50% at 100% 90%,#200d6a 0%,transparent 55%),' +
            '#04061a',
        }}
      >
        {/* Spotlight */}
        <div
          ref={spotlightRef}
          className="fixed pointer-events-none z-[1] w-[600px] h-[600px] rounded-full -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }}
        />

        {/* Grid */}
        <div className="lp-grid absolute inset-0 pointer-events-none" />

        {/* Orbs */}
        <div className="animate-lp-orb1 absolute rounded-full pointer-events-none blur-[110px]"
          style={{ width: 500, height: 500, background: 'rgba(79,70,229,0.18)', top: -120, left: -100 }} />
        <div className="animate-lp-orb2 absolute rounded-full pointer-events-none blur-[110px]"
          style={{ width: 380, height: 380, background: 'rgba(56,124,252,0.14)', bottom: -80, right: -60 }} />
        <div className="animate-lp-orb3 absolute rounded-full pointer-events-none blur-[110px]"
          style={{ width: 280, height: 280, background: 'rgba(139,92,246,0.12)', top: '40%', left: '40%' }} />

        {/* Stars */}
        {STARS.map((s) => (
          <div key={s.id}
            className="animate-lp-twinkle absolute rounded-full pointer-events-none bg-white"
            style={{ width: s.size, height: s.size, top: `${s.top}%`, left: `${s.left}%`, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
          />
        ))}

        {/* Particles */}
        {PARTICLES.map((p, i) => (
          <div key={i}
            className={`animate-lp-float absolute w-[3px] h-[3px] rounded-full pointer-events-none ${p.tw} ${p.top} ${p.left} ${p.dur} ${p.delay}`}
          />
        ))}

        {/* ══ Content ══ */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-[1200px]">

          {/* Badge */}
          <div
            className="animate-lp-down flex items-center gap-2 rounded-full px-4 py-2 mb-7 backdrop-blur-md border border-white/15"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          >
            <span className="animate-lp-pulse w-2 h-2 rounded-full bg-blue-400"
              style={{ boxShadow: '0 0 10px #60a5fa, 0 0 28px rgba(96,165,250,0.6)' }} />
            <span className="text-[10px] tracking-[0.16em] uppercase font-medium text-white/55">
              School Management System
            </span>
          </div>

          {/* ── Logo (original IMAGES.logo) ── */}
          <div className="animate-lp-down [animation-delay:0.08s] mb-5">
            {/* Glowing ring behind logo */}
            <div className="relative flex items-center justify-center">
              {/* outer glow ring */}
              <div
                className="absolute w-[90px] h-[90px] rounded-full animate-lp-pulse"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)' }}
              />
              {/* inner soft ring */}
              <div
                className="absolute w-[76px] h-[76px] rounded-full border border-violet-400/30"
                style={{ boxShadow: '0 0 24px rgba(139,92,246,0.4), inset 0 0 24px rgba(99,102,241,0.15)' }}
              />
              {/* logo itself — no background, just the image */}
              <img
                src={IMAGES.logo}
                alt="EduPortal Logo"
                className="relative z-10 h-14 w-auto object-contain drop-shadow-[0_0_18px_rgba(139,92,246,0.7)]"
              />
            </div>
          </div>

          {/* Headline */}
          <h1
            className="font-cinzel animate-lp-down [animation-delay:0.13s] text-center text-white font-black leading-[1.15] mb-3"
            style={{ fontSize: 'clamp(22px,4.5vw,40px)' }}
          >
            Welcome to <span className="lp-grad-text">EduPortal</span>
          </h1>

          {/* Tagline */}
          <p className="animate-lp-in [animation-delay:0.22s] text-[11px] font-light tracking-[0.2em] uppercase text-center text-white/30 mb-6">
            Empowering Education · Inspiring Futures
          </p>

          {/* Divider */}
          <div
            className="animate-lp-in [animation-delay:0.3s] w-px h-0 sm:h-10 mx-auto mb-5"
            style={{ background: 'linear-gradient(180deg,transparent,rgba(148,163,184,.3),transparent)' }}
          />

          {/* Hint */}
          <p className="animate-lp-in [animation-delay:0.4s] text-[11px] sm:text-[13px] tracking-[0.22em] uppercase text-center text-white/20 mb-9">
            Choose your role to continue
          </p>

          {/* ══ Cards ══ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Link
                  key={role.label}
                  to={role.to}
                  onClick={handleCardClick}
                  className={`
                    lp-card ${role.delay} animate-lp-up
                    relative flex flex-col items-center gap-3
                    rounded-[24px] px-2 sm:px-4 pt-8 pb-7
                    overflow-hidden no-underline
                    bg-white border border-white/80
                    shadow-[0_8px_32px_rgba(0,0,0,0.22),0_1px_0_rgba(255,255,255,0.9)_inset]
                    transition-[transform,box-shadow,border-color] duration-[350ms]
                    ease-[cubic-bezier(.34,1.56,.64,1)]
                    hover:-translate-y-3 hover:scale-[1.04]
                    hover:shadow-[0_28px_64px_rgba(0,0,0,0.38),0_0_0_2px_rgba(255,255,255,0.95),0_1px_0_rgba(255,255,255,0.9)_inset]
                    hover:border-white
                    active:-translate-y-1 active:scale-[1.01]
                  `}
                >
                  {/* Top gradient bar */}
                  <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-[24px] bg-gradient-to-r ${role.bar}`} />

                  {/* Bottom stripe (reveals on hover) */}
                  <div className={`lp-bottom-stripe bg-gradient-to-r ${role.bar}`} />

                  {/* Shimmer */}
                  <div
                    className="lp-shimmer absolute inset-0 rounded-[24px] pointer-events-none"
                    style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.55) 0%,transparent 55%)' }}
                  />

                  {/* Glow ring */}
                  <div
                    className="lp-glow absolute -inset-[2px] rounded-[26px] pointer-events-none -z-10"
                    style={{ background: `linear-gradient(135deg,${role.glowColor})` }}
                  />

                  {/* Number badge */}
                  <span className="absolute top-[13px] left-[14px] text-[9px] font-bold tracking-[0.08em] text-black/15">
                    {role.num}
                  </span>

                  {/* Arrow button */}
                  <div className="lp-arr absolute top-[11px] right-[11px] w-[26px] h-[26px] rounded-full flex items-center justify-center text-[13px] bg-black/[0.05] border border-black/[0.07] text-black/25">
                    <PiArrowUpRight weight="bold" />
                  </div>

                  {/* ── Icon — gradient circle with coloured shadow ── */}
                  <div
                    className={`lp-icon-wrap mt-1 w-[62px] h-[62px] rounded-2xl bg-gradient-to-br ${role.iconGrad} flex items-center justify-center`}
                    style={{ boxShadow: `0 8px 24px ${role.iconShadow}` }}
                  >
                    <Icon weight="duotone" className="text-white text-[30px]" />
                  </div>

                  {/* Label */}
                  <div className="lp-label-wrap mt-1">
                    <span className="text-[15.5px] sm:text-[18px] font-semibold tracking-[0.01em] text-[#0f1530]">
                      {role.label}
                    </span>
                  </div>

                  {/* Hint badge */}
                  <span className={`lp-hint text-[10px] sm:text-[11.5px] font-medium px-3 py-[3px] rounded-full border ${role.badgeBg}`}>
                    {role.hint}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="animate-lp-in [animation-delay:0.9s] flex items-center gap-[14px] mt-8">
            {['Privacy Policy', 'Help Center', '© 2026'].map((txt, i) => (
              <React.Fragment key={txt}>
                {i > 0 && <div className="w-[3px] h-[3px] rounded-full bg-white/15" />}
                <span className="text-[10.5px] sm:text-[13px] font-light tracking-[0.07em] text-white/20">
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
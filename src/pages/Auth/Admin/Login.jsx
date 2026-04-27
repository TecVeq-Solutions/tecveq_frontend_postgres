import React, { useState, useEffect, useRef } from 'react'
import IMAGES from '../../../assets/images';
import { studentLogin } from '../../../api/Student/StudentApis';
import Loader from '../../../utils/Loader';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { toast } from 'react-toastify';
import { useAdmin } from '../../../context/AdminContext';
import { useTeacher } from '../../../context/TeacherContext';
import { BACKEND_URL_SOCKET } from '../../../constants/api';
import { io } from 'socket.io-client';
import { PiGraduationCap, PiChartLineUp, PiShieldCheck, PiArrowRight } from 'react-icons/pi';

const Login = () => {
    const [mounted, setMounted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [activeField, setActiveField] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [ripples, setRipples] = useState([]);
    const leftPanelRef = useRef(null);
    const rightPanelRef = useRef(null);
    const navigate = useNavigate();
    const { setUserData, setSocketContext } = useUser();
    const { setAdminLogedIn } = useAdmin();
    const { setTeacherLogedIn } = useTeacher();

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e) => {
            if (leftPanelRef.current) {
                const rect = leftPanelRef.current.getBoundingClientRect();
                setMousePos({
                    x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
                    y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleRightClick = (e) => {
        if (!rightPanelRef.current) return;
        const rect = rightPanelRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const id = Date.now();
        setRipples(prev => [...prev, { id, x, y }]);
        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const emailValue = e.target[0].value.trim().toLowerCase();
            const passwordValue = e.target[1].value;

            const dataBody = {
                email: emailValue,
                password: passwordValue
            };
            
            const response = await studentLogin(dataBody);
            
            if (response && response !== "error") {
                setUserData(response);
                if (response.userType == "admin") {
                    setAdminLogedIn(true);
                    toast.success("Login successful");
                    localStorage.setItem("tcauser", JSON.stringify(response));
                    navigate("/admin/dashboard");
                } else if (response.userType == "super_admin") {
                    setAdminLogedIn(true);
                    toast.success("Login successful");
                    localStorage.setItem("tcauser", JSON.stringify(response));
                    navigate("/superadmin/dashboard");
                } else if (response.userType == "teacher") {
                    const con = io(`${BACKEND_URL_SOCKET}`);
                    setSocketContext(con);
                    setTeacherLogedIn(true);
                    toast.success("Login successful");
                    localStorage.setItem("tcauser", JSON.stringify(response));
                    navigate("/teacher/dashboard");
                } else {
                    toast.error("Unauthorized access type");
                    navigate("/admin/login");
                }
            } else if (response === "error") {
                // apiRequest usually throws, but if it returns "error", handle it here
                console.error("Login failed: API returned 'error'");
            }
        } catch (error) {
            console.error("error in student login UI screen is : ", error);
            // toast.error is already handled by setupAxios interceptor
        } finally {
            setLoading(false);
        }
    };

    const handleGoToSignUp = () => navigate("/signup");

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Syne:wght@400;500;600;700&display=swap');

                @keyframes auroraDrift { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(30px, -20px) scale(1.05); } 66% { transform: translate(-20px, 15px) scale(0.97); } 100% { transform: translate(0, 0) scale(1); } }
                @keyframes auroraDrift2 { 0% { transform: translate(0, 0) rotate(0deg); } 50% { transform: translate(-25px, -30px) rotate(8deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes scanLine { 0% { top: -2px; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } }
                @keyframes cyanPulse { 0%,100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
                @keyframes cardReveal { from { opacity: 0; transform: translateY(40px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
                @keyframes leftReveal { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes floatBadge { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
                @keyframes shimmerCyan { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
                @keyframes shimmerViolet { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
                @keyframes rotateRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes rotateRingRev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                @keyframes countUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes dotPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(0,212,255,0.6); } 50% { box-shadow: 0 0 0 8px rgba(0,212,255,0); } }
                @keyframes dotPulseBlue { 0%,100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.6); } 50% { box-shadow: 0 0 0 8px rgba(37,99,235,0); } }
                @keyframes meshMove1 { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,-30px) scale(1.08); } 66% { transform: translate(-20px,25px) scale(0.94); } }
                @keyframes meshMove2 { 0%,100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(-35px,-20px) rotate(15deg); } }
                @keyframes meshMove3 { 0%,100% { transform: translate(0,0) scale(1); } 40% { transform: translate(20px,35px) scale(1.12); } 80% { transform: translate(-30px,-10px) scale(0.9); } }
                @keyframes orbFloat { 0%,100% { transform: translateY(0) translateX(0) scale(1); } 25% { transform: translateY(-18px) translateX(10px) scale(1.04); } 75% { transform: translateY(12px) translateX(-8px) scale(0.97); } }
                @keyframes orbFloat2 { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-22px) translateX(-14px); } }
                @keyframes gridGlow { 0%,100% { opacity: 0.4; } 50% { opacity: 0.75; } }
                @keyframes rippleOut { 0% { transform: scale(0); opacity: 0.25; } 100% { transform: scale(6); opacity: 0; } }
                @keyframes lineTrail { 0% { transform: translateY(-100%) scaleX(1); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(200%) scaleX(1); opacity: 0; } }
                @keyframes cornerPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
                @keyframes btnShine { 0% { left: -100%; } 100% { left: 200%; } }
            `}</style>

            <div className="flex w-full h-screen min-h-[600px] font-['Syne',sans-serif] overflow-hidden max-[900px]:flex-col max-[900px]:h-auto max-[900px]:overflow-y-auto">

                <div className="relative flex flex-col justify-center w-1/2 min-w-0 shrink-0 px-16 bg-[#020c14] overflow-hidden max-[900px]:w-full max-[900px]:px-9 max-[900px]:py-10 max-[900px]:min-h-auto max-[640px]:px-8 max-[420px]:px-6 max-[360px]:px-3" ref={leftPanelRef}>
                    <div className="absolute inset-0 pointer-events-none z-[1] transition-[background] duration-100" style={{
                        background: `radial-gradient(700px circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,212,255,0.07) 0%, transparent 55%)`,
                    }} />

                    <div className="absolute rounded-full pointer-events-none w-[560px] h-[560px] -top-[120px] -left-[140px] bg-[radial-gradient(circle_at_40%_40%,rgba(0,80,140,0.85)_0%,rgba(0,40,80,0.55)_45%,transparent_70%)] animate-[auroraDrift_18s_ease-in-out_infinite] blur-[1px]" />
                    <div className="absolute rounded-full pointer-events-none w-[480px] h-[480px] -bottom-[80px] -right-[100px] bg-[radial-gradient(circle_at_60%_60%,rgba(0,100,100,0.65)_0%,rgba(0,60,70,0.35)_50%,transparent_70%)] animate-[auroraDrift2_22s_ease-in-out_infinite] blur-[2px]" />
                    <div className="absolute rounded-full pointer-events-none w-[300px] h-[300px] top-[45%] left-[55%] bg-[radial-gradient(circle,rgba(0,60,90,0.3)_0%,transparent_65%)] animate-[auroraDrift_14s_ease-in-out_infinite_reverse]" />

                    <div className="absolute inset-0 pointer-events-none overflow-hidden after:content-[''] after:absolute after:-inset-[100px] after:bg-[length:56px_56px] after:bg-[linear-gradient(rgba(0,212,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.045)_1px,transparent_1px)]">
                        <div className="absolute left-0 right-0 h-[1px] bg-[linear-gradient(90deg,transparent,rgba(0,212,255,0.28),transparent)] animate-[scanLine_8s_linear_infinite] pointer-events-none" />
                    </div>

                    <div className="absolute -bottom-[120px] -right-[120px] w-[500px] h-[500px] pointer-events-none max-[900px]:hidden">
                        <div className="absolute inset-0 rounded-full border border-[rgba(0,212,255,0.12)] animate-[rotateRing_30s_linear_infinite]">
                            <div className="absolute w-2 h-2 rounded-full bg-[#00d4ff] -top-1 left-1/2 -translate-x-1/2 animate-[dotPulse_2.5s_ease-in-out_infinite]" />
                        </div>
                        <div className="absolute inset-[50px] rounded-full border border-[rgba(0,212,255,0.07)] animate-[rotateRingRev_22s_linear_infinite]" />
                        <div className="absolute inset-[100px] rounded-full border border-dashed border-[rgba(0,212,255,0.05)] animate-[rotateRing_18s_linear_infinite]" />
                    </div>

                    {[
                        { top: '12%', left: '9%', s: 5, d: '0s', du: '8s' },
                        { top: '72%', left: '6%', s: 3, d: '1.8s', du: '10s' },
                        { top: '38%', left: '82%', s: 4, d: '0.6s', du: '7s' },
                        { top: '85%', left: '75%', s: 6, d: '2.4s', du: '9s' },
                        { top: '22%', left: '72%', s: 3, d: '1.2s', du: '6s' },
                    ].map((p, i) => (
                        <div key={i} className="absolute rounded-full pointer-events-none z-[1]" style={{
                            top: p.top, left: p.left, width: p.s, height: p.s,
                            background: '#00d4ff',
                            boxShadow: `0 0 ${p.s * 3}px rgba(0,212,255,0.65)`,
                            animation: `cyanPulse ${p.du} ease-in-out infinite`,
                            animationDelay: p.d,
                        }} />
                    ))}

                    <div className="relative z-[2] max-w-[480px] animate-[leftReveal_0.8s_ease_forwards]">
                        <div className="mb-11 max-[420px]:mb-7 max-[360px]:mb-5">
                            <img src={IMAGES.logo} alt="Logo" className="max-h-[52px] max-w-[180px] object-contain brightness-[1.15] max-[420px]:max-h-10" />
                            <div className="flex items-center gap-3 mt-3.5">
                                <div className="w-9 h-[2px] bg-[linear-gradient(90deg,#00d4ff,#00ffcc)] rounded-[2px]" />
                                <span className="text-[10px] tracking-[0.3em] uppercase text-[rgba(0,212,255,0.7)] font-semibold">Learning Platform</span>
                            </div>
                        </div>

                        <div className="mb-9 max-[420px]:mb-6 max-[360px]:mb-[18px]">
                            <h1 className="font-['Cormorant_Garamond',serif] text-[54px] font-bold leading-[1.08] text-[#e0f7ff] tracking-[-0.5px] mb-4 max-[900px]:text-[42px] max-[640px]:text-[36px] max-[420px]:text-[30px] max-[360px]:text-[26px]">
                                Unlock Your<br />
                                <em className="not-italic bg-[linear-gradient(135deg,#00d4ff_0%,#00ffcc_40%,#0099cc_80%)] bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmerCyan_4s_linear_infinite]">Learning</em><br />
                                Journey
                            </h1>
                            <p className="text-sm sm:text-md text-[rgba(220,248,255,0.38)] leading-[1.75] max-w-[340px] font-normal max-[640px]:text-[13px] max-[640px]:max-w-full">
                                A world-class platform crafted for students,<br />teachers, and administrators.
                            </p>
                        </div>

                        <div className="mb-10 flex flex-col gap-2.5 max-[640px]:hidden">
                            {[
                                { icon: <PiGraduationCap size={22} />, title: 'Smart Learning', desc: 'AI-powered personalized study plans', delay: '0.2s' },
                                { icon: <PiChartLineUp size={22} />, title: 'Live Analytics', desc: 'Track progress with real-time dashboards', delay: '0.3s' },
                                { icon: <PiShieldCheck size={22} />, title: 'Secure & Private', desc: 'Enterprise-grade data protection', delay: '0.4s' },
                            ].map(f => (
                                <div key={f.title} className="flex items-center gap-3.5 p-[14px_18px] bg-[rgba(0,212,255,0.04)] border border-[rgba(0,212,255,0.12)] rounded-xl cursor-default transition-all duration-[0.35s] cubic-bezier(0.4,0,0.2,1) hover:bg-[rgba(0,212,255,0.09)] hover:border-[rgba(0,212,255,0.32)] hover:translate-x-[6px] animate-[leftReveal_0.8s_ease_forwards]" style={{ animationDelay: f.delay, opacity: 0 }}>
                                    <div className="w-[38px] h-[38px] shrink-0 rounded-lg bg-[rgba(0,212,255,0.12)] border border-[rgba(0,212,255,0.22)] flex items-center justify-center text-[17px] text-[#00d4ff]">{f.icon}</div>
                                    <div>
                                        <div className="text-[13px] sm:text-[16px] font-semibold text-[rgba(220,248,255,0.92)] mb-[2px]">{f.title}</div>
                                        <div className="text-[11.5px] sm:text-[14px] text-[rgba(220,248,255,0.32)] leading-[1.5]">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 gap-3 animate-[countUp_0.9s_0.5s_ease_forwards] opacity-0 max-[420px]:gap-1.5 max-[360px]:gap-[5px]">
                            {[['12K+', 'Students'], ['600+', 'Teachers'], ['98%', 'Satisfaction']].map(([n, l]) => (
                                <div key={l} className="p-[16px_12px] rounded-xl bg-[rgba(0,212,255,0.05)] border border-[rgba(0,212,255,0.13)] text-center cursor-default transition-all duration-300 hover:bg-[rgba(0,212,255,0.11)] hover:border-[rgba(0,212,255,0.32)] hover:-translate-y-1 max-[420px]:p-[10px_6px] max-[420px]:rounded-lg max-[360px]:p-[8px_4px] max-[360px]:rounded-lg">
                                    <div className="font-['Cormorant_Garamond',serif] text-[26px] font-bold bg-[linear-gradient(135deg,#00d4ff,#00ffcc)] bg-clip-text text-transparent mb-1 max-[420px]:text-[19px] max-[360px]:text-base">{n}</div>
                                    <div className="text-[10px] sm:text-[14px] text-[rgba(220,248,255,0.32)] tracking-[0.15em] uppercase max-[420px]:text-[8.5px] max-[360px]:text-[7.5px] max-[360px]:tracking-[0.08em]">{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex-1 min-w-0 relative flex items-center justify-center bg-[#080710] overflow-hidden p-[32px_40px] cursor-crosshair max-[900px]:w-full max-[900px]:p-[32px_24px_48px] max-[640px]:p-[24px_16px_40px] max-[420px]:p-[20px_12px_36px] max-[360px]:p-[16px_10px_32px]" ref={rightPanelRef} onClick={handleRightClick}>

                    <div className="absolute pointer-events-none w-[520px] h-[520px] -top-[180px] -right-[160px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(37,99,235,0.20)_0%,rgba(30,64,175,0.11)_35%,transparent_65%)] blur-[30px] animate-[meshMove1_20s_ease-in-out_infinite] max-[360px]:hidden" />
                    <div className="absolute pointer-events-none w-[420px] h-[420px] -bottom-[140px] -left-[100px] rounded-full bg-[radial-gradient(circle_at_60%_60%,rgba(6,182,212,0.18)_0%,rgba(8,145,178,0.09)_40%,transparent_65%)] blur-[25px] animate-[meshMove2_25s_ease-in-out_infinite] max-[360px]:hidden" />
                    <div className="absolute pointer-events-none w-[360px] h-[360px] top-[40%] left-[35%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(30,58,138,0.13)_0%,transparent_65%)] blur-[20px] animate-[meshMove3_16s_ease-in-out_infinite] max-[360px]:hidden" />

                    <div className="absolute inset-0 pointer-events-none overflow-hidden after:content-[''] after:absolute after:-inset-[60px] after:bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] after:bg-[length:48px_48px] after:animate-[gridGlow_6s_ease-in-out_infinite]" />
                    <div className="absolute top-0 bottom-0 w-[1px] left-[25%] bg-[linear-gradient(180deg,transparent,rgba(37,99,235,0.20),transparent)] animate-[lineTrail_7s_linear_infinite] pointer-events-none" />
                    <div className="absolute top-0 bottom-0 w-[1px] left-[72%] bg-[linear-gradient(180deg,transparent,rgba(37,99,235,0.14),transparent)] animate-[lineTrail_10s_3.5s_linear_infinite] pointer-events-none" />

                    <div className="absolute pointer-events-none w-[90px] h-[90px] rounded-full top-[12%] left-[8%] bg-[radial-gradient(circle,rgba(37,99,235,0.28)_0%,rgba(37,99,235,0.06)_60%,transparent_80%)] blur-[4px] animate-[orbFloat_9s_ease-in-out_infinite] max-[900px]:hidden" />
                    <div className="absolute pointer-events-none w-[60px] h-[60px] rounded-full bottom-[16%] right-[9%] bg-[radial-gradient(circle,rgba(37,99,235,0.22)_0%,rgba(37,99,235,0.04)_60%,transparent_80%)] blur-[3px] animate-[orbFloat2_12s_ease-in-out_infinite] max-[360px]:hidden" />
                    <div className="absolute pointer-events-none w-[45px] h-[45px] rounded-full top-[68%] left-[5%] bg-[radial-gradient(circle,rgba(37,99,235,0.20)_0%,transparent_70%)] blur-[2px] animate-[orbFloat_7s_2s_ease-in-out_infinite] max-[360px]:hidden" />
                    <div className="absolute pointer-events-none w-[35px] h-[35px] rounded-full top-[20%] right-[6%] bg-[radial-gradient(circle,rgba(37,99,235,0.18)_0%,transparent_70%)] blur-[2px] animate-[orbFloat2_8s_1s_ease-in-out_infinite] max-[900px]:hidden" />

                    {[
                        { top: '8%', left: '15%', s: 4, d: '0s', du: '7s' },
                        { top: '20%', left: '88%', s: 3, d: '1.5s', du: '9s' },
                        { top: '55%', left: '92%', s: 5, d: '0.8s', du: '6s' },
                        { top: '80%', left: '18%', s: 3, d: '2s', du: '8s' },
                        { top: '90%', left: '60%', s: 4, d: '0.4s', du: '10s' },
                        { top: '35%', left: '4%', s: 3, d: '1.2s', du: '7s' },
                    ].map((p, i) => (
                        <div key={i} className="absolute rounded-full pointer-events-none bg-[#3b82f6]" style={{
                            top: p.top, left: p.left, width: p.s, height: p.s,
                            boxShadow: `0 0 ${p.s * 3}px rgba(37,99,235,0.75)`,
                            animation: `cyanPulse ${p.du} ease-in-out infinite`,
                            animationDelay: p.d,
                        }} />
                    ))}

                    <div className="absolute w-14 h-14 pointer-events-none animate-[cornerPulse_3s_ease-in-out_infinite] top-5 left-5 border-t-2 border-l-2 border-[rgba(37,99,235,0.55)] rounded-[3px_0_0_0] max-[420px]:w-10 max-[420px]:h-10 max-[420px]:top-3 max-[420px]:left-3 max-[360px]:w-8 max-[360px]:h-8 max-[360px]:top-2.5 max-[360px]:left-2.5" />
                    <div className="absolute w-14 h-14 pointer-events-none animate-[cornerPulse_3s_ease-in-out_infinite] top-5 right-5 border-t-2 border-r-2 border-[rgba(37,99,235,0.38)] rounded-[0_3px_0_0] delay-1000 max-[420px]:w-10 max-[420px]:h-10 max-[420px]:top-3 max-[420px]:right-3 max-[360px]:w-8 max-[360px]:h-8 max-[360px]:top-2.5 max-[360px]:right-2.5" />
                    <div className="absolute w-14 h-14 pointer-events-none animate-[cornerPulse_3s_ease-in-out_infinite] bottom-5 left-5 border-b-2 border-l-2 border-[rgba(37,99,235,0.38)] rounded-[0_0_0_3px] delay-500 max-[420px]:w-10 max-[420px]:h-10 max-[420px]:bottom-3 max-[420px]:left-3 max-[360px]:w-8 max-[360px]:h-8 max-[360px]:bottom-2.5 max-[360px]:left-2.5" />
                    <div className="absolute w-14 h-14 pointer-events-none animate-[cornerPulse_3s_ease-in-out_infinite] bottom-5 right-5 border-b-2 border-r-2 border-[rgba(37,99,235,0.55)] rounded-[0_0_3px_0] delay-1500 max-[420px]:w-10 max-[420px]:h-10 max-[420px]:bottom-3 max-[420px]:right-3 max-[360px]:w-8 max-[360px]:h-8 max-[360px]:bottom-2.5 max-[360px]:right-2.5" />

                    {ripples.map(r => (
                        <div key={r.id} className="absolute w-20 h-20 rounded-full bg-[rgba(37,99,235,0.18)] scale-0 pointer-events-none animate-[rippleOut_2s_ease-out_forwards] -ml-10 -mt-10" style={{
                            left: `${r.x}%`, top: `${r.y}%`,
                        }} />
                    ))}

                    <div className="relative z-10 bg-[rgba(10,8,22,0.80)] backdrop-blur-[24px] rounded-3xl p-[44px_40px_40px] w-full max-w-[420px] border border-[rgba(37,99,235,0.25)] shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_8px_40px_rgba(0,0,0,0.55),0_0_80px_rgba(37,99,235,0.07),inset_0_1px_0_rgba(255,255,255,0.05)] animate-[cardReveal_0.75s_cubic-bezier(0.22,1,0.36,1)_forwards] before:content-[''] before:absolute before:top-0 before:left-10 before:right-10 before:h-[2px] before:bg-[linear-gradient(90deg,transparent,#3b82f6,#06b6d4,#3b82f6,transparent)] before:bg-[length:200%_100%] before:rounded-[0_0_2px_2px] before:animate-[shimmerViolet_4s_linear_infinite] after:content-[''] after:absolute after:bottom-[-1px] after:left-[20%] after:right-[20%] after:h-[1px] after:bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.45),transparent)] after:rounded-full max-[640px]:p-[32px_24px_28px] max-[640px]:rounded-[20px] max-[420px]:p-[28px_18px_24px] max-[420px]:rounded-[18px] max-[360px]:p-[24px_14px_20px] max-[360px]:rounded-[16px]">

                        <div className="inline-flex items-center gap-1.5 bg-[rgba(37,99,235,0.12)] border border-[rgba(37,99,235,0.35)] rounded-[100px] p-[5px_13px] mb-[22px] animate-[floatBadge_4s_ease-in-out_infinite] max-[360px]:p-[4px_10px]">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#3b82f6] animate-[dotPulseBlue_2s_ease-in-out_infinite]" />
                            <span className="text-[11px] sm:text-[13px] text-[#60a5fa] tracking-[0.14em] font-semibold max-[360px]:text-[10px]">Secure Login</span>
                        </div>

                        <div className="font-['Cormorant_Garamond',serif] text-[36px] font-bold text-[#f3eeff] tracking-[-0.3px] leading-[1.1] mb-1.5 max-[640px]:text-[30px] max-[420px]:text-[26px] max-[360px]:text-[23px]">
                            Welcome <em className="not-italic bg-[linear-gradient(135deg,#3b82f6,#06b6d4,#1d4ed8)] bg-[length:200%_100%] bg-clip-text text-transparent animate-[shimmerViolet_4s_linear_infinite]">Back</em>
                        </div>
                        <div className="text-[13px] sm:text-[16px] text-[rgba(235,245,255,0.4)] mb-8 leading-[1.6] max-[420px]:text-xs max-[420px]:mb-6 max-[360px]:text-[11.5px] max-[360px]:mb-5">
                            Sign in to access your dashboard
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-[18px] max-[360px]:mb-[14px]">
                                <label className={`block text-[10.5px] sm:text-[14px] font-bold tracking-[0.14em] uppercase mb-2 transition-colors duration-[0.25s] max-[360px]:text-[9.5px] ${activeField === 'email' ? 'text-[#60a5fa]' : 'text-[rgba(235,245,255,0.4)]'}`}>Email Address</label>
                                <div className="relative">
                                    <div className={`absolute left-[14px] top-1/2 -translate-y-1/2 flex items-center transition-colors duration-[0.25s] pointer-events-none max-[360px]:left-[11px] 
    ${activeField === 'email' ? 'text-[#60a5fa]' : 'text-black'}`}>

                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                        </svg>
                                    </div>
                                    <input
                                        className="w-full p-[13px_16px_13px_42px] bg-[rgba(255,255,255,0.05)] border border-[rgba(37,99,235,0.18)] rounded-xl text-sm font-['Syne',sans-serif] text-[#f3eeff] outline-none transition-all duration-300 cubic-bezier(0.4,0,0.2,1) caret-[#3b82f6] placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(37,99,235,0.75)] focus:bg-[rgba(37,99,235,0.06)] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.14),inset_0_1px_0_rgba(255,255,255,0.04)] max-[420px]:text-[13px] max-[420px]:p-[12px_14px_12px_40px] max-[360px]:text-[12.5px] max-[360px]:p-[11px_12px_11px_38px] max-[360px]:rounded-[10px]" required type="email"
                                        placeholder="you@example.com"
                                        onFocus={() => setActiveField('email')}
                                        onBlur={() => setActiveField(null)}
                                    />
                                </div>
                            </div>

                            <div className="mb-[18px] max-[360px]:mb-[14px]">
                                <label className={`block text-[10.5px] sm:text-[14px]  font-bold tracking-[0.14em] uppercase mb-2 transition-colors duration-[0.25s] max-[360px]:text-[9.5px] ${activeField === 'password' ? 'text-[#60a5fa]' : 'text-[rgba(235,245,255,0.4)]'}`}>Password</label>
                                <div className="relative">
                                    <div className={`absolute left-[14px] top-1/2 -translate-y-1/2 flex items-center transition-colors duration-[0.25s] pointer-events-none max-[360px]:left-[11px] 
    ${activeField === 'password' ? 'text-[#60a5fa]' : 'text-black'}`}>

                                        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                    </div>
                                    <input
                                        className="w-full p-[13px_16px_13px_42px] pr-[46px] bg-[rgba(255,255,255,0.05)] border border-[rgba(37,99,235,0.18)] rounded-xl text-sm font-['Syne',sans-serif] text-[#f3eeff] outline-none transition-all duration-300 cubic-bezier(0.4,0,0.2,1) caret-[#3b82f6] placeholder:text-[rgba(255,255,255,0.2)] focus:border-[rgba(37,99,235,0.75)] focus:bg-[rgba(37,99,235,0.06)] focus:shadow-[0_0_0_4px_rgba(37,99,235,0.14),inset_0_1px_0_rgba(255,255,255,0.04)] max-[420px]:text-[13px] max-[420px]:p-[12px_14px_12px_40px] max-[420px]:pr-[42px] max-[360px]:text-[12.5px] max-[360px]:p-[11px_12px_11px_38px] max-[360px]:pr-[38px] max-[360px]:rounded-[10px]" required
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter your password"
                                        onFocus={() => setActiveField('password')}
                                        onBlur={() => setActiveField(null)}
                                    />
                                    <button type="button" className="absolute right-[14px] top-1/2 -translate-y-1/2 bg-none border-none cursor-pointer text-[rgba(255,255,255,0.26)] flex items-center transition-colors duration-200 hover:text-[#60a5fa] max-[360px]:right-[11px]" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mb-[26px] max-[420px]:flex-wrap max-[420px]:gap-2 max-[360px]:mb-[18px]">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-[15px] h-[15px] cursor-pointer accent-[#3b82f6] rounded" />
                                    <span className="text-[12.5px] text-[rgba(235,245,255,0.4)] select-none max-[360px]:text-[11px]">Remember me</span>
                                </label>
                                <button type="button" className="bg-none border-none font-['Syne',sans-serif] text-[12.5px] text-[rgba(235,245,255,0.4)] cursor-pointer transition-colors duration-200 hover:text-[#60a5fa] max-[360px]:text-[11px]">Forgot password?</button>
                            </div>

                            <div className="mb-5">
                                {loading ? (
                                    <div className="flex justify-center p-[8px_0]"><Loader /></div>
                                ) : (
                                    <button type="submit" className="w-full p-[15px] bg-[linear-gradient(135deg,#1e40af_0%,#3b82f6_40%,#38bdf8_80%,#0284c7_100%)] bg-[length:200%_100%] border-none rounded-xl text-white text-sm font-bold tracking-[0.08em] cursor-pointer font-['Syne',sans-serif] relative overflow-hidden transition-all duration-300 cubic-bezier(0.4,0,0.2,1) shadow-[0_4px_20px_rgba(37,99,235,0.38)] hover:bg-right hover:-translate-y-[2px] hover:shadow-[0_8px_32px_rgba(37,99,235,0.55)] active:translate-y-0 active:shadow-[0_4px_16px_rgba(37,99,235,0.38)] before:content-[''] before:absolute before:top-0 before:-left-full before:w-3/5 before:h-full before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)] before:skew-x-[-20deg] before:animate-[btnShine_4s_ease-in-out_infinite_1s] max-[420px]:text-[13px] max-[360px]:p-[13px] max-[360px]:text-[12.5px] max-[360px]:rounded-[10px] flex items-center justify-center gap-2">
                                        Sign In <PiArrowRight weight="bold" size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3.5 mt-6 mb-5 max-[360px]:mt-[18px] max-[360px]:mb-4">
                                <div className="flex-1 h-[1px] bg-[rgba(37,99,235,0.14)]" />
                                <span className="text-[10px] sm:text-[12px] text-[rgba(37,99,235,0.45)] tracking-[0.2em] font-semibold">New Here?</span>
                                <div className="flex-1 h-[1px] bg-[rgba(37,99,235,0.14)]" />
                            </div>

                            <p className="text-center text-[13px] text-[rgba(235,245,255,0.4)] max-[360px]:text-xs">
                                Don't have an account?{' '}
                                <span className="text-[#60a5fa] font-semibold cursor-pointer transition-colors duration-200 hover:text-[#06b6d4] hover:shadow-[0_0_12px_rgba(37,99,235,0.5)]" onClick={handleGoToSignUp}>Create one now</span>
                            </p>
                        </form>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Login;
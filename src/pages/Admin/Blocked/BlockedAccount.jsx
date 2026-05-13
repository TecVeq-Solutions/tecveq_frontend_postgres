import React from 'react';
import { IoShieldOutline, IoChatbubbleEllipsesOutline, IoCallOutline, IoMailOutline, IoLogOutOutline } from 'react-icons/io5';
import { useUser } from '../../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { userLogout } from '../../../api/ForAllAPIs';

const BlockedAccount = () => {
    const { userData } = useUser();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await userLogout();
        localStorage.clear();
        navigate('/login');
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-poppins">
            <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-rose-100 border border-rose-50 overflow-hidden">
                <div className="bg-rose-500 p-10 text-white text-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-10 -left-10 w-40 h-40 border-8 border-white rounded-full"></div>
                        <div className="absolute -bottom-20 -right-10 w-60 h-60 border-8 border-white rounded-full"></div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="h-20 w-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 backdrop-blur-md">
                            <IoShieldOutline size={40} />
                        </div>
                        <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Account Restricted</h1>
                        <p className="text-rose-100 font-medium">Your access to the LMS has been temporarily suspended.</p>
                    </div>
                </div>

                <div className="p-8 sm:p-12">
                    <div className="space-y-8">
                        <div className="text-center space-y-4">
                            <p className="text-slate-600 font-medium leading-relaxed">
                                Your account has been <span className="text-rose-600 font-black">Blocked</span> due to unpaid monthly subscriptions or system maintenance. To restore your access and continue managing your institute, please contact the Super Admin team.
                            </p>
                        </div>

                        {/* Account Info Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                                <p className="text-rose-600 font-black text-lg">Blocked / Unpaid</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</p>
                                <p className="text-slate-800 font-black text-lg">
                                    {userData?.subscriptionExpiresAt ? new Date(userData.subscriptionExpiresAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Support Options */}
                        <div className="space-y-4">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] text-center">Contact Support</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <a href="mailto:support@tecveq.com" className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                                    <IoMailOutline className="text-indigo-600 group-hover:scale-110 transition-transform" size={20} />
                                    <span className="text-[10px] font-black text-slate-600 uppercase">Email</span>
                                </a>
                                <a href="tel:+923000000000" className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group">
                                    <IoCallOutline className="text-emerald-600 group-hover:scale-110 transition-transform" size={20} />
                                    <span className="text-[10px] font-black text-slate-600 uppercase">Call</span>
                                </a>
                                <button 
                                    onClick={() => navigate('/admin/platform-support')}
                                    className="flex flex-col items-center gap-2 p-4 bg-white border border-slate-100 rounded-2xl hover:border-amber-200 hover:bg-amber-50/30 transition-all group"
                                >
                                    <IoChatbubbleEllipsesOutline className="text-amber-600 group-hover:scale-110 transition-transform" size={20} />
                                    <span className="text-[10px] font-black text-slate-600 uppercase">Chat</span>
                                </button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={handleLogout}
                                className="flex-1 py-4 px-6 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                            >
                                <IoLogOutOutline size={20} /> Sign Out
                            </button>
                            <button 
                                onClick={() => navigate('/admin/subscription')}
                                className="flex-[2] py-4 px-6 bg-[#0B1053] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#080f4f] shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                            >
                                <IoCardOutline size={20} /> Pay Monthly Fee & Unblock
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlockedAccount;

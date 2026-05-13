import React, { useState, useEffect, useRef } from 'react';
import {
    IoChatbubbleEllipsesOutline,
    IoNotificationsOutline,
    IoSend,
    IoShieldCheckmarkOutline,
    IoChevronForwardOutline,
    IoInformationCircleOutline,
} from 'react-icons/io5';
import Navbar from '../../../components/Admin/Navbar';
import { useUser } from '../../../context/UserContext';
import { useAdmin } from '../../../context/AdminContext';
import moment from 'moment';
import axios from 'axios';
import { BACKEND_URL } from '../../../constants/api';
import { useQuery } from '@tanstack/react-query';

const PlatformSupport = () => {
    const { userData } = useUser();
    const { setUnreadSupportCount } = useAdmin();
    const [activeTab, setActiveTab] = useState('chat');
    const [msgInput, setMsgInput] = useState('');
    const [notifications, setNotifications] = useState([]);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        setUnreadSupportCount(0);
        const fetchSystemInfo = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('tcauser'));
                const response = await axios.get(`${BACKEND_URL}/superadmin/notifications/admin`, {
                    headers: { Authorization: `Bearer ${userData?.token}` }
                });
                setNotifications(response.data || []);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            }
        };
        fetchSystemInfo();
    }, []);

    const { data: messages = [], refetch: refetchMsgs } = useQuery({
        queryKey: ['admin-support-messages'],
        queryFn: async () => {
            if (!userData?.id) return [];
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const res = await axios.get(`${BACKEND_URL}/superadmin/support/messages`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            return res.data;
        },
        enabled: !!userData?.id && activeTab === 'chat',
        refetchInterval: 3000
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!msgInput.trim()) return;
        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            await axios.post(`${BACKEND_URL}/superadmin/support/messages`, {
                message: msgInput.trim()
            }, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setMsgInput('');
            refetchMsgs();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="flex flex-col flex-1 px-3 sm:px-5 ml-0 lg:ml-80 min-h-screen bg-slate-50 font-sans overflow-x-hidden">
            {/* Navbar */}
            <div className="flex min-h-16 md:min-h-20 md:px-14 lg:pt-3 lg:px-0">
                <Navbar heading={"Platform Support"} />
            </div>

            {/* Main Layout */}
            <main className="mt-3 sm:mt-6 flex flex-col lg:flex-row gap-4 lg:gap-6 pb-6 lg:pb-8 min-h-[calc(100vh-90px)] lg:h-[calc(100vh-120px)]">

                {/* ── Sidebar ── */}
                <div className="w-full lg:w-64 flex flex-col gap-3 shrink-0">

                    {/* Mobile tabs wrapper friendly sizing */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1  gap-2 sm:gap-3">

                        {/* Chat Tab */}
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-2xl border transition-all duration-200 text-left min-w-0
                            ${activeTab === 'chat'
                                    ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200/60'
                                    : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40'}`}
                        >
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0
                            ${activeTab === 'chat' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
                                <IoChatbubbleEllipsesOutline size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-semibold truncate ${activeTab === 'chat' ? 'text-white' : 'text-slate-800'}`}>
                                    Direct Chat
                                </p>
                                <p className={`text-[11px] mt-0.5 truncate ${activeTab === 'chat' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    Talk to Super Admin
                                </p>
                            </div>
                        </button>

                        {/* Notifications Tab */}
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-4 rounded-2xl border transition-all duration-200 text-left min-w-0
                            ${activeTab === 'notifications'
                                    ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200/60'
                                    : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50/40'}`}
                        >
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0
                            ${activeTab === 'notifications' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-600'}`}>
                                <IoNotificationsOutline size={22} />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-sm font-semibold truncate ${activeTab === 'notifications' ? 'text-white' : 'text-slate-800'}`}>
                                    System Alerts
                                </p>
                                <p className={`text-[11px] mt-0.5 truncate ${activeTab === 'notifications' ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    Broadcast Messages
                                </p>
                            </div>
                        </button>
                    </div>

                    {/* Info Card */}
                    <div className="lg:mt-auto bg-[#1E1B4B] rounded-2xl p-4 sm:p-5 text-white">
                        <div className="flex items-center gap-2 mb-3">
                            <IoShieldCheckmarkOutline className="text-emerald-400 shrink-0" size={16} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Security Verified
                            </span>
                        </div>
                        <p className="text-[12px] text-slate-300 leading-relaxed">
                            Our technical support team is available 24/7 for critical system issues.
                        </p>
                        <div className="mt-4 sm:mt-5 flex items-center gap-2 text-indigo-400 cursor-pointer hover:text-indigo-300 transition-colors">
                            <IoInformationCircleOutline size={15} />
                            <span className="text-[11px] font-semibold">Help Center</span>
                            <IoChevronForwardOutline size={13} className="ml-auto" />
                        </div>
                    </div>
                </div>

                {/* ── Content Area ── */}
                <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-sm h-[60vh] sm:h-[65vh] lg:h-auto">

                    {activeTab === 'chat' ? (
                        <>
                            {/* Chat Header */}
                            <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-slate-100 shrink-0">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md shadow-indigo-200 shrink-0">
                                        SA
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">Super Admin Support</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                                            <p className="text-[11px] text-slate-400">Online</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors shrink-0">
                                    <IoInformationCircleOutline size={16} className="text-slate-500" />
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-4 space-y-4 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-10 sm:py-16">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-100 text-indigo-500 rounded-2xl flex items-center justify-center mb-4">
                                            <IoChatbubbleEllipsesOutline size={34} />
                                        </div>
                                        <h3 className="text-base font-semibold text-slate-800">Start a Conversation</h3>
                                        <p className="text-sm text-slate-400 max-w-[220px] mt-2 leading-relaxed">
                                            Send a message to the Super Admin for queries or technical help.
                                        </p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderId === userData.id;
                                        return (
                                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[85%] sm:max-w-[75%] break-words px-1.5 sm:px-3 py-1.5 sm:py-3 text-sm leading-relaxed shadow-sm
                                                ${isMe
                                                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                                        : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'}`}>
                                                    {msg.message}
                                                    <p className={`text-[10px] mt-0.5 sm:mt-1.5 text-right ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                        {moment(msg.createdAt).format('hh:mm A')}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="px-3 sm:px-4 py-3 bg-white border-t border-slate-100 shrink-0">
                                <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 sm:px-4 py-1.5 focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
                                    <input
                                        type="text"
                                        value={msgInput}
                                        onChange={(e) => setMsgInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type your message..."
                                        className="flex-1 min-w-0 bg-transparent py-2 text-sm text-slate-800 placeholder-slate-400 outline-none"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-lg flex items-center justify-center transition-all shadow-md shadow-indigo-200 shrink-0"
                                    >
                                        <IoSend size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Notifications Header */}
                            <div className="px-4 sm:px-5 py-4 border-b border-slate-100 shrink-0">
                                <h3 className="text-sm font-semibold text-slate-800">System Broadcasts</h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">Official updates from Super Admin</p>
                            </div>

                            {/* Notifications List */}
                            <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                                {notifications.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center py-10 sm:py-16">
                                        <IoNotificationsOutline size={52} className="text-slate-200 mb-4" />
                                        <p className="text-sm text-slate-400 font-medium">No system notifications yet</p>
                                    </div>
                                ) : (
                                    notifications.map((notif, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-sm rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 transition-all duration-200 cursor-default"
                                        >
                                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0
                                            ${notif.type === 'Alert' ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-500'}`}>
                                                <IoInformationCircleOutline size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start sm:items-center justify-between gap-2 mb-1.5">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0
                                                    ${notif.type === 'Alert'
                                                            ? 'bg-rose-100 text-rose-600'
                                                            : 'bg-blue-100 text-blue-600'}`}>
                                                        {notif.type}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 text-right shrink-0">
                                                        {moment(notif.createdAt).fromNow()}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-semibold text-slate-800 mb-1 break-words">{notif.title}</h4>
                                                <p className="text-xs text-slate-500 leading-relaxed break-words">{notif.message}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default PlatformSupport;
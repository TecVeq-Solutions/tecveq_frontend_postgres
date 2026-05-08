import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BACKEND_URL } from '../../constants/api';
import SuperAdminNavbar from '../../components/SuperAdmin/SuperAdminNavbar';
import Loader from '../../utils/Loader';
import {
    IoSearchOutline,
    IoSend,
    IoPersonCircleOutline,
    IoBusinessOutline,
    IoRadioButtonOnOutline
} from 'react-icons/io5';

const Chat = () => {
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [message, setMessage] = useState('');
    const chatEndRef = useRef(null);

    const { data: admins = [], isLoading: adminsLoading } = useQuery({
        queryKey: ['superadmin-chat-admins'],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const res = await axios.get(`${BACKEND_URL}/superadmin/chats`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            return res.data;
        }
    });

    const { data: messages = [], isLoading: msgsLoading, refetch: refetchMsgs } = useQuery({
        queryKey: ['superadmin-messages', selectedAdmin?.id],
        queryFn: async () => {
            if (!selectedAdmin) return [];
            const user = JSON.parse(localStorage.getItem('tcauser'));
            const res = await axios.get(`${BACKEND_URL}/superadmin/messages/${selectedAdmin.id}`, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            return res.data;
        },
        enabled: !!selectedAdmin,
        refetchInterval: 5000 // Polling for new messages
    });

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedAdmin) return;

        try {
            const user = JSON.parse(localStorage.getItem('tcauser'));
            await axios.post(`${BACKEND_URL}/superadmin/messages`, {
                receiverId: selectedAdmin.id,
                message: message.trim()
            }, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
            setMessage('');
            refetchMsgs();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    if (adminsLoading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader /></div>;

    const currentUser = JSON.parse(localStorage.getItem('tcauser'));

    return (
        <div className="min-h-[93vh] suppor bg-[#f5f7fb] font-poppins flex flex-col">
            <SuperAdminNavbar heading="Support Center" />

            <main className="flex-1 overflow-hidden flex flex-row p-4 lg:p-6 gap-6">
                {/* Admin List */}
                <div className="w-80 flex flex-col bg-white rounded-3xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-50">
                        <div className="relative">
                            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search admins..."
                                className="w-full bg-slate-50 rounded-2xl py-2.5 pl-10 pr-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-100 transition"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {admins.map(admin => (
                            <div
                                key={admin.id}
                                onClick={() => setSelectedAdmin(admin)}
                                className={`p-4 flex items-center gap-3 cursor-pointer transition ${selectedAdmin?.id === admin.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                            >
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-indigo-700 font-black">
                                        {admin.profilePic ? <img src={admin.profilePic} className="h-full w-full object-cover rounded-2xl" /> : admin.name?.[0]}
                                    </div>
                                    {admin.status === 'active' && (
                                        <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-slate-800 truncate">{admin.name}</p>
                                    <p className="text-[11px] font-bold text-slate-400 truncate uppercase tracking-tighter">{admin.instituteName}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm ring-1 ring-slate-100 overflow-hidden relative">
                    {selectedAdmin ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-5 border-b border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-black">
                                        {selectedAdmin.name?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-800">{selectedAdmin.name}</h3>
                                        <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                                            <IoRadioButtonOnOutline /> Online
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
                                {messages.map((msg, idx) => {
                                    const isMe = msg.senderId === currentUser.id;
                                    return (
                                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${isMe ? 'bg-[#080f4f] text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                                                <p className="text-sm font-medium">{msg.message}</p>
                                                <p className={`mt-1.5 text-[10px] font-bold uppercase tracking-widest ${isMe ? 'text-white/50' : 'text-slate-300'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSendMessage} className="p-5 bg-white border-t border-slate-50 flex items-center gap-3">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here..."
                                    className="flex-1 bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-100 transition"
                                />
                                <button
                                    type="submit"
                                    className="h-12 w-12 rounded-2xl bg-[#080f4f] text-white flex items-center justify-center shadow-lg shadow-indigo-900/20 transition hover:scale-105 active:scale-95"
                                >
                                    <IoSend size={20} />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                            <div className="h-20 w-20 rounded-[2.5rem] bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                                <IoPersonCircleOutline size={48} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">Select an Admin</h3>
                            <p className="text-sm text-slate-400 max-w-xs mt-2">Choose an administrator from the list to start a support conversation.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Chat;

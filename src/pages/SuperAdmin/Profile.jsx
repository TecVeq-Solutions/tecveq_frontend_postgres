import React, { useState } from 'react';
import SuperAdminNavbar from '../../components/SuperAdmin/SuperAdminNavbar';
import { 
    IoPersonOutline, 
    IoMailOutline,
    IoShieldOutline,
    IoKeyOutline,
    IoSaveOutline,
    IoCameraOutline
} from 'react-icons/io5';
import { toast } from 'react-toastify';

const Profile = () => {
    const user = JSON.parse(localStorage.getItem('tcauser')) || {};
    const [processing, setProcessing] = useState(false);

    const handleUpdateProfile = (e) => {
        e.preventDefault();
        setProcessing(true);
        setTimeout(() => {
            toast.success("Profile updated successfully (Simulation)");
            setProcessing(false);
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] font-poppins">
            <SuperAdminNavbar heading="Admin Profile" />

            <main className="mx-auto max-w-screen-md p-4 lg:p-6">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm ring-1 ring-slate-100">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="relative group mb-4">
                            <div className="h-32 w-32 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-4xl text-indigo-700 ring-4 ring-white shadow-xl">
                                {user.name?.[0] || 'A'}
                            </div>
                            <button className="absolute -bottom-2 -right-2 h-10 w-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg transition hover:scale-110 active:scale-95 border-4 border-white">
                                <IoCameraOutline size={18} />
                            </button>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">{user.name || 'Super Admin'}</h2>
                        <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mt-1">Platform Controller</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</label>
                                <div className="relative">
                                    <IoPersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        defaultValue={user.name}
                                        className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                <div className="relative">
                                    <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        readOnly
                                        defaultValue={user.email}
                                        className="w-full bg-slate-50 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-semibold outline-none border border-transparent cursor-not-allowed opacity-70" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50">
                            <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                                <IoKeyOutline /> Change Password
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">New Password</label>
                                    <input 
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
                                    <input 
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 rounded-2xl py-3.5 px-6 text-sm font-semibold outline-none border border-transparent focus:border-indigo-300 focus:bg-white transition" 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center pt-6">
                            <button 
                                type="submit"
                                disabled={processing}
                                className="flex items-center justify-center gap-2 rounded-2xl bg-[#080f4f] px-12 py-4 text-sm font-black text-white shadow-xl shadow-indigo-900/20 transition hover:bg-indigo-800 active:scale-95 disabled:opacity-70"
                            >
                                <IoSaveOutline size={20} /> {processing ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Profile;

import React, { useState } from 'react'
import Loader from '../../../utils/Loader';
import logo from "../../../assets/logo.png";
import Card from '../../../components/Parent/ChildrenScreen/Card'
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useUser } from '../../../context/UserContext';
import { useParent } from '../../../context/ParentContext';
import { getAllChildren } from '../../../api/Parent/ParentApi';

const ChildrenScreen = () => {
    const [selectedId, setSelectedId] = useState(null);
    const navigate = useNavigate();
    const { parentLogedIn, setSelectedChild } = useParent();
    const { userData } = useUser();

    const handleChildClick = (child) => {
        setSelectedChild(child);
        setSelectedId(child._id);
        localStorage.setItem("selectedChild", JSON.stringify(child));
        navigate("/parent/dashboard");
    };

    const { data, isPending } = useQuery({
        queryKey: ["childquery"],
        queryFn: async () => {
            const result = await getAllChildren(userData.email);
            return result;
        },
        staleTime: 30000,
        enabled: parentLogedIn
    });

    if (isPending) return <Loader />;

    return (
        <div className="relative min-h-screen bg-[#060D2E] flex flex-col items-center justify-center overflow-hidden px-6 py-12">

            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Ambient orbs */}
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.2)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.18)_0%,transparent_70%)] pointer-events-none" />

            {/* Logo */}
            <div className="relative flex items-center gap-3 mb-10 animate-fadeDown">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <img src={logo} alt="logo" className="w-7 h-7 object-contain" />
                </div>
                <span className="text-white text-xl font-extrabold tracking-tight font-poppins">
                    EduParent
                </span>
            </div>

            {/* Heading */}
            <div className="relative text-center mb-10">
                <p className="text-white text-3xl font-extrabold tracking-tight font-poppins mb-2">
                    Select a Child Profile
                </p>
                <p className="text-white/40 text-sm font-medium">
                    Choose a profile to view their dashboard and progress
                </p>
            </div>

            {/* Cards */}
            <div className="relative flex flex-wrap gap-5 justify-center">
                {data.map((item, index) => (
                    <Card
                        key={item._id}
                        data={item}
                        active={selectedId === item._id}
                        onpress={() => handleChildClick(item)}
                        delay={index}
                    />
                ))}
            </div>
        </div>
    );
};

export default ChildrenScreen;
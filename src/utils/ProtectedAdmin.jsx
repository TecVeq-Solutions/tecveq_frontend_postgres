import React from 'react'
import { useUser } from '../context/UserContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedAdmin = () => {
    const { userData } = useUser();
    const location = useLocation();

    if (!userData || (userData.userType !== "admin" && userData.userType !== "super_admin")) {
        return <Navigate to={"/"} />;
    }

    // If user is an admin and is blocked
    if (userData.userType === "admin" && userData.status === "blocked") {
        // Allow access ONLY to blocked screen and platform support chat
        const allowedPaths = ["/admin/blocked", "/admin/platform-support"];
        if (!allowedPaths.includes(location.pathname)) {
            return <Navigate to="/admin/blocked" />;
        }
    }

    return <Outlet />;
}

export default ProtectedAdmin

import React from 'react'
import { useUser } from '../context/UserContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedAdmin = () => {
    const { userData } = useUser();
    const location = useLocation();
    const user = userData || JSON.parse(localStorage.getItem("tcauser"));

    if (!user || (user.userType !== "admin" && user.userType !== "super_admin")) {
        return <Navigate to="/admin/login" replace />;
    }

    // If user is an admin and is blocked
    if (user.userType === "admin" && user.status === "blocked") {
        // Allow access ONLY to blocked screen and platform support chat
        const allowedPaths = ["/admin/blocked", "/admin/platform-support"];
        if (!allowedPaths.includes(location.pathname)) {
            return <Navigate to="/admin/blocked" replace />;
        }
    }

    return <Outlet />;
}

export default ProtectedAdmin

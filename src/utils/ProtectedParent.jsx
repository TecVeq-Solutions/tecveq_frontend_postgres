import React from 'react'
import { useUser } from '../context/UserContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedParent = () => {
    const { userData } = useUser();
    const user = userData || JSON.parse(localStorage.getItem("tcauser"));
    return user && user.userType === "parent" ? <Outlet /> : <Navigate to={"/login"} replace />
}

export default ProtectedParent

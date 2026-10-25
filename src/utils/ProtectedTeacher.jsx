import React from 'react'
import { useUser } from '../context/UserContext';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedTeacher = () => {
    const { userData } = useUser();
    const user = userData || JSON.parse(localStorage.getItem("tcauser"));
    return user && user.userType === "teacher" ? <Outlet /> : <Navigate to={"/admin/login"} replace />
}

export default ProtectedTeacher

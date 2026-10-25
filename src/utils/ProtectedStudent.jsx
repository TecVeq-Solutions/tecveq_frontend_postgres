import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedStudent = () => {
  const { userData } = useUser();
  const user = userData || JSON.parse(localStorage.getItem("tcauser"));
  return user && user.userType === "student" ? <Outlet /> : <Navigate to={"/login"} replace />
}

export default ProtectedStudent

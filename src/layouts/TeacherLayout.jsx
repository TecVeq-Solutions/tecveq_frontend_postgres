import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Teacher/Sidebar/Sidebar';

const TeacherLayout = ({children}) => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Teacher layout is active");
  }, []);
  return (
    <>
    <div className="flex h-screen w-full overflow-hidden bg-[#F9F9F9]">
       <div className="fixed top-0 left-0 h-full z-40 flex-shrink-0">
         <Sidebar />
       </div>
       <div className="flex-1 h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative">
         {children}
       </div>
     </div>
    </>
  )
}

export default TeacherLayout

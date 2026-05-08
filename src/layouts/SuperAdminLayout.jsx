import React from 'react'
import Sidebar from '../components/SuperAdmin/Sidebar/Sidebar';

const SuperAdminLayout = ({children}) => {
  return (
    <>
    <div className="flex">
       <div className="fixed top-0 left-0 h-screen z-[100] flex">
         <Sidebar />
       </div>
       <div className="flex-1 pt-[72px] w-full ml-0 lg:ml-72 xl:ml-80">
         {children}
       </div>
     </div>
    </>
  )
}

export default SuperAdminLayout;

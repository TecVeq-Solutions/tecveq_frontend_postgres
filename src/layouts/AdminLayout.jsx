import React from 'react'
import Sidebar from '../components/Admin/Sidebar/Sidebar';

const AdminLayout = ({ children }) => {
  return (
    <>
      <div className="flex max-w-full">
        <div className="fixed top-0 left-0 h-screen z-20 flex">
          <Sidebar />
        </div>
        {children}
      </div>
    </>
  )
}

export default AdminLayout

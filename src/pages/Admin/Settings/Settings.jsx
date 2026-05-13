import React from 'react'
import AttandenceSetting from '../../../components/Admin/AttandenceSetting/AttandenceSetting'
import Navbar from '../../../components/Admin/Navbar'
import { useBlur } from '../../../context/BlurContext'
import { useSidebar } from '../../../context/SidebarContext'

const AttandenceSettings = () => {
    const { isBlurred } = useBlur();
    const { isSidebarOpen } = useSidebar();

    return (
        <div className="flex flex-col flex-1 bg-[#F8FAFC] font-poppins min-h-screen overflow-x-hidden w-full">
            <div className="flex flex-col flex-1 px-3 sm:px-5 ml-0 lg:ml-72 xl:ml-80 min-h-full pb-10">
                <header className="sticky top-0 px-2 z-40 bg-[#f9f9f9]/90 backdrop-blur-sm flex h-16 sm:h-20 md:px-14 lg:px-0">
                    <Navbar heading={"Settings"} />
                </header>

                <div
                    className={`flex flex-col md:px-10 lg:px-0 w-full gap-3 sm:gap-5 pt-6 pb-2 flex-1 transition-all duration-300 ${isBlurred ? "blur" : ""
                        } ${isSidebarOpen ? "-z-10" : "z-auto"} lg:z-auto`}
                >
                    <AttandenceSetting />
                </div>
            </div>
        </div>
    )
}

export default AttandenceSettings

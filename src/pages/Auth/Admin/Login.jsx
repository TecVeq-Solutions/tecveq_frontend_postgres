import React, { useState } from 'react'
import IMAGES from '../../../assets/images';
import { studentLogin } from '../../../api/Student/StudentApis';
import Loader from '../../../utils/Loader';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../../context/UserContext';
import { toast } from 'react-toastify';
import { useAdmin } from '../../../context/AdminContext';
import { useTeacher } from '../../../context/TeacherContext';
import { BACKEND_URL_SOCKET } from '../../../constants/api';
import { io } from 'socket.io-client';

const Login = () => {

    const CustomInput = ({ label, placeholder, type }) => {
        return (
            <div className='flex flex-col text-start py-1'>
                <div className='flex flex-col gap-1'>
                    <div className='font-medium'>
                        {label}
                    </div>
                    <div>
                        <input
                            className={`border outline-none rounded-sm border-black/20 px-4 w-full py-[4px] ${type == "password" ? "font-bold text-xl" : ""} placeholder:text-base placeholder:font-normal `}
                            required
                            type={type}
                            placeholder={placeholder}
                        />
                    </div>
                </div>
            </div>
        )
    }

    const Selectable = ({ label }) => {
        return (
            <div className='flex flex-col text-start py-1'>
                <div className='flex flex-col gap-1'>
                    <div className='font-medium'>
                        {label}
                    </div>
                    <div>
                        <select className='border outline-none rounded-sm border-black/20 px-4 w-full py-[4px]'>
                            <option value="student">Studnet</option>
                            <option value="parent">Parent</option>
                        </select>
                    </div>
                </div>
            </div>
        )
    }

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setUserData, setSocketContext } = useUser();
    const { setAdminLogedIn } = useAdmin();
    const { setTeacherLogedIn } = useTeacher();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const dataBody = {
                email: e.target[0].value.trim().toLowerCase(), 
                password: e.target[1].value
            }
            const response = await studentLogin(dataBody);

            if (response !== "error") {
                setUserData(response);
                if (response.userType == "admin") {
                    setAdminLogedIn(true);
                    toast.success("Login successful");
                    localStorage.setItem("tcauser", JSON.stringify(response))
                    navigate("/admin/dashboard")

                }
                else if (response.userType == "super_admin") {
                    setAdminLogedIn(true);
                    toast.success("Login successful");
                    localStorage.setItem("tcauser", JSON.stringify(response))
                    navigate("/superadmin/dashboard")

                } else if (response.userType == "teacher") {
                    const con = io(`${BACKEND_URL_SOCKET}`)
                    setSocketContext(con);
                    setTeacherLogedIn(true);
                    toast.success("Login successful");
                    localStorage.setItem("tcauser", JSON.stringify(response))
                    navigate("/teacher/dashboard")

                } else {
                    navigate("/admin/login")
                }
            }

        } catch (error) {
            console.log("error in student login UI screen is : ", error);
            // toast.error handled globally by axios interceptor
        }
        setLoading(false);
    }

    const handleGoToSignUp = () => {
        navigate("/signup");
    }

    return (
        <div className='flex flex-col md:flex-row min-h-screen w-full bg-[#0B1053]'
        // style={{ background: 'linear-gradient(140.21deg, rgba(243, 233, 233, 0.4) -6.93%, rgba(246, 246, 246, 0) 98.1%)' }}
        >
            {/* <div className=' bg-cover bg-hero-pattern absolute w-72 h-72' ></div> */}
            {/* <div className='flex flex-1 sm:w-1/2 px-4 md:px-10 py-10 justify-center'> */}
            <div className='flex w-full md:w-1/2 px-4 md:px-10 py-6 justify-center items-center'>
                <div className='flex lg:w-full items-center justify-center'>
                    <img src={IMAGES.logo} alt="" className=' bg-cover' />
                </div>
            </div>
            <div className='flex flex-1 md:w-1/2 '>
                {/* <div className='relative hidden bottom-10 items-end lg:items-center lg:left-11 2xl:left-14 lg:flex justify-center '>
                     <div className='bg-cover mr-5 bg-center-img 2xl:w-80 2xl:h-72 xl:w-72 xl:h-64 h-44 w-52 absolute'></div> 
                </div> */}
                {/* <div className='flex flex-col lg:px-32 md:px-4 px-0 flex-1 px-4 md:px-10 py-8 justify-center items-center text-center w-full'> */}
                <div className='flex flex-1 justify-center items-center lg:px-24 px-4 py-8 w-full'>
                    {/* <div className='flex w-full lg:px-16 px-0 flex-col bg-white h-full px-4 py-10 justify-center items-center'> */}
                    <div className='flex flex-col bg-white w-full h-full lg:px-16  px-4 max-w-md sm:max-w-full mx-auto px-6 py-10 rounded-lg shadow-lg justify-center items-center'>                        {/* <div> */}
                        <div className='py-3 text-center'>
                            <p className='text-2xl font-medium'>Welcome Back</p>
                            <p className='text-sm text-black/60'>Welcome back please enter your details</p>
                        </div>
                        <div className='w-full'>
                            <form onSubmit={handleSubmit}>
                                <div className=''>
                                    {/* <Selectable label={"Parent/Student"} /> */}
                                    <CustomInput label={"Email"} type="email" placeholder={"Enter your email..."} />
                                    <CustomInput label={"Password"} type="password" placeholder={"Enter your password..."} />
                                </div>
                                <div className='flex justify-between items-center'>
                                    <div className='flex gap-2 items-center ml-2'>
                                        <p>
                                            <input type="checkbox" />
                                        </p>
                                        <p className='text-sm'>Remember me</p>
                                    </div>
                                    <div>
                                        <p className='text-sm cursor-pointer hover:underline'>Forgot Password</p>
                                    </div>
                                </div>
                                <div className='py-4 flex flex-col gap-2'>
                                    {loading ?
                                        <>
                                            <div className='flex flex-1' > <Loader /> </div>
                                        </>
                                        : (
                                            <button type='submit' className='flex bg-[#6A00FF] text-white rounded-md py-2 px-4 justify-center items-center text-center cursor-pointer hover:bg-[#007EEA]'>Sign In</button>
                                        )}
                                    <p className='text-[#000000]/70 text-sm'>Don't have an account? <span onClick={handleGoToSignUp} className='text-[#000000]/50 cursor-pointer hover:text-[#00000090] font-medium underline'>Sign up</span> now</p>
                                </div>
                            </form>
                        </div>
                        {/* </div> */}
                    </div>
                </div>
            </div>
        </div>
    )

}

export default Login

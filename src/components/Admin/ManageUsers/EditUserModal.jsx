import React, { useRef, useState } from 'react'
import Loader from '../../../utils/Loader';

import { toast } from 'react-toastify';
import { LuAsterisk } from "react-icons/lu";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation } from '@tanstack/react-query';
import { updateUser } from '../../../api/Admin/UsersApi';
import useClickOutside from '../../../hooks/useClickOutlise';
import { useBlur } from '../../../context/BlurContext';
import { useAdmin } from '../../../context/AdminContext';


const InputFiled = ({ label, req, val, name, dataObj, setDataObj, type = "text" }) => {


    return (
        <div className='flex flex-1'>
            <div className='flex flex-col gap-2 flex-1'>
                <div className='flex'>
                    <p>{label}</p>
                    {req ? <LuAsterisk className='text-maroon' size={16} /> : <></>}
                </div>
                <div className='w-full flex-1'>
                    <input
                        type={type}
                        onChange={(e) => {
                            if (setDataObj) {
                                setDataObj((prev) => ({ ...prev, [name]: e.target.value }));
                            }
                        }}
                        value={val || ""}
                        placeholder={label}
                        className='rounded-md w-full outline-none border border-black/20 py-2 px-4'
                    />
                </div>
            </div>
        </div>
    )
}




const EditUserModal = ({ closeModal, refetch, data }) => {


    const ref = useRef(null); // Reference to the modal container
    const { toggleBlur } = useBlur(); // Access toggleBlur from the context
    const { allLevels } = useAdmin();

    // Use the hook with the modal's reference and callback function
    useClickOutside(ref, () => {
        closeModal(); // Close the modal
    });

    const CustomButton = ({ label, btnClick }) => {
        return (
            <div className='flex justify-center mt-2'>
                <div onClick={btnClick} className='w-40 cursor-pointer bg-[#0B1053] rounded-3xl py-2 px-4 text-white justify-center flex items-center '>
                    <p>{label}</p>
                </div>
            </div>
        )
    }


    const [userObj, setUsrObj] = useState({
        name: data.name || "",
        email: data.email || "",
        rollNo: data.rollNo || "",
        phoneNumber: data.phoneNumber || "",
        gender: data.gender || "",
        guardianPhoneNumber: data.guardianPhoneNumber || "",
        guardianEmail: data.guardianEmail || "",
        guardianName: data.guardianName || "",
        referenceNo: data.referenceNo || "",
        levelID: data.levelID || "",
        password: "",
        confirmPassword: ""
    });

    const handleUpdateUser = async () => {
        if (userObj.password !== userObj.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        console.log("mutation ")
        mutation.mutate(userObj);
    }

    const mutation = useMutation({
        mutationFn: async (updateData) => {
            let result = await updateUser(updateData, data.id);
            console.log("user updatd ", result);
            await refetch();
            toast.success(`User updated successfully!`);
            return result;
        }, onSettled: async () => {
            closeModal();
        }
    });

    if (mutation.error) return <div className='ml-72 px-10 py-10 text-3xl'>Error Occured</div>

    return (
        <div className='absolute sm:w-96 w-72 border overflow-y-auto h-screen border-black/20 z-10 bg-white right-0 top-0' ref={ref}>
            <div className='flex flex-col gap-2'>
                <div className=' border-b border-b-black/20'>
                    <div className='flex justify-between py-4 px-8 '>
                        <p>Edit User Profile</p>
                        <IoCloseSharp onClick={closeModal} size={20} className='cursor-pointer' />
                    </div>
                </div>
                <div className='flex flex-col gap-2 px-10 flex-1 py-4'>
                    <InputFiled label={"Occupation"} req={false} val={data.userType} name={"occupation"} />
                    <InputFiled label={"Name"} req={false} val={userObj.name} name={"name"} setDataObj={setUsrObj} />
                    <InputFiled label={"Email"} req={false} val={userObj.email} name={"email"} setDataObj={setUsrObj} />
                    <InputFiled label={"Phone No."} req={false} val={userObj.phoneNumber} name={"phoneNumber"} setDataObj={setUsrObj} />
                    <InputFiled label={"Reference No"} req={false} val={userObj.referenceNo} name={"referenceNo"} setDataObj={setUsrObj} />

                    <label htmlFor="">Gender</label>
                    <select
                        name="gender"
                        value={userObj.gender || ""}
                        onChange={(e) => setUsrObj({ ...userObj, gender: e.target.value })}
                        className="border rounded px-3 py-2 w-full"
                    >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>

                    {data.userType == "student" &&
                        <>
                            <InputFiled label={"Roll No."} req={false} val={userObj.rollNo} name={"rollNo"} setDataObj={setUsrObj} />
                            {/* <InputFiled label={"Enroll In."} req={false} val={data.levelID} /> */}
                            <label className='font-medium'>Enroll in</label>
                            <select
                                value={userObj.levelID || ""}
                                onChange={(e) => setUsrObj({ ...userObj, levelID: e.target.value })}
                                className="border outline-none rounded-md border-black/20 px-4 w-full py-[8px]"
                            >
                                <option value="" disabled hidden>Enroll in</option>
                                {allLevels.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                            <InputFiled label={"Guardian Name"} req={false} val={userObj.guardianName} name={"guardianName"} setDataObj={setUsrObj} />
                            <InputFiled label={"Guardian Email"} req={false} val={userObj.guardianEmail} name={"guardianEmail"} setDataObj={setUsrObj} />
                            <InputFiled label={"Guardian Phone No."} req={false} val={userObj.guardianPhoneNumber} name={"guardianPhoneNumber"} setDataObj={setUsrObj} />
                        </>
                    }
                    <InputFiled label={"Password"} req={false} val={userObj.password} name={"password"} setDataObj={setUsrObj} type="password" />
                    <InputFiled label={"Confirm Password"} req={false} val={userObj.confirmPassword} name={"confirmPassword"} setDataObj={setUsrObj} type="password" />
                    {mutation.isPending && <div className='flex flex-1'><Loader /></div>}
                    {!mutation.isPending &&
                        <CustomButton label={"Update User"} btnClick={handleUpdateUser} />
                    }
                </div>
            </div>
        </div>
    )
}

export default EditUserModal

import React, { useRef, useState } from 'react'
import Loader from '../../../utils/Loader';
import IMAGES from '../../../assets/images';

import { toast } from 'react-toastify';
import { FaAsterisk } from 'react-icons/fa6';
import { IoCloseSharp } from "react-icons/io5";
import { uploadFile } from '../../../utils/FileUpload';
import { default_profile } from '../../../constants/api';
import { useAdmin } from '../../../context/AdminContext';
import { registerStudent } from '../../../api/Student/StudentApis';
import { experience, qualification } from '../../../constants/teacher';
import { emailPattern, namePattern, passwordPattern } from '../../../constants/pattern';
import useClickOutside from '../../../hooks/useClickOutlise';
import { useBlur } from '../../../context/BlurContext';

const CustomInput = ({ label, placeholder, type, required = false, name, defaultValue }) => {
    return (
        <div className="flex flex-col text-start py-1">
            <div className="flex flex-col gap-1">
                <div className="font-medium flex gap-1">
                    <p>{label}</p>
                    {required && (
                        <p className="font-normal">
                            <FaAsterisk size={6} color="red" className="mt-1" />
                        </p>
                    )}
                </div>
                <div>
                    <input
                        className="border outline-none rounded-md border-black/20 px-4 w-full py-[8px]"
                        required={required}
                        type={type}
                        placeholder={placeholder}
                        name={name}
                        defaultValue={defaultValue}
                        onChange={(e) => {
                            const formData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');
                            formData[name] = e.target.value;
                            localStorage.setItem('addUserFormData', JSON.stringify(formData));
                        }}
                    />
                </div>
            </div>
        </div>
    );
};


const Selectable = ({ label, role, setRole }) => {
    return (
        <div className='flex flex-col text-start py-1'>
            <div className='flex flex-col gap-1'>
                <div className='font-medium '>
                    {label}
                </div>
                <div>
                    <select value={role} onChange={(e) => {
                        setRole(e.target.value);
                        const formData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');
                        formData['role'] = e.target.value;
                        localStorage.setItem('addUserFormData', JSON.stringify(formData));
                    }} className='border outline-none rounded-md border-black/20 px-4 w-full py-[8px]'>
                        <option value="student">Student</option>
                        {/* <option value="parent">Parent</option> */}
                        <option value="teacher">Teacher</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

const LevelSelectable = ({ label, alllevels, defaultValue, name }) => {
    return (
        <div className='flex flex-col text-start py-1'>
            <div className='flex flex-col gap-1'>
                <div className='font-medium flex gap-1'>
                    <p>
                        {label}
                    </p>
                    <p className='font-normal'>
                        <FaAsterisk size={6} color='red' className='mt-1' />
                    </p>
                </div>
                <div>
                    <select
                        name={name}
                        defaultValue={defaultValue}
                        onChange={(e) => {
                            const formData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');
                            formData['levelID'] = e.target.value;
                            localStorage.setItem('addUserFormData', JSON.stringify(formData));
                        }}
                        className='border outline-none rounded-md border-black/20 px-4 w-full py-[8px]'>
                        <option value="">Enroll in</option>
                        {alllevels.map((item) => {
                            return <option key={item.id} value={JSON.stringify(item)}>{item.name}</option>
                        })}
                    </select>
                </div>
            </div>
        </div>
    )
}

const CustomSelectable = ({ label, options }) => {
    return (
        <div className='flex flex-col text-start py-1'>
            <div className='flex flex-col gap-1'>
                <div className='font-medium flex gap-1'>
                    <p>
                        {label}
                    </p>
                    <p className='font-normal'>
                        <FaAsterisk size={6} color='red' className='mt-1' />
                    </p>
                </div>
                <div>
                    <select className='border outline-none rounded-md border-black/20 px-4 w-full py-[8px]'>
                        <option value="">Select {label} </option>
                        {options.map((item) => {
                            return <option key={item} value={item}>{item}</option>
                        })}
                    </select>
                </div>
            </div>
        </div>
    )
}


const CustomFileSelector = ({ label }) => {
    return <div className="flex flex-col gap-2">
        <div className='flex gap-2 items-center'>

            <p className="font-semibold">{label}</p>
            <p className='font-normal'>
                <FaAsterisk size={6} color='red' className='mt-1' />
            </p>
        </div>
        <div className="flex border border-black/20 rounded-lg px-6 py-4 flex-col text-xs justify-center items-center">
            <input
                type="file"
                className="hidden"
                id="cv"
            />
            <label htmlFor="cv">
                <img
                    src={IMAGES.upload}
                    className="w-8 h-8 cursor-pointer"
                />
            </label>
            <p className="text-[#6A00FF] font-medium text-[10px] text-center">Click to Upload <span className='text-black font-normal'>drag and drop you CV</span> </p>
            <p className='text-[10px]'>PNG, JPG, Word or PDF</p>
        </div>
    </div>
}


const AddUserModal = ({ closeModal, refetch }) => {


    const { allLevels } = useAdmin();
    const [role, setRole] = useState(() => {
        const formData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');
        return formData.role || "student";
    });
    const [loading, setLoading] = useState(false);

    const initialFormData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');


    const ref = useRef(null); // Reference to the modal container
    const { toggleBlur } = useBlur(); // Access toggleBlur from the context

    // Use the hook with the modal's reference and callback function
    useClickOutside(ref, () => {
        // closeModal(); // Close the modal
        console.log("i am working");

    });


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const elements = e.target.elements;

        try {
            let dataBody = {};
            console.log("After form submit: ", e);

            if (role === "parent") {
                const password = elements.password.value;
                const confirmPassword = elements.confirmPassword.value;

                if (password.length < 6) return toast.error("Password must be at least 6 characters.");
                if (confirmPassword !== password) return toast.error("Password and Confirm Password do not match!");

                dataBody = {
                    role,
                    sName: elements.sName.value,
                    sID: elements.sID.value,
                    password: password,
                    profilePic: default_profile,
                };
            } else if (role === "student") {
                const name = elements.name.value;
                const email = elements.email.value;
                const guardianName = elements.guardianName.value;
                const guardianEmail = elements.guardianEmail.value;
                const password = elements.password.value;
                const confirmPassword = elements.confirmPassword.value;
                const levelDataRaw = elements.levelID.value;

                const isValidName = namePattern.test(name);
                const isValidEmail = emailPattern.test(email);
                const isValidGuardianName = namePattern.test(guardianName);
                const isValidGuardianEmail = emailPattern.test(guardianEmail);

                if (!isValidName) return toast.error("Name cannot have digits or special characters.");
                if (!isValidEmail) return toast.error("Invalid Email!");
                if (!isValidGuardianName) return toast.error("Guardian Name cannot have digits or special characters.");
                if (!isValidGuardianEmail) return toast.error("Invalid Guardian Email!");
                if (!levelDataRaw) return toast.error("Please select a level to enroll in.");
                if (password.length < 6) return toast.error("Password must be at least 6 characters.");
                if (confirmPassword !== password) return toast.error("Password and Confirm Password do not match!");

                const levelData = JSON.parse(levelDataRaw);

                dataBody = {
                    userType: role,
                    name,
                    email,
                    rollNo: elements.rollNo.value,
                    referenceNo: elements.referenceNo.value,
                    gender: elements.gender.value,
                    bio: elements.bio.value,
                    phoneNumber: elements.phoneNumber.value,
                    levelID: levelData.id,
                    isAccepted: true,
                    guardianName,
                    guardianEmail,
                    guardianPhoneNumber: elements.guardianPhoneNumber.value,
                    password,
                    profilePic: default_profile,
                };

                const response = await registerStudent(dataBody);
                console.log(response, "user response data");

                if (response?.id) {
                    toast.success("User added successfully!");
                    localStorage.removeItem('addUserFormData');
                    await refetch();
                    closeModal();
                } else {
                    throw new Error("Failed to register user.");
                }
            } else if (role === "teacher") {
                const name = elements.name.value;
                const email = elements.email.value;
                const password = elements.password.value;
                const confirmPassword = elements.confirmPassword.value;

                const isValidName = namePattern.test(name);
                const isValidEmail = emailPattern.test(email);

                if (!isValidName) return toast.error("Name cannot have digits or special characters.");
                if (!isValidEmail) return toast.error("Invalid Email!");
                if (password.length < 6) return toast.error("Password should be at least 6 characters.");
                if (password !== confirmPassword) return toast.error("Passwords do not match.");

                dataBody = {
                    userType: role,
                    name,
                    email,
                    bio: elements.bio.value,
                    phoneNumber: elements.phoneNumber.value,
                    referenceNo: elements.referenceNo.value,
                    isAccepted: true,
                    password: password,
                    profilePic: default_profile,
                };

                const response = await registerStudent(dataBody);
                if (response?.id) {
                    toast.success("User added successfully!");
                    localStorage.removeItem('addUserFormData');
                    await refetch();
                    closeModal();
                } else {
                    throw new Error("Failed to register user.");
                }
            }

        } catch (error) {
            console.error("Error during form submission:", error);
            toast.error(error.message || "Cannot add the user!");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className='absolute sm:w-96 w-80 border h-screen border-black/20 z-10 bg-white right-0 top-0'
        // ref={ref}
        >
            <div className='flex flex-col gap-2 h-full'>
                <div className=' border-b border-b-black/20'>
                    <div className='flex justify-between py-4 px-8'>
                        <p>Add User</p>
                        <IoCloseSharp onClick={closeModal} size={20} className='cursor-pointer' />
                    </div>
                </div>

                <div className='overflow-y-auto register-scrollbar'>
                    <div className='flex flex-col bg-white h-full px-2 sm:px-10 py-4'>
                        <form onSubmit={handleSubmit}>
                            <div className=''>
                                <Selectable label={"Occupation"} role={role} setRole={setRole} />
                                {role == "student" ?
                                    <>
                                        <CustomInput label={"Name"} type="text" placeholder={"Enter your Name"} required name="name" defaultValue={initialFormData.name} />
                                        <CustomInput label={"Email"} type="email" placeholder={"Enter your Email"} required name="email" defaultValue={initialFormData.email} />
                                        <CustomInput label={"Roll No"} type="text" placeholder={"Enter your Roll No"} required name="rollNo" defaultValue={initialFormData.rollNo} />
                                        <CustomInput label={"Reference No"} type="text" placeholder={"Enter your Reference No"} name="referenceNo" defaultValue={initialFormData.referenceNo} />

                                        <div className="flex flex-col">
                                            <label className="text-gray-700 font-medium">Gender</label>
                                            <select name="gender" className="border p-2 rounded-md" required defaultValue={initialFormData.gender} onChange={(e) => {
                                                const formData = JSON.parse(localStorage.getItem('addUserFormData') || '{}');
                                                formData['gender'] = e.target.value;
                                                localStorage.setItem('addUserFormData', JSON.stringify(formData));
                                            }}>
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <CustomInput label={"Bio"} type="text" placeholder={"Enter your Bio"} name="bio" defaultValue={initialFormData.bio} />
                                        <CustomInput label={"Phone no."} type="text" placeholder={"Enter your Phone Number"} required name="phoneNumber" defaultValue={initialFormData.phoneNumber} />
                                        <LevelSelectable label={"Enroll in"} alllevels={allLevels} defaultValue={initialFormData.levelID} name="levelID" />
                                        <CustomInput label={"Guardian Name"} type="text" placeholder={"Enter Guardian Name"} required name="guardianName" defaultValue={initialFormData.guardianName} />
                                        <CustomInput label={"Guardian Email"} type="email" placeholder={"Enter Guardian Email"} required name="guardianEmail" defaultValue={initialFormData.guardianEmail} />
                                        <CustomInput label={"Guardian Phone no."} type="text" placeholder={"Enter Guardian Phone no."} required name="guardianPhoneNumber" defaultValue={initialFormData.guardianPhoneNumber} />
                                        <CustomInput label={"Password"} type="password" placeholder={"Enter your Password"} required name="password" defaultValue={initialFormData.password} />
                                        <CustomInput label={"Confirm Password"} type="password" placeholder={"Confirm your Password"} required name="confirmPassword" defaultValue={initialFormData.confirmPassword} />
                                    </>
                                    : role == "parent" ? <>
                                        <CustomInput label={"Student Name"} type="text" placeholder={"Enter student Name"} required name="sName" defaultValue={initialFormData.sName} />
                                        <CustomInput label={"Student ID"} type="text" placeholder={"Enter student ID"} required name="sID" defaultValue={initialFormData.sID} />
                                        <CustomInput label={"Password"} type="password" placeholder={"Enter your Password"} required name="password" defaultValue={initialFormData.password} />
                                        <CustomInput label={"Confirm Password"} type="password" placeholder={"Confirm your Password"} required name="confirmPassword" defaultValue={initialFormData.confirmPassword} />
                                    </> :
                                        <>
                                            <CustomInput label={"Name"} type="text" placeholder={"Enter your Name"} required name="name" defaultValue={initialFormData.name} />
                                            <CustomInput label={"Email"} type="email" placeholder={"Enter your email"} required name="email" defaultValue={initialFormData.email} />
                                            <CustomInput label={"Bio"} type="text" placeholder={"Enter your Bio"} name="bio" defaultValue={initialFormData.bio} />
                                            <CustomInput label={"Phone"} type="text" placeholder={"Enter your phone no."} required name="phoneNumber" defaultValue={initialFormData.phoneNumber} />
                                            <CustomInput label={"Reference No"} type="text" placeholder={"Enter your Reference No"} name="referenceNo" defaultValue={initialFormData.referenceNo} />

                                            {/* <CustomSelectable label={"Qualification"} options={qualification} />
                                            <CustomFileSelector label={"CV"} />
                                            <CustomSelectable label={"Experience"} options={experience} /> */}
                                            <CustomInput label={"Password"} type="password" placeholder={"Enter your Password"} required name="password" defaultValue={initialFormData.password} />
                                            <CustomInput label={"Confirm Password"} type="password" placeholder={"Confirm your Password"} required name="confirmPassword" defaultValue={initialFormData.confirmPassword} />
                                        </>}

                            </div>
                            <div className='py-4 flex flex-col gap-2'>
                                {loading ?
                                    <>
                                        <div className='flex flex-1 '> <Loader /> </div>
                                    </>
                                    : (
                                        <button type='submit' className='flex self-center bg-[#6A00FF] text-white rounded-3xl py-2 px-4 justify-center items-center w-3/5 text-center cursor-pointer hover:bg-[#6A00FF]/90'>Add User</button>
                                    )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddUserModal

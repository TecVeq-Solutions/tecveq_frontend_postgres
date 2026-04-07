import React, { useEffect, useRef } from 'react'
import IMAGES from '../../../assets/images'
import LoaderSmall from '../../../utils/LoaderSmall';

import { MdOutlinePhone } from "react-icons/md";
import { useMutation } from '@tanstack/react-query';
import { acceptUser, rejectUser } from '../../../api/Admin/UsersApi';

const RequestModal = ({ refetch, data, onclose }) => {

    const modalRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onclose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onclose]);

    const handleAcceptUser = async (id) => {
        acceptMutation.mutate(id);
    }

    const handleRejectUser = async (id) => {
        rejectMutation.mutate(id)
    }

    const acceptMutation = useMutation({
        mutationKey: ["accept"], mutationFn: async (id) => {
            const results = await acceptUser(id);
            await refetch();
            return results;
        }, onSettled: () => {
            onclose();
        }
    })

    const rejectMutation = useMutation({
        mutationKey: ["accept"], mutationFn: async (id) => {
            const results = await rejectUser(id);
            await refetch();
            return results;
        }, onSettled: () => {
            onclose();
        }
    })

    const RequestComponent = ({ user, accept, reject }) => {
        return (
            <div className='border-b border-black/10'>
                <div className='flex items-center justify-center gap-4 py-4 px-4'>
                    <div>
                        <img src={IMAGES.ProfileSvg} alt="" className='h-10 w-10 rounded-3xl' />
                    </div>
                    <div className='flex flex-col gap-1 text-xs'>
                        <div className='flex items-center gap-2'>
                            <p className='font-medium text-lg'>{user.name} </p>
                            <p className='text-xs bg-[#0B1053] px-2 rounded-3xl text-white'>{user.userType}</p>
                        </div>
                        <div className='flex items-center gap-2'>
                            <MdOutlinePhone size={10} className='text-[#0B1053]' />
                            <p>{user.phoneNumber}</p>
                        </div>

                        <div className='flex items-center gap-2'>
                            <p onClick={() => accept(user.id)} className={`py-1 text-xs px-4 rounded-3xl bg-yellow_green_light/10 text-yellow_green_light cursor-pointer`}>Accept</p>
                            <p onClick={() => reject(user.id)} className={`py-1 text-xs px-4 rounded-3xl bg-[#e0e1fa] text-[#0B1053] cursor-pointer`}>Reject</p>
                        </div>

                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
            <div ref={modalRef} className='bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-black/20 relative p-4'>
            <div className=''>
                <div className='border-b border-black/10 py-2 flex items-center justify-center'>
                    <p>Request</p>
                </div>

                {(acceptMutation.isPending || rejectMutation.isPending) ? <div className='flex flex-1 justify-center'><LoaderSmall /> </div> :
                    <div className='h-72 overflow-y-auto register-scrollbar'>
                        {data.map((item) => {
                            if (item.isAccepted == false) {
                                if (item.userType !== "admin") {
                                    return <RequestComponent
                                        user={item}
                                        accept={handleAcceptUser}
                                        reject={handleRejectUser}
                                    />
                                }
                            }
                        })}
                        {data.filter((item) => {
                            if (item.isAccepted == false) {
                                if (item.userType !== "admin") {
                                    return item
                                }
                            }
                        }).length == 0 && <div className='text-center flex flex-1 py-2 justify-center text-black'>No pending users!</div>}
                    </div>
                }
            </div>
        </div>
    </div>
    )
}

export default RequestModal

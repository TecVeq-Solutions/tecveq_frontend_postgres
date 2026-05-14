import React, { useState, useRef } from 'react'
import IMAGES from '../../../assets/images';
import { IoSend } from "react-icons/io5";
import useClickOutside from '../../../hooks/useClickOutlise';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitFeedback } from '../../../api/Student/Feedback';
import { sendQuickMessage } from '../../../api/UserApis';
import { toast } from 'react-toastify';
import LoaderSmall from '../../../utils/LoaderSmall';

const TeacherMessageDialog = ({ handleFeedback, item }) => {
    const queryClient = useQueryClient();
    const [feedback, setFeedback] = useState("");
    const [msgText, setMsgText] = useState("");

    const handleSendMessage = async () => {
        if (!msgText.trim()) {
            toast.warning("Please enter a message.");
            return;
        }
        const teacherID = item?.teacher?.id || item?.teacherId;
        if (!teacherID) {
            toast.error("Teacher ID not found.");
            return;
        }
        let data = { message: msgText, receiverId: teacherID };
        const resp = await sendQuickMessage(data);
        return resp;
    }

    const messageMutation = useMutation({
        mutationKey: ["sendquickmessage"],
        mutationFn: handleSendMessage,
        onMutate: () => {
            const currentMsg = msgText;
            setMsgText("");
            return { currentMsg };
        },
        onSuccess: (data) => {
            if (data) {
                queryClient.invalidateQueries({ queryKey: ["chat"] });
                toast.success("Message sent successfully!");
                handleFeedback();
            }
        },
        onError: (error, variables, context) => {
            toast.error(error?.message || "Error sending message.");
            if (context?.currentMsg) setMsgText(context.currentMsg);
        }
    })

    const handleSendFeedback = async () => {
        if (!feedback.trim()) {
            toast.warning("Please enter feedback.");
            return;
        }
        const teacherID = item?.teacher?.id || item?.teacherId;
        if (!teacherID) {
            toast.error("Teacher ID not found.");
            return;
        }
        let data = { message: feedback, teacherID };
        const resp = await submitFeedback(data);
        return resp;
    }

    const feedbackMutation = useMutation({
        mutationKey: ["sendfeedback"],
        mutationFn: handleSendFeedback,
        onMutate: () => {
            const currentFeedback = feedback;
            setFeedback("");
            return { currentFeedback };
        },
        onSuccess: (data) => {
            if (data) {
                toast.success("Feedback submitted successfully!");
                handleFeedback();
            }
        },
        onError: (error, variables, context) => {
            toast.error(error?.message || "Error while submitting feedback.");
            if (context?.currentFeedback) setFeedback(context.currentFeedback);
        }
    })

    const dialogRef = useRef(null);
    useClickOutside(dialogRef, handleFeedback);

    return (
        <div ref={dialogRef} className='fixed z-10 flex py-4 bg-white rounded-lg shadow-lg top-40 w-72'>
            <div className='flex flex-col w-full'>
                <div className='flex items-center gap-4 px-5 py-4 border-b border-b-black/30'>
                    <img src={(item.teacher?.profile && item.teacher?.profile !== "null") ? item.teacher.profile : IMAGES.ProfileSvg} alt="" className='w-16 h-16 rounded-full object-cover' />
                    <div className='flex flex-col'>
                        <p className='font-medium text-black'>{item?.teacher?.name || "Teacher"}</p>
                        <p className='text-sm text-black/70'>Instructor</p>
                    </div>
                </div>
                <div className='flex flex-col items-center justify-center gap-3 py-2'>
                    <div className='flex w-full items-center justify-center gap-2'>
                        <input
                            type="text"
                            value={msgText}
                            onChange={(e) => setMsgText(e.target.value)}
                            className='w-4/5 px-2 py-1 rounded-md outline-none bg-[#919191]/10 text-black text-[12px]'
                            placeholder='Send Quick Message'
                        />
                        {messageMutation.isPending ? <LoaderSmall /> : (
                            <IoSend size={18} onClick={() => messageMutation.mutate()} className='cursor-pointer' color='#0B1053' />
                        )}
                    </div>
                    <div className='flex w-full items-center justify-center flex-row px-4 gap-2'>
                        <input
                            type="text"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className='px-2 py-1 w-full rounded-md outline-none bg-[#919191]/10 text-black text-[12px]'
                            placeholder='Enter Feedback'
                        />
                        {feedbackMutation.isPending ? <LoaderSmall /> : (
                            <IoSend size={20} onClick={() => feedbackMutation.mutate()} className='cursor-pointer' color='#0B1053' />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TeacherMessageDialog

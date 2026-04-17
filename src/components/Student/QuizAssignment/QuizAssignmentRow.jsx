import React, { useEffect, useState } from 'react';
import Loader from '../../../utils/Loader';
import IMAGES from '../../../assets/images/index';
import { ClipboardCheck, ClipboardCopy } from 'lucide-react';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitQiuz } from '../../../api/Student/Quiz';
import { uploadFile } from '../../../utils/FileUpload';
import { handleProfileImageUpdate } from '../../../utils/Admin/profileImageUtils';
import { formatDate } from '../../../constants/formattedDate';
import { submitAssignment } from '../../../api/Student/Assignments';
import { useUser } from '../../../context/UserContext';
import { useSidebar } from '../../../context/SidebarContext';
import { FiEdit } from 'react-icons/fi';
import ConfirmModal from './ConfirmModal';
import TakeQuizModal from './TakeQuizModal';

const QuizAssignmentRow = (props) => {

    const queryClient = useQueryClient();
    const [timePassed, setTimePassed] = useState(false);
    const [timeLeft, setTimeLeft] = useState('');
    const [isUploaded, setIsUploadded] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFileUrl, setUploadedFileUrl] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isTakeQuizModalOpen, setIsTakeQuizModalOpen] = useState(false);
    const { isSidebarOpen } = useSidebar();

    const { userData } = useUser();

    const quizAssignmentMutation = useMutation({
        mutationKey: ["quizAssignment"], mutationFn: async ({ fileUrl, answers }) => {
            if (!fileUrl && !answers) throw new Error("No data provided");

            let results;
            if (props.isQuiz) {
                results = await submitQiuz({ file: fileUrl, answers }, props.alldata.id)
            } else {
                results = await submitAssignment({ file: fileUrl }, props.alldata.id)
            }
            return results;
        }, onSettled: (data, error) => {
            if (!error) {
                toast.success("Uploaded successfully!");
                setIsUploadded(true);
                queryClient.invalidateQueries(["assignment"]);
                queryClient.invalidateQueries(["quiz"]);
                queryClient.invalidateQueries(["reports"]);
                queryClient.invalidateQueries(["report"]);
                queryClient.invalidateQueries(["studentReports"]);
                queryClient.invalidateQueries(["teacherStudets"]);
                queryClient.invalidateQueries(["student-assignments-quizes"]);
            }
        }
    })

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setShowConfirmModal(true);
        // Reset file input value so same file can be selected again if cancelled
        event.target.value = '';
    };

    const handleConfirmUpload = async () => {
        if (!selectedFile) return;
        
        setShowConfirmModal(false);
        await handleProfileImageUpdate(
            selectedFile,
            (url) => {
                console.log("Submission Cloudinary URL:", url);
                setUploadedFileUrl(url);
                quizAssignmentMutation.mutate({ fileUrl: url });
            },
            setIsUploading
        );
    };

    const handleCompleteQuiz = async (answers) => {
        quizAssignmentMutation.mutate({ answers });
    };

    const compareDateAndTime = (dateTimeString) => {
        const eventDateTime = new Date(dateTimeString);
        const currentDateTime = new Date();

        if (eventDateTime < currentDateTime) {
            setTimePassed(true);
        } else {
            setTimePassed(false);
            const difference = eventDateTime - currentDateTime;
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / (1000 * 60)) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        }
    };

    useEffect(() => {

        props?.alldata?.submissions?.map((item) => {
            if (item?.studentID === userData?.id) {
                setIsUploadded(true);
            }
        })

        const formattedDateTimeString = props.deadline
            .replace(/(\d+)(st|nd|rd|th)/, '$1')
            .replace(',', '')
            .replace(/(\d+)([ap]m)$/i, (match, p1, p2) => `${p1} ${p2.toUpperCase()}`);

        compareDateAndTime(formattedDateTimeString);

        const intervalId = setInterval(() => {
            compareDateAndTime(formattedDateTimeString);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [props.deadline]);


    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(props.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <>
            <div className='min-w-full'>
                <div className='border-b border-grey md:py-5 py-2 md:pl-3 md:pr-5'>
                    <div style={{ backgroundColor: props.bgColor }} className={`flex flex-row items-center px-1 mt-2 space-x-3`}>

                        {/* Index */}
                        <p className={`flex-[1] md:text-[14px] sm:text-[11px] text-[9px] text-center ${props.header ? 'font-semibold' : ''}`}>
                            {props.index + "."}
                        </p>

                        {/* Subject */}
                        <p className={`flex-[3] my-1 md:my-0 text-center md:text-[14px] sm:text-[11px] text-[9px] ${props.header ? 'font-semibold' : ''}`}>
                            {props.subject}
                        </p>

                        {/* Title */}
                        <p className={`flex-[3] my-1 md:my-0 text-center md:text-[14px] sm:text-[11px] text-[9px] ${props.header ? 'font-semibold' : ''}`}>
                            {props.title}
                        </p>

                        {/* Deadline */}
                        <p className={`flex-[3] my-1 md:my-0 text-center md:text-[14px] sm:text-[11px] text-[9px] ${props.header ? 'font-semibold' : ''}`}>
                            {props.header ? props.deadline : formatDate(props.deadline)}
                        </p>

                        {/* Total Marks */}
                        <p className={`flex-[3] my-1 md:my-0 text-center md:text-[14px] sm:text-[11px] text-[9px] ${props.header ? 'font-semibold' : ''}`}>
                            {props.total_marks}
                        </p>

                        {/* Download */}
                        <div className={`flex-[3] my-1 md:my-0 flex items-center justify-center`}>
                            {props.header ? (
                                <p className={`md:text-[14px] sm:text-[11px] text-[9px] font-semibold`}>Download</p>
                            ) : (
                                <>
                                    {props?.download ? (
                                        <a href={props?.download} download target='_blank' rel="noopener noreferrer">
                                            <img src={IMAGES.Download} alt='' className='md:w-[18px] cursor-pointer md:h-[18px] w-[16px] h-[16px]' />
                                        </a>
                                    ) : (
                                        <span className="text-[10px] text-gray-400">No File</span>
                                    )}
                                </>
                            )}
                        </div>

                        <div className={`flex-[2] my-1 md:my-0 flex items-center justify-center`}>
                            {props.header ? (
                                <p className={`md:text-[14px] sm:text-[11px] text-[9px] font-semibold`}>Action</p>
                            ) : (
                                !isUploaded ? (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        {(quizAssignmentMutation.isPending || isUploading) && <div><Loader /></div>}
                                        {!quizAssignmentMutation.isPending && !isUploading && (
                                            <>
                                                {props.isQuiz && props.alldata?.questions?.length > 0 ? (
                                                    <button 
                                                        onClick={() => setIsTakeQuizModalOpen(true)}
                                                        className='bg-emerald-500 hover:bg-emerald-600 cursor-pointer rounded-xl flex items-center justify-center py-1 text-white md:text-[14px] text-[11px] px-2 sm:px-4 font-bold shadow-sm transition-all'
                                                    >
                                                        Take Quiz
                                                    </button>
                                                ) : (
                                                    <label htmlFor={`upload-${props.id}`} className='bg-[#6A00FF] cursor-pointer rounded-xl flex items-center justify-center py-1 text-white md:text-[14px] text-[11px] px-2 sm:px-4'>
                                                        Upload
                                                        <input id={`upload-${props.id}`} onChange={handleFileChange} type="file" className='hidden' />
                                                    </label>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className='flex justify-center items-center gap-1 sm:gap-2'>
                                        <div className='bg-emerald-50 text-emerald-600 font-bold border border-emerald-100 rounded-3xl flex items-center justify-center sm:py-2 sm:px-3 py-1 px-2 text-[10px] md:text-sm shadow-sm uppercase tracking-tight'>
                                            Completed
                                        </div>
                                        {(!props.isQuiz || props.alldata?.questions?.length === 0) && (
                                            <label htmlFor={`upload-${props.id}`} className="cursor-pointer text-[#6A00FF] hover:text-blue-600">
                                                <FiEdit size={18} />
                                                <input id={`upload-${props.id}`} onChange={handleFileChange} type="file" className='hidden' />
                                            </label>
                                        )}
                                    </div>
                                )
                            )}
                        </div>

                    </div>

                    {/* Text Assignment Section */}
                    <div className={`mt-4 relative ${isSidebarOpen ? "-z-50" : "z-auto"}`}>
                        {props.text && (
                            <>
                                <h1 className='font-semibold text-xl'>Text Assignment</h1>
                                <div className="max-h-[80px] overflow-y-scroll scrollbar-hide pr-2 text-gray-700 bg-gray-100 p-2 rounded relative">
                                    {props.text}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className="absolute top-1 right-1 text-xs bg-[blue] hover:bg-[blue] text-white px-2 py-1 rounded transition-all"
                                >
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </>
                        )}
                    </div>

                </div>

                {/* Quiz Timer / Submitted Badge */}
                {
                    props.isQuiz && !props.header && (
                        !isUploaded ? (
                            <div className='flex flex-row items-center justify-end'>
                                {timePassed ? (
                                    <div className='bg-[#A41D30]/10 rounded-xl flex items-center justify-center py-1 px-2 text-[#0B1053] md:text-[10px] text-[8px]'>
                                        Time Up!
                                    </div>
                                ) : (
                                    <div className='flex flex-row items-center justify-end'>
                                        <div className='bg-[#A41D30]/10 rounded-xl flex items-center justify-center py-1 px-2 text-[#0B1053] md:text-[10px] text-[8px]'>
                                            {timeLeft}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className='flex flex-row items-center justify-end'>
                                <div className='bg-[#108206]/10 rounded-xl flex items-center justify-center py-1 px-2 text-[#108206] md:text-[10px] text-[8px]'>
                                    Submitted On Time!
                                </div>
                            </div>
                        )
                    )
                }

            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                title={`Confirm Submission`}
                description={`Are you sure you want to submit this ${props.isQuiz ? 'Quiz' : 'Assignment'}? once submitted you can still change it but teacher would see both.`}
                onConfirm={handleConfirmUpload}
                onCancel={() => {
                    setShowConfirmModal(false);
                    setSelectedFile(null);
                }}
            />

            <TakeQuizModal 
                isOpen={isTakeQuizModalOpen}
                onClose={() => setIsTakeQuizModalOpen(false)}
                quiz={props.alldata}
                onComplete={handleCompleteQuiz}
            />
        </>
    )
}

export default QuizAssignmentRow

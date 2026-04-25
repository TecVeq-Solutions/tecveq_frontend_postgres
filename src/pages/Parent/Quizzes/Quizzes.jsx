
import React, { useEffect, useState } from 'react'
import Sidebar from '../../../components/Student/Sidebar/Sidebar'
import QuizAssignmentRow from '../../../components/Parent/QuizAssignment/QuizAssignmentRow'
import DataRows from '../../../components/Parent/Reports/DataRows'
import IMAGES from '../../../assets/images'
import { useBlur } from '../../../context/BlurContext'
import ProfileMenu from '../../../components/Parent/Dashboard/ProfileMenu'
import ProfileDetails from '../../../components/Parent/Dashboard/ProfileDetails'
import Notifications from '../../../components/Parent/Dashboard/Notifications'
import { useNavigate } from 'react-router-dom'
import { useParent } from '../../../context/ParentContext'
import { useQuery } from '@tanstack/react-query'
import { getAllSubjects } from '../../../api/Parent/ParentApi'
import Navbar from '../../../components/Parent/Dashboard/Navbar'

const Quizzes = () => {
    const [mail, setmail] = useState(false);
    const [bell, setBell] = useState(false);
    const [isProfileMenu, setIsProfileMenu] = useState(false);
    const [isProfileDetails, setIsProfileDetails] = useState(false);

    const { isBlurred, toggleBlur } = useBlur();

    const toggleProfielMenu = () => {
        setIsProfileMenu(!isProfileMenu);
        setmail(false);
        setBell(false);
    };

    const toggleMail = () => {
        setmail(!mail);
        setIsProfileMenu(false);
        setBell(false);
    };

    const togglebell = () => {
        setBell(!bell);
        setmail(false);
        setIsProfileMenu(false);
    };

    const toggleProfileDetails = () => {
        toggleBlur();
        setIsProfileDetails(!isProfileDetails);
    };

    const onProfileClick = () => {
        toggleProfielMenu();
        toggleProfileDetails();
    };

    const navigate = useNavigate();
    const onLineClick = () => {
        navigate(`/parent/quizzes/reports`)
    }

    const onSettingsClick = () => { };
    const onLogoutClick = () => { };


    const reports = [
        {
            subject: "Mathematics",
            instructor: "John Smith",
            attendance: "70%",
        },
        {
            subject: "English",
            instructor: "John Smith",
            attendance: "70%",
        },
        {
            subject: "Urdu",
            instructor: "John Smith",
            attendance: "70%",
        },
        {
            subject: "Chemistry",
            instructor: "John Smith",
            attendance: "70%",
        },
        {
            subject: "Biology",
            instructor: "John Smith",
            attendance: "70%",
        },
        {
            subject: "Islamiyat",
            instructor: "John Smith",
            attendance: "70%",
        },
        {
            subject: "History",
            instructor: "John Smith",
            attendance: "70%",
        },
    ];

    const handleFunctionClick = (report) => {
        navigate(`/parent/quizes/reports`, { state: report });
    };

    const [enableQuery, setEnableQuery] = useState(false);

    const { allSubjects, setAllSubjects, selectedChild } = useParent();

    const subjectQuery = useQuery({
        queryKey: ["subjects"], queryFn: async () => {
            const results = await getAllSubjects(selectedChild.id);
            setAllSubjects(results);
            return results
        }, staleTime: 300000, enabled: enableQuery
    });

    useEffect(() => {
        if (allSubjects.length == 0) {
            setEnableQuery(true);
        }
    }, []);

    return (
        <div className="flex flex-1 bg-[#F9F9F9] font-poppins">
            <div className="flex flex-1">
                <div className='w-full  h-screen lg:px-14 sm:px-10 px-3 flex-grow lg:ml-72'>
                    <Navbar heading={"Quizzes"} />
                    <div className={`w-full ${isBlurred ? "blur" : ""} h-screen px-0 sm:px-3 flex-grow`}>
                        <div className='mt-4 sm:mt-8 h-[80%] overflow-auto'>
                            <DataRows index={"Sr. No"} subject={"Subject"} instructor={"Instructor"} attendance={"Attendance"} bgColor={"#F9F9F9"} header={true} />
                            {
                                allSubjects?.subjects && allSubjects?.subjects.length > 0 ? (
                                    allSubjects.subjects.map((report, index) => (
                                        <DataRows
                                            key={index}
                                            index={index + 1}
                                            subject={report.subject.name}
                                            instructor={report.teacher.name}
                                            attendance={report?.avgAttendancePer}
                                            bgColor={"#FFFFFF"}
                                            header={false}
                                            onClickFunction={() => handleFunctionClick(report)}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center text-2xl font-semibold text-gray-500 py-4">
                                        No Quizzes Found
                                    </div>
                                )
                            }

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Quizzes;

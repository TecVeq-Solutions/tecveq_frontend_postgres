import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';

import { useQuery } from '@tanstack/react-query';
import { getAllQiuzes } from '../api/Student/Quiz';
import { getChildAssignments } from '../api/Parent/ParentApi';
import { getAllAnnouncements, getAllClasses } from '../api/ForAllAPIs';

const ParentContext = createContext();

export const useParent = () => useContext(ParentContext);

export const ParentProvider = ({ children }) => {

    const [allQuizes, setAllQuizes] = useState([]);
    const [allClasses, setAllClasses] = useState([]);
    const [allSubjects, setAllSubjects] = useState([]);
    const [allAssignments, setAllAssignments] = useState([]);
    const [parentLogedIn, setParentLogedIn] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [allAnnouncements, setAllAnnouncements] = useState([]);
    const [meetingStart, setMeetingStart] = useState({ start: false, event: null });

    const { userData } = useUser();

    // const announcementQuery = useQuery({
    //     queryKey: ["announcements"], queryFn: async () => {
    //         const results = await getAllAnnouncements();
    //         setAllAnnouncements(results.filter((item) => item.visibility == "student" || item.visibility == "all"));
    //         return results
    //     }, staleTime: 300000, enabled: parentLogedIn
    // });

    const assignmentQuery = useQuery({
        queryKey: ["assignment", selectedChild?.id], queryFn: async () => {
            const results = await getChildAssignments(selectedChild?.id);
            if (results?.assignments) setAllAssignments(results.assignments);
            if (results?.quizzes) setAllQuizes(results.quizzes);
            return results;
        }, staleTime: 300000, enabled: parentLogedIn && !!selectedChild?.id
    });

    const quizQuery = useQuery({
        queryKey: ["quiz"], queryFn: async () => {
            const results = await getAllQiuzes();
            return results;
        }, staleTime: 300000, enabled: parentLogedIn
    });

    useEffect(() => {
        if (assignmentQuery.isSuccess) {
            if (assignmentQuery.data?.assignments) setAllAssignments(assignmentQuery.data.assignments);
            if (assignmentQuery.data?.quizzes) setAllQuizes(assignmentQuery.data.quizzes);
        }
    }, [assignmentQuery.isSuccess, assignmentQuery.data]);

    // useEffect(() => {
    //     if (quizQuery.isSuccess) {
    //         setAllQuizes(quizQuery.data);
    //     }
    // }, [quizQuery.isSuccess, quizQuery.data]);

    useEffect(() => {
        let child = localStorage.getItem("selectedChild");
        
        if (child != null && userData?.userType === "parent") {
            setSelectedChild(JSON.parse(child));
            setParentLogedIn(true);
        } else {
            // Ensure parent mode is off for other roles
            setParentLogedIn(false);
            if (userData?.userType !== "parent" && userData !== null) {
                // Optional: clear selectedChild if switching to teacher/admin
                // localStorage.removeItem("selectedChild");
            }
        }
    }, [userData])

    useEffect(() => {
        //console.log("parse dataa is is success", selectedChild);
    }, [selectedChild]);

    return (
        <ParentContext.Provider value={{
            parentLogedIn,
            setParentLogedIn,
            
            allSubjects, 
            setAllSubjects,
            
            allAssignments,
            setAllAssignments,
            allQuizes,
            setAllQuizes,
            assignmentRefetch: assignmentQuery.refetch,
            assignmentIsPending: assignmentQuery.isPending,

            selectedChild,
            setSelectedChild
        }}>
            {children}
        </ParentContext.Provider>
    );
};

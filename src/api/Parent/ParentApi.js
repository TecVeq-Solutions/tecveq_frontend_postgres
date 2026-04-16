import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";

axios.defaults.withCredentials = true;

// under dev
export const getAllAssignmentsOfChild = apiRequest(async () => {
    // const url = `${BACKEND_URL}//single`;
    const url = `${BACKEND_URL}/parent/single`;
    const response = await axios.get(url);
    return response;
})

export const getChildReport = apiRequest(async (sid, cid, subid, tid) => {
    const url = `${BACKEND_URL}/parent/student-report/${sid}?classroomID=${cid}&&subjectID=${subid}&&teacherID=${tid}`;
    const response = await axios.get(url);
    return response;
})

// export const getChildAssignments = apiRequest(async (sid) => {
//     const url = `${BACKEND_URL}/parent/child-assignments/${sid}`;
//     const response = await axios.get(url);
//     return response;
// })

export const getChildAssignments = apiRequest(async (sid) => {
    const token = localStorage.getItem('token'); // or wherever you store it
    const url = `${BACKEND_URL}/parent/child-assignments/${sid}`;
    const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return response;
})

export const getChildLastDeliveredAssignmentReport = apiRequest(async (sid) => {
    const url = `${BACKEND_URL}/parent/student-last-delivered-assignment-report/${sid}`;
    const response = await axios.get(url);
    return response;
})

export const getAllChildren = apiRequest(async (mail) => {
    const url = `${BACKEND_URL}/parent/children/${mail}`;
    const response = await axios.get(url);
    return response;
})


export const getAllSubjects = apiRequest(async (id) => {
    const url = `${BACKEND_URL}/parent/student-subjects/${id}`;
    const response = await axios.get(url);
    return response;
})


export const getTeachersForChat = apiRequest(async() =>{
    const url = `${BACKEND_URL}/chatroom/chat/teachers`
    const response = await axios.get(url);
    return response;
})

export const getParentChatrooms = apiRequest(async () => {
    // Calling the optional studentID endpoint without a studentID
    const url = `${BACKEND_URL}/parent/chats/all`; 
    const response = await axios.get(url);
    return response;
})


export const getChildFees = apiRequest(async (sid) => {
    const url = `${BACKEND_URL}/fees/student/${sid}`;
    return await axios.get(url);
})


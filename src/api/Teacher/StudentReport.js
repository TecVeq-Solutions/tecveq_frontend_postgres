import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";

axios.defaults.withCredentials = true;


export const getAllStudentsOfTeacher = apiRequest(async () => {
    const url = `${BACKEND_URL}/user/students-of-teacher`;
    const response = await axios.get(url);
    return response;
})

export const getMyStudentsForReport = apiRequest(async () => {
    const url = `${BACKEND_URL}/user/teacher/my-students-for-report`;
    const response = await axios.get(url);
    return response;
});

export const getMyTeacherStudentSubjects = apiRequest(async (studentId) => {
    const url = `${BACKEND_URL}/user/teacher/my-student-subjects/${studentId}`;
    const response = await axios.get(url);
    return response;
});

export const getStudentReport = apiRequest(async (id, clid, subid) => {
    const url = `${BACKEND_URL}/user/student-report/${id}?classroomID=${clid}&subjectID=${subid}`;
    const response = await axios.get(url);
    return response;
})

import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";

axios.defaults.withCredentials = true;

// export const logout = async () => {
//     const url = `${BACKEND_URL}/user/logout`
//     try {
//         const response = await axios.get(url);
//         return response?.data;
//     } catch (error) {
//         console.log(`error on url: ${url} is : `, error);
//         return "error"
//     }
// }


export const logout = apiRequest(async () => {
    const url = `${BACKEND_URL}/user/logout`
    const response = await axios.get(url);
    return response;
});

export const getStudentCompleteProfile = apiRequest(async (studentID) => {
    const url = `${BACKEND_URL}/user/student-profile/${studentID}`;
    const response = await axios.get(url);
    return response;
});

export const addStudentNote = apiRequest(async (data) => {
    const url = `${BACKEND_URL}/user/student-note`;
    const response = await axios.post(url, data);
    return response;
});

export const addDisciplineRecord = apiRequest(async (data) => {
    const url = `${BACKEND_URL}/discipline`;
    const response = await axios.post(url, data);
    return response;
});


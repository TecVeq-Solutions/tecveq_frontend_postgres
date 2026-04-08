// FOR ADMIN GENERAL DATA

import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
axios.defaults.withCredentials = true;

export const getAllStudents = apiRequest(async () => await axios.get(`${BACKEND_URL}/user/students`));


export const getAllUsers = apiRequest(async () => {
    const url = `${BACKEND_URL}/user`
    const response = await axios.get(url);
    return response;
})

export const getAllAdmins = apiRequest(async () => {
    const url = `${BACKEND_URL}/user/admins`
    const response = await axios.get(url);
    return response;
})



export const useGetAllStudentsWithLevel = (levelId) => {
    const { data: studentWithLevel = [], isLoading, isFetching } = useQuery({
        queryKey: ['fetchStudentsWithLevel', levelId],
        queryFn: async () => {
            const url = `${BACKEND_URL}/user/students-with-level/${levelId}`;
            const { data, status } = await axios.get(url);
            if (status !== 200) throw new Error('Failed to fetch students');
            return data;
        },
        enabled: !!levelId,
        staleTime: 5 * 60 * 1000,   // treat data fresh for 5 min (no refetch on re-focus)
        gcTime: 10 * 60 * 1000,     // keep in cache for 10 min after unmount
        placeholderData: [],         // show empty list instantly while loading
        retry: 2,
    });

    return { studentWithLevel, isLoading, isFetching };
};

export const getAllTeachers = apiRequest(async () => {
    const url = `${BACKEND_URL}/user/admin/teachers`
    const response = await axios.get(url);
    return response;
})


export const getStudentReport = apiRequest(async (sId) => {
    const url = `${BACKEND_URL}/user/student-reports-admin/${sId}`
    const response = await axios.get(url);
    return response;
})

// export const getStudentReport = async (sId) => {
//     const url = `${BACKEND_URL}/user/student-reports-admin/${sId}`
//     try {
//         const response = await axios.get(url);
//         return response?.data;
//     } catch (error) {
//         console.log(`error on url: ${url} is : `, error);
//         toast.error(error?.response?.data)
//         return "error"
//     }
// }




export const getStudentSubjectReport = apiRequest(async (sId, subid) => {
    const url = `${BACKEND_URL}/user/student-assignments-quizes/${sId}/${subid}`
    const response = await axios.get(url);
    return response;
})


// export const getStudentSubjectReport = async (sId, subid) => {
//     const url = `${BACKEND_URL}/user/student-assignments-quizes/${sId}/${subid}`
//     try {
//         const response = await axios.get(url);
//         return response?.data;
//     } catch (error) {
//         console.log(`error on url: ${url} is : `, error);
//         return "error"
//     }
// }



export const adminLogout = apiRequest(async () => {
    const url = `${BACKEND_URL}/user/logout`
    const response = await axios.get(url);
    return response;
})


// export const adminLogout = async () => {
//     const url = `${BACKEND_URL}/user/logout`
//     try {
//         const response = await axios.get(url);
//         return response?.data;
//     } catch (error) {
//         console.log(`error on url: ${url} is : `, error);
//         toast.error(error?.response?.data);
//         return "error"
//     }
// }

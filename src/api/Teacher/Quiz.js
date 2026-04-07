import axios from "axios";
import apiRequest from "../../utils/ApiRequest";

import { toast } from "react-toastify";
import { BACKEND_URL } from "../../constants/api";


axios.defaults.withCredentials = true;

export const getAllQuizes = apiRequest(async () => {
    const url = `${BACKEND_URL}/quiz/all/teacher`;
    const response = await axios.get(url);
    return response;
})

export const getQuizById = apiRequest(async (id) => {
    const url = `${BACKEND_URL}/quiz/${id}`;
    const response = await axios.get(url);
    return response;
});

export const createQuiz = apiRequest(async (data) => {
    const url = `${BACKEND_URL}/quiz/`
    const response = await axios.post(url, data);
    return response;
});

// export const createQuiz = async (data) => {
//     const url = `${BACKEND_URL}/quiz/`
//     try {
//         const response = await axios.post(url, data);
//         toast.success(`Quiz created successfully!`);
//         return response?.data;
//     } catch (error) {
//         console.log(`error on url: ${url} is : `, error);
//         toast.error(error?.response?.data)
//         return "error"
//     }
// }

// export const deleteQuiz = async (id) => {
//     const url = `${BACKEND_URL}/quiz/${id}`
//     try {
//         const response = await axios.delete(url);
//         return response?.data;
//     } catch (error) {
//         console.log(`error on url: ${url} is : `, error);
//         toast.error(error?.response?.data)
//         return "error"
//     }
// }

export const deleteQuiz = apiRequest(async (id) => {
    const url = `${BACKEND_URL}/quiz/${id}`
    const response = await axios.delete(url);
    return response;
});


// export const editQuiz = async (data, id) => {
//     const url = `${BACKEND_URL}/quiz/${id}`
//     try {
//         const response = await axios.put(url, data);
//         return response?.data;
//     } catch (error) {
//         console.log(`error on url: ${url} is : `, error);
//         toast.error(error?.response?.data)
//         return "error"
//     }
// }


export const editQuiz = apiRequest(async (data, id) => {
    const url = `${BACKEND_URL}/quiz/${id}`
    const response = await axios.put(url, data);
    return response;
});




export const getMultipleQuizesForGrading = apiRequest(async (aId) => {
    const url = `${BACKEND_URL}/quiz/submissions/${aId}`
    const response = await axios.get(url);
    return response;
})

export const gradeQuizes = apiRequest(async (data, id) => {
    const url = `${BACKEND_URL}/quiz/grade/${id}`
    const response = await axios.post(url, data);
    return response;
})

export const checkQuizPlagiarism = apiRequest(async (id) => {
    const url = `${BACKEND_URL}/quiz/check-plagiarism/${id}`;
    const response = await axios.get(url);
    return response;
});

export const checkSingleQuizSubmission = apiRequest(async (quizID, studentID) => {
    const url = `${BACKEND_URL}/quiz/check-submission/${quizID}/${studentID}`;
    const response = await axios.get(url);
    return response;
});

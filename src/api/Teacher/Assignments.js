import axios from "axios";
import apiRequest from "../../utils/ApiRequest";

import { BACKEND_URL } from "../../constants/api";


axios.defaults.withCredentials = true;


export const getAllAssignments = apiRequest(async () => {
    const url = `${BACKEND_URL}/assignment/all/teacher`
    const response = await axios.get(url);
    return response;
});

export const getAssignmentById = apiRequest(async (id) => {
    const url = `${BACKEND_URL}/assignment/${id}`;
    const response = await axios.get(url);
    return response;
});


export const createAssignment = apiRequest(async (data) => {
    const url = `${BACKEND_URL}/assignment/`
    const response = await axios.post(url, data);
    return response;
});


export const deleteAssignments = apiRequest(async (id) => {
    const url = `${BACKEND_URL}/assignment/${id}`
    const response = await axios.delete(url);
    return response;
});

export const editAssignment = apiRequest(async (data, id) => {
    const url = `${BACKEND_URL}/assignment/${id}`
    const response = await axios.put(url, data);
    return response;
});


export const getMultipleAssignmentsForGrading = apiRequest(async (aId) => {
    const url = `${BACKEND_URL}/assignment/submissions/${aId}`
    const response = await axios.get(url);
    return response;
})

export const gradeAssignments = apiRequest(async (data, id) => {
    const url = `${BACKEND_URL}/assignment/grade/${id}`
    const response = await axios.post(url, data);
    return response;
})


export const checkAssignmentPlagiarism = apiRequest(async (id) => {
    const url = `${BACKEND_URL}/assignment/check-plagiarism/${id}`;
    const response = await axios.get(url);
    return response;
});

export const checkSingleAssignmentSubmission = apiRequest(async (assignmentID, studentID) => {
    const url = `${BACKEND_URL}/assignment/check-submission/${assignmentID}/${studentID}`;
    const response = await axios.get(url);
    return response;
});

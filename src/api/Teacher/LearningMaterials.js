import axios from "axios";
import apiRequest from "../../utils/ApiRequest";
import { BACKEND_URL } from "../../constants/api";

axios.defaults.withCredentials = true;

export const getTeacherMaterials = apiRequest(async (page = 1, limit = 10) => {
    const url = `${BACKEND_URL}/learning-material/teacher?page=${page}&limit=${limit}`;
    const response = await axios.get(url);
    return response;
});

export const getTeacherMaterialById = apiRequest(async (id) => {
    const url = `${BACKEND_URL}/learning-material/teacher/${id}`;
    const response = await axios.get(url);
    return response;
});

export const getStudentMaterials = apiRequest(async (subjectId, classId) => {
    let url = `${BACKEND_URL}/learning-material/student`;
    if (subjectId && classId) {
        url += `?subjectId=${subjectId}&classId=${classId}`;
    }
    const response = await axios.get(url);
    return response;
});

export const createMaterial = apiRequest(async (data) => {
    const url = `${BACKEND_URL}/learning-material/`;
    const response = await axios.post(url, data);
    return response;
});

export const updateMaterial = apiRequest(async (id, data) => {
    const url = `${BACKEND_URL}/learning-material/${id}`;
    const response = await axios.put(url, data);
    return response;
});

export const deleteMaterial = apiRequest(async (id) => {
    const url = `${BACKEND_URL}/learning-material/${id}`;
    const response = await axios.delete(url);
    return response;
});

export const publishMaterial = apiRequest(async (id, status) => {
    const url = `${BACKEND_URL}/learning-material/${id}/status`;
    const response = await axios.patch(url, { status });
    return response;
});

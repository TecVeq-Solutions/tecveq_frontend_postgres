import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";

axios.defaults.withCredentials = true;

export const getAllSubjects = apiRequest(async (id, all = false) => {
    const url = `${BACKEND_URL}/user/student-subjects/${id}?all=${all}`;
    const response = await axios.get(url);
    return response;
})

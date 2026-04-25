import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";

axios.defaults.withCredentials = true;

export const getAllAssignments = apiRequest(async () =>{
    const url = `${BACKEND_URL}/assignment/all/student`;
    const response = await axios.get(url);
    return response;
})

export const submitAssignment = apiRequest(async (data,id) =>{
    const url = `${BACKEND_URL}/assignment/submit/${id}`;
    const response = await axios.post(url, data);
    return response;
})

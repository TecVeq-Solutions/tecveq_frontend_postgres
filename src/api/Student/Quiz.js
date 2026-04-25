import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";

axios.defaults.withCredentials = true;

export const getAllQiuzes = apiRequest(async () =>{
    const url = `${BACKEND_URL}/quiz/all/student`;
    const response = await axios.get(url);
    return response;
})

export const submitQiuz = apiRequest(async (data, id) =>{
    const url = `${BACKEND_URL}/quiz/submit/${id}`;
    const response = await axios.post(url, data);
    return response;
})

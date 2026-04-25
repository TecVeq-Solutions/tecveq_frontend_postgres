import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";

axios.defaults.withCredentials = true;

export const getAllClasses = apiRequest(async(a) =>{

    let endDate = new Date();
    let startDate = new Date();
    endDate.setDate(endDate.getDate() + 8);

    const url = `${BACKEND_URL}/class?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    // const url = `${BACKEND_URL}/class/`;
    const response = await axios.get(url);
    return response;
})

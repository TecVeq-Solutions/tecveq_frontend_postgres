import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";

axios.defaults.withCredentials = true;

export const getSuperAdminStats = apiRequest(async () => {
    const url = `${BACKEND_URL}/superadmin/stats`;
    const response = await axios.get(url);
    return response;
});

export const getPlatformFees = apiRequest(async () => {
    const url = `${BACKEND_URL}/superadmin/payments`;
    const response = await axios.get(url);
    return response;
});

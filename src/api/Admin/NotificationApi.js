import axios from "axios";
import apiRequest from "../../utils/ApiRequest";
import { BACKEND_URL } from "../../constants/api";

axios.defaults.withCredentials = true;

export const getAllNotifications = apiRequest(async () => await axios.get(`${BACKEND_URL}/notification/`))
export const clearAllNotifications = apiRequest(async () => await axios.put(`${BACKEND_URL}/notification/read-all`))

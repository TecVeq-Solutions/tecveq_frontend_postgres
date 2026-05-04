import axios from "axios";
import apiRequest from "../utils/ApiRequest";

import { toast } from "react-toastify";
import { BACKEND_URL } from "../constants/api";

axios.defaults.withCredentials = true;

export const getAllAnnouncements = apiRequest(async () => await axios.get(`${BACKEND_URL}/announcement/`));

export const getAllNotifications = apiRequest(async () => await axios.get(`${BACKEND_URL}/notification`));

export const userLogout = apiRequest(async () => {
    const url = `${BACKEND_URL}/user/logout`
    const response = await axios.get(url);
    toast.success("Log out successfull!");
    return response;
});


export const getAllClasses = apiRequest(async (params) => {
    const { teacherID, studentID, startDate: customStartDate, endDate: customEndDate } = params || {};

    let startDate = customStartDate ? new Date(customStartDate) : new Date(Date.now());
    if (!customStartDate) startDate.setDate(startDate.getDate() - 15);

    let endDate = customEndDate ? new Date(customEndDate) : new Date(Date.now());
    if (!customEndDate) endDate.setDate(endDate.getDate() + 15);

    // Extract ID safely: either from teacherID property or params if it's a string/ID
    let id = teacherID;
    if (typeof id === 'object') id = id?.id;
    if (!id && typeof params !== 'object') id = params;

    let url = `${BACKEND_URL}/class?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
    if (id) url += `&teacherID=${id}`;
    if (studentID) url += `&studentID=${studentID}`;

    const response = await axios.get(url);
    return response;
})

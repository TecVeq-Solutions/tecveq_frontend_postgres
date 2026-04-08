import axios from "axios";
import apiRequest from "../../utils/ApiRequest";
import { BACKEND_URL } from "../../constants/api";

axios.defaults.withCredentials = true;

export const generateFees = apiRequest(async (data) => {
    const url = `${BACKEND_URL}/fees/generate`;
    return await axios.post(url, data);
});

export const getAllFees = apiRequest(async () => {
    const url = `${BACKEND_URL}/fees/all`;
    return await axios.get(url);
});

export const updateFeeStatus = apiRequest(async (feeID, data) => {
    const url = `${BACKEND_URL}/fees/${feeID}`;
    return await axios.put(url, data);
});

export const deleteFee = apiRequest(async (feeID) => {
    const url = `${BACKEND_URL}/fees/${feeID}`;
    return await axios.delete(url);
});

// Platform Fees
export const generatePlatformFee = apiRequest(async (data) => {
    const url = `${BACKEND_URL}/fees/platform/generate`;
    return await axios.post(url, data);
});

export const getPlatformFees = apiRequest(async (adminID) => {
    const url = `${BACKEND_URL}/fees/platform/all${adminID ? `?adminID=${adminID}` : ""}`;
    return await axios.get(url);
});

export const updatePlatformFeeStatus = apiRequest(async (feeID, data) => {
    const url = `${BACKEND_URL}/fees/platform/${feeID}`;
    return await axios.put(url, data);
});

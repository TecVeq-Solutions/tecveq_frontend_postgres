import axios from "axios";
import apiRequest from "../../utils/ApiRequest";
import { BACKEND_URL } from "../../constants/api";

axios.defaults.withCredentials = true;

export const getPaymentHistory = apiRequest(async () => await axios.get(`${BACKEND_URL}/admin-payments/history`));

export const submitPaymentProof = apiRequest(async (data) => await axios.post(`${BACKEND_URL}/admin-payments/submit-proof`, data));

export const updatePaymentProof = apiRequest(async (id, data) => await axios.put(`${BACKEND_URL}/admin-payments/update-proof/${id}`, data));

export const getSystemSettings = apiRequest(async () => await axios.get(`${BACKEND_URL}/admin-payments/instructions`));

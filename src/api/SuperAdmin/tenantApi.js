import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";

axios.defaults.withCredentials = true;

/**
 * Fetch live diagnostic overview showing counts from Master DB and all Branch databases
 */
export const getTenantOverview = apiRequest(async () => {
  const response = await axios.get(`${BACKEND_URL}/tenant/overview`);
  return response;
});

/**
 * Fetch list of all active tenant branches (City School 1, 2, 3)
 */
export const getBranches = apiRequest(async () => {
  const response = await axios.get(`${BACKEND_URL}/tenant/branches`);
  return response;
});

/**
 * Create a student in a specific branch DB to test and verify isolated storage
 */
export const createTestStudent = apiRequest(async (data) => {
  const response = await axios.post(`${BACKEND_URL}/tenant/create-test-student`, data);
  return response;
});

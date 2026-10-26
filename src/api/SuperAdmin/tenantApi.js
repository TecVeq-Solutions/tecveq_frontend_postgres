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

/**
 * 1-Click Institute Onboarding & Database Provisioning
 */
export const onboardInstitute = apiRequest(async (data) => {
  const response = await axios.post(`${BACKEND_URL}/tenant/onboard`, data);
  return response;
});

/**
 * Toggle Tenant Status (ACTIVE / SUSPENDED)
 */
export const toggleTenantStatus = apiRequest(async (slug) => {
  const response = await axios.put(`${BACKEND_URL}/tenant/toggle-status/${slug}`);
  return response;
});

/**
 * Delete a tenant from Master Registry
 */
export const deleteTenant = apiRequest(async (slug) => {
  const response = await axios.delete(`${BACKEND_URL}/tenant/${slug}`);
  return response;
});


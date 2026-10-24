import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";

axios.defaults.withCredentials = true;

/**
 * Fetch current installation's public license status (for status badges/banners)
 */
export const getLicenseStatus = apiRequest(async () => {
  const response = await axios.get(`${BACKEND_URL}/license/status`);
  return response;
});

/**
 * Activate a license key for this LMS installation
 */
export const activateLicense = apiRequest(async (licenseKey) => {
  const response = await axios.post(`${BACKEND_URL}/license/activate`, { licenseKey });
  return response;
});

/**
 * Force manual verification recheck
 */
export const verifyLicenseOnline = apiRequest(async () => {
  const response = await axios.post(`${BACKEND_URL}/license/verify`);
  return response;
});

/**
 * Superadmin: List all licenses across all tenants with optional filters
 */
export const getAllLicenses = apiRequest(async (params = {}) => {
  const response = await axios.get(`${BACKEND_URL}/license/admin/all`, { params });
  return response;
});

/**
 * Superadmin: Issue a new license for a tenant
 */
export const createLicense = apiRequest(async (data) => {
  const response = await axios.post(`${BACKEND_URL}/license/admin/create`, data);
  return response;
});

/**
 * Superadmin: Renew a subscription
 */
export const renewLicense = apiRequest(async (licenseId, data) => {
  const response = await axios.post(`${BACKEND_URL}/license/admin/renew/${licenseId}`, data);
  return response;
});

/**
 * Superadmin: Suspend a license
 */
export const suspendLicense = apiRequest(async (licenseId, reason) => {
  const response = await axios.post(`${BACKEND_URL}/license/admin/suspend/${licenseId}`, { reason });
  return response;
});

/**
 * Superadmin: Reactivate a suspended license
 */
export const reactivateLicense = apiRequest(async (licenseId) => {
  const response = await axios.post(`${BACKEND_URL}/license/admin/reactivate/${licenseId}`);
  return response;
});

/**
 * Superadmin: Revoke a license permanently with recorded mandatory reason
 */
export const revokeLicense = apiRequest(async (licenseId, reason) => {
  const response = await axios.post(`${BACKEND_URL}/license/admin/revoke/${licenseId}`, { reason });
  return response;
});

/**
 * Superadmin: Get global audit logs
 */
export const getAuditLogs = apiRequest(async (params = {}) => {
  const response = await axios.get(`${BACKEND_URL}/license/admin/audit-logs`, { params });
  return response;
});

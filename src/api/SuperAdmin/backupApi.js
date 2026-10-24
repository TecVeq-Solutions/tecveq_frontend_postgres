import axios from "axios";
import { BACKEND_URL } from "../../constants/api";
import apiRequest from "../../utils/ApiRequest";

axios.defaults.withCredentials = true;

/**
 * Superadmin: List all backups
 */
export const getBackupList = apiRequest(async () => {
  const response = await axios.get(`${BACKEND_URL}/backup/list`);
  return response;
});

/**
 * Superadmin: Trigger manual backup creation
 */
export const createBackup = apiRequest(async (note = "") => {
  const response = await axios.post(`${BACKEND_URL}/backup/create`, { note });
  return response;
});

/**
 * Superadmin: Restore database to a snapshot
 */
export const restoreBackup = apiRequest(async (backupId) => {
  const response = await axios.post(`${BACKEND_URL}/backup/restore/${backupId}`);
  return response;
});

/**
 * Superadmin: Delete a backup
 */
export const deleteBackup = apiRequest(async (backupId) => {
  const response = await axios.delete(`${BACKEND_URL}/backup/${backupId}`);
  return response;
});

/**
 * Get direct download URL for a backup file
 */
export const getDownloadBackupUrl = (backupId, format = "sql") => {
  return `${BACKEND_URL}/backup/download/${backupId}?format=${format}`;
};

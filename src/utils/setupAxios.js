import axios from "axios";
import { toast } from "react-toastify";

const setupAxios = () => {
  // Global axios configuration
  axios.defaults.withCredentials = true;
  axios.defaults.timeout = 20000; // 20 seconds timeout to prevent hanging requests

  // Request interceptor to automatically attach active tenant / branch header
  axios.interceptors.request.use((config) => {
    const activeTenant = localStorage.getItem("active_tenant_slug") || "cityschool-1";
    if (activeTenant && !config.headers["X-Tenant-ID"]) {
      config.headers["X-Tenant-ID"] = activeTenant;
    }
    return config;
  }, (error) => Promise.reject(error));

  // Response interceptor for global error handling
  axios.interceptors.response.use(
    (response) => {
      // Return response as is on success
      return response;
    },
    (error) => {
      // Catch all axios errors (4xx, 5xx, or network errors)
      if (!axios.isCancel(error)) {
        let errMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          (typeof error?.response?.data === "string" ? error?.response?.data : null) ||
          error.message ||
          "An unexpected error occurred";

        if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
          errMsg = "Request timed out. Please check your internet connection or try again later.";
        } else if (error.message === "Network Error") {
          errMsg = "Network Error: Could not connect to the server. This may be due to a CORS issue or the server being down.";
        }

        // Special handling for subscription lifecycle status codes
        if (error?.response?.data?.code === "SUBSCRIPTION_EXPIRED") {
          toast.warning("Subscription Expired: LMS is in read-only mode. Please renew your license.", {
            toastId: "subscription-expired-toast",
            autoClose: 5000,
          });
          return Promise.reject(error);
        }

        if (error?.response?.data?.code === "SUBSCRIPTION_SUSPENDED" || error?.response?.data?.code === "SUBSCRIPTION_REVOKED") {
          toast.error("License Suspended: Please contact platform administration.", {
            toastId: "subscription-suspended-toast",
            autoClose: 6000,
          });
          return Promise.reject(error);
        }

        // Skip toast for specific expected "errors" like teacher not being in a classroom yet
        const skipToast = errMsg === "Teacher not found in any classroom." || errMsg === "No subjects found for the given teacher." || errMsg === "Setting not found";

        if (!skipToast) {
          toast.error(errMsg, {
            toastId: "global-api-error-toast",
            autoClose: 3000,
          });
        }

        console.error("Global API Error:", errMsg);
      }

      // Handle 401 specifically if needed (e.g., redirect to login)
      if (error?.response?.status === 401) {
        localStorage.removeItem("tcauser");
        window.location.href = "/login";
      }

      return Promise.reject(error);
    }
  );
};

export default setupAxios;

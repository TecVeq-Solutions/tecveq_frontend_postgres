import axios from "axios";
import { toast } from "react-toastify";

const setupAxios = () => {
  // Global axios configuration
  axios.defaults.withCredentials = true;

  // Response interceptor for global error handling
  axios.interceptors.response.use(
    (response) => {
      // Return response as is on success
      return response;
    },
    (error) => {
      // Catch all axios errors (4xx, 5xx, or network errors)
      if (!axios.isCancel(error)) {
        const errMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          (typeof error?.response?.data === "string" ? error?.response?.data : null) ||
          error.message ||
          "An unexpected error occurred";

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
        // Optional: Redirect or clear user state
        // localStorage.removeItem("tcauser");
        // window.location.href = "/login";
      }

      return Promise.reject(error);
    }
  );
};

export default setupAxios;

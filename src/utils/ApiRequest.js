const apiRequest = (apiCall) => {
  return async (...args) => {
    try {
      const response = await apiCall(...args);
      // If the response is already data (from a wrapper), return it. 
      // If it's an axios response object, return .data.
      return response?.data !== undefined ? response.data : response;
    } catch (error) {
      // The toast is now handled globally by axiosInstance interceptors.
      // We still throw so the UI can handle loading states or specific logic.
      throw error;
    }
  };
};

export default apiRequest;

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? "http://localhost:3000/api" : "https://api.tecveq.com/api");
export const BACKEND_URL_SOCKET = import.meta.env.VITE_BACKEND_URL_SOCKET || (window.location.hostname === 'localhost' ? "http://localhost:3000" : "https://api.tecveq.com");
export const default_profile = ""

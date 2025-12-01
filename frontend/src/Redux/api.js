import axios from "axios";

const API_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (orginnalRequest && originalRequest.url.includes("/user/me")) {
        return Promise.reject(error.response?.data || error);
      }

      localStorage.removeItem("token");
      window.location.href = "/dashboard";
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
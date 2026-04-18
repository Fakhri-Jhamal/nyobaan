/// <reference types="vite/client" />
import axios from "axios";

// Determine the base URL depending on environment
const isProd = import.meta.env.PROD;
const baseURL = import.meta.env.VITE_API_URL || (isProd ? "/api" : "http://localhost:5000/api");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request nambah JWT token ke headers jika ada
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("forum_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

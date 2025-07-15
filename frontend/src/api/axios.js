import axios from 'axios'
const api = axios.create({
    baseURL : import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
    withCredentials : true
})

// Global interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      alert('⛔ Too many requests. Please try again later.');
    }
    return Promise.reject(error);
  }
);

export default api;
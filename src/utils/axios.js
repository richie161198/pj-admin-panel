import axios from 'axios';
import { getToken, isTokenExpired, clearAuth } from './auth';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:4000/api/v0',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        console.log('Axios Request: Token is expired, clearing auth');
        clearAuth();
        // Redirect to login will be handled by the component
        return config;
      }
      
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Axios Request: Valid token added to headers');
    } else {
      console.log('Axios Request: No token found');
    }
    
    return config;
  },
  (error) => {
    console.error('Axios Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Axios Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Axios Response Error:', error);
    
    // Handle 401 Unauthorized responses
    // Only clear auth if token is actually expired, not on all 401 errors
    // (401 can occur due to server errors, network issues, etc.)
    if (error.response?.status === 401) {
      const token = getToken();
      console.log('Axios Response: 401 Unauthorized');
      
      // Only clear auth if token is expired or missing
      // This prevents clearing auth on temporary server errors
      if (!token || isTokenExpired(token)) {
        console.log('Axios Response: Token is expired or missing, clearing auth');
        clearAuth();
      } else {
        console.log('Axios Response: 401 but token is still valid, not clearing auth (likely server error)');
      }
      // The ProtectedRoute will handle redirect to login if needed
    }
    
    return Promise.reject(error);
  }
);

export default api;

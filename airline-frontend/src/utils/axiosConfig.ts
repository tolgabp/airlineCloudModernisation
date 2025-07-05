import axios from 'axios';
import { isAuthError } from './errorHandler';
import { clearAuthData } from './authUtils';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081',
  timeout: 10000,
});

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors (401 Unauthorized)
    if (isAuthError(error)) {
      console.log('Authentication error detected, clearing auth data');
      clearAuthData();
      
      // Redirect to login page if we're in a browser environment
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage if available
    const token = localStorage.getItem('airline_auth_data');
    console.log('Request interceptor - localStorage token:', token);
    if (token) {
      try {
        const authData = JSON.parse(token);
        console.log('Request interceptor - parsed auth data:', authData);
        if (authData.token) {
          config.headers.Authorization = `Bearer ${authData.token}`;
          console.log('Request interceptor - added Authorization header');
        } else {
          console.log('Request interceptor - no token in auth data');
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
        clearAuthData();
      }
    } else {
      console.log('Request interceptor - no token in localStorage');
    }
    
    console.log('Request interceptor - final config headers:', config.headers);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient; 
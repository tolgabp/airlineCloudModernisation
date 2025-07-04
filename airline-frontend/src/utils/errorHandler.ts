import axios, { AxiosError } from 'axios';

export interface ApiError {
  error: string;
  message: string;
}

export const parseApiError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    
    // Handle network errors
    if (!axiosError.response) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Handle HTTP status codes
    const status = axiosError.response.status;
    
    switch (status) {
      case 400:
        return 'Please check your input and try again.';
      case 401:
        return 'Invalid email or password. Please check your credentials and try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource could not be found.';
      case 409:
        return 'This resource already exists. Please try a different option.';
      case 422:
        return 'Please check your input and ensure all required fields are filled correctly.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
  
  // Handle non-Axios errors
  if (error instanceof Error) {
    return 'An unexpected error occurred. Please try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const isNetworkError = (error: any): boolean => {
  return axios.isAxiosError(error) && !error.response;
};

export const isAuthError = (error: any): boolean => {
  return axios.isAxiosError(error) && error.response?.status === 401;
}; 
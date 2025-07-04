// Authentication utilities for token management
export interface AuthData {
  token: string;
  email: string;
  userId?: string;
}

const AUTH_STORAGE_KEY = 'airline_auth_data';

// Save authentication data to localStorage
export const saveAuthData = (authData: AuthData): void => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error('Failed to save auth data to localStorage:', error);
  }
};

// Load authentication data from localStorage
export const loadAuthData = (): AuthData | null => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    
    const authData = JSON.parse(stored);
    
    // Validate the stored data has required fields
    if (!authData.token || !authData.email) {
      clearAuthData();
      return null;
    }
    
    return authData;
  } catch (error) {
    console.error('Failed to load auth data from localStorage:', error);
    clearAuthData();
    return null;
  }
};

// Clear authentication data from localStorage
export const clearAuthData = (): void => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth data from localStorage:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const authData = loadAuthData();
  return authData !== null && !!authData.token;
};

// Get the current auth token
export const getAuthToken = (): string | null => {
  const authData = loadAuthData();
  return authData?.token || null;
};

// Get the current user email
export const getCurrentUserEmail = (): string | null => {
  const authData = loadAuthData();
  return authData?.email || null;
}; 
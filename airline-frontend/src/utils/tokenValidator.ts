// JWT token validation utilities
export const isTokenExpired = (token: string): boolean => {
  try {
    // Decode the JWT token (without verification for client-side check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Check if token is expired
    return payload.exp < currentTime;
  } catch (error) {
    // If we can't decode the token, consider it invalid/expired
    console.error('Error decoding token:', error);
    return true;
  }
};

// Get token expiration time
export const getTokenExpirationTime = (token: string): Date | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

// Check if token will expire soon (within 5 minutes)
export const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const fiveMinutesFromNow = currentTime + (5 * 60);
    
    return payload.exp < fiveMinutesFromNow;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}; 
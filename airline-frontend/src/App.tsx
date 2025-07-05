import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './Components/auth/Login';
import Register from './Components/auth/Register';
import ErrorBoundary from './Components/common/ErrorBoundary';
import PublicHomePage from './Components/common/PublicHomePage';
import Navigation from './Components/common/Navigation';
import ResponsiveDashboard from './Components/dashboard/ResponsiveDashboard';
import MyProfilePage from './Components/profile/MyProfilePage';
import BookingHistoryPage from './Components/dashboard/BookingHistoryPage';
import MyBookingsPage from './Components/dashboard/MyBookingsPage';
import { NotificationProvider } from './context/NotificationContext';
import React, { useState, useEffect, createContext, useContext } from 'react';
import axios from 'axios';
import { parseApiError } from './utils/errorHandler';
import { saveAuthData, loadAuthData, clearAuthData, AuthData } from './utils/authUtils';
import { isTokenExpired, isTokenExpiringSoon } from './utils/tokenValidator';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

// Auth Context
interface AuthContextType {
  email: string | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects authenticated users)
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Auth Provider Component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Load authentication data on app startup
  useEffect(() => {
    const authData = loadAuthData();
    if (authData) {
      // Check if token is expired
      if (isTokenExpired(authData.token)) {
        console.log('Stored token is expired, clearing auth data');
        clearAuthData();
        return;
      }
      
      // Check if token is expiring soon
      if (isTokenExpiringSoon(authData.token)) {
        console.log('Token is expiring soon, consider refreshing');
        // In a real app, you might want to refresh the token here
      }
      
      setEmail(authData.email);
      setToken(authData.token);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, { email, password });
      console.log('Login response:', response.data);
      const authData: AuthData = {
        token: response.data.token,
        email: email,
        userId: response.data.user?.id
      };
      
      console.log('Saving auth data:', authData);
      // Save to localStorage for persistence
      saveAuthData(authData);
      
      setEmail(email);
      setToken(response.data.token);
    } catch (error) {
      const errorMessage = parseApiError(error);
      throw new Error(`Login failed: ${errorMessage}`);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/register`, { name, email, password });
    } catch (error) {
      const errorMessage = parseApiError(error);
      throw new Error(`Registration failed: ${errorMessage}`);
    }
  };

  const logout = () => {
    // Clear from localStorage
    clearAuthData();
    
    setEmail(null);
    setToken(null);
  };

  const value: AuthContextType = {
    email,
    token,
    isAuthenticated: !!token,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Main App Component
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

// App Routes Component
const AppRoutes: React.FC = () => {
  const { token } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation - Show on all pages except auth pages */}
      {!location.pathname.includes('/login') && !location.pathname.includes('/register') && (
        <Navigation />
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicHomePage />} />
        
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <NotificationProvider token={token}>
                <ResponsiveDashboard />
              </NotificationProvider>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <NotificationProvider token={token}>
                <MyProfilePage />
              </NotificationProvider>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/booking-history" 
          element={
            <ProtectedRoute>
              <NotificationProvider token={token}>
                <BookingHistoryPage />
              </NotificationProvider>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/my-bookings" 
          element={
            <ProtectedRoute>
              <NotificationProvider token={token}>
                <MyBookingsPage />
              </NotificationProvider>
            </ProtectedRoute>
          } 
        />

        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

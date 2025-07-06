import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Components
import Login from './Components/auth/Login';
import Register from './Components/auth/Register';
import ResponsiveDashboard from './Components/dashboard/ResponsiveDashboard';
import PublicHomePage from './Components/common/PublicHomePage';
import Navigation from './Components/common/Navigation';
import MyProfilePage from './Components/profile/MyProfilePage';
import MyBookingsPage from './Components/dashboard/MyBookingsPage';
import BookingHistoryPage from './Components/dashboard/BookingHistoryPage';
import ErrorBoundary from './Components/common/ErrorBoundary';

// Context
import { NotificationProvider } from './context/NotificationContext';

// Utils
import { parseApiError } from './utils/errorHandler';
import { clearAuthData } from './utils/authUtils';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://cloud-api-layer-eu-906b86b9ff06.herokuapp.com';

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

  // Check token expiration on app start
  useEffect(() => {
    const checkTokenExpiration = () => {
      const authData = localStorage.getItem('airline_auth_data');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          if (parsed.expiresAt && new Date(parsed.expiresAt) <= new Date()) {
            // Token is expired, clear auth data
            localStorage.removeItem('airline_auth_data');
            setToken(null);
            setEmail(null);
          } else if (parsed.expiresAt && new Date(parsed.expiresAt) <= new Date(Date.now() + 5 * 60 * 1000)) {
            // Token expires in next 5 minutes, consider refreshing
            // For now, just log this - could implement token refresh here
          }
        } catch (error) {
          localStorage.removeItem('airline_auth_data');
          setToken(null);
          setEmail(null);
        }
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, { email, password });
      
      const authData = {
        token: response.data.token,
        email: response.data.email,
        expiresAt: response.data.expiresAt || new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString() // 10 hours default
      };
      
      localStorage.setItem('airline_auth_data', JSON.stringify(authData));
      setToken(authData.token);
      setEmail(authData.email);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
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

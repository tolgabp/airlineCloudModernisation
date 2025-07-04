import './App.css';
import Login from './Components/Login';
import Register from './Components/Register';
import ErrorBoundary from './Components/ErrorBoundary';
import PublicHomePage from './Components/PublicHomePage';
import Navigation from './Components/Navigation';
import ResponsiveDashboard from './Components/ResponsiveDashboard';
import { NotificationProvider } from './context/NotificationContext';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { parseApiError } from './utils/errorHandler';
import { saveAuthData, loadAuthData, clearAuthData, AuthData } from './utils/authUtils';
import { useDataRefresh } from './hooks/useDataRefresh';
import { usePeriodicRefresh } from './hooks/usePeriodicRefresh';
import { isTokenExpired, isTokenExpiringSoon } from './utils/tokenValidator';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

function App() {
  const [page, setPage] = useState<"home" | "login" | "register" | "dashboard">("home");
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const { registerRefreshCallback, triggerRefreshAfterDelay } = useDataRefresh();
  
  // Set up periodic refresh for real-time updates (only when authenticated)
  usePeriodicRefresh({
    intervalMs: 30000, // 30 seconds
    enabled: page === "dashboard" && !!token,
    onRefresh: () => {
      fetchBookings();
      fetchFlights();
    }
  });

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
        setPage("dashboard");
    }
  }, []);

  // Function to fetch flights
  const fetchFlights = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/flights`);
      const mappedFlights = response.data.map((f: any) => ({
        id: f.id,
        from: f.origin,
        to: f.destination,
        time: new Date(f.departureTime).toLocaleString()
      }));
      setFlights(mappedFlights);
    } catch (error) {
      console.error('Failed to fetch flights:', error);
      // Silently handle flight fetching errors - flights will remain empty
    }
  }, []);

  // Function to fetch bookings
  const fetchBookings = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookings/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    }
  }, [token]);

  // Register refresh callbacks
  useEffect(() => {
    const unregisterFlights = registerRefreshCallback(fetchFlights);
    const unregisterBookings = registerRefreshCallback(fetchBookings);
    
    return () => {
      unregisterFlights();
      unregisterBookings();
    };
  }, [registerRefreshCallback, fetchFlights, fetchBookings]);

  // Fetch data when authenticated
  useEffect(() => {
    if (page === "dashboard" && token) {
      fetchFlights();
      fetchBookings();
    }
  }, [page, token, fetchFlights, fetchBookings]);

  const handleRegister = (name: string, email: string, password: string) => {
    axios.post(`${API_BASE_URL}/api/register`, { name, email, password })
      .then(response => {
        alert('Registration successful! Please login.');
        setPage("login");
      })
      .catch(error => {
        const errorMessage = parseApiError(error);
        alert(`Registration failed: ${errorMessage}`);
      });
  };

  const handleLogin = (email: string, password: string) => {
    axios.post(`${API_BASE_URL}/api/login`, { email, password })
      .then(response => {
        const authData: AuthData = {
          token: response.data.token,
          email: email,
          userId: response.data.user?.id
        };
        
        // Save to localStorage for persistence
        saveAuthData(authData);
        
        setEmail(email);
        setToken(response.data.token);
        setPage("dashboard");
      })
      .catch(error => {
        const errorMessage = parseApiError(error);
        alert(`Login failed: ${errorMessage}`);
      });
  };

  const handleLogout = () => {
    // Clear from localStorage
    clearAuthData();
    
    setEmail(null);
    setToken(null);
    setPage("home");
    setBookings([]);
  };

  const handleHome = () => {
    if (token) {
      setPage("dashboard");
    } else {
      setPage("home");
    }
  };

  const refreshBookings = () => {
    triggerRefreshAfterDelay(500); // Small delay to ensure backend updates are complete
  };

  // Render different pages based on current state
  if (page === "login") {
    return (
      <ErrorBoundary>
        <Login 
          onLogin={handleLogin} 
          onBackToHome={handleHome}
          onGoToRegister={() => setPage("register")}
        />
      </ErrorBoundary>
    );
  }

  if (page === "register") {
    return (
      <ErrorBoundary>
        <Register 
          onRegister={handleRegister} 
          onBackToHome={handleHome}
          onGoToLogin={() => setPage("login")}
        />
      </ErrorBoundary>
    );
  }

  if (page === "dashboard") {
    return (
      <ErrorBoundary>
        <NotificationProvider token={token}>
          <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <Navigation
              isAuthenticated={!!token}
              userEmail={email}
              onLogin={() => setPage("login")}
              onRegister={() => setPage("register")}
              onLogout={handleLogout}
              onHome={handleHome}
            />

            {/* Responsive Dashboard */}
            <ResponsiveDashboard
              flights={flights}
              bookings={bookings}
              token={token}
              onBookingUpdate={refreshBookings}
              onLogout={handleLogout}
              onFlightSelect={(flight) => {
                // This could be used to pre-select a flight in the booking form
                console.log('Selected flight:', flight);
              }}
              onBook={flight => {
                if (!token) {
                  alert('You must be logged in to book a flight.');
                  return;
                }
                axios.post(`${API_BASE_URL}/api/bookings`, {
                  flightId: flight.id
                }, {
                  headers: { Authorization: `Bearer ${token}` }
                })
                .then(() => {
                  alert('Flight booked successfully!');
                  // Refresh bookings after successful booking
                  triggerRefreshAfterDelay(500);
                })
                .catch(error => {
                  const errorMessage = parseApiError(error);
                  alert(`Booking failed: ${errorMessage}`);
                });
              }}
              onRebookingSuccess={() => triggerRefreshAfterDelay(1000)}
            />
          </div>
        </NotificationProvider>
      </ErrorBoundary>
    );
  }

  // Default: Public Home Page
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <Navigation
          isAuthenticated={!!token}
          userEmail={email}
          onLogin={() => setPage("login")}
          onRegister={() => setPage("register")}
          onLogout={handleLogout}
          onHome={handleHome}
        />

        {/* Public Home Page */}
        <PublicHomePage
          flights={flights}
          onLogin={() => setPage("login")}
          onRegister={() => setPage("register")}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;

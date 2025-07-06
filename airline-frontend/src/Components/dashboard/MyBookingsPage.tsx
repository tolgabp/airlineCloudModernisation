import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MyBookings from './MyBookings';
import { useAuth } from '../../App';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import { usePeriodicRefresh } from '../../hooks/usePeriodicRefresh';
import apiClient from '../../utils/axiosConfig';
import DelayNotification from '../notifications/DelayNotification';

const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const { registerRefreshCallback, triggerRefreshAfterDelay } = useDataRefresh();
  
  const handleRebookingSuccess = () => {
    triggerRefreshAfterDelay(1000);
  };

  // Function to fetch flights
  const fetchFlights = useCallback(async () => {
    try {
      const response = await apiClient.get(`/api/flights`);
      const mappedFlights = response.data.map((f: any) => ({
        id: f.id,
        from: f.origin,
        to: f.destination,
        time: new Date(f.departureTime).toLocaleString(),
        departureTime: f.departureTime, // Keep original departure time for filtering
        availableSeats: f.availableSeats
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
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/api/bookings/my`);
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setError('Failed to load your bookings. Please try again later.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Set up periodic refresh for real-time updates
  usePeriodicRefresh({
    intervalMs: 30000, // 30 seconds
    enabled: !!token,
    onRefresh: () => {
      fetchBookings();
      fetchFlights();
    }
  });

  // Register refresh callbacks
  useEffect(() => {
    const unregisterFlights = registerRefreshCallback(fetchFlights);
    const unregisterBookings = registerRefreshCallback(fetchBookings);
    
    return () => {
      unregisterFlights();
      unregisterBookings();
    };
  }, [registerRefreshCallback, fetchFlights, fetchBookings]);

  // Fetch data when component mounts
  useEffect(() => {
    if (token) {
      fetchFlights();
      fetchBookings();
    }
  }, [token, fetchFlights, fetchBookings]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const refreshBookings = () => {
    triggerRefreshAfterDelay(500); // Small delay to ensure backend updates are complete
  };

  // Filter bookings to only show CONFIRMED and DELAYED statuses
  const activeBookings = bookings.filter(booking => 
    booking.status === 'CONFIRMED' || booking.status === 'DELAYED'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => {
              fetchBookings();
              fetchFlights();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Active Bookings</h1>
          <p className="text-gray-600 mt-2">
            Manage your confirmed and delayed flight bookings
          </p>
          {bookings.length > activeBookings.length && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-blue-800">
                  Showing {activeBookings.length} active bookings. 
                  <button 
                    onClick={() => navigate('/booking-history')}
                    className="ml-1 underline hover:text-blue-900"
                  >
                    View booking history
                  </button>
                  {' '}for completed and cancelled bookings.
                </span>
              </div>
            </div>
          )}
        </div>

        <DelayNotification 
                  token={token}
                  bookings={bookings}
                  onRebookingSuccess={handleRebookingSuccess}
                />

        <MyBookings 
          bookings={activeBookings} 
          flights={flights} 
          token={token}
          onBookingUpdate={refreshBookings}
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
};

export default MyBookingsPage; 
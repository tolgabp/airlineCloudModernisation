import React, { useState, useEffect, useCallback } from 'react';
import BookingHistory from './BookingHistory';
import { useAuth } from '../../App';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import { usePeriodicRefresh } from '../../hooks/usePeriodicRefresh';
import apiClient from '../../utils/axiosConfig';

const BookingHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const { registerRefreshCallback } = useDataRefresh();

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
      setError('Failed to load booking history. Please try again later.');
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
    }
  });

  // Register refresh callback
  useEffect(() => {
    const unregisterBookings = registerRefreshCallback(fetchBookings);
    return () => {
      unregisterBookings();
    };
  }, [registerRefreshCallback, fetchBookings]);

  // Fetch data when component mounts
  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token, fetchBookings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking history...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Booking History</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchBookings}
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
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
            <p className="text-gray-600 mt-2">
              View your completed and cancelled flight bookings
            </p>
          </div>
          
          <BookingHistory bookings={bookings} />
        </div>
      </div>
    </div>
  );
};

export default BookingHistoryPage; 
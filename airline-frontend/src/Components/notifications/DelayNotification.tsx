import React, { useState, useEffect } from 'react';
import apiClient from '../../utils/axiosConfig';
import { parseApiError } from '../../utils/errorHandler';

interface RebookingSuggestion {
  flightId: number;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  price: number;
  priority: number;
}

interface DelayNotificationProps {
  token: string | null;
  bookings: any[];
  onRebookingSuccess: () => void;
}

const DelayNotification: React.FC<DelayNotificationProps> = ({ token, bookings, onRebookingSuccess }) => {
  const [delayNotifications, setDelayNotifications] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<{ [bookingId: number]: RebookingSuggestion[] }>({});
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Simulate delay notifications for demo purposes
  const simulateDelay = async () => {
    if (!token || !selectedBookingId) {
      setError('Please select a booking to simulate delay for');
      return;
    }

    const selectedBooking = bookings.find(b => b.id === selectedBookingId);
    if (!selectedBooking) {
      setError('Selected booking not found');
      return;
    }

    setSimulating(true);
    setError(null);
    setSuccess(null);

    try {
      const delayRequest = {
        bookingId: selectedBookingId,
        flightId: selectedBooking.flight.id,
        reason: "Technical issues with aircraft",
        originalDepartureTime: new Date().toISOString(),
        newDepartureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours delay
      };

      await apiClient.post(`/api/recommendations/notify-delay`, delayRequest);

      // Fetch rebooking suggestions
      const suggestionsResponse = await apiClient.get(`/api/recommendations/suggestions?bookingId=${selectedBookingId}`);

      setSuggestions(prev => ({
        ...prev,
        [selectedBookingId]: suggestionsResponse.data.suggestions || []
      }));

      setDelayNotifications(prev => [...prev, {
        bookingId: selectedBookingId,
        flightId: selectedBooking.flight.id,
        reason: delayRequest.reason,
        originalDepartureTime: delayRequest.originalDepartureTime,
        newDepartureTime: delayRequest.newDepartureTime,
        timestamp: new Date().toISOString()
      }]);

      setSelectedBookingId(null); // Reset selection after successful simulation
      setSuccess('Delay notification created successfully! Alternative flights are now available.');

    } catch (error) {
      const errorMessage = parseApiError(error);
      setError(`Failed to simulate delay: ${errorMessage}`);
    } finally {
      setSimulating(false);
    }
  };

  const handleRebook = async (bookingId: number, newFlightId: number) => {
    if (!token) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.put(`/api/bookings/${bookingId}`, {
        flightId: newFlightId
      });

      setSuccess('Successfully rebooked to alternative flight!');
      
      // Remove the delay notification and suggestions
      setDelayNotifications(prev => prev.filter(n => n.bookingId !== bookingId));
      setSuggestions(prev => {
        const newSuggestions = { ...prev };
        delete newSuggestions[bookingId];
        return newSuggestions;
      });

      // Trigger refresh after a delay to ensure backend updates are complete
      setTimeout(() => {
        onRebookingSuccess();
      }, 1000);
    } catch (error) {
      const errorMessage = parseApiError(error);
      setError(`Rebooking failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getBookingDisplay = (booking: any) => {
    const flight = booking.flight;
    const origin = flight.origin || flight.from;
    const destination = flight.destination || flight.to;
    const time = flight.departureTime ? new Date(flight.departureTime).toLocaleString() : flight.time;
    return `${origin} → ${destination} at ${time}`;
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDelayMinutes = (originalTime: string, newTime: string) => {
    const original = new Date(originalTime).getTime();
    const newTimeMs = new Date(newTime).getTime();
    return Math.round((newTimeMs - original) / (1000 * 60));
  };

  if (delayNotifications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Delay Notifications</h2>
            <p className="text-sm text-gray-600">Manage flight delays and rebooking options</p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border bg-red-50 border-red-200 text-red-800">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-lg border bg-green-50 border-green-200 text-green-800">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {success}
            </div>
          </div>
        )}

        {/* Filter bookings to only show CONFIRMED flights for simulation */}
        {(() => {
          const confirmedBookings = bookings.filter(booking => booking.status === 'CONFIRMED');
          if (confirmedBookings.length === 0) {
            return (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No confirmed bookings available</h3>
                  <p className="text-sm text-gray-500">
                    Only confirmed flights can be used for delay simulation. You have {bookings.length} total booking(s), but none are confirmed.
                  </p>
                </div>
              </div>
            );
          }
          
          return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm">ℹ️</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Simulation Mode</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Select a booking below to simulate a flight delay and see how the rebooking system works.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a booking to simulate delay:
              </label>
              <select
                value={selectedBookingId || ""}
                onChange={(e) => setSelectedBookingId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={simulating}
              >
                <option value="">Choose a booking...</option>
                {confirmedBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    Booking #{booking.id}: {getBookingDisplay(booking)}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={simulateDelay} 
              disabled={simulating || !selectedBookingId}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {simulating ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Simulating Delay...
                </div>
              ) : (
                'Simulate Flight Delay'
              )}
            </button>
          </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Active Delay Notifications</h2>
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <span className="text-red-600 text-sm font-semibold">⚠️</span>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✅</span>
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {delayNotifications.map((notification, index) => (
          <div key={index} className="border border-red-200 rounded-lg bg-red-50 overflow-hidden">
            {/* Header */}
            <div className="bg-red-100 px-4 py-3 border-b border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-red-600 mr-2">🚨</span>
                  <h3 className="text-red-800 font-semibold">Flight Delay Alert</h3>
                </div>
                <span className="text-xs text-red-600 bg-red-200 px-2 py-1 rounded-full">
                  {formatTime(notification.timestamp || new Date().toISOString())}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Booking ID</p>
                  <p className="font-medium text-gray-800">#{notification.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delay Reason</p>
                  <p className="font-medium text-gray-800">{notification.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Original Departure</p>
                  <p className="font-medium text-gray-800">{formatTime(notification.originalDepartureTime)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">New Departure</p>
                  <p className="font-medium text-red-600">
                    {formatTime(notification.newDepartureTime)}
                    <span className="ml-2 text-xs bg-red-200 text-red-700 px-2 py-1 rounded">
                      +{calculateDelayMinutes(notification.originalDepartureTime, notification.newDepartureTime)} min
                    </span>
                  </p>
                </div>
              </div>
              
              {suggestions[notification.bookingId] && suggestions[notification.bookingId].length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center mb-3">
                    <span className="text-green-600 mr-2">✈️</span>
                    <h4 className="text-sm font-semibold text-gray-700">Alternative Flights Available</h4>
                  </div>
                  <div className="space-y-3">
                    {suggestions[notification.bookingId].map((suggestion, idx) => (
                      <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="text-lg font-bold text-gray-800">
                                {suggestion.origin} → {suggestion.destination}
                              </span>
                              {suggestion.priority === 1 && (
                                <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                                  Best Option
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Departure:</span>
                                <span className="ml-1 font-medium">{formatTime(suggestion.departureTime)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Arrival:</span>
                                <span className="ml-1 font-medium">{formatTime(suggestion.arrivalTime)}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Available Seats:</span>
                                <span className="ml-1 font-medium text-green-600">{suggestion.availableSeats}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Price:</span>
                                <span className="ml-1 font-bold text-blue-600">${suggestion.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRebook(notification.bookingId, suggestion.flightId)}
                            disabled={loading}
                            className="ml-4 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                          >
                            {loading ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Rebooking...
                              </div>
                            ) : (
                              'Rebook Now'
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DelayNotification; 
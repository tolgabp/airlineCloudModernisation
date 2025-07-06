import React, { useState } from "react";
import axios from "axios";
import { parseApiError, isAuthError } from "../../utils/errorHandler";

interface MyBookingsProps {
  bookings: any[];
  flights: any[];
  token: string | null;
  onBookingUpdate: () => void;
  onLogout?: () => void;
}

const MyBookings: React.FC<MyBookingsProps> = ({ bookings, flights, token, onBookingUpdate, onLogout }) => {
  const [editingBooking, setEditingBooking] = useState<number | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const handleUpdateBooking = async (bookingId: number) => {
    if (!selectedFlightId) {
      setMessage("Please select a flight");
      return;
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://cloud-api-layer-eu-906b86b9ff06.herokuapp.com';
      await axios.put(
        `${API_BASE_URL}/api/bookings/${bookingId}`,
        { flightId: selectedFlightId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Booking updated successfully!");
      setEditingBooking(null);
      setSelectedFlightId(null);
      
      // Trigger refresh after a delay to ensure backend updates are complete
      setTimeout(() => {
        onBookingUpdate();
      }, 500);
    } catch (error: any) {
      const errorMessage = parseApiError(error);
      setMessage(`Update failed: ${errorMessage}`);
      
      // Handle authentication errors
      if (isAuthError(error) && onLogout) {
        setTimeout(() => {
          onLogout();
        }, 3000);
      }
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://cloud-api-layer-eu-906b86b9ff06.herokuapp.com';
      await axios.post(
        `${API_BASE_URL}/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Booking cancelled successfully!");
      
      // Trigger refresh after a delay to ensure backend updates are complete
      setTimeout(() => {
        onBookingUpdate();
      }, 500);
    } catch (error: any) {
      const errorMessage = parseApiError(error);
      setMessage(`Cancel failed: ${errorMessage}`);
      
      // Handle authentication errors
      if (isAuthError(error) && onLogout) {
        setTimeout(() => {
          onLogout();
        }, 3000);
      }
    }
  };

  const handleViewRebookingSuggestions = async (bookingId: number) => {
    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://cloud-api-layer-eu-906b86b9ff06.herokuapp.com';
      const response = await axios.get(
        `${API_BASE_URL}/api/recommendations/suggestions?bookingId=${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // For now, just show a message with the suggestions
      const suggestions = response.data.suggestions;
      if (suggestions && suggestions.length > 0) {
        const suggestionList = suggestions.map((s: any, index: number) => 
          `${index + 1}. ${s.origin} → ${s.destination} at ${new Date(s.departureTime).toLocaleString()} ($${s.price})`
        ).join('\n');
        
        alert(`Rebooking suggestions for your delayed flight:\n\n${suggestionList}`);
      } else {
        setMessage("No rebooking suggestions available at this time.");
      }
    } catch (error: any) {
      const errorMessage = parseApiError(error);
      setMessage(`Failed to load rebooking suggestions: ${errorMessage}`);
      
      // Handle authentication errors
      if (isAuthError(error) && onLogout) {
        setTimeout(() => {
          onLogout();
        }, 3000);
      }
    }
  };

  const getFlightDisplay = (booking: any) => {
    const flight = flights.find(f => f.id === booking.flight.id);
    return flight
      ? `${flight.from} → ${flight.to} at ${flight.time}`
      : `${booking.flight.origin || booking.flight.from} → ${booking.flight.destination || booking.flight.to} at ${booking.flight.departureTime ? new Date(booking.flight.departureTime).toLocaleString() : booking.flight.time}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
          <p className="text-sm text-gray-600">Manage your flight reservations</p>
        </div>
      </div>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.includes('successfully') 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.includes('successfully') ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {message}
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-sm text-gray-500">
              You haven't made any flight bookings yet.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Flight Details</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                    booking.status === 'DELAYED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </div>
                <p className="text-gray-700">{getFlightDisplay(booking)}</p>
                
                {booking.status === 'DELAYED' && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-yellow-800 font-medium">
                          Your flight has been delayed. Check for rebooking options below.
                        </span>
                      </div>
                      <button
                        onClick={() => handleViewRebookingSuggestions(booking.id)}
                        className="bg-yellow-600 text-white rounded-lg px-3 py-1 text-xs hover:bg-yellow-700 transition-colors font-medium"
                      >
                        View Suggestions
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {(booking.status === 'CONFIRMED' || booking.status === 'DELAYED') && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setEditingBooking(editingBooking === booking.id ? null : booking.id)}
                    className="bg-blue-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-blue-700 transition-colors font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {editingBooking === booking.id ? 'Cancel Edit' : 'Change Flight'}
                  </button>
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="bg-red-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-red-700 transition-colors font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel Booking
                  </button>
                </div>
              )}

              {editingBooking === booking.id && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Alternative Flight (Same Route, Future Departures Only):
                  </label>
                  {(() => {
                    // Get the current booking's origin and destination
                    const currentFlight = flights.find(f => f.id === booking.flight.id);
                    const currentOrigin = currentFlight?.from || booking.flight.origin || booking.flight.from;
                    const currentDestination = currentFlight?.to || booking.flight.destination || booking.flight.to;
                    
                    // Get current time for filtering
                    const now = new Date();
                    
                    // Filter flights to same origin and destination, but different flight ID and future departure time
                    const alternativeFlights = flights.filter((flight) => {
                      // Same route but different flight
                      const sameRoute = flight.id !== booking.flight.id && 
                                      flight.from === currentOrigin && 
                                      flight.to === currentDestination;
                      
                      // Future departure time
                      const futureDeparture = new Date(flight.departureTime) > now;
                      
                      return sameRoute && futureDeparture;
                    });
                    
                    if (alternativeFlights.length === 0) {
                      // Check if there are any flights with same route but past departure time
                      const pastFlights = flights.filter((flight) => 
                        flight.id !== booking.flight.id && 
                        flight.from === currentOrigin && 
                        flight.to === currentDestination &&
                        new Date(flight.departureTime) <= now
                      );
                      
                      if (pastFlights.length > 0) {
                        return (
                          <div className="text-gray-500 text-sm mb-2">
                            No future alternative flights available for the same route ({currentOrigin} → {currentDestination}). 
                            All other flights on this route have already departed.
                          </div>
                        );
                      } else {
                        return (
                          <div className="text-gray-500 text-sm mb-2">
                            No alternative flights available for the same route ({currentOrigin} → {currentDestination}).
                          </div>
                        );
                      }
                    }
                    
                    return (
                      <select
                        value={selectedFlightId || ""}
                        onChange={(e) => setSelectedFlightId(Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Choose a future alternative flight...</option>
                        {alternativeFlights.map((flight) => (
                          <option key={flight.id} value={flight.id}>
                            {flight.from} → {flight.to} at {flight.time}
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                  
                  {selectedFlightId && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleUpdateBooking(booking.id)}
                        className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 transition-colors font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Booking
                      </button>
                      <button
                        onClick={() => {
                          setEditingBooking(null);
                          setSelectedFlightId(null);
                        }}
                        className="bg-gray-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-gray-700 transition-colors font-medium flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
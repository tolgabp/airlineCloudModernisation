import React, { useState } from "react";
import axios from "axios";
import { parseApiError, isAuthError } from "../utils/errorHandler";

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
      await axios.put(
        `http://localhost:8081/api/bookings/${bookingId}`,
        { flightId: selectedFlightId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Booking updated successfully!");
      setEditingBooking(null);
      setSelectedFlightId(null);
      onBookingUpdate();
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
      await axios.post(
        `http://localhost:8081/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Booking cancelled successfully!");
      onBookingUpdate();
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

  const getFlightDisplay = (booking: any) => {
    const flight = flights.find(f => f.id === booking.flight.id);
    return flight
      ? `${flight.from} → ${flight.to} at ${flight.time}`
      : `${booking.flight.origin || booking.flight.from} → ${booking.flight.destination || booking.flight.to} at ${booking.flight.departureTime ? new Date(booking.flight.departureTime).toLocaleString() : booking.flight.time}`;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">My Bookings</h2>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <ul className="space-y-3">
          {bookings.map((booking, idx) => (
            <li key={idx} className="border rounded p-3">
              <div className="mb-2">
                <span className="font-medium">Flight: </span>
                {getFlightDisplay(booking)}
              </div>
              <div className="mb-2">
                <span className="font-medium">Status: </span>
                <span className={`px-2 py-1 rounded text-xs ${
                  booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {booking.status}
                </span>
              </div>
              
              {booking.status === 'CONFIRMED' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingBooking(editingBooking === booking.id ? null : booking.id)}
                    className="bg-blue-600 text-white rounded px-3 py-1 text-sm hover:bg-blue-700"
                  >
                    {editingBooking === booking.id ? 'Cancel Edit' : 'Change Flight'}
                  </button>
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="bg-red-600 text-white rounded px-3 py-1 text-sm hover:bg-red-700"
                  >
                    Cancel Booking
                  </button>
                </div>
              )}

              {editingBooking === booking.id && (
                <div className="mt-3 p-3 bg-gray-50 rounded">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Flight:
                  </label>
                  {flights.filter((flight) => flight.id !== booking.flight.id).length === 0 ? (
                    <div className="text-gray-500 text-sm mb-2">
                      No other flights available to change to.
                    </div>
                  ) : (
                    <select
                      value={selectedFlightId || ""}
                      onChange={(e) => setSelectedFlightId(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a flight...</option>
                      {flights
                        .filter((flight) => flight.id !== booking.flight.id)
                        .map((flight) => (
                          <option key={flight.id} value={flight.id}>
                            {flight.from} → {flight.to} at {flight.time}
                          </option>
                        ))}
                    </select>
                  )}
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => handleUpdateBooking(booking.id)}
                      disabled={flights.filter((flight) => flight.id !== booking.flight.id).length === 0}
                      className="bg-green-600 text-white rounded px-3 py-1 text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Update Booking
                    </button>
                    <button
                      onClick={() => {
                        setEditingBooking(null);
                        setSelectedFlightId(null);
                      }}
                      className="bg-gray-600 text-white rounded px-3 py-1 text-sm hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyBookings;
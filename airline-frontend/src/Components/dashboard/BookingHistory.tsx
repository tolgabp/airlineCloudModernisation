import React from 'react';

interface Booking {
  id: number;
  flightId: number;
  userId: number;
  bookingDate: string;
  status: string;
  flight?: {
    id: number;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
  };
}

interface BookingHistoryProps {
  bookings: Booking[];
}

const BookingHistory: React.FC<BookingHistoryProps> = ({ bookings }) => {
  // Filter completed/cancelled bookings for history
  const historyBookings = bookings.filter(booking => 
    booking.status === 'COMPLETED' || booking.status === 'CANCELLED'
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (historyBookings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No booking history</h3>
          <p className="text-sm text-gray-500">
            Your completed and cancelled bookings will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Booking History</h3>
        <span className="text-sm text-gray-500">
          {historyBookings.length} {historyBookings.length === 1 ? 'booking' : 'bookings'}
        </span>
      </div>

      <div className="space-y-3">
        {historyBookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">✈️</span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {booking.flight?.origin || 'Unknown'} → {booking.flight?.destination || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.flight?.departureTime ? 
                        formatDate(booking.flight.departureTime) : 
                        'Flight details unavailable'
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Booked: {formatDate(booking.bookingDate)}</span>
                  <span>Booking ID: #{booking.id}</span>
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                
                {booking.status === 'COMPLETED' && (
                  <div className="text-xs text-green-600">
                    ✓ Journey completed
                  </div>
                )}
                
                {booking.status === 'CANCELLED' && (
                  <div className="text-xs text-red-600">
                    ✗ Booking cancelled
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Completed:</span>
            <span className="ml-2 font-medium text-green-600">
              {historyBookings.filter(b => b.status === 'COMPLETED').length}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Cancelled:</span>
            <span className="ml-2 font-medium text-red-600">
              {historyBookings.filter(b => b.status === 'CANCELLED').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory; 
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedFlightList from './EnhancedFlightList';
import FlightSearchFilters from './FlightSearchFilters';
import UserProfile from '../profile/UserProfile';
import { useAuth } from '../../App';
import { useDataRefresh } from '../../hooks/useDataRefresh';
import { usePeriodicRefresh } from '../../hooks/usePeriodicRefresh';
import { useFlightSearch } from '../../hooks/useFlightSearch';
import apiClient from '../../utils/axiosConfig';

const ResponsiveDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flights' | 'delays' | 'profile'>('flights');
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const { registerRefreshCallback } = useDataRefresh();

  
  // Flight search functionality
  const {
    filters,
    filteredFlights,
    uniqueOrigins,
    uniqueDestinations,
    hasActiveFilters,
    updateFilter,
    clearFilters
  } = useFlightSearch(flights);

  // Set up periodic refresh for real-time updates
  usePeriodicRefresh({
    intervalMs: 30000, // 30 seconds
    enabled: !!token,
    onRefresh: () => {
      fetchBookings();
      fetchFlights();
    }
  });

  // Function to fetch flights
  const fetchFlights = useCallback(async () => {
    try {
      const response = await apiClient.get(`/api/flights`);
      const mappedFlights = response.data.map((f: any) => ({
        id: f.id,
        from: f.origin,
        to: f.destination,
        time: new Date(f.departureTime).toLocaleString(),
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
      const response = await apiClient.get(`/api/bookings/my`);
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

  

  const handleFlightSelect = (flight: any) => {
    setSelectedFlight(flight);
    setShowBookingModal(true);
  };

  const handleBookFlight = async () => {
    if (!selectedFlight || !token) return;

    try {
      setBookingMessage('Booking flight...');
      await apiClient.post(
        `/api/bookings`,
        { flightId: selectedFlight.id }
      );
      
      setBookingMessage('Flight booked successfully!');
      setShowBookingModal(false);
      setSelectedFlight(null);
      
      // Refresh bookings after successful booking
      setTimeout(() => {
        fetchBookings();
        setBookingMessage('');
      }, 2000);
      
    } catch (error: any) {
      console.error('Booking failed:', error);
      setBookingMessage('Failed to book flight. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setBookingMessage('');
      }, 3000);
    }
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedFlight(null);
    setBookingMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Mobile Tab Navigation */}
        <div className="bg-white shadow-soft border-b border-gray-100 sticky top-16 z-40">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('flights')}
              className={`flex-shrink-0 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'flights'
                  ? 'border-airline-500 text-airline-600 bg-airline-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Flights
              </div>
            </button>
            <button
              onClick={() => setActiveTab('delays')}
              className={`flex-shrink-0 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'delays'
                  ? 'border-airline-500 text-airline-600 bg-airline-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Delays
              </div>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-shrink-0 px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-airline-500 text-airline-600 bg-airline-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Profile
              </div>
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {activeTab === 'flights' && (
            <div className="card p-6">
              <div className="flex items-center mb-6">
                <div className="bg-airline-100 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-airline-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Available Flights</h2>
                  <p className="text-sm text-gray-600">Search and book your next journey</p>
                </div>
              </div>
              
              <FlightSearchFilters
                filters={filters}
                uniqueOrigins={uniqueOrigins}
                uniqueDestinations={uniqueDestinations}
                onFilterChange={updateFilter}
                onClearFilters={clearFilters}
                totalFlights={flights.length}
                filteredCount={filteredFlights.length}
                hasActiveFilters={hasActiveFilters}
              />
              <EnhancedFlightList 
                flights={filteredFlights} 
                onFlightSelect={handleFlightSelect}
              />
            </div>
          )}
          
          {activeTab === 'delays' && (
            <div className="card p-6">
              <div className="flex items-center mb-6">
                <div className="bg-warning-100 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delay Notifications</h2>
                  <p className="text-sm text-gray-600">Manage delays and rebooking options</p>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div className="card p-6">
              <div className="flex items-center mb-6">
                <div className="bg-airline-100 w-12 h-12 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-airline-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
                  <p className="text-sm text-gray-600">Manage your account settings</p>
                </div>
              </div>
              
              <UserProfile 
                token={token}
                onLogout={handleLogout}
                email={undefined}
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="xl:col-span-2 space-y-8">
              {/* Flights Section */}
              <div className="card p-6 lg:p-8">
                <div className="flex items-center mb-6 lg:mb-8">
                  <div className="bg-airline-100 w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center mr-4 lg:mr-6">
                    <svg className="w-6 h-6 lg:w-8 lg:h-8 text-airline-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Available Flights</h2>
                    <p className="text-sm lg:text-base text-gray-600">Search and book your next journey with ease</p>
                  </div>
                </div>
                
                <FlightSearchFilters
                  filters={filters}
                  uniqueOrigins={uniqueOrigins}
                  uniqueDestinations={uniqueDestinations}
                  onFilterChange={updateFilter}
                  onClearFilters={clearFilters}
                  totalFlights={flights.length}
                  filteredCount={filteredFlights.length}
                  hasActiveFilters={hasActiveFilters}
                />
                <EnhancedFlightList 
                  flights={filteredFlights} 
                  onFlightSelect={handleFlightSelect}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedFlight && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-8 shadow-large animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Confirm Booking</h3>
              <button
                onClick={closeBookingModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-gray-900">Flight #{selectedFlight.id}</span>
                  <span className="status-badge status-success">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    On Time
                  </span>
                </div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="text-sm font-semibold text-gray-900">{selectedFlight.from}</div>
                  <div className="text-airline-400">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{selectedFlight.to}</div>
                </div>
                <div className="text-sm text-gray-500">
                  Departure: {selectedFlight.time}
                </div>
              </div>
            </div>

            {bookingMessage && (
              <div className={`mb-6 p-4 rounded-xl border ${
                bookingMessage.includes('successfully') 
                  ? 'bg-success-50 border-success-200 text-success-800' 
                  : bookingMessage.includes('Booking flight...')
                  ? 'bg-airline-50 border-airline-200 text-airline-800'
                  : 'bg-error-50 border-error-200 text-error-800'
              }`}>
                <div className="flex items-center">
                  {bookingMessage.includes('successfully') ? (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : bookingMessage.includes('Booking flight...') ? (
                    <div className="loading-spinner w-5 h-5 mr-2"></div>
                  ) : (
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{bookingMessage}</span>
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleBookFlight}
                disabled={bookingMessage.includes('Booking flight...')}
                className="flex-1 btn-primary py-3 font-semibold"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {bookingMessage.includes('Booking flight...') ? 'Booking...' : 'Confirm Booking'}
              </button>
              <button
                onClick={closeBookingModal}
                disabled={bookingMessage.includes('Booking flight...')}
                className="flex-1 btn-secondary py-3 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveDashboard; 
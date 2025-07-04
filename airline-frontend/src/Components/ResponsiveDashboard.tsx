import React, { useState } from 'react';
import { Flight } from '../hooks/useFlightSearch';
import FlightList from './FlightList';
import BookFlight from './BookFlight';
import MyBookings from './MyBookings';
import DelayNotification from './DelayNotification';
import UserProfile from './UserProfile';

interface ResponsiveDashboardProps {
  flights: Flight[];
  bookings: any[];
  token: string | null;
  onBookingUpdate: () => void;
  onLogout: () => void;
  onFlightSelect?: (flight: Flight) => void;
  onBook: (flight: Flight) => void;
  onRebookingSuccess: () => void;
}

const ResponsiveDashboard: React.FC<ResponsiveDashboardProps> = ({
  flights,
  bookings,
  token,
  onBookingUpdate,
  onLogout,
  onFlightSelect,
  onBook,
  onRebookingSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'flights' | 'book' | 'bookings' | 'delays' | 'profile'>('flights');

  // Mobile tab navigation
  const tabs = [
    { id: 'flights', label: 'Flights', icon: '✈️' },
    { id: 'book', label: 'Book', icon: '🎫' },
    { id: 'bookings', label: 'My Trips', icon: '📋' },
    { id: 'delays', label: 'Delays', icon: '⚠️' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Tab Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="block text-lg mb-1">{tab.icon}</span>
              <span className="block text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="md:hidden">
        <div className="p-4">
          {activeTab === 'flights' && (
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <FlightList 
                flights={flights} 
                onFlightSelect={onFlightSelect}
              />
            </div>
          )}
          
          {activeTab === 'book' && (
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <BookFlight
                flights={flights}
                onBook={onBook}
              />
            </div>
          )}
          
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <MyBookings 
                bookings={bookings} 
                flights={flights} 
                token={token}
                onBookingUpdate={onBookingUpdate}
                onLogout={onLogout}
              />
            </div>
          )}
          
          {activeTab === 'delays' && (
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <DelayNotification 
                token={token}
                bookings={bookings}
                onRebookingSuccess={onRebookingSuccess}
              />
            </div>
          )}
          
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <UserProfile 
                token={token}
                onLogout={onLogout}
                email={undefined}
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {/* Flights - Full width on large screens */}
            <div className="lg:col-span-2 xl:col-span-1 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <FlightList 
                flights={flights} 
                onFlightSelect={onFlightSelect}
              />
            </div>
            
            {/* Book Flight */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <BookFlight
                flights={flights}
                onBook={onBook}
              />
            </div>
            
            {/* My Bookings */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <MyBookings 
                bookings={bookings} 
                flights={flights} 
                token={token}
                onBookingUpdate={onBookingUpdate}
                onLogout={onLogout}
              />
            </div>
            
            {/* Delay Notifications */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <DelayNotification 
                token={token}
                bookings={bookings}
                onRebookingSuccess={onRebookingSuccess}
              />
            </div>
            
            {/* User Profile */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <UserProfile 
                token={token}
                onLogout={onLogout}
                email={undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveDashboard; 
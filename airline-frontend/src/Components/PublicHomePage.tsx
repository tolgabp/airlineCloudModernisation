import React from 'react';
import { Flight } from '../hooks/useFlightSearch';
import FlightList from './FlightList';

interface PublicHomePageProps {
  flights: Flight[];
  onLogin: () => void;
  onRegister: () => void;
}

const PublicHomePage: React.FC<PublicHomePageProps> = ({ 
  flights, 
  onLogin, 
  onRegister 
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              ✈️ Find Your Perfect Flight
            </h1>
            <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100 px-4">
              Search, compare, and book flights with ease. No account required to browse.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
              <button
                onClick={onLogin}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onRegister}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Search</h3>
            <p className="text-gray-600">Find flights quickly with our powerful search and filter tools.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
            <p className="text-gray-600">Compare prices and find the best deals for your journey.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Booking</h3>
            <p className="text-gray-600">Book with confidence using our secure booking system.</p>
          </div>
        </div>

        {/* Flights Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200">
          <FlightList 
            flights={flights} 
            onFlightSelect={(flight) => {
              // Show login prompt when trying to book
              alert('Please sign in to book this flight!');
              onLogin();
            }}
          />
        </div>

        {/* Call to Action */}
        <div className="text-center mt-8 sm:mt-12">
          <div className="bg-gray-100 rounded-lg p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to Book?</h2>
            <p className="text-gray-600 mb-6 px-4">
              Create an account to save your preferences, track bookings, and get exclusive deals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
              <button
                onClick={onRegister}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Create Free Account
              </button>
              <button
                onClick={onLogin}
                className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicHomePage; 
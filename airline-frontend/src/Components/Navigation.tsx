import React, { useState } from 'react';

interface NavigationProps {
  isAuthenticated: boolean;
  userEmail?: string | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onHome: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated,
  userEmail,
  onLogin,
  onRegister,
  onLogout,
  onHome
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <button
              onClick={onHome}
              className="flex items-center space-x-2 text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              <span>✈️</span>
              <span className="hidden sm:inline">Airline Booking</span>
              <span className="sm:hidden">Airline</span>
            </button>
          </div>

          {/* Navigation Links - Only show when authenticated on desktop */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center space-x-8">
              <button
                onClick={onHome}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Flights
              </button>
              <button
                onClick={onHome}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                My Bookings
              </button>
            </div>
          )}

          {/* Auth Buttons / User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated ? (
              /* User Menu */
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">{userEmail}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onHome();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register Buttons */
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={onLogin}
                  className="text-gray-700 hover:text-blue-600 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </button>
                <button
                  onClick={onRegister}
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <span className="hidden sm:inline">Sign Up</span>
                  <span className="sm:hidden">Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu - close when clicking outside */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navigation; 
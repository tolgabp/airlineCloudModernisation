import React from 'react';
import { Flight } from '../../hooks/useFlightSearch';

interface EnhancedFlightListProps {
  flights: Flight[];
  onFlightSelect?: (flight: Flight) => void;
}

const EnhancedFlightList: React.FC<EnhancedFlightListProps> = ({ 
  flights, 
  onFlightSelect 
}) => {
  console.log('EnhancedFlightList received flights:', flights);
  console.log('Number of flights to display:', flights.length);

  if (flights.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-500">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">No flights found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Try adjusting your search criteria or check back later for new flights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table - Show on medium screens and up */}
      <div className="hidden lg:block overflow-hidden shadow-soft ring-1 ring-gray-200 rounded-2xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Flight
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Route
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Departure
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="relative px-6 py-4">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {flights.map((flight, index) => (
              <tr 
                key={flight.id} 
                className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="bg-airline-100 w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-airline-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">#{flight.id}</div>
                      <div className="text-xs text-gray-500">SkyBook Airlines</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-semibold text-gray-900">{flight.from}</div>
                    <div className="mx-3 text-airline-400">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">{flight.to}</div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-medium">{flight.time}</div>
                  <div className="text-xs text-gray-500">Local time</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="status-badge status-success">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    On Time
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onFlightSelect && onFlightSelect(flight)}
                    className="btn-primary px-6 py-2 text-sm font-medium"
                    disabled={!onFlightSelect}
                    style={!onFlightSelect ? { opacity: 0.5, pointerEvents: 'none' } : {}}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Book Now
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tablet Layout - Show on medium screens but hide on large */}
      <div className="hidden md:block lg:hidden space-y-4">
        {flights.map((flight, index) => (
          <div 
            key={flight.id}
            className="card card-hover p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <div className="bg-airline-100 w-12 h-12 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-airline-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Flight #{flight.id}</div>
                  <div className="text-xs text-gray-500">SkyBook Airlines</div>
                </div>
              </div>
              <span className="status-badge status-success">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                On Time
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-sm font-semibold text-gray-900">{flight.from}</div>
                <div className="text-airline-400">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-gray-900">{flight.to}</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-900 font-medium">Departure</div>
                <div className="text-sm text-gray-500">{flight.time}</div>
              </div>
              <button
                onClick={() => onFlightSelect && onFlightSelect(flight)}
                className="btn-primary px-6 py-3 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Cards - Show on small screens only */}
      <div className="md:hidden space-y-4">
        {flights.map((flight, index) => (
          <div 
            key={flight.id}
            className="card card-hover p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <div className="bg-airline-100 w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-airline-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Flight #{flight.id}</div>
                  <div className="text-xs text-gray-500">SkyBook Airlines</div>
                </div>
              </div>
              <span className="status-badge status-success">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                On Time
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="text-sm font-semibold text-gray-900">{flight.from}</div>
                <div className="text-airline-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-gray-900">{flight.to}</div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <div>
                <div className="text-sm text-gray-900 font-medium">Departure</div>
                <div className="text-sm text-gray-500">{flight.time}</div>
              </div>
              <button
                onClick={() => onFlightSelect && onFlightSelect(flight)}
                className="w-full btn-primary py-3 text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedFlightList; 
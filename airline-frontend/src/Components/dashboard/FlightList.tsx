import React from 'react';
import { useFlightSearch, Flight } from '../../hooks/useFlightSearch';
import FlightSearchFilters from './FlightSearchFilters';
import EnhancedFlightList from './EnhancedFlightList';

interface FlightListProps {
  flights: Flight[];
  onFlightSelect?: (flight: Flight) => void;
}

const FlightList: React.FC<FlightListProps> = ({ flights, onFlightSelect }) => {
  const {
    filters,
    filteredFlights,
    uniqueOrigins,
    uniqueDestinations,
    hasActiveFilters,
    updateFilter,
    clearFilters
  } = useFlightSearch(flights);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mr-4">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Available Flights</h2>
          <p className="text-sm text-gray-600">Search and filter flights to find your perfect journey</p>
        </div>
      </div>

      {/* Search and Filter Controls */}
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

      {/* Show welcome message when no search has been performed */}
      {!hasActiveFilters && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-500">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to find your flight?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Use the search bar above to find flights by origin, destination, or flight number.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search by city
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Filter by origin
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Filter by destination
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Filter by availability
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Flight List - Only show when there are active filters */}
      {hasActiveFilters && (
        <EnhancedFlightList 
          flights={filteredFlights} 
          onFlightSelect={onFlightSelect}
        />
      )}
    </div>
  );
};

export default FlightList;
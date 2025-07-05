import React from 'react';
import { FlightFilters } from '../../hooks/useFlightSearch';

interface FlightSearchFiltersProps {
  filters: FlightFilters;
  uniqueOrigins: string[];
  uniqueDestinations: string[];
  onFilterChange: (key: keyof FlightFilters, value: string) => void;
  onClearFilters: () => void;
  totalFlights: number;
  filteredCount: number;
  hasActiveFilters: boolean;
}

const FlightSearchFilters: React.FC<FlightSearchFiltersProps> = ({
  filters,
  uniqueOrigins,
  uniqueDestinations,
  onFilterChange,
  onClearFilters,
  totalFlights,
  filteredCount,
  hasActiveFilters
}) => {
  return (
    <div className="space-y-6 mb-8">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search flights by origin, destination, or flight number..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="input-field pl-12 text-base"
        />
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Origin Filter */}
        <div>
          <label htmlFor="origin-filter" className="block text-sm font-semibold text-gray-700 mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-airline-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Origin
            </div>
          </label>
          <select
            id="origin-filter"
            value={filters.origin}
            onChange={(e) => onFilterChange('origin', e.target.value)}
            className="input-field"
          >
            <option value="">All Origins</option>
            {uniqueOrigins.map(origin => (
              <option key={origin} value={origin}>{origin}</option>
            ))}
          </select>
        </div>

        {/* Destination Filter */}
        <div>
          <label htmlFor="destination-filter" className="block text-sm font-semibold text-gray-700 mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-airline-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Destination
            </div>
          </label>
          <select
            id="destination-filter"
            value={filters.destination}
            onChange={(e) => onFilterChange('destination', e.target.value)}
            className="input-field"
          >
            <option value="">All Destinations</option>
            {uniqueDestinations.map(destination => (
              <option key={destination} value={destination}>{destination}</option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        <div>
          <label htmlFor="availability-filter" className="block text-sm font-semibold text-gray-700 mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-airline-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Availability
            </div>
          </label>
          <select
            id="availability-filter"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="input-field"
          >
            <option value="">All Flights</option>
            <option value="available">Available Seats</option>
            <option value="full">Fully Booked</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
              hasActiveFilters
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-800 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                : 'bg-gray-50 text-gray-400 border border-gray-100 cursor-not-allowed'
            }`}
          >
            <svg className={`w-4 h-4 mr-2 ${hasActiveFilters ? 'text-gray-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary - Only show when there are active filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-4 bg-airline-50 rounded-xl border border-airline-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-airline-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-airline-800">
              Showing {filteredCount} of {totalFlights} flights
            </span>
          </div>
          <span className="status-badge status-info">
            Filtered
          </span>
        </div>
      )}
    </div>
  );
};

export default FlightSearchFilters; 
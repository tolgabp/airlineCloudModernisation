import React from 'react';
import { FlightFilters } from '../hooks/useFlightSearch';

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
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search flights by origin, destination, or flight number..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Origin Filter */}
        <div>
          <label htmlFor="origin-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Origin
          </label>
          <select
            id="origin-filter"
            value={filters.origin}
            onChange={(e) => onFilterChange('origin', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Origins</option>
            {uniqueOrigins.map(origin => (
              <option key={origin} value={origin}>{origin}</option>
            ))}
          </select>
        </div>

        {/* Destination Filter */}
        <div>
          <label htmlFor="destination-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Destination
          </label>
          <select
            id="destination-filter"
            value={filters.destination}
            onChange={(e) => onFilterChange('destination', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Destinations</option>
            {uniqueDestinations.map(destination => (
              <option key={destination} value={destination}>{destination}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Status</option>
            <option value="on-time">On Time</option>
            <option value="delayed">Delayed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Clear Filters Button */}
        <div className="flex items-end">
          <button
            onClick={onClearFilters}
            disabled={!hasActiveFilters}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Summary - Only show when there are active filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredCount} of {totalFlights} flights
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Filtered
            </span>
          </span>
          <button
            onClick={onClearFilters}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FlightSearchFilters; 
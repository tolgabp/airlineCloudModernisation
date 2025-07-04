import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export interface Flight {
  id: number;
  from: string;
  to: string;
  time: string;
}

export interface FlightFilters {
  search: string;
  origin: string;
  destination: string;
  status: string;
}

export const useFlightSearch = (flights: Flight[]) => {
  const [filters, setFilters] = useState<FlightFilters>({
    search: '',
    origin: '',
    destination: '',
    status: ''
  });

  // Debounce search input to improve performance
  const debouncedSearch = useDebounce(filters.search, 300);

  // Get unique values for filter dropdowns
  const uniqueOrigins = useMemo(() => {
    const origins = Array.from(new Set(flights.map(flight => flight.from)));
    return origins.sort();
  }, [flights]);

  const uniqueDestinations = useMemo(() => {
    const destinations = Array.from(new Set(flights.map(flight => flight.to)));
    return destinations.sort();
  }, [flights]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Boolean(filters.search || filters.origin || filters.destination || filters.status);
  }, [filters]);

  // Filter flights based on search and filter criteria
  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      // Search filter (case-insensitive) - using debounced search
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch = !debouncedSearch || 
        flight.from.toLowerCase().includes(searchLower) ||
        flight.to.toLowerCase().includes(searchLower) ||
        flight.id.toString().includes(searchLower);

      // Origin filter
      const matchesOrigin = !filters.origin || flight.from === filters.origin;

      // Destination filter
      const matchesDestination = !filters.destination || flight.to === filters.destination;

      // Status filter (for future use - currently all flights are active)
      const matchesStatus = !filters.status || filters.status === 'all';

      return matchesSearch && matchesOrigin && matchesDestination && matchesStatus;
    });
  }, [flights, filters, debouncedSearch]);

  // Update filters
  const updateFilter = useCallback((key: keyof FlightFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      origin: '',
      destination: '',
      status: ''
    });
  }, []);

  return {
    filters,
    filteredFlights,
    uniqueOrigins,
    uniqueDestinations,
    hasActiveFilters,
    updateFilter,
    clearFilters
  };
}; 
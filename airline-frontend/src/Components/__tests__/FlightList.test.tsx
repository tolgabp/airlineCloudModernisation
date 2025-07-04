import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FlightList from '../FlightList';
import { Flight } from '../../hooks/useFlightSearch';

// Mock the useFlightSearch hook
jest.mock('../../hooks/useFlightSearch', () => ({
  useFlightSearch: jest.fn()
}));

const mockFlights: Flight[] = [
  { id: 1, from: 'New York', to: 'London', time: '10:00 AM' },
  { id: 2, from: 'London', to: 'Paris', time: '2:00 PM' },
  { id: 3, from: 'Paris', to: 'Tokyo', time: '6:00 PM' }
];

describe('FlightList', () => {
  const mockUseFlightSearch = require('../../hooks/useFlightSearch').useFlightSearch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show welcome message when no filters are active', () => {
    mockUseFlightSearch.mockReturnValue({
      filters: { search: '', origin: '', destination: '', status: '' },
      filteredFlights: mockFlights,
      uniqueOrigins: ['New York', 'London', 'Paris'],
      uniqueDestinations: ['London', 'Paris', 'Tokyo'],
      hasActiveFilters: false,
      updateFilter: jest.fn(),
      clearFilters: jest.fn()
    });

    render(<FlightList flights={mockFlights} />);

    expect(screen.getByText('Ready to find your flight?')).toBeInTheDocument();
    expect(screen.getByText('Use the search bar above to find flights by origin, destination, or flight number.')).toBeInTheDocument();
    expect(screen.queryByText('Flight #1')).not.toBeInTheDocument();
  });

  it('should show flight list when filters are active', () => {
    mockUseFlightSearch.mockReturnValue({
      filters: { search: 'New York', origin: '', destination: '', status: '' },
      filteredFlights: [mockFlights[0]],
      uniqueOrigins: ['New York', 'London', 'Paris'],
      uniqueDestinations: ['London', 'Paris', 'Tokyo'],
      hasActiveFilters: true,
      updateFilter: jest.fn(),
      clearFilters: jest.fn()
    });

    render(<FlightList flights={mockFlights} />);

    expect(screen.queryByText('Ready to find your flight?')).not.toBeInTheDocument();
    expect(screen.getByText('Flight #1')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
    expect(screen.getAllByText('On Time').length).toBeGreaterThan(0);
  });

  it('should show search and filter controls', () => {
    mockUseFlightSearch.mockReturnValue({
      filters: { search: '', origin: '', destination: '', status: '' },
      filteredFlights: mockFlights,
      uniqueOrigins: ['New York', 'London', 'Paris'],
      uniqueDestinations: ['London', 'Paris', 'Tokyo'],
      hasActiveFilters: false,
      updateFilter: jest.fn(),
      clearFilters: jest.fn()
    });

    render(<FlightList flights={mockFlights} />);

    expect(screen.getByPlaceholderText('Search flights by origin, destination, or flight number...')).toBeInTheDocument();
    expect(screen.getByText('Origin')).toBeInTheDocument();
    expect(screen.getByText('Destination')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
}); 
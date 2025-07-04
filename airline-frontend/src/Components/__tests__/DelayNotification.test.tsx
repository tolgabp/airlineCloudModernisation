import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import DelayNotification from '../DelayNotification';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DelayNotification Component', () => {
  const mockToken = 'test-token';
  const mockOnRebookingSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no delay notifications', () => {
    render(
      <DelayNotification 
        token={mockToken} 
        bookings={[]}
        onRebookingSuccess={mockOnRebookingSuccess} 
      />
    );

    expect(screen.getByText('Delay Notifications')).toBeInTheDocument();
    expect(screen.getByText(/No active delay notifications/)).toBeInTheDocument();
    expect(screen.getByText('Simulate Delay')).toBeInTheDocument();
  });

  it('simulates delay notification successfully', async () => {
    const mockDelayResponse = {
      data: {
        id: 1,
        bookingId: 1,
        flightId: 1,
        reason: 'Technical issues with aircraft',
        status: 'PENDING'
      }
    };

    const mockSuggestionsResponse = {
      data: {
        delayNotificationId: 1,
        delayReason: 'Technical issues with aircraft',
        suggestions: [
          {
            flightId: 2,
            origin: 'New York',
            destination: 'London',
            departureTime: '2024-01-15T10:00:00',
            arrivalTime: '2024-01-15T17:00:00',
            availableSeats: 5,
            price: 250.0,
            priority: 1
          }
        ]
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockDelayResponse);
    mockedAxios.get.mockResolvedValueOnce(mockSuggestionsResponse);

    render(
      <DelayNotification 
        token={mockToken} 
        bookings={[]}
        onRebookingSuccess={mockOnRebookingSuccess} 
      />
    );

    const simulateButton = screen.getByText('Simulate Delay');
    fireEvent.click(simulateButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8081/api/recommendations/notify-delay',
        expect.objectContaining({
          bookingId: 1,
          flightId: 1,
          reason: 'Technical issues with aircraft'
        }),
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` }
        })
      );
    });

    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:8081/api/recommendations/suggestions?bookingId=1',
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` }
        })
      );
    });
  });

  it('handles delay simulation error gracefully', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

    render(
      <DelayNotification 
        token={mockToken} 
        bookings={[]}
        onRebookingSuccess={mockOnRebookingSuccess} 
      />
    );

    const simulateButton = screen.getByText('Simulate Delay');
    fireEvent.click(simulateButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalled();
    });
  });

  it('displays delay notification with suggestions', async () => {
    const mockDelayResponse = {
      data: {
        id: 1,
        bookingId: 1,
        flightId: 1,
        reason: 'Technical issues with aircraft',
        status: 'PENDING'
      }
    };

    const mockSuggestionsResponse = {
      data: {
        delayNotificationId: 1,
        delayReason: 'Technical issues with aircraft',
        suggestions: [
          {
            flightId: 2,
            origin: 'New York',
            destination: 'London',
            departureTime: '2024-01-15T10:00:00',
            arrivalTime: '2024-01-15T17:00:00',
            availableSeats: 5,
            price: 250.0,
            priority: 1
          }
        ]
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockDelayResponse);
    mockedAxios.get.mockResolvedValueOnce(mockSuggestionsResponse);

    render(
      <DelayNotification 
        token={mockToken} 
        bookings={[]}
        onRebookingSuccess={mockOnRebookingSuccess} 
      />
    );

    const simulateButton = screen.getByText('Simulate Delay');
    fireEvent.click(simulateButton);

    await waitFor(() => {
      expect(screen.getByText('⚠️ Flight Delay Notification')).toBeInTheDocument();
      expect(screen.getByText(/Technical issues with aircraft/)).toBeInTheDocument();
      expect(screen.getByText('Alternative Flights:')).toBeInTheDocument();
      expect(screen.getByText('New York → London')).toBeInTheDocument();
      expect(screen.getByText('Rebook')).toBeInTheDocument();
    });
  });

  it('handles rebooking successfully', async () => {
    // First simulate delay
    const mockDelayResponse = {
      data: {
        id: 1,
        bookingId: 1,
        flightId: 1,
        reason: 'Technical issues with aircraft',
        status: 'PENDING'
      }
    };

    const mockSuggestionsResponse = {
      data: {
        delayNotificationId: 1,
        delayReason: 'Technical issues with aircraft',
        suggestions: [
          {
            flightId: 2,
            origin: 'New York',
            destination: 'London',
            departureTime: '2024-01-15T10:00:00',
            arrivalTime: '2024-01-15T17:00:00',
            availableSeats: 5,
            price: 250.0,
            priority: 1
          }
        ]
      }
    };

    mockedAxios.post
      .mockResolvedValueOnce(mockDelayResponse)
      .mockResolvedValueOnce({ data: { success: true } });
    mockedAxios.get.mockResolvedValueOnce(mockSuggestionsResponse);
    mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });

    render(
      <DelayNotification 
        token={mockToken} 
        bookings={[]}
        onRebookingSuccess={mockOnRebookingSuccess} 
      />
    );

    const simulateButton = screen.getByText('Simulate Delay');
    fireEvent.click(simulateButton);

    await waitFor(() => {
      expect(screen.getByText('Rebook')).toBeInTheDocument();
    });

    const rebookButton = screen.getByText('Rebook');
    fireEvent.click(rebookButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        'http://localhost:8081/api/bookings/1',
        { flightId: 2 },
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` }
        })
      );
    });

    await waitFor(() => {
      expect(mockOnRebookingSuccess).toHaveBeenCalled();
    });
  });

  it('handles rebooking error gracefully', async () => {
    // First simulate delay
    const mockDelayResponse = {
      data: {
        id: 1,
        bookingId: 1,
        flightId: 1,
        reason: 'Technical issues with aircraft',
        status: 'PENDING'
      }
    };

    const mockSuggestionsResponse = {
      data: {
        delayNotificationId: 1,
        delayReason: 'Technical issues with aircraft',
        suggestions: [
          {
            flightId: 2,
            origin: 'New York',
            destination: 'London',
            departureTime: '2024-01-15T10:00:00',
            arrivalTime: '2024-01-15T17:00:00',
            availableSeats: 5,
            price: 250.0,
            priority: 1
          }
        ]
      }
    };

    mockedAxios.post.mockResolvedValueOnce(mockDelayResponse);
    mockedAxios.get.mockResolvedValueOnce(mockSuggestionsResponse);
    mockedAxios.put.mockRejectedValueOnce(new Error('Rebooking failed'));

    render(
      <DelayNotification 
        token={mockToken} 
        bookings={[]}
        onRebookingSuccess={mockOnRebookingSuccess} 
      />
    );

    const simulateButton = screen.getByText('Simulate Delay');
    fireEvent.click(simulateButton);

    await waitFor(() => {
      expect(screen.getByText('Rebook')).toBeInTheDocument();
    });

    const rebookButton = screen.getByText('Rebook');
    fireEvent.click(rebookButton);

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalled();
    });
  });

  it('disables simulate button when loading', async () => {
    mockedAxios.post.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <DelayNotification 
        token={mockToken} 
        bookings={[]}
        onRebookingSuccess={mockOnRebookingSuccess} 
      />
    );

    const simulateButton = screen.getByText('Simulate Delay');
    fireEvent.click(simulateButton);

    expect(screen.getByText('Simulating...')).toBeInTheDocument();
    expect(screen.getByText('Simulating...')).toBeDisabled();
  });
}); 
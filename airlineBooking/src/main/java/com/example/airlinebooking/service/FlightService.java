package com.example.airlinebooking.service;

import com.example.airlinebooking.model.Flight;
import com.example.airlinebooking.repository.FlightRepository;
import com.example.airlinebooking.exception.FlightNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FlightService {
    private final FlightRepository flightRepository;

    public FlightService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    public Flight createFlight(Flight flight) {
        // Validate flight data
        if (flight.getCapacity() < 1) {
            throw new IllegalArgumentException("Capacity must be at least 1");
        }
        
        if (flight.getDepartureTime().isAfter(flight.getArrivalTime())) {
            throw new IllegalArgumentException("Departure time must be before arrival time");
        }
        
        // Set initial available seats equal to capacity
        flight.setAvailableSeats(flight.getCapacity());
        
        return flightRepository.save(flight);
    }

    public Flight updateFlight(Long id, Flight updatedFlight) {
        Flight existingFlight = flightRepository.findById(id)
                .orElseThrow(() -> new FlightNotFoundException("Flight not found"));
        
        // Validate capacity changes
        if (updatedFlight.getCapacity() < existingFlight.getCapacity() - existingFlight.getAvailableSeats()) {
            throw new IllegalArgumentException("Cannot reduce capacity below number of booked seats");
        }
        
        // Update fields
        existingFlight.setOrigin(updatedFlight.getOrigin());
        existingFlight.setDestination(updatedFlight.getDestination());
        existingFlight.setDepartureTime(updatedFlight.getDepartureTime());
        existingFlight.setArrivalTime(updatedFlight.getArrivalTime());
        
        // Handle capacity changes
        int capacityDifference = updatedFlight.getCapacity() - existingFlight.getCapacity();
        existingFlight.setCapacity(updatedFlight.getCapacity());
        existingFlight.setAvailableSeats(existingFlight.getAvailableSeats() + capacityDifference);
        
        return flightRepository.save(existingFlight);
    }

    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    public Flight getFlightById(Long id) {
        return flightRepository.findById(id)
                .orElseThrow(() -> new FlightNotFoundException("Flight not found"));
    }

    public List<Flight> getAvailableFlights() {
        return flightRepository.findAll().stream()
                .filter(Flight::hasAvailableSeats)
                .toList();
    }
} 
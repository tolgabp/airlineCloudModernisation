package com.example.airlinebooking.service;

import com.example.airlinebooking.model.*;
import com.example.airlinebooking.repository.*;
import com.example.airlinebooking.exception.BookingException;
import com.example.airlinebooking.exception.FlightNotFoundException;
import com.example.airlinebooking.exception.UserNotFoundException;
import com.example.airlinebooking.exception.BookingNotFoundException;
import com.example.airlinebooking.exception.UnauthorizedAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookingService {
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final FlightRepository flightRepository;

    public BookingService(BookingRepository bookingRepository, UserRepository userRepository, FlightRepository flightRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.flightRepository = flightRepository;
    }

    public Booking createBooking(Long userId, Long flightId) {
        // Find user and flight
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        
        Flight flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new FlightNotFoundException("Flight not found with ID: " + flightId));

        // Check if user already has a confirmed booking for this flight
        Optional<Booking> existingBooking = bookingRepository.findByUserAndFlight(user, flight);
        if (existingBooking.isPresent() && existingBooking.get().getStatus() == BookingStatus.CONFIRMED) {
            throw new BookingException("You have already booked this flight");
        }

        // Check seat availability and reserve a seat atomically
        if (!flight.hasAvailableSeats()) {
            throw new BookingException("No available seats on this flight");
        }

        // Reserve the seat
        if (!flight.reserveSeat()) {
            throw new BookingException("Failed to reserve seat - flight may be full");
        }

        // Save the updated flight with new seat count
        flightRepository.save(flight);

        // Create the booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setFlight(flight);
        booking.setStatus(BookingStatus.CONFIRMED);
        
        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + bookingId));
        
        // Check if user owns this booking
        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("User " + userId + " attempted to cancel booking " + bookingId + " owned by user " + booking.getUser().getId());
        }

        // Check if booking is already cancelled
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BookingException("Booking is already cancelled");
        }

        // Cancel the booking
        booking.setStatus(BookingStatus.CANCELLED);
        
        // Release the seat back to the flight
        Flight flight = booking.getFlight();
        flight.releaseSeat();
        flightRepository.save(flight);
        
        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        return bookingRepository.findByUser(user);
    }

    public Booking getBookingById(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + bookingId));
        
        // Check if user owns this booking
        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("User " + userId + " attempted to view booking " + bookingId + " owned by user " + booking.getUser().getId());
        }
        
        return booking;
    }

    public Booking updateBooking(Long bookingId, Long userId, Long newFlightId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + bookingId));
        
        // Check if user owns this booking
        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("User " + userId + " attempted to update booking " + bookingId + " owned by user " + booking.getUser().getId());
        }

        // Check if booking is already cancelled
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BookingException("Cannot update a cancelled booking");
        }

        // Find the new flight
        Flight newFlight = flightRepository.findById(newFlightId)
                .orElseThrow(() -> new FlightNotFoundException("New flight not found with ID: " + newFlightId));

        // Check if user is trying to update to the same flight
        if (booking.getFlight().getId().equals(newFlightId)) {
            throw new BookingException("Cannot update booking to the same flight");
        }

        // Check if new flight has available seats
        if (!newFlight.hasAvailableSeats()) {
            throw new BookingException("No available seats on the new flight");
        }

        // Check if user already has a booking for the new flight
        Optional<Booking> existingBooking = bookingRepository.findByUserAndFlight(booking.getUser(), newFlight);
        if (existingBooking.isPresent() && existingBooking.get().getStatus() == BookingStatus.CONFIRMED 
            && !existingBooking.get().getId().equals(bookingId)) {
            throw new BookingException("You already have a booking for this flight");
        }

        // Release seat from old flight
        Flight oldFlight = booking.getFlight();
        oldFlight.releaseSeat();
        flightRepository.save(oldFlight);

        // Reserve seat on new flight
        if (!newFlight.reserveSeat()) {
            throw new BookingException("Failed to reserve seat on new flight");
        }
        flightRepository.save(newFlight);

        // Update booking with new flight
        booking.setFlight(newFlight);
        
        return bookingRepository.save(booking);
    }
    
    public Booking updateBookingStatus(Long bookingId, Long userId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + bookingId));
        
        // Check if user owns this booking
        if (!booking.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("User " + userId + " attempted to update status of booking " + bookingId + " owned by user " + booking.getUser().getId());
        }

        // Update the booking status
        booking.setStatus(newStatus);
        
        return bookingRepository.save(booking);
    }
    
    // Method for recommendation engine to update booking status without user authentication
    public Booking updateBookingStatusForSystem(Long bookingId, BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new BookingNotFoundException("Booking not found with ID: " + bookingId));

        // Update the booking status
        booking.setStatus(newStatus);
        
        return bookingRepository.save(booking);
    }
} 
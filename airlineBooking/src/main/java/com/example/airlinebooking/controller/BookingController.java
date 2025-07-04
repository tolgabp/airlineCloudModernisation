package com.example.airlinebooking.controller;

import com.example.airlinebooking.model.Booking;
import com.example.airlinebooking.model.User;
import com.example.airlinebooking.dto.BookingRequest;
import com.example.airlinebooking.dto.BookingUpdateRequest;
import com.example.airlinebooking.dto.BookingStatusUpdateRequest;
import com.example.airlinebooking.service.BookingService;
import com.example.airlinebooking.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;

    public BookingController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings() {
        User currentUser = getCurrentUser();
        List<Booking> bookings = bookingService.getUserBookings(currentUser.getId());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBooking(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Booking booking = bookingService.getBookingById(id, currentUser.getId());
        return ResponseEntity.ok(booking);
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest request) {
        User currentUser = getCurrentUser();
        Booking booking = bookingService.createBooking(currentUser.getId(), request.getFlightId());
        return ResponseEntity.ok(booking);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        Booking cancelledBooking = bookingService.cancelBooking(id, currentUser.getId());
        return ResponseEntity.ok(cancelledBooking);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @Valid @RequestBody BookingUpdateRequest request) {
        User currentUser = getCurrentUser();
        Booking updatedBooking = bookingService.updateBooking(id, currentUser.getId(), request.getFlightId());
        return ResponseEntity.ok(updatedBooking);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(@PathVariable Long id, @RequestBody BookingStatusUpdateRequest request) {
        User currentUser = getCurrentUser();
        Booking updatedBooking = bookingService.updateBookingStatus(id, currentUser.getId(), request.getStatus());
        return ResponseEntity.ok(updatedBooking);
    }

    // System endpoint for recommendation engine to update booking status
    @PutMapping("/{id}/status/system")
    public ResponseEntity<Booking> updateBookingStatusForSystem(@PathVariable Long id, @RequestBody BookingStatusUpdateRequest request) {
        Booking updatedBooking = bookingService.updateBookingStatusForSystem(id, request.getStatus());
        return ResponseEntity.ok(updatedBooking);
    }

    // Helper method to get current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authentication failed - user not found"));
    }
}
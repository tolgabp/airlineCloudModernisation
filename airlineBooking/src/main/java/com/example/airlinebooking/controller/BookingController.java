package com.example.airlinebooking.controller;

import com.example.airlinebooking.model.Booking;
import com.example.airlinebooking.repository.BookingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;

    public BookingController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    // GET /bookings - list all bookings
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // GET /bookings/{id} - get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBooking(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null || !username.equals(booking.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(booking);
    }

    // GET /bookings/my - get bookings for the authenticated user
    @GetMapping("/my")
    public List<Booking> getMyBookings() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return bookingRepository.findByUsername(username);
    }

    // POST /bookings - create a new booking
    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        booking.setUsername(username);
        return bookingRepository.save(booking);
    }
}
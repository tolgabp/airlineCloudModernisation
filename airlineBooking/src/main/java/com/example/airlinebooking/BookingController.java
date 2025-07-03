package com.example.airlinebooking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    // GET /bookings - list all bookings
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // GET /bookings/{id} - get booking by ID
    @GetMapping("/{id}")
    public Optional<Booking> getBookingById(@PathVariable Long id) {
        return bookingRepository.findById(id);
    }

    // POST /bookings - create a new booking
    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        return bookingRepository.save(booking);
    }
}
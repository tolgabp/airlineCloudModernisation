package com.example.airlinebooking.repository;

import com.example.airlinebooking.model.Booking;
import com.example.airlinebooking.model.BookingStatus;
import com.example.airlinebooking.model.Flight;
import com.example.airlinebooking.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByUserAndFlight(User user, Flight flight);
    long countByFlightAndStatus(Flight flight, BookingStatus status);
    List<Booking> findByUser(User user);
    List<Booking> findByUserEmail(String email);
    void deleteByUser(User user);
} 
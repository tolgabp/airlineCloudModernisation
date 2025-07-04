package com.example.airlinebooking.repository;

import com.example.airlinebooking.model.Flight;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FlightRepository extends JpaRepository<Flight, Long> {
} 
package com.example.airlinebooking.controller;

import com.example.airlinebooking.model.Flight;
import com.example.airlinebooking.service.FlightService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/flights")
public class FlightController {
    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @GetMapping
    public ResponseEntity<List<Flight>> getAllFlights() {
        List<Flight> flights = flightService.getAllFlights();
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/available")
    public ResponseEntity<List<Flight>> getAvailableFlights() {
        List<Flight> flights = flightService.getAvailableFlights();
        return ResponseEntity.ok(flights);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flight> getFlightById(@PathVariable Long id) {
        Flight flight = flightService.getFlightById(id);
        return ResponseEntity.ok(flight);
    }

    @PostMapping
    public ResponseEntity<Flight> createFlight(@Valid @RequestBody Flight flight) {
        Flight createdFlight = flightService.createFlight(flight);
        return ResponseEntity.ok(createdFlight);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Flight> updateFlight(@PathVariable Long id, @Valid @RequestBody Flight flight) {
        Flight updatedFlight = flightService.updateFlight(id, flight);
        return ResponseEntity.ok(updatedFlight);
    }
} 
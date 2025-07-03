package com.example.airlinebooking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/flights")
public class FlightController {
    @Autowired
    private FlightRepository flightRepository;

    @GetMapping
    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }

    @GetMapping("/{id}")
    public Optional<Flight> getFlightById(@PathVariable Long id) {
        return flightRepository.findById(id);
    }

    @PostMapping
    public Flight createFlight(@RequestBody Flight flight) {
        return flightRepository.save(flight);
    }
} 
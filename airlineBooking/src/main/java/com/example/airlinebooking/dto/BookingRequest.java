package com.example.airlinebooking.dto;

import jakarta.validation.constraints.NotNull;

public class BookingRequest {
    @NotNull(message = "Flight ID is required")
    private Long flightId;

    // Getters and setters
    public Long getFlightId() {
        return flightId;
    }

    public void setFlightId(Long flightId) {
        this.flightId = flightId;
    }
} 
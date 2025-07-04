package com.example.airlinebooking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingUpdateRequest {
    
    @NotNull(message = "Flight ID is required")
    private Long flightId;
} 
package com.example.recommendationengine.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DelayNotificationRequest {
    
    @NotNull(message = "Booking ID is required")
    private Long bookingId;
    
    @NotNull(message = "Flight ID is required")
    private Long flightId;
    
    @NotBlank(message = "Delay reason is required")
    private String reason;
    
    @NotNull(message = "Original departure time is required")
    private LocalDateTime originalDepartureTime;
    
    @NotNull(message = "New departure time is required")
    private LocalDateTime newDepartureTime;
} 
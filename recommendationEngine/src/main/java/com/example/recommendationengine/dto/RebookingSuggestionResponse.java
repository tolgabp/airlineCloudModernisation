package com.example.recommendationengine.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RebookingSuggestionResponse {
    
    private Long delayNotificationId;
    private String delayReason;
    private LocalDateTime originalDepartureTime;
    private LocalDateTime newDepartureTime;
    private List<Suggestion> suggestions;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Suggestion {
        private Long flightId;
        private String origin;
        private String destination;
        private LocalDateTime departureTime;
        private LocalDateTime arrivalTime;
        private Integer availableSeats;
        private Double price;
        private Integer priority;
    }
} 
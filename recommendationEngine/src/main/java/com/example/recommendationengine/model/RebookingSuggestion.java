package com.example.recommendationengine.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "rebooking_suggestions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RebookingSuggestion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long delayNotificationId;
    
    @Column(nullable = false)
    private Long suggestedFlightId;
    
    @Column(nullable = false)
    private String origin;
    
    @Column(nullable = false)
    private String destination;
    
    @Column(nullable = false)
    private LocalDateTime departureTime;
    
    @Column(nullable = false)
    private LocalDateTime arrivalTime;
    
    @Column(nullable = false)
    private Integer availableSeats;
    
    @Column(nullable = false)
    private Double price;
    
    @Column(nullable = false)
    private Integer priority; // 1 = highest priority
    
    @Enumerated(EnumType.STRING)
    private SuggestionStatus status;
    
    public enum SuggestionStatus {
        AVAILABLE, BOOKED, EXPIRED
    }
} 
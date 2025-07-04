package com.example.recommendationengine.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "delay_notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DelayNotification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long bookingId;
    
    @Column(nullable = false)
    private Long flightId;
    
    @Column(nullable = false)
    private String reason;
    
    @Column(nullable = false)
    private LocalDateTime originalDepartureTime;
    
    @Column(nullable = false)
    private LocalDateTime newDepartureTime;
    
    @Column(nullable = false)
    private LocalDateTime notificationTime;
    
    @Enumerated(EnumType.STRING)
    private NotificationStatus status;
    
    public enum NotificationStatus {
        PENDING, PROCESSED, RESOLVED
    }
} 
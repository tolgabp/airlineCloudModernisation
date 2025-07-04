package com.example.recommendationengine.repository;

import com.example.recommendationengine.model.DelayNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DelayNotificationRepository extends JpaRepository<DelayNotification, Long> {
    
    List<DelayNotification> findByBookingId(Long bookingId);
    
    List<DelayNotification> findByBookingIdOrderByNotificationTimeDesc(Long bookingId);
    
    Optional<DelayNotification> findFirstByBookingIdOrderByNotificationTimeDesc(Long bookingId);
    
    List<DelayNotification> findByStatus(DelayNotification.NotificationStatus status);
    
    List<DelayNotification> findByFlightId(Long flightId);
} 
package com.example.recommendationengine.service;

import com.example.recommendationengine.model.DelayNotification;
import com.example.recommendationengine.model.RebookingSuggestion;
import com.example.recommendationengine.repository.DelayNotificationRepository;
import com.example.recommendationengine.repository.RebookingSuggestionRepository;
import com.example.recommendationengine.dto.DelayNotificationRequest;
import com.example.recommendationengine.dto.RebookingSuggestionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class DelayNotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(DelayNotificationService.class);
    
    private final DelayNotificationRepository delayNotificationRepository;
    private final RebookingSuggestionRepository rebookingSuggestionRepository;
    private final RestTemplate restTemplate;
    
    @Value("${cloud.api.base-url}")
    private String cloudApiBaseUrl;
    
    @Value("${airline.booking.base-url}")
    private String airlineBookingBaseUrl;
    
    @Autowired
    public DelayNotificationService(DelayNotificationRepository delayNotificationRepository,
                                   RebookingSuggestionRepository rebookingSuggestionRepository,
                                   RestTemplate restTemplate) {
        this.delayNotificationRepository = delayNotificationRepository;
        this.rebookingSuggestionRepository = rebookingSuggestionRepository;
        this.restTemplate = restTemplate;
    }
    
    public DelayNotification createDelayNotification(DelayNotificationRequest request) {
        // Check if a delay notification already exists for this booking
        Optional<DelayNotification> existingNotification = delayNotificationRepository.findFirstByBookingIdOrderByNotificationTimeDesc(request.getBookingId());
        if (existingNotification.isPresent()) {
            // Update the existing notification instead of creating a new one
            DelayNotification notification = existingNotification.get();
            notification.setReason(request.getReason());
            notification.setOriginalDepartureTime(request.getOriginalDepartureTime());
            notification.setNewDepartureTime(request.getNewDepartureTime());
            notification.setNotificationTime(LocalDateTime.now());
            notification.setStatus(DelayNotification.NotificationStatus.PENDING);
            
            DelayNotification savedNotification = delayNotificationRepository.save(notification);
            
            // Update booking status to DELAYED
            updateBookingStatusToDelayed(request.getBookingId());
            
            // Regenerate rebooking suggestions
            generateRebookingSuggestions(savedNotification);
            
            return savedNotification;
        }
        
        // Create new delay notification
        DelayNotification notification = new DelayNotification();
        notification.setBookingId(request.getBookingId());
        notification.setFlightId(request.getFlightId());
        notification.setReason(request.getReason());
        notification.setOriginalDepartureTime(request.getOriginalDepartureTime());
        notification.setNewDepartureTime(request.getNewDepartureTime());
        notification.setNotificationTime(LocalDateTime.now());
        notification.setStatus(DelayNotification.NotificationStatus.PENDING);
        
        DelayNotification savedNotification = delayNotificationRepository.save(notification);
        
        // Update booking status to DELAYED
        updateBookingStatusToDelayed(request.getBookingId());
        
        // Generate rebooking suggestions
        generateRebookingSuggestions(savedNotification);
        
        return savedNotification;
    }
    
    private void updateBookingStatusToDelayed(Long bookingId) {
        try {
            // Call the proxy layer to update the booking status using system endpoint
            String updateUrl = cloudApiBaseUrl + "/api/bookings/" + bookingId + "/status/system";
            String updateRequest = "{\"status\":\"DELAYED\"}";
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(updateRequest, headers);
            
            restTemplate.put(updateUrl, entity);
        } catch (Exception e) {
            // Log error but don't fail the notification creation
            logger.error("Error updating booking status to DELAYED: " + e.getMessage());
        }
    }
    
    private void generateRebookingSuggestions(DelayNotification notification) {
        try {
            // Clear existing suggestions for this notification
            rebookingSuggestionRepository.deleteByDelayNotificationId(notification.getId());
            
            // Get the original flight to find its origin
            String originalFlightUrl = airlineBookingBaseUrl + "/api/flights/" + notification.getFlightId();
            ResponseEntity<Object> originalFlightResponse = 
                restTemplate.getForEntity(originalFlightUrl, Object.class);
            
            if (originalFlightResponse.getBody() != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> originalFlight = (Map<String, Object>) originalFlightResponse.getBody();
                String originalOrigin = (String) originalFlight.get("origin");
                
                // Get all available flights from the backend
                String flightsUrl = airlineBookingBaseUrl + "/api/flights";
                ResponseEntity<Object[]> response = restTemplate.getForEntity(flightsUrl, Object[].class);
                
                if (response.getBody() != null) {
                    Object[] flightsArray = response.getBody();
                    List<Map<String, Object>> flights = new java.util.ArrayList<>();
                    
                    // Convert Object[] to List<Map<String, Object>>
                    for (Object flightObj : flightsArray) {
                        if (flightObj instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> flight = (Map<String, Object>) flightObj;
                            flights.add(flight);
                        }
                    }
                    
                    // Filter flights that match the origin and have available seats
                    List<Map<String, Object>> availableFlights = flights.stream()
                        .filter(flight -> {
                            String origin = (String) flight.get("origin");
                            Integer availableSeats = (Integer) flight.get("availableSeats");
                            Long flightId = Long.valueOf(flight.get("id").toString());
                            
                            return origin.equals(originalOrigin) && 
                                   availableSeats > 0 && 
                                   !flightId.equals(notification.getFlightId());
                        })
                        .sorted((f1, f2) -> {
                            // Sort by departure time (earliest first)
                            String dep1 = (String) f1.get("departureTime");
                            String dep2 = (String) f2.get("departureTime");
                            return dep1.compareTo(dep2);
                        })
                        .collect(Collectors.toList());
                    
                    // Create rebooking suggestions (up to 5 alternatives)
                    for (int i = 0; i < Math.min(availableFlights.size(), 5); i++) {
                        Map<String, Object> flight = availableFlights.get(i);
                        
                        RebookingSuggestion suggestion = new RebookingSuggestion();
                        suggestion.setDelayNotificationId(notification.getId());
                        suggestion.setSuggestedFlightId(Long.valueOf(flight.get("id").toString()));
                        suggestion.setOrigin((String) flight.get("origin"));
                        suggestion.setDestination((String) flight.get("destination"));
                        suggestion.setDepartureTime(LocalDateTime.parse(flight.get("departureTime").toString()));
                        suggestion.setArrivalTime(LocalDateTime.parse(flight.get("arrivalTime").toString()));
                        suggestion.setAvailableSeats((Integer) flight.get("availableSeats"));
                        suggestion.setPrice(calculatePrice(flight));
                        suggestion.setPriority(i + 1);
                        suggestion.setStatus(RebookingSuggestion.SuggestionStatus.AVAILABLE);
                        
                        rebookingSuggestionRepository.save(suggestion);
                    }
                }
            }
        } catch (Exception e) {
            // Log error but don't fail the notification creation
            logger.error("Error generating rebooking suggestions: " + e.getMessage());
        }
    }
    
    private Double calculatePrice(Map<String, Object> flight) {
        // Simple price calculation based on distance and time
        // In a real system, this would be more sophisticated
        return 150.0 + Math.random() * 200.0;
    }
    
    public RebookingSuggestionResponse getRebookingSuggestions(Long bookingId) {
        DelayNotification notification = delayNotificationRepository.findFirstByBookingIdOrderByNotificationTimeDesc(bookingId)
            .orElseThrow(() -> new RuntimeException("No delay notification found for booking: " + bookingId));
        
        List<RebookingSuggestion> suggestions = rebookingSuggestionRepository
            .findByDelayNotificationIdAndStatus(notification.getId(), RebookingSuggestion.SuggestionStatus.AVAILABLE);
        
        List<RebookingSuggestionResponse.Suggestion> suggestionDtos = suggestions.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
        
        return new RebookingSuggestionResponse(
            notification.getId(),
            notification.getReason(),
            notification.getOriginalDepartureTime(),
            notification.getNewDepartureTime(),
            suggestionDtos
        );
    }
    
    private RebookingSuggestionResponse.Suggestion convertToDto(RebookingSuggestion suggestion) {
        return new RebookingSuggestionResponse.Suggestion(
            suggestion.getSuggestedFlightId(),
            suggestion.getOrigin(),
            suggestion.getDestination(),
            suggestion.getDepartureTime(),
            suggestion.getArrivalTime(),
            suggestion.getAvailableSeats(),
            suggestion.getPrice(),
            suggestion.getPriority()
        );
    }
} 
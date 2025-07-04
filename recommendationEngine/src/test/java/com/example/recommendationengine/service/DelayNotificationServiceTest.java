package com.example.recommendationengine.service;

import com.example.recommendationengine.model.DelayNotification;
import com.example.recommendationengine.model.RebookingSuggestion;
import com.example.recommendationengine.repository.DelayNotificationRepository;
import com.example.recommendationengine.repository.RebookingSuggestionRepository;
import com.example.recommendationengine.dto.DelayNotificationRequest;
import com.example.recommendationengine.dto.RebookingSuggestionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DelayNotificationServiceTest {

    @Mock
    private DelayNotificationRepository delayNotificationRepository;

    @Mock
    private RebookingSuggestionRepository rebookingSuggestionRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private DelayNotificationService delayNotificationService;

    private DelayNotification testNotification;
    private RebookingSuggestion testSuggestion;
    private DelayNotificationRequest testRequest;

    @BeforeEach
    void setUp() {
        delayNotificationService = new DelayNotificationService(
            delayNotificationRepository, 
            rebookingSuggestionRepository, 
            restTemplate
        );
        ReflectionTestUtils.setField(delayNotificationService, "legacyBaseUrl", "http://localhost:8080");

        testNotification = new DelayNotification();
        testNotification.setId(1L);
        testNotification.setBookingId(1L);
        testNotification.setFlightId(1L);
        testNotification.setReason("Technical issues");
        testNotification.setOriginalDepartureTime(LocalDateTime.now());
        testNotification.setNewDepartureTime(LocalDateTime.now().plusHours(2));
        testNotification.setNotificationTime(LocalDateTime.now());
        testNotification.setStatus(DelayNotification.NotificationStatus.PENDING);

        testSuggestion = new RebookingSuggestion();
        testSuggestion.setId(1L);
        testSuggestion.setDelayNotificationId(1L);
        testSuggestion.setSuggestedFlightId(2L);
        testSuggestion.setOrigin("New York");
        testSuggestion.setDestination("London");
        testSuggestion.setDepartureTime(LocalDateTime.now().plusHours(3));
        testSuggestion.setArrivalTime(LocalDateTime.now().plusHours(10));
        testSuggestion.setAvailableSeats(5);
        testSuggestion.setPrice(250.0);
        testSuggestion.setPriority(1);
        testSuggestion.setStatus(RebookingSuggestion.SuggestionStatus.AVAILABLE);

        testRequest = new DelayNotificationRequest();
        testRequest.setBookingId(1L);
        testRequest.setFlightId(1L);
        testRequest.setReason("Technical issues");
        testRequest.setOriginalDepartureTime(LocalDateTime.now());
        testRequest.setNewDepartureTime(LocalDateTime.now().plusHours(2));
    }

    @Test
    void testCreateDelayNotification_Success() {
        // Arrange
        when(delayNotificationRepository.save(any(DelayNotification.class))).thenReturn(testNotification);
        when(restTemplate.getForEntity(anyString(), eq(Object[].class)))
            .thenReturn(ResponseEntity.ok(new Object[0]));

        // Act
        DelayNotification result = delayNotificationService.createDelayNotification(testRequest);

        // Assert
        assertNotNull(result);
        assertEquals(testRequest.getBookingId(), result.getBookingId());
        assertEquals(testRequest.getFlightId(), result.getFlightId());
        assertEquals(testRequest.getReason(), result.getReason());
        assertEquals(DelayNotification.NotificationStatus.PENDING, result.getStatus());
        
        verify(delayNotificationRepository).save(any(DelayNotification.class));
    }

    @Test
    void testCreateDelayNotification_WithFlightData() {
        // Arrange
        when(delayNotificationRepository.save(any(DelayNotification.class))).thenReturn(testNotification);
        
        // Mock flight data
        Object[] flights = new Object[1];
        Map<String, Object> flight = Map.of(
            "id", 2L,
            "origin", "New York",
            "destination", "London",
            "departureTime", LocalDateTime.now().plusHours(3).toString(),
            "arrivalTime", LocalDateTime.now().plusHours(10).toString(),
            "availableSeats", 5
        );
        flights[0] = flight;
        
        when(restTemplate.getForEntity(anyString(), eq(Object[].class)))
            .thenReturn(ResponseEntity.ok(flights));
        when(restTemplate.getForEntity(anyString(), eq(Map.class)))
            .thenReturn(ResponseEntity.ok(Map.of("origin", "New York")));
        when(rebookingSuggestionRepository.save(any(RebookingSuggestion.class)))
            .thenReturn(testSuggestion);

        // Act
        DelayNotification result = delayNotificationService.createDelayNotification(testRequest);

        // Assert
        assertNotNull(result);
        verify(delayNotificationRepository).save(any(DelayNotification.class));
        verify(rebookingSuggestionRepository, atLeastOnce()).save(any(RebookingSuggestion.class));
    }

    @Test
    void testCreateDelayNotification_ExceptionHandling() {
        // Arrange
        when(delayNotificationRepository.save(any(DelayNotification.class))).thenReturn(testNotification);
        when(restTemplate.getForEntity(anyString(), eq(Object[].class)))
            .thenThrow(new RuntimeException("Network error"));

        // Act - Should not throw exception
        DelayNotification result = delayNotificationService.createDelayNotification(testRequest);

        // Assert
        assertNotNull(result);
        verify(delayNotificationRepository).save(any(DelayNotification.class));
        // Service should handle the exception gracefully
    }

    @Test
    void testGetRebookingSuggestions_Success() {
        // Arrange
        List<RebookingSuggestion> suggestions = Arrays.asList(testSuggestion);
        when(delayNotificationRepository.findFirstByBookingIdOrderByNotificationTimeDesc(1L)).thenReturn(Optional.of(testNotification));
        when(rebookingSuggestionRepository.findByDelayNotificationIdAndStatus(
            eq(1L), eq(RebookingSuggestion.SuggestionStatus.AVAILABLE)))
            .thenReturn(suggestions);

        // Act
        RebookingSuggestionResponse result = delayNotificationService.getRebookingSuggestions(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testNotification.getId(), result.getDelayNotificationId());
        assertEquals(testNotification.getReason(), result.getDelayReason());
        assertEquals(1, result.getSuggestions().size());
        
        RebookingSuggestionResponse.Suggestion suggestion = result.getSuggestions().get(0);
        assertEquals(testSuggestion.getSuggestedFlightId(), suggestion.getFlightId());
        assertEquals(testSuggestion.getOrigin(), suggestion.getOrigin());
        assertEquals(testSuggestion.getDestination(), suggestion.getDestination());
        assertEquals(testSuggestion.getPrice(), suggestion.getPrice());
        
        verify(delayNotificationRepository).findFirstByBookingIdOrderByNotificationTimeDesc(1L);
        verify(rebookingSuggestionRepository).findByDelayNotificationIdAndStatus(
            eq(1L), eq(RebookingSuggestion.SuggestionStatus.AVAILABLE));
    }

    @Test
    void testGetRebookingSuggestions_NoNotificationFound() {
        // Arrange
        when(delayNotificationRepository.findFirstByBookingIdOrderByNotificationTimeDesc(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            delayNotificationService.getRebookingSuggestions(999L);
        });

        verify(delayNotificationRepository).findFirstByBookingIdOrderByNotificationTimeDesc(999L);
        verify(rebookingSuggestionRepository, never()).findByDelayNotificationIdAndStatus(anyLong(), any());
    }

    @Test
    void testGetRebookingSuggestions_NoSuggestions() {
        // Arrange
        when(delayNotificationRepository.findFirstByBookingIdOrderByNotificationTimeDesc(1L)).thenReturn(Optional.of(testNotification));
        when(rebookingSuggestionRepository.findByDelayNotificationIdAndStatus(
            eq(1L), eq(RebookingSuggestion.SuggestionStatus.AVAILABLE)))
            .thenReturn(Arrays.asList());

        // Act
        RebookingSuggestionResponse result = delayNotificationService.getRebookingSuggestions(1L);

        // Assert
        assertNotNull(result);
        assertEquals(testNotification.getId(), result.getDelayNotificationId());
        assertEquals(0, result.getSuggestions().size());
        
        verify(delayNotificationRepository).findFirstByBookingIdOrderByNotificationTimeDesc(1L);
        verify(rebookingSuggestionRepository).findByDelayNotificationIdAndStatus(
            eq(1L), eq(RebookingSuggestion.SuggestionStatus.AVAILABLE));
    }
} 
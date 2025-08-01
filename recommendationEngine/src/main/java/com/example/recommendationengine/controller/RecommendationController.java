package com.example.recommendationengine.controller;

import com.example.recommendationengine.dto.DelayNotificationRequest;
import com.example.recommendationengine.dto.RebookingSuggestionResponse;
import com.example.recommendationengine.model.DelayNotification;
import com.example.recommendationengine.service.DelayNotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = {
    "https://airline-frontend-app-876da0517315.herokuapp.com",
    "https://airline-frontend-app-554a763b7738.herokuapp.com"
})
public class RecommendationController {
    
    private final DelayNotificationService delayNotificationService;
    
    public RecommendationController(DelayNotificationService delayNotificationService) {
        this.delayNotificationService = delayNotificationService;
    }
    
    @PostMapping("/notify-delay")
    public ResponseEntity<DelayNotification> notifyDelay(@Valid @RequestBody DelayNotificationRequest request) {
        DelayNotification notification = delayNotificationService.createDelayNotification(request);
        return ResponseEntity.ok(notification);
    }
    
    @GetMapping("/suggestions")
    public ResponseEntity<RebookingSuggestionResponse> getRebookingSuggestions(@RequestParam Long bookingId) {
        RebookingSuggestionResponse suggestions = delayNotificationService.getRebookingSuggestions(bookingId);
        return ResponseEntity.ok(suggestions);
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Recommendation Engine is running");
    }
} 
package com.example.cloudapilayer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RestTemplate restTemplate;

    @Value("${recommendation.engine.base-url:https://recommendation-engine-app-554a763b7738.herokuapp.com}")
    private String recommendationEngineBaseUrl;

    @Autowired
    public RecommendationController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // Proxy POST /api/recommendations/notify-delay to recommendation engine
    @PostMapping("/notify-delay")
    public ResponseEntity<String> notifyDelay(@RequestBody @NonNull String delayRequest) {
        // Ensure user is authenticated
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("{\"error\":\"Authentication required\",\"message\":\"You must be logged in to create delay notifications\"}");
        }
        
        try {
            String recommendationUrl = recommendationEngineBaseUrl + "/api/recommendations/notify-delay";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(delayRequest, headers);

            String response = restTemplate.postForObject(recommendationUrl, entity, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw e; // Let the global exception handler deal with it
        }
    }

    // Proxy GET /api/recommendations/suggestions to recommendation engine
    @GetMapping("/suggestions")
    public ResponseEntity<String> getRebookingSuggestions(@RequestParam Long bookingId) {
        // Ensure user is authenticated
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("{\"error\":\"Authentication required\",\"message\":\"You must be logged in to view rebooking suggestions\"}");
        }
        
        try {
            String recommendationUrl = recommendationEngineBaseUrl + "/api/recommendations/suggestions?bookingId=" + bookingId;
            HttpHeaders headers = new HttpHeaders();
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(recommendationUrl, HttpMethod.GET, entity, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            throw e; // Let the global exception handler deal with it
        }
    }

    // Health check endpoint
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        try {
            String recommendationUrl = recommendationEngineBaseUrl + "/api/recommendations/health";
            String response = restTemplate.getForObject(recommendationUrl, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("Recommendation engine is not available");
        }
    }
} 
package com.example.cloudapilayer.controller;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;

@RestController
@RequestMapping("/api")
public class UserController {
    private final RestTemplate restTemplate;

    @Value("${legacy.system.base-url}")
    private String legacyBaseUrl;

    public UserController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody @NonNull String userRequest) {
        try {
            String legacyUrl = legacyBaseUrl + "/api/users/register";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(userRequest, headers);
            String response = restTemplate.postForObject(legacyUrl, entity, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw e; // Let the global exception handler deal with it
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody @NonNull String loginRequest) {
        try {
            String legacyUrl = legacyBaseUrl + "/api/users/login";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<String> entity = new HttpEntity<>(loginRequest, headers);
            String response = restTemplate.postForObject(legacyUrl, entity, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw e; // Let the global exception handler deal with it
        }
    }

    @PutMapping("/users/profile")
    public ResponseEntity<String> updateUserProfile(@RequestBody @NonNull String updateRequest, @RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            String legacyUrl = legacyBaseUrl + "/api/users/profile";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (authorization != null) {
                headers.set("Authorization", authorization);
            }
            HttpEntity<String> entity = new HttpEntity<>(updateRequest, headers);
            ResponseEntity<String> response = restTemplate.exchange(legacyUrl, HttpMethod.PUT, entity, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            throw e; // Let the global exception handler deal with it
        }
    }

    @DeleteMapping("/users/profile")
    public ResponseEntity<String> deleteUserProfile(@RequestHeader(value = "Authorization", required = false) String authorization) {
        try {
            String legacyUrl = legacyBaseUrl + "/api/users/profile";
            HttpHeaders headers = new HttpHeaders();
            if (authorization != null) {
                headers.set("Authorization", authorization);
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(legacyUrl, HttpMethod.DELETE, entity, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            throw e; // Let the global exception handler deal with it
        }
    }
}
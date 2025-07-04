package com.example.cloudapilayer.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;

@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    private RestTemplate restTemplate;

    @Value("${legacy.base.url}")
    private String legacyBaseUrl;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody @NonNull String userRequest) {
        String legacyUrl = legacyBaseUrl + "/register";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(userRequest, headers);
        String response = restTemplate.postForObject(legacyUrl, entity, String.class);
        return ResponseEntity.ok(response);
    }
}
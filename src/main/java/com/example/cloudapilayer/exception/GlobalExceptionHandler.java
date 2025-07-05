package com.example.cloudapilayer.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<Map<String, String>> handleHttpClientError(HttpClientErrorException ex) {
        logger.warn("Client error from backend: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Request failed");
        
        // Sanitize error messages based on status code
        switch (ex.getStatusCode().value()) {
            case 400:
                error.put("message", "Please check your input and try again.");
                break;
            case 401:
                error.put("message", "Invalid email or password. Please check your credentials and try again.");
                break;
            case 403:
                error.put("message", "You do not have permission to perform this action.");
                break;
            case 404:
                error.put("message", "The requested resource could not be found.");
                break;
            case 409:
                error.put("message", "This resource already exists. Please try a different option.");
                break;
            case 422:
                error.put("message", "Please check your input and ensure all required fields are filled correctly.");
                break;
            default:
                error.put("message", "An error occurred. Please try again.");
        }
        
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }

    @ExceptionHandler(HttpServerErrorException.class)
    public ResponseEntity<Map<String, String>> handleHttpServerError(HttpServerErrorException ex) {
        logger.error("Server error from backend: {} - {}", ex.getStatusCode(), ex.getResponseBodyAsString());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Server error");
        error.put("message", "Server error. Please try again later.");
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<Map<String, String>> handleResourceAccessError(ResourceAccessException ex) {
        logger.error("Backend service unavailable: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Service unavailable");
        error.put("message", "Service temporarily unavailable. Please try again later.");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        logger.error("Unexpected error in proxy layer", ex);
        Map<String, String> error = new HashMap<>();
        error.put("error", "Internal server error");
        error.put("message", "An unexpected error occurred. Please try again later.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
} 
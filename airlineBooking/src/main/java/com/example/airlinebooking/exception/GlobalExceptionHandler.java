package com.example.airlinebooking.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleUserAlreadyExists(UserAlreadyExistsException ex) {
        logger.warn("User registration failed - user already exists: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Registration failed");
        error.put("message", "An account with this email already exists. Please use a different email or try logging in.");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentials(InvalidCredentialsException ex) {
        logger.warn("Login failed - invalid credentials: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Login failed");
        error.put("message", "Invalid email or password. Please check your credentials and try again.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(FlightNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleFlightNotFound(FlightNotFoundException ex) {
        logger.warn("Flight not found: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Flight not found");
        error.put("message", "The requested flight could not be found. Please try selecting a different flight.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BookingException.class)
    public ResponseEntity<Map<String, String>> handleBookingException(BookingException ex) {
        logger.warn("Booking operation failed: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Booking failed");
        error.put("message", "Unable to complete the booking operation. Please try again or contact support if the problem persists.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        // Log detailed validation errors for developers
        StringBuilder validationDetails = new StringBuilder();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationDetails.append(fieldName).append(": ").append(errorMessage).append("; ");
        });
        logger.warn("Validation error details: {}", validationDetails.toString());
        
        // Return generic message to user
        Map<String, String> error = new HashMap<>();
        error.put("error", "Validation failed");
        error.put("message", "Please check your input and ensure all required fields are filled correctly.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleUserNotFound(UserNotFoundException ex) {
        logger.warn("User not found: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "User not found");
        error.put("message", "The requested user account could not be found.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(BookingNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleBookingNotFound(BookingNotFoundException ex) {
        logger.warn("Booking not found: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Booking not found");
        error.put("message", "The requested booking could not be found.");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorizedAccess(UnauthorizedAccessException ex) {
        logger.warn("Unauthorized access attempt: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Unauthorized access");
        error.put("message", "You do not have permission to perform this action.");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        logger.error("Unexpected error occurred", ex);
        Map<String, String> error = new HashMap<>();
        error.put("error", "Internal server error");
        error.put("message", "An unexpected error occurred. Please try again later.");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    // Additional security handlers for common vulnerabilities
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        logger.warn("Illegal argument provided: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Invalid request");
        error.put("message", "Please check your input and try again.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(IllegalStateException ex) {
        logger.warn("Illegal state detected: {}", ex.getMessage());
        Map<String, String> error = new HashMap<>();
        error.put("error", "Operation failed");
        error.put("message", "Unable to complete the requested operation. Please try again.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
} 
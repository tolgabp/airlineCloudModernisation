package com.example.airlinebooking.controller;

import com.example.airlinebooking.model.User;
import com.example.airlinebooking.dto.UserRegistrationRequest;
import com.example.airlinebooking.dto.UserLoginRequest;
import com.example.airlinebooking.dto.UserUpdateRequest;
import com.example.airlinebooking.service.UserService;
import com.example.airlinebooking.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationRequest request) {
        // Create user entity from request
        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPassword(request.getPassword());
        
        // Create user (password will be hashed in service)
        User createdUser = userService.createUser(user);
        
        Map<String, String> response = Map.of(
            "message", "User registered successfully",
            "email", createdUser.getEmail()
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody UserLoginRequest request) {
        // Authenticate user
        User user = userService.authenticateUser(request.getEmail(), request.getPassword());
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail());
        
        Map<String, Object> response = Map.of(
            "message", "Login successful",
            "token", token,
            "user", Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "name", user.getName()
            )
        );
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@Valid @RequestBody UserUpdateRequest request) {
        User currentUser = getCurrentUser();
        
        User updatedUser = userService.updateUser(currentUser.getId(), request.getEmail(), request.getPassword());
        
        Map<String, Object> response = Map.of(
            "message", "User profile updated successfully",
            "user", Map.of(
                "id", updatedUser.getId(),
                "email", updatedUser.getEmail(),
                "name", updatedUser.getName()
            )
        );
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteUserProfile() {
        User currentUser = getCurrentUser();
        
        userService.deleteUser(currentUser.getId());
        
        Map<String, String> response = Map.of(
            "message", "User account deleted successfully"
        );
        
        return ResponseEntity.ok(response);
    }

    // Helper method to get current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authentication failed - user not found"));
    }
}
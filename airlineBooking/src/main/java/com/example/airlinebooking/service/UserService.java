package com.example.airlinebooking.service;

import com.example.airlinebooking.model.User;
import com.example.airlinebooking.repository.UserRepository;
import com.example.airlinebooking.repository.BookingRepository;
import com.example.airlinebooking.exception.UserAlreadyExistsException;
import com.example.airlinebooking.exception.InvalidCredentialsException;
import com.example.airlinebooking.exception.UserNotFoundException;
import com.example.airlinebooking.exception.UnauthorizedAccessException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BookingRepository bookingRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(User user) {
        // Check if user already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("User with email " + user.getEmail() + " already exists");
        }
        
        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User authenticateUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        
        return user;
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long userId, String newEmail, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        
        // Check if new email is already taken by another user
        if (!user.getEmail().equals(newEmail)) {
            userRepository.findByEmail(newEmail)
                    .ifPresent(existingUser -> {
                        throw new UserAlreadyExistsException("Email already taken: " + newEmail);
                    });
        }
        
        // Update email and password
        user.setEmail(newEmail);
        user.setPassword(passwordEncoder.encode(newPassword));
        
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
        
        // Delete all bookings for this user first
        bookingRepository.deleteByUser(user);
        
        // Then delete the user
        userRepository.delete(user);
    }
} 
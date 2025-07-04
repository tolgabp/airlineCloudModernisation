package com.example.airlinebooking.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;


import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "flights")
public class Flight {
    // Getters and setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String origin;

    @NotBlank
    private String destination;

    @NotNull
    private LocalDateTime departureTime;

    @NotNull
    private LocalDateTime arrivalTime;

    @Min(1)
    private int capacity;

    @Min(0)
    private int availableSeats;

    // Custom setter to ensure availableSeats doesn't exceed capacity
    public void setAvailableSeats(int availableSeats) {
        if (availableSeats > this.capacity) {
            throw new IllegalArgumentException("Available seats cannot exceed capacity");
        }
        if (availableSeats < 0) {
            throw new IllegalArgumentException("Available seats cannot be negative");
        }
        this.availableSeats = availableSeats;
    }

    // Method to check if flight has available seats
    public boolean hasAvailableSeats() {
        return availableSeats > 0;
    }

    // Method to reserve a seat (decrease available seats)
    public boolean reserveSeat() {
        if (availableSeats > 0) {
            availableSeats--;
            return true;
        }
        return false;
    }

    // Method to release a seat (increase available seats)
    public void releaseSeat() {
        if (availableSeats < capacity) {
            availableSeats++;
        }
    }
}
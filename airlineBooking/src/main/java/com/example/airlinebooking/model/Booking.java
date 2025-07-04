package com.example.airlinebooking.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;

@Setter
@Getter
@Entity
@Table(name = "bookings")
public class Booking {
    // Getters and setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false)
    private Flight flight;

    @Enumerated(EnumType.STRING)
    private BookingStatus status;
    

}
package com.example.airlinebooking.config;

import com.example.airlinebooking.model.Flight;
import com.example.airlinebooking.repository.FlightRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

@Configuration
public class DataLoader {

    private static final Logger logger = LoggerFactory.getLogger(DataLoader.class);

    @Bean
    CommandLineRunner initDatabase(FlightRepository flightRepository) {
        return args -> {
            // Only add flights if the repository is empty
            if (flightRepository.count() == 0) {
                Flight flight1 = new Flight();
                flight1.setOrigin("New York");
                flight1.setDestination("London");
                flight1.setDepartureTime(LocalDateTime.now().plusDays(1));
                flight1.setArrivalTime(LocalDateTime.now().plusDays(1).plusHours(7));
                flight1.setCapacity(150);
                flight1.setAvailableSeats(150);
                flightRepository.save(flight1);

                Flight flight2 = new Flight();
                flight2.setOrigin("London");
                flight2.setDestination("Paris");
                flight2.setDepartureTime(LocalDateTime.now().plusDays(2));
                flight2.setArrivalTime(LocalDateTime.now().plusDays(2).plusHours(1));
                flight2.setCapacity(120);
                flight2.setAvailableSeats(120);
                flightRepository.save(flight2);

                Flight flight3 = new Flight();
                flight3.setOrigin("Paris");
                flight3.setDestination("Tokyo");
                flight3.setDepartureTime(LocalDateTime.now().plusDays(3));
                flight3.setArrivalTime(LocalDateTime.now().plusDays(3).plusHours(12));
                flight3.setCapacity(200);
                flight3.setAvailableSeats(200);
                flightRepository.save(flight3);

                logger.info("Test flights loaded successfully!");
            }
        };
    }
} 
package com.example.airlinebooking.service;

import com.example.airlinebooking.model.*;
import com.example.airlinebooking.repository.*;
import com.example.airlinebooking.exception.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FlightRepository flightRepository;

    @InjectMocks
    private BookingService bookingService;

    private User testUser;
    private Flight testFlight;
    private Booking testBooking;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setName("Test User");

        testFlight = new Flight();
        testFlight.setId(1L);
        testFlight.setOrigin("New York");
        testFlight.setDestination("London");
        testFlight.setDepartureTime(LocalDateTime.now().plusDays(1));
        testFlight.setArrivalTime(LocalDateTime.now().plusDays(1).plusHours(7));
        testFlight.setCapacity(150);
        testFlight.setAvailableSeats(150);

        testBooking = new Booking();
        testBooking.setId(1L);
        testBooking.setUser(testUser);
        testBooking.setFlight(testFlight);
        testBooking.setStatus(BookingStatus.CONFIRMED);
    }

    @Test
    void testCreateBooking_Success() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(testFlight));
        when(bookingRepository.findByUserAndFlight(testUser, testFlight)).thenReturn(Optional.empty());
        when(flightRepository.save(any(Flight.class))).thenReturn(testFlight);
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        // Act
        Booking result = bookingService.createBooking(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(BookingStatus.CONFIRMED, result.getStatus());
        assertEquals(testUser, result.getUser());
        assertEquals(testFlight, result.getFlight());
        verify(userRepository).findById(1L);
        verify(flightRepository).findById(1L);
        verify(bookingRepository).findByUserAndFlight(testUser, testFlight);
        verify(flightRepository).save(any(Flight.class));
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_UserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> {
            bookingService.createBooking(999L, 1L);
        });

        verify(userRepository).findById(999L);
        verify(flightRepository, never()).findById(anyLong());
    }

    @Test
    void testCreateBooking_FlightNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(flightRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(FlightNotFoundException.class, () -> {
            bookingService.createBooking(1L, 999L);
        });

        verify(userRepository).findById(1L);
        verify(flightRepository).findById(999L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_NoAvailableSeats() {
        // Arrange
        testFlight.setAvailableSeats(0);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(testFlight));

        // Act & Assert
        assertThrows(BookingException.class, () -> {
            bookingService.createBooking(1L, 1L);
        });

        verify(userRepository).findById(1L);
        verify(flightRepository).findById(1L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_AlreadyBooked() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(flightRepository.findById(1L)).thenReturn(Optional.of(testFlight));
        when(bookingRepository.findByUserAndFlight(testUser, testFlight)).thenReturn(Optional.of(testBooking));

        // Act & Assert
        assertThrows(BookingException.class, () -> {
            bookingService.createBooking(1L, 1L);
        });

        verify(userRepository).findById(1L);
        verify(flightRepository).findById(1L);
        verify(bookingRepository).findByUserAndFlight(testUser, testFlight);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testCancelBooking_Success() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(flightRepository.save(any(Flight.class))).thenReturn(testFlight);
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        // Act
        Booking result = bookingService.cancelBooking(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(BookingStatus.CANCELLED, result.getStatus());
        verify(bookingRepository).findById(1L);
        verify(flightRepository).save(any(Flight.class));
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void testCancelBooking_BookingNotFound() {
        // Arrange
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(BookingNotFoundException.class, () -> {
            bookingService.cancelBooking(999L, 1L);
        });

        verify(bookingRepository).findById(999L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testCancelBooking_UnauthorizedAccess() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act & Assert
        assertThrows(UnauthorizedAccessException.class, () -> {
            bookingService.cancelBooking(1L, 999L); // Different user ID
        });

        verify(bookingRepository).findById(1L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testCancelBooking_AlreadyCancelled() {
        // Arrange
        testBooking.setStatus(BookingStatus.CANCELLED);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act & Assert
        assertThrows(BookingException.class, () -> {
            bookingService.cancelBooking(1L, 1L);
        });

        verify(bookingRepository).findById(1L);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testGetUserBookings_Success() {
        // Arrange
        List<Booking> expectedBookings = Arrays.asList(testBooking);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(bookingRepository.findByUser(testUser)).thenReturn(expectedBookings);

        // Act
        List<Booking> result = bookingService.getUserBookings(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testBooking, result.get(0));
        verify(userRepository).findById(1L);
        verify(bookingRepository).findByUser(testUser);
    }

    @Test
    void testGetUserBookings_UserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> {
            bookingService.getUserBookings(999L);
        });

        verify(userRepository).findById(999L);
        verify(bookingRepository, never()).findByUser(any(User.class));
    }

    @Test
    void testGetBookingById_Success() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act
        Booking result = bookingService.getBookingById(1L, 1L);

        // Assert
        assertNotNull(result);
        assertEquals(testBooking, result);
        verify(bookingRepository).findById(1L);
    }

    @Test
    void testGetBookingById_BookingNotFound() {
        // Arrange
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(BookingNotFoundException.class, () -> {
            bookingService.getBookingById(999L, 1L);
        });

        verify(bookingRepository).findById(999L);
    }

    @Test
    void testGetBookingById_UnauthorizedAccess() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        // Act & Assert
        assertThrows(UnauthorizedAccessException.class, () -> {
            bookingService.getBookingById(1L, 999L); // Different user ID
        });

        verify(bookingRepository).findById(1L);
    }
} 
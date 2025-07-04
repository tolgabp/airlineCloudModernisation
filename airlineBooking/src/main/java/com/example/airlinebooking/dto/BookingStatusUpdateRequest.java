package com.example.airlinebooking.dto;

import com.example.airlinebooking.model.BookingStatus;
import jakarta.validation.constraints.NotNull;

public class BookingStatusUpdateRequest {
    
    @NotNull
    private BookingStatus status;
    
    public BookingStatusUpdateRequest() {}
    
    public BookingStatusUpdateRequest(BookingStatus status) {
        this.status = status;
    }
    
    public BookingStatus getStatus() {
        return status;
    }
    
    public void setStatus(BookingStatus status) {
        this.status = status;
    }
} 
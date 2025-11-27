package com.warehouse.inventory.entity.enums;

public enum ReservationStatus {
    ACTIVE,     // Reservation is active
    FULFILLED,  // Reservation was fulfilled (converted to transaction)
    CANCELLED,  // Reservation was cancelled
    EXPIRED     // Reservation expired
}

package com.warehouse.inventory.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateReservationRequest(
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        @NotNull(message = "Expiration date is required")
        @Future(message = "Expiration date must be in the future")
        LocalDateTime expiresAt,

        @Size(max = 100, message = "Reserved by must not exceed 100 characters")
        String reservedBy,

        @Size(max = 100, message = "Reference must not exceed 100 characters")
        String reference,

        @Size(max = 500, message = "Notes must not exceed 500 characters")
        String notes,

        @NotNull(message = "Product ID is required")
        Long productId
) {}

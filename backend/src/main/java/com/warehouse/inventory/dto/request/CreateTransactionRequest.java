package com.warehouse.inventory.dto.request;

import com.warehouse.inventory.entity.enums.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTransactionRequest(
        @NotNull(message = "Transaction type is required")
        TransactionType type,

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity,

        @Size(max = 500, message = "Notes must not exceed 500 characters")
        String notes,

        @Size(max = 100, message = "Reference must not exceed 100 characters")
        String reference,

        @NotNull(message = "Product ID is required")
        Long productId
) {}

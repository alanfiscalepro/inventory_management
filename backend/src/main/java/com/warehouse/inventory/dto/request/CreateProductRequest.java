package com.warehouse.inventory.dto.request;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record CreateProductRequest(
        @NotBlank(message = "SKU is required")
        @Size(min = 2, max = 50, message = "SKU must be between 2 and 50 characters")
        String sku,

        @NotBlank(message = "Product name is required")
        @Size(min = 2, max = 200, message = "Product name must be between 2 and 200 characters")
        String name,

        String description,

        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        Integer quantity,

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
        BigDecimal price,

        @Size(max = 20, message = "Unit must not exceed 20 characters")
        String unit,

        @Min(value = 0, message = "Minimum stock level cannot be negative")
        Integer minStockLevel,

        @NotNull(message = "Warehouse ID is required")
        Long warehouseId
) {}

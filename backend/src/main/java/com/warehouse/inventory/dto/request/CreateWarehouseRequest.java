package com.warehouse.inventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateWarehouseRequest(
        @NotBlank(message = "Warehouse name is required")
        @Size(min = 2, max = 100, message = "Warehouse name must be between 2 and 100 characters")
        String name,

        @NotBlank(message = "Location is required")
        @Size(max = 200, message = "Location must not exceed 200 characters")
        String location,

        String description
) {}

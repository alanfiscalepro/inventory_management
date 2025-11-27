package com.warehouse.inventory.entity.enums;

public enum TransactionType {
    INBOUND,      // Stock received
    OUTBOUND,     // Stock shipped/sold
    ADJUSTMENT,   // Manual adjustment
    RETURN,       // Product returned
    TRANSFER,     // Transfer between warehouses
    DAMAGED,      // Damaged/lost items
    RESERVATION   // Reserved for future use
}

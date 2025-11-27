package com.warehouse.inventory.dto.response;

import com.warehouse.inventory.entity.Reservation;
import com.warehouse.inventory.entity.enums.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {

    private Long id;
    private Integer quantity;
    private ReservationStatus status;
    private LocalDateTime expiresAt;
    private String reservedBy;
    private String reference;
    private String notes;
    private Boolean expired;
    private Boolean active;
    private Long productId;
    private String productSku;
    private String productName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReservationResponse fromEntity(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .quantity(reservation.getQuantity())
                .status(reservation.getStatus())
                .expiresAt(reservation.getExpiresAt())
                .reservedBy(reservation.getReservedBy())
                .reference(reservation.getReference())
                .notes(reservation.getNotes())
                .expired(reservation.isExpired())
                .active(reservation.isActive())
                .productId(reservation.getProduct() != null ? reservation.getProduct().getId() : null)
                .productSku(reservation.getProduct() != null ? reservation.getProduct().getSku() : null)
                .productName(reservation.getProduct() != null ? reservation.getProduct().getName() : null)
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .build();
    }

    public static ReservationResponse fromEntityWithoutProduct(Reservation reservation) {
        return ReservationResponse.builder()
                .id(reservation.getId())
                .quantity(reservation.getQuantity())
                .status(reservation.getStatus())
                .expiresAt(reservation.getExpiresAt())
                .reservedBy(reservation.getReservedBy())
                .reference(reservation.getReference())
                .notes(reservation.getNotes())
                .expired(reservation.isExpired())
                .active(reservation.isActive())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt())
                .build();
    }
}

package com.warehouse.inventory.dto.response;

import com.warehouse.inventory.entity.Transaction;
import com.warehouse.inventory.entity.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {

    private Long id;
    private TransactionType type;
    private Integer quantity;
    private Integer quantityBefore;
    private Integer quantityAfter;
    private String notes;
    private String reference;
    private Long productId;
    private String productSku;
    private String productName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static TransactionResponse fromEntity(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .quantity(transaction.getQuantity())
                .quantityBefore(transaction.getQuantityBefore())
                .quantityAfter(transaction.getQuantityAfter())
                .notes(transaction.getNotes())
                .reference(transaction.getReference())
                .productId(transaction.getProduct() != null ? transaction.getProduct().getId() : null)
                .productSku(transaction.getProduct() != null ? transaction.getProduct().getSku() : null)
                .productName(transaction.getProduct() != null ? transaction.getProduct().getName() : null)
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }

    public static TransactionResponse fromEntityWithoutProduct(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .quantity(transaction.getQuantity())
                .quantityBefore(transaction.getQuantityBefore())
                .quantityAfter(transaction.getQuantityAfter())
                .notes(transaction.getNotes())
                .reference(transaction.getReference())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}

package com.warehouse.inventory.repository;

import com.warehouse.inventory.entity.Transaction;
import com.warehouse.inventory.entity.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByProductId(Long productId);

    List<Transaction> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<Transaction> findByType(TransactionType type);

    @Query("SELECT t FROM Transaction t WHERE t.product.id = :productId AND t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Transaction> findByProductIdAndDateRange(Long productId, LocalDateTime startDate, LocalDateTime endDate);

    @Query("SELECT t FROM Transaction t WHERE t.product.warehouse.id = :warehouseId ORDER BY t.createdAt DESC")
    List<Transaction> findByWarehouseId(Long warehouseId);
}

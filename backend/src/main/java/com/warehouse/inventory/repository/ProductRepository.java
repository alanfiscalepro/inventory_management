package com.warehouse.inventory.repository;

import com.warehouse.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySku(String sku);

    List<Product> findByWarehouseId(Long warehouseId);

    List<Product> findByActiveTrue();

    @Query("SELECT p FROM Product p WHERE p.quantity - p.reservedQuantity <= p.minStockLevel AND p.active = true")
    List<Product> findLowStockProducts();

    @Query("SELECT p FROM Product p WHERE p.warehouse.id = :warehouseId AND p.active = true")
    List<Product> findActiveProductsByWarehouse(Long warehouseId);

    boolean existsBySku(String sku);
}

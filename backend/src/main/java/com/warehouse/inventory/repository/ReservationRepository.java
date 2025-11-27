package com.warehouse.inventory.repository;

import com.warehouse.inventory.entity.Reservation;
import com.warehouse.inventory.entity.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByProductId(Long productId);

    List<Reservation> findByProductIdAndStatus(Long productId, ReservationStatus status);

    List<Reservation> findByStatus(ReservationStatus status);

    @Query("SELECT r FROM Reservation r WHERE r.status = 'ACTIVE' AND r.expiresAt < :currentTime")
    List<Reservation> findExpiredReservations(LocalDateTime currentTime);

    @Query("SELECT r FROM Reservation r WHERE r.product.id = :productId AND r.status = 'ACTIVE' AND r.expiresAt > :currentTime")
    List<Reservation> findActiveReservationsByProduct(Long productId, LocalDateTime currentTime);

    @Query("SELECT r FROM Reservation r WHERE r.product.warehouse.id = :warehouseId AND r.status = 'ACTIVE'")
    List<Reservation> findActiveReservationsByWarehouse(Long warehouseId);
}
